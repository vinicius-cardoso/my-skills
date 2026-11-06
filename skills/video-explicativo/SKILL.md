---
name: video-explicativo
description: Make an animated explainer video (1080p MP4 with pt-BR narration) that teaches a topic - course content, a concept, an algorithm, a section of a study guide - in the style of the Bytada YouTube channel (dark background, hand-written titles, highlighted code, arrows, step-by-step simulations), with edge-tts narration (voice Thalita) synced to Remotion animations. Use it whenever Vinícius asks for a video, aula, videoaula or explainer about a subject to learn or share with classmates - "faz um vídeo sobre tipos algébricos", "make the next video of the P2 series", "explica passagem de parâmetros em vídeo", "o próximo vídeo", "a video like Bytada about X" - or wants to change the voice, script or visuals of one of these videos. NOT for recording a screencast or evidence video of an Arkmeds card, bug fix or app screen (DEV-/ARKCX- cards, demos for QA/CX/PO) - that is gravar-video-card. Rule of thumb - teaching a subject means this skill; proving how the app behaves means gravar-video-card.
---

# Explainer video (Bytada style, pt-BR)

The output is a 6–10 minute 1080p MP4 that a student can watch to actually understand a topic, plus an `.srt`.
The bar: someone who found the written material too dense finishes the video able to solve the exam
questions on that topic. Vinícius shares these with classmates, so correctness matters more than polish.
A wrong answer in a video spreads to a whole class.

## Which skill?

| Request | Skill |
| --- | --- |
| "faz um vídeo explicando escopo / tipos algébricos / o passo 5 do guia" | **video-explicativo** |
| "grava um vídeo do DEV-2267", "evidência em vídeo do fix", "mostra pro QA que funciona" | gravar-video-card |
| "video" + a card id, a tenant, a screen of the app, a bug | gravar-video-card |

If this skill was loaded for a card or app-behavior video, stop and use `gravar-video-card` instead.

## Where things live

Project: `~/projects/experiments/video-generation` (not a git repo).

```
content/<id>/narration.json      script: scenes → beats, voice, rate
tools/tts.py <id>                synthesizes beats → studio/public/<id>/*.mp3 + timeline.json + out/NN-<id>.srt
tools/render.sh <id>             Remotion render + loudness normalization → out/NN-<id>.mp4 (one render at a time machine-wide)
tools/stills.sh <id> <dir> …     review stills (max 3 runs at once machine-wide)
studio/src/lib.tsx               the visual toolkit (Code, Arrow, Region, Chip, Card, Title, useBeats…)
studio/src/<id>/index.tsx        entry point of that video alone (stills and renders use it)
studio/src/<id>/Video.tsx        exports `Video` and `duration`; maps scene ids to scene components
studio/src/Root.tsx              every video, only for `npx remotion studio` previews
samples/                         voice samples the voice was chosen from
references/                      the Bytada videos used as the style reference
```

`escopo` is the finished reference video. Before writing scenes for a new video, read
`studio/src/escopo/scenes*.tsx`. It shows every pattern below in working code.

If the project folder is missing (new machine), bootstrap it from this skill's `template/` (see
`references/bootstrap.md`).

## Workflow

### 1. Study the source and find what the exam asks

Read the material yourself: slides, problem sets *and* their answer keys, the study guide, past exams. For
the DCC024 series the map of topics to files is in `references/dcc024-series.md`. Before writing anything,
list:
- the 3–6 ideas the topic stands on,
- every "★ cai na prova" item and every "! pegadinha" (trap) the guide or slides mention,
- the canonical examples the professor uses (reuse them: students will see them again on the exam),
- the question formats ("count the definitions", "what is printed", "final state of the heap").

**Verify every code claim by running it** (`javac`/`java`, `gcc`; there is no SML compiler on this machine,
so ML results must match the answer key and course slides). Answer keys can be wrong. Lista 10 said the first
`Reuse` in `Reuse.Reuse(Reuse)` was the method, but compiling proved it is the parameter. When you find a
discrepancy, teach the verified version and tell Vinícius about it.

### 2. Outline the scenes

Typical arc, one idea per scene:
1. **Hook** (≈20 s): a surprising concrete example that the topic explains, then the title typed in.
2. **Vocabulary**: the 2–3 terms everything else uses.
3. **Concept scenes**: each built around one worked example on screen, revealed step by step.
4. **A simulation** of the mechanism (dictionary stack, call stack, heap cells, trace table). This is
   where understanding happens, so give it time.
5. **Traps**: each "pegadinha" gets its own moment, with the wrong answer named and ruled out.
6. **Recap** cards in exam language, then a **challenge** from the guide's practice questions with a
   3-second countdown pause, then the answer and a teaser of the next topic.

Use chapter chips (`Part`) when the topic has an explicit taxonomy (e.g. the 4 kinds of scope).

### 3. Write `content/<id>/narration.json`

```json
{"number": 2, "voice": "pt-BR-ThalitaMultilingualNeural", "rate": "+6%",
 "scenes": [{"id": "hook", "beats": ["Olha essas duas funções.", {"text": "Quanto vale g de 5?", "pause": 1.2}]}]}
```

- **`number`** is the episode's position in the series: outputs are named `out/NN-<id>.mp4/.srt` so
  they sort in watching order. Omit it for a standalone video.
- **Voice: Thalita** (`pt-BR-ThalitaMultilingualNeural`, rate `+6%`). Vinícius picked it from 10 samples
  on 2026-10-31. Don't change it unless he asks.
- A **beat** is one or two short sentences, and one visual change. More beats = tighter sync.
  `pause` (seconds) adds silence after a beat: use it after questions to the viewer.
- Spoken Brazilian Portuguese, conversational ("a gente", "repara", "guarda isso"), short sentences, no
  bullet-point prose. Say code the way a person reads it aloud ("val x igual a 10", "S ponto f de 5").
- Words the voice mangles go in the `SAY` map of `tools/tts.py` (display text → spoken text).

Then run `.venv/bin/python tools/tts.py <id>` from the project root. It caches each beat by text hash,
retries rate-limit errors, and prints scene lengths. Sanity check: speech is 10–18 characters per second.
A beat far outside that is truncated audio, so delete its mp3 and re-run.

### 4. Build the scenes

Read `references/toolkit.md` (the `lib.tsx` API and the timing model) and `references/visual-style.md`
(the Bytada look and layout rules) before writing scenes.

- Create `studio/src/<id>/index.tsx` (copy `escopo/index.tsx`, change the id), `studio/src/<id>/Video.tsx`
  exporting `Video` and `duration` (copy `escopo/Video.tsx`: it maps scene ids to components and reads
  `public/<id>/timeline.json`), and the scene files. Add the video to `Root.tsx` for studio previews.
  Per-video entry points mean a half-written video never breaks another video's stills or render.
- Inside a scene, everything is timed against the narration: `inn(i, w(i, 'palavra'))` makes an element
  appear when the word is spoken in beat `i`. **Beat indices are positional.** If you insert or delete a beat
  in `narration.json`, re-check every index in that scene. `w()` throws if the word isn't in the beat, which
  catches most mistakes.
- `cd studio && npx tsc -p .` must pass.

### 5. Review stills before rendering

A full render takes minutes; stills take seconds. From the project root:

```bash
tools/stills.sh <id> /tmp/stills                 # end-of-beat still for every beat + sheet_<scene>.jpeg
tools/stills.sh <id> /tmp/stills stack:9:0.6     # one still at 60% of beat 9 of scene "stack"
```

Look at every contact sheet, then pick mid-beat moments for anything transient (lookups, arrows mid-draw,
countdowns), because end-of-beat stills miss them. Check against the list in `references/visual-style.md`
("Review checklist"). Fix, re-render the affected stills, repeat.

### 6. Render and deliver

```bash
tools/render.sh <id>        # → out/NN-<id>.mp4, loudness-normalized to -16 LUFS
```

Check duration and that audio exists (`ffprobe`), send the MP4 with `SendUserFile`, and give a short summary:
scene list, anything you verified or found wrong in the course material, and 3–4 specific things you'd like
feedback on. For the first video of a new series, wait for his verdict before producing the rest.

## Making several videos at once

Running one subagent per video works (the DCC024 series: 8 videos in parallel). The tools already take
turns: `tts.py` holds a lock (edge-tts rate-limits bursts), `stills.sh` allows 3 runs, `render.sh` one.
Give each agent: its id, its source files, the next-video teaser, the rule to touch only its own
`content/<id>/`, `studio/src/<id>/`, `studio/public/<id>/` and `out/NN-<id>.*`, and the type-check command
`cd studio && npx tsc --noEmit -p . 2>&1 | grep "src/<id>/"` (other folders may be mid-edit). Expect each
agent to use ~250k tokens: 8 at once can exhaust a 5-hour usage window, so launch the exam-heaviest topics
first and ask for the report *before* the final render wait, so a usage cutoff doesn't lose it. Check every
finished video yourself (duration, audio level, a frame sheet, answers vs. the answer key) before sending.

