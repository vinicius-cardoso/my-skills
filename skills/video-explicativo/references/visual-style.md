# Visual style (Bytada reference)

The reference videos are in `~/projects/experiments/video-generation/references/`. To refresh your eye,
extract a contact sheet:
`ffmpeg -i <video>.mp4 -vf "fps=1/10,scale=640:-1,tile=4x4" -frames:v 1 sheet.png`.

## What defines the look

- Near-black navy background (`#0b0f17`, faint radial glow), lots of empty space, one idea on screen at a time.
- Small **hand-written titles** (Patrick Hand) in a pastel accent, typed in with a caret; a short subtitle
  line under them when a definition helps.
- **Code in monospace panels** (JetBrains Mono) with thin borders; meaning is shown by tinted, bordered
  highlights on tokens, not by syntax colors.
- **Pastel chips and cards**: tinted fill (~10%), stronger border (~55%), text in the same hue.
- Elements **appear on the spoken word** and leave when the narration moves on; nothing decorative moves.
- Colors are semantic and stay consistent within a video: e.g. teal = the static/definition side,
  yellow = the thing being asked, orange = dynamic, red = error/trap, green = correct result.

## Layout rules that worked

- Title at y≈52, chapter chip at (56, 50), watermark bottom-right. Content between y≈150 and y≈980.
- Two-column scenes: code on the left (x≈100–150), explanation/simulation on the right (x≈780–1800).
- Code size 30–36 px for 8–13 lines, 40–48 px for one or two lines. Hand text ≥ 28 px; card body 32–36 px.
- Clear the stage between ideas (`out(i, 0)` on the group), instead of piling a third block onto a full screen.

## Review checklist (each of these happened in the first video)

- [ ] The typing caret disappears when a title finishes (only blinks while `p < 1`).
- [ ] DEF tags don't cover the line above → `lhMul={1.95}` on dense code.
- [ ] Arrows don't cut through code: run them along the gap between lines (start at the top of the lower
      token, end at the bottom corner of the upper one, small `bend`) or outside the panel.
- [ ] Labels near tokens are readable (≥ 28 px) and don't overlap arrows; put them on the other side.
- [ ] Region boxes cover the whole construct (check the column range against the longest line).
- [ ] Nothing runs off the right edge (x + width ≤ 1880).
- [ ] Transient states (lookups, mid-simulation) are visible at a mid-beat still, not only at beat ends.
- [ ] Every number/result on screen matches what was verified in step 1.
- [ ] Audio: final file around −16 LUFS (`tools/render.sh` does it); raw edge-tts output is ~6 dB quieter
      than YouTube videos.
