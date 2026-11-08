#!/usr/bin/env bash
# usage: tools/setup_qa.sh   (once per machine; idempotent, ~1 s when everything is there)
# Creates .venv-qa (Python 3.12: ctranslate2 has no wheels for the system's newest Python) with
# faster-whisper for tools/check_narration.py, plus cuBLAS/cuDNN when an NVIDIA GPU is present, and
# downloads the Whisper model (~3 GB, shared HF cache). Prints the hardware profile hw.py picked.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
venv="$root/.venv-qa"
gpu=0
command -v nvidia-smi >/dev/null 2>&1 && nvidia-smi -L >/dev/null 2>&1 && gpu=1
check="import edge_tts, faster_whisper, jiwer, num2words"
[ "$gpu" = 1 ] && check="$check, nvidia.cublas, nvidia.cudnn"
if ! "$venv/bin/python" -c "$check" 2>/dev/null; then
  echo "creating/completing $venv (NVIDIA GPU: $gpu)"
  [ -x "$venv/bin/python" ] || uv venv -q -p 3.12 "$venv"
  pkgs=(edge-tts "faster-whisper==1.2.1" jiwer num2words)
  # ctranslate2 doesn't find the system's libcublas.so.12; hw.py points it at these instead (~1 GB, GPU only)
  [ "$gpu" = 1 ] && pkgs+=(nvidia-cublas-cu12 "nvidia-cudnn-cu12==9.*")
  VIRTUAL_ENV="$venv" uv pip install -q "${pkgs[@]}"
fi
"$venv/bin/python" "$root/tools/hw.py" --download
