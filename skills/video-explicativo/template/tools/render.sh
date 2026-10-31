#!/usr/bin/env bash
# usage: tools/render.sh <video-id>   ->  out/<video-id>.mp4 (1080p, h264, loudness-normalized to -16 LUFS)
set -euo pipefail
id="${1:?video id}"
root="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$root/out"
cd "$root/studio"
npx remotion render src/index.ts "$id" "$root/out/$id.raw.mp4" --codec=h264 --crf=20 --audio-bitrate=192k
ffmpeg -v error -y -i "$root/out/$id.raw.mp4" -c:v copy -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 "$root/out/$id.mp4"
rm "$root/out/$id.raw.mp4"
printf 'done: %s (%.1fs)\n' "$root/out/$id.mp4" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$root/out/$id.mp4")"
