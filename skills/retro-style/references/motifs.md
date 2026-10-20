# Shapes and motifs

What makes it look like Nintendo hardware rather than "dark mode with a pixel
font". Taken from `firmware/esp32_tft/gfx.h` and `ui.h`. To see it, open the
screenshots in `claude-usage-display/docs/screenshots/` (`usage.png`,
`question.png`, `theme-*-light.png` / `theme-*-dark.png`).

## Rules

1. **Flat fills only.** No gradients, blur, glass, transparency or soft drop
   shadows. Depth comes from hard offsets.
2. **Limited palette.** Each surface uses only its theme's 16 colors.
   No extra hex values "close enough".
3. **Keycaps:** body in `key` (or `accent` when selected), plus a **2px side
   in `key2` directly below** (hard, no blur). Label centered, UPPERCASE, in
   `keyink`.
4. **Cards:** 1px border in `key2`, fill `panel`, plus a **1px top highlight**
   in `white`.
5. **Corners:** 2px stepped pixel corners, not smooth curves. In CSS,
   `border-radius: 2px` is close enough; use a `clip-path` polygon for true
   pixel steps.
6. **Header strip:** a `key2` bar with `keyink` text and a **2px `accent`
   rule** under it.
7. **Signature:** four dots in red, yellow, green, blue (the A B X Y buttons),
   e.g. in a header or as a logo.
8. **Progress is blocks, not a smooth bar:** 20 segments with 2px gaps, filled
   ones in the level color, empty ones in `panel2`.
9. **Pills/chips:** small rounded rect in a state color, `keyink` text (`key2`
   on yellow), short UPPERCASE label like `A1`, `2 BUSY`.
10. **Attention:** waiting items get a 4px `yellow` stripe on the left edge,
    and a lamp blinking yellow/red every 400 ms.
11. **Integer scaling:** sizes and offsets are multiples of the pixel grid,
    and images scale only by whole numbers.
12. **Copy:** short UPPERCASE labels (`RESETS 05:27`, `IN 4H48M`, `NO DATA`),
    `>` for "doing now", `!` for "needs you".

## CSS starter

Pair with `scripts/palette.py <theme> <mode> --format css` for the
`--retro-*` variables.

```css
body { background: var(--retro-bg); color: var(--retro-ink); }
.title { font: 16px/1.25 "Press Start 2P", monospace; text-transform: uppercase; }
.mono  { font: 11px/1.4 "Departure Mono", "Terminus", monospace; -webkit-font-smoothing: none; }

.header { background: var(--retro-key2); color: var(--retro-keyink);
          border-bottom: 2px solid var(--retro-accent); }

.card { background: var(--retro-panel); border: 1px solid var(--retro-key2);
        border-radius: 2px; box-shadow: inset 0 1px 0 var(--retro-white); }

.key { background: var(--retro-key); color: var(--retro-keyink); border: 0;
       border-radius: 2px; box-shadow: 0 2px 0 var(--retro-key2);
       font: 8px "Press Start 2P", monospace; text-transform: uppercase; }
.key:active { transform: translateY(2px); box-shadow: none; }
.key.selected { background: var(--retro-accent); }

.bar  { display: flex; gap: 2px; }
.bar i { flex: 1; height: 14px; background: var(--retro-panel2); }
.bar i.on { background: var(--retro-green); }   /* yellow ≥60%, red ≥85% */

.chip { background: var(--retro-blue); color: var(--retro-keyink);
        border-radius: 2px; padding: 1px 4px; }
.chip.yellow { background: var(--retro-yellow); color: var(--retro-key2); }

img, canvas { image-rendering: pixelated; }
```
