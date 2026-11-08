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
tools/setup_qa.sh                                   # Whisper check: .venv-qa + model (~3 GB, skipped if cached)
cd studio && npm install && npm install-scripts approve esbuild && npm rebuild esbuild
cd .. && .venv/bin/python tools/tts.py escopo      # needs internet (edge-tts)
cd studio && npx tsc -p . && node stills.mjs escopo /tmp/stills hook
```

Requirements: Node ≥ 20, Python ≥ 3.10, ffmpeg/ffprobe, ImageMagick (`magick`, for contact sheets), `uv`
(`setup_qa.sh` uses it to get Python 3.12, since ctranslate2 has no wheels for the newest Python).
Remotion downloads its own headless Chrome on the first render. Fonts (Patrick Hand, JetBrains Mono) come
from Google Fonts at render time, so rendering needs internet.

When you improve `lib.tsx`, `tts.py`, `check_narration.py`, `stills.mjs` or `render.sh` in the project, copy the change back
into `template/` so the next machine gets it.

## Machine quirks (2026-11-06/08)

- **Laptop IPv6 is broken.** The router advertises an IPv6 route that doesn't route, so anything that
  tries IPv6 first hangs (Hugging Face, the Playwright/Chrome CDNs, sometimes npm). If `npm install`,
  Remotion's first-render Chrome download or `setup_qa.sh` stalls, force IPv4:
  `NODE_OPTIONS=--dns-result-order=ipv4first`, `curl -4`. `hw.py` loads a cached model without touching
  the network, so a check that suddenly takes many minutes before the first beat is the network, not the CPU.
- **Browser installs can hang on Node 26.** Playwright 1.52's installer stopped mid-extraction on both
  machines. If Remotion's Chrome download (`studio/node_modules/.remotion/chrome-headless-shell`) does the same,
  copy that folder from the other machine.
- **Driving the laptop over Tailscale SSH**: the session kills its children when it ends, including
  `nohup` and `setsid`. Run long renders and checks with
  `systemd-run --user --unit=vg-render --collect bash -c "... > /tmp/vg-render.log 2>&1"`.
- `hw.py` and `ptnorm.py` are copies of `gravar-video-card/scripts/tts/` (that skill is private and lives
  outside this repo, so don't import from it). Keep the copies in sync when one side changes.
