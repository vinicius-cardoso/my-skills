# Bootstrapping the project on a new machine

The engine is bundled in this skill's `template/` folder (a copy of the project's reusable files) and
`template/examples/escopo/` holds the finished reference video's script and scenes.

```bash
P=~/projects/experiments/video-generation
mkdir -p $P && cp -r <skill-dir>/template/. $P/ && cd $P
mkdir -p studio/src/escopo content/escopo
cp examples/escopo/narration.json content/escopo/
cp examples/escopo/*.tsx studio/src/escopo/
python3 -m venv .venv && .venv/bin/pip install edge-tts
cd studio && npm install && npm install-scripts approve esbuild && npm rebuild esbuild
cd .. && .venv/bin/python tools/tts.py escopo      # needs internet (edge-tts)
cd studio && npx tsc -p . && node stills.mjs escopo /tmp/stills hook
```

Requirements: Node ≥ 20, Python ≥ 3.10, ffmpeg/ffprobe, ImageMagick (`magick`, for contact sheets).
Remotion downloads its own headless Chrome on the first render. Fonts (Patrick Hand, JetBrains Mono) come
from Google Fonts at render time, so rendering needs internet.

When you improve `lib.tsx`, `tts.py`, `stills.mjs` or `render.sh` in the project, copy the change back
into `template/` so the next machine gets it.
