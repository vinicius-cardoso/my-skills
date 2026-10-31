# video-generation

Explainer videos (pt-BR) for DCC024 – Linguagens de Programação, Prova 2, in the visual style of the
Bytada YouTube channel (`references/`).

## Pipeline

```
content/<id>/narration.json   script: scenes → beats (one or two sentences each), voice, rate
        │  .venv/bin/python tools/tts.py <id>
        ▼
studio/public/<id>/*.mp3      one mp3 per beat (edge-tts, cached by text hash)
studio/public/<id>/timeline.json   frame where every scene/beat starts
out/<id>.srt                  subtitles
        │  Remotion (React → video)
        ▼
out/<id>.mp4
```

- **Voice:** `pt-BR-ThalitaMultilingualNeural` via edge-tts (free, needs internet). Other options:
  `pt-BR-AntonioNeural` (male), `pt-BR-FranciscaNeural`.
- **Animations:** `studio/src/<id>/scenes*.tsx`. Each scene reads its beats with `useBeats()`:
  `inn(i, f)` fades something in at fraction `f` of beat `i`; `w(i, 'palavra')` returns the fraction where
  that word is spoken, so visuals land on the word.
- **Building blocks:** `studio/src/lib.tsx` — `Code` (code panel with `[[id|token]]` highlights, DEF badges,
  line cursor), `Arrow`, `Region`, `Chip`, `Card`, `Title` (typed), `Terminal`.

## Commands

```bash
.venv/bin/python tools/tts.py escopo                  # (re)generate narration + timeline + subtitles
cd studio
npx remotion studio src/index.ts                      # live preview in the browser
node stills.mjs escopo /tmp/stills                    # end-of-beat stills + one contact sheet per scene
node stills.mjs escopo /tmp/stills stack:9:0.5        # one still at 50% of beat 9 of scene "stack"
cd .. && tools/render.sh escopo                       # out/escopo.mp4, loudness-normalized
```

New video `<id>`: `content/<id>/narration.json`, `studio/src/<id>/` (copy `escopo/Video.tsx`), and a
`<Composition id="<id>">` in `studio/src/Root.tsx`. The full workflow is the `video-explicativo` skill
(`~/projects/claude/my-skills/skills/video-explicativo`).

Editing a sentence in `narration.json` only re-synthesizes that beat. If you add/remove beats in a scene,
update the beat indices used by that scene's component.
