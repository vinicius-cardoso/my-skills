# -*- coding: utf-8 -*-
"""Escolhe como rodar o Whisper conforme o hardware da maquina (desktop com GPU ou notebook).

    python hw.py               imprime o perfil escolhido
    python hw.py --download    baixa o modelo do perfil (para o primeiro uso nao parar no meio)

Perfis:
  GPU NVIDIA (CUDA)  -> large-v3, float16. Ex.: desktop RTX 3060 Ti.
  so CPU             -> large-v3, int8, todas as threads. Ex.: notebook i5-1240P (Iris Xe nao roda CUDA).

Sobrescrever: NARRACAO_DEVICE=cuda|cpu, NARRACAO_MODEL=<modelo faster-whisper> (ex. large-v3-turbo,
mais rapido na CPU, porem menos exato), NARRACAO_THREADS=<n>.

Na GPU o ctranslate2 precisa das libs cuBLAS/cuDNN instaladas no venv (pacotes nvidia-*), que so sao
achadas via LD_LIBRARY_PATH. use_cuda_libs() reexecuta o script com essa variavel ajustada, entao
os scripts rodam direto com o python do venv, sem prefixo.
"""
import glob
import os
import sys

import ctranslate2


def _cuda_ok():
    try:
        return ctranslate2.get_cuda_device_count() > 0
    except Exception:
        return False


def profile():
    device = os.environ.get('NARRACAO_DEVICE') or ('cuda' if _cuda_ok() else 'cpu')
    threads = int(os.environ.get('NARRACAO_THREADS') or os.cpu_count() or 4)
    p = {
        'device': device,
        'compute_type': 'float16' if device == 'cuda' else 'int8',
        'model': os.environ.get('NARRACAO_MODEL') or 'large-v3',
        'cpu_threads': 0 if device == 'cuda' else threads,
    }
    return p


def describe(p):
    if p['device'] == 'cuda':
        return 'whisper %s em GPU (cuda %s)' % (p['model'], p['compute_type'])
    return 'whisper %s em CPU (%s, %d threads)' % (p['model'], p['compute_type'], p['cpu_threads'])


def use_cuda_libs():
    """Na GPU, garante LD_LIBRARY_PATH com as libs nvidia do venv; reexecuta o processo uma vez."""
    if profile()['device'] != 'cuda' or os.environ.get('_NARRACAO_REEXEC'):
        return
    site = os.path.dirname(os.path.dirname(ctranslate2.__file__))
    libs = sorted(glob.glob(os.path.join(site, 'nvidia', '*', 'lib')))
    if not libs:
        return
    cur = os.environ.get('LD_LIBRARY_PATH', '')
    if all(d in cur.split(':') for d in libs):
        return
    env = dict(os.environ, LD_LIBRARY_PATH=':'.join(libs + ([cur] if cur else [])), _NARRACAO_REEXEC='1')
    os.execve(sys.executable, [sys.executable] + sys.argv, env)


def load_model():
    from faster_whisper import WhisperModel

    p = profile()
    print('[narracao] %s' % describe(p), flush=True)
    kw = dict(device=p['device'], compute_type=p['compute_type'], cpu_threads=p['cpu_threads'])
    # Cache local primeiro: sem isso cada carga consulta o HF Hub, e numa rede ruim (o notebook) isso
    # custou ~20 min por execucao. So vai a rede se o modelo ainda nao foi baixado.
    try:
        return WhisperModel(p['model'], local_files_only=True, **kw)
    except Exception:
        return WhisperModel(p['model'], **kw)


if __name__ == '__main__':
    use_cuda_libs()
    p = profile()
    print(describe(p))
    if '--download' in sys.argv:
        from faster_whisper import download_model

        # Cache primeiro: download_model() sempre consulta o HF Hub, e no notebook (IPv6 quebrado,
        # conexao trava em SYN-SENT) isso pendurava o setup.sh por minutos mesmo com o modelo baixado.
        try:
            print(download_model(p['model'], local_files_only=True))
        except Exception:
            print(download_model(p['model']))
