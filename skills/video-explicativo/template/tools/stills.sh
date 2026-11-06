#!/usr/bin/env bash
# usage: tools/stills.sh <video-id> <outdir> [sceneId ...] [scene:beat:fraction ...]
# Wrapper around studio/stills.mjs that allows at most 3 runs at once machine-wide (RAM).
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root/studio"
while true; do
  for slot in 1 2 3; do
    exec 9>"/tmp/vg-stills-$slot.lock"
    if flock -n 9; then node stills.mjs "$@"; exit $?; fi
    exec 9>&-
  done
  sleep 3
done
