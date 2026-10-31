"""Routing test: which skill does Claude Code pick for each prompt, with the real skills installed?

usage: python3 evals/route_test.py <empty-dir-to-run-claude-in>
Compares video-explicativo against gravar-video-card (Arkmeds card evidence videos) and unrelated video tasks.
"""
import json, os, subprocess, sys, time, select
from concurrent.futures import ThreadPoolExecutor
CASES = [
 ("faz o vídeo de tipos algébricos agora, mesmo estilo do de escopo", "video-explicativo"),
 ("make the next video of the P2 series, registros de ativação", "video-explicativo"),
 ("quero um vídeo explicando passagem de parâmetros por valor, referência, valor-resultado e nome, com a tabela de rastreio animada", "video-explicativo"),
 ("can you make a video explaining how mark-and-sweep garbage collection works? like those bytada videos, in portuguese", "video-explicativo"),
 ("o vídeo de escopo tá com a voz rápida demais, diminui a velocidade e renderiza de novo", "video-explicativo"),
 ("cria uma videoaula sobre tratamento de exceções em java (try/catch/finally) pra eu mandar pros colegas da disciplina", "video-explicativo"),
 ("faz um vídeo curtinho explicando o que é um índice invertido", "video-explicativo"),
 ("grava um vídeo do DEV-2301 mostrando que o filtro de localização agora funciona", "gravar-video-card"),
 ("preciso de uma evidência em vídeo do fix do ARKCX-512 pra mandar pro QA", "gravar-video-card"),
 ("faz um vídeo do card DEV-2267 no tenant hospital_x", "gravar-video-card"),
 ("record a quick screencast showing the PO that the new equipment form now saves the serial number", "gravar-video-card"),
 ("make a video showing the bug in the work order list is fixed, the one from yesterday's hotfix", "gravar-video-card"),
 ("faz um vídeo explicando pro CX como funciona a nova tela de calibração do sistema", "gravar-video-card"),
 ("faz um vídeo do teste do card DEV-2310, mas com narração explicando cada passo", "gravar-video-card"),
 ("transcreve essa entrevista que eu gravei ~/Downloads/entrevista.mp4", "none-of-the-two"),
 ("converte ~/Videos/demo.mp4 pra gif com 15fps", "none-of-the-two"),
]
CWD = sys.argv[1]
def run(q):
    env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}
    p = subprocess.Popen(["claude", "-p", q, "--output-format", "stream-json", "--verbose", "--model", "claude-opus-5-5"],
                         stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, cwd=CWD, env=env)
    t0, buf, picked = time.time(), "", None
    try:
        while time.time() - t0 < 180 and picked is None:
            if p.poll() is not None:
                buf += (p.stdout.read() or b"").decode(errors="replace")
            elif select.select([p.stdout], [], [], 1.0)[0]:
                chunk = os.read(p.stdout.fileno(), 65536)
                if not chunk: break
                buf += chunk.decode(errors="replace")
            else:
                continue
            for line in buf.split("\n"):
                try: ev = json.loads(line)
                except Exception: continue
                if ev.get("type") == "assistant":
                    for c in ev["message"].get("content", []):
                        if c.get("type") == "tool_use":
                            n = c["name"]; inp = c.get("input", {})
                            if n == "Skill": picked = "skill:" + inp.get("skill", "?")
                            elif n == "Read" and "/skills/" in inp.get("file_path", ""): picked = "read:" + inp["file_path"].split("/skills/")[1].split("/")[0]
                            else: picked = "tool:" + n
                            break
                    if picked: break
                if ev.get("type") == "result": picked = picked or "no-tool"; break
            if p.poll() is not None and picked is None: picked = "no-tool"
    finally:
        if p.poll() is None: p.kill(); p.wait()
    return picked or "timeout"
with ThreadPoolExecutor(4) as ex:
    res = list(ex.map(lambda c: run(c[0]), CASES))
ok = 0
for (q, exp), got in zip(CASES, res):
    good = (exp in got) if exp != "none-of-the-two" else not any(s in got for s in ("video-explicativo", "gravar-video-card"))
    ok += good
    print(f"{'PASS' if good else 'FAIL'}  expected={exp:18} got={got:32} | {q[:70]}")
print(f"\n{ok}/{len(CASES)} routed as expected")
