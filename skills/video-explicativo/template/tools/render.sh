#!/usr/bin/env bash
# usage: tools/render.sh <video-id>   ->  out/NN-<video-id>.mp4 (1080p, h264, loudness-normalized to -16 LUFS)
# Renders one video at a time machine-wide (waits for /tmp/vg-render.lock).
set -euo pipefail
id="${1:?video id}"
root="$(cd "$(dirname "$0")/.." && pwd)"
entry="src/$id/index.tsx"; [[ -f "$root/studio/$entry" ]] || entry="src/index.ts"
mkdir -p "$root/out"
# episode number from narration.json -> out/NN-<id>.mp4, so files sort in watching order
num="$(python3 -c 'import json,sys; n=json.load(open(sys.argv[1])).get("number"); print(f"{n:02d}-" if n else "")' "$root/content/$id/narration.json")"
name="$num$id"
exec 9>/tmp/vg-render.lock
echo "waiting for render lock..."; flock 9; echo "rendering $id"
cd "$root/studio"
npx remotion render "$entry" "$id" "$root/out/$name.raw.mp4" --codec=h264 --crf=20 --audio-bitrate=192k --concurrency=8
ffmpeg -v error -y -i "$root/out/$name.raw.mp4" -c:v copy -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 "$root/out/$name.mp4"
rm "$root/out/$name.raw.mp4"
LC_NUMERIC=C printf 'done: %s (%.1fs)\n' "$root/out/$name.mp4" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$root/out/$name.mp4")"
