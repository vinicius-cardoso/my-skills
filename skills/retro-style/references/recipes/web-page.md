# Web page / project UI

Status: **applied** to vlc-web-remote (`public/`), laptop, 2026-11-21. Use
it as the template for any other project page: copy its `styles/app.css`
header, then adapt.

## Scale

Draw at **2x the device**: the CYD/knob is 1x, a phone page reads well at 2x.
That fixes every size, so nothing lands off the pixel grid:

| thing | device (1x) | web (2x) |
|---|---|---|
| Press Start 2P (titles, labels, keys, chips) | 8 px | 16 px (big numbers 32 px) |
| dense text | GLCD 6x8 | Departure Mono 22 px (its 11 px grid x2); 11 px for tiny details |
| card border / top highlight | 1 px | 2 px |
| keycap side | 2 px | 4 px, and `:active` moves down 4 px with no shadow |
| block bar gap | 2 px | 4 px; 20 segments |
| left stripe / selection marker | 4 px | 8 px |

## Pieces

- Palette: `python3 scripts/palette.py snes dark --format css`, pasted as
  `--retro-*` variables. Map by role (see palette.md); no other colors.
- Fonts: bundle them in the project, with their OFL texts, instead of a CDN:
  Press Start 2P TTF from the google/fonts repo, Departure Mono woff2 from
  `gh release download -R rektdeckard/departure-mono`. The server must send
  `font/ttf` and `font/woff2`.
- `-webkit-font-smoothing: none` on html/body.
- Header strip: `key2` bar, 4 px `accent` bottom border, state label + icon on
  the left, A B X Y dots (12 px), a state chip (green ON / red OFF).
- Icons: no line icons. Draw them as ASCII art (`#` = pixel), render as SVG
  `<rect>`s with `shape-rendering: crispEdges`, and size the box so each icon
  scales by a whole number (keep `preserveAspectRatio` at its default).
  Stepped 8x7 triangles look like stairs past 4x: use a 6x11 one for big play.
- Selected list rows: `accent` face, 8 px `lav` inset marker, green `ON` chip.
- Attention: lamp blinking yellow/red with `steps(1)` at 400 ms, off under
  `prefers-reduced-motion`.
- Range inputs: style the track as an inset `panel2` bar and the thumb as an
  `accent` keycap.
- Favicon: 16x16 SVG with the four A B X Y squares.

## Gotchas

- At 390 px wide the header is tight: 12 px gaps and 12 px dots fit; hide the
  dots only below 360 px.
- Press Start 2P has no glyph for some accented capitals (Á showed as A):
  fine, the device is ASCII-only anyway.
- Check with headless Chrome at 390x844 @2x and 1280 wide; drive clicks with
  Playwright pointed at `/usr/bin/google-chrome-stable` (its bundled browser
  may be missing).
