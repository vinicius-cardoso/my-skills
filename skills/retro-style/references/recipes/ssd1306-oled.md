# SSD1306 OLED (128x64, monochrome)

Applied: SparkMiner BTC lottery miner, `btc-mining/SparkMiner/src/display/display_oled.cpp`
(U8g2, full-buffer `_F_HW_I2C`).

## Mapping (no colors, so roles become fill vs outline)

| motif | on a 1-bit panel |
|---|---|
| header strip (`key2` bar + `accent` rule) | 10px filled bar, dark text, 1px gap, 2px rule; content starts at y=14 |
| A B X Y dots | SNES pad: A/B filled discs (convex), X/Y hollow circles (concave), r=2, 6px apart |
| keycap (body + 2px `key2` side) | rounded outline r=2 with the bottom edge doubled; selected = filled, dark label |
| block bar | 2px gaps, on = filled box, off = 1px outline (a dot when segments are < 3px) |
| attention lamp (yellow/red blink) | a `!` that flips between dark-on-lit and lit-on-dark every update |
| level colors 60/85 | none; use `!` / `>` prefixes and the lamp instead |
| light/dark mode | SSD1306 hardware invert: `sendF("c", 0xA6/0xA7)` |

## Fonts (U8g2 built-ins)

- Press Start 2P: `u8g2_font_pressstart2p_8r`. Caps are 7 rows tall.
- GLCD 5x7 stand-in: `u8g2_font_5x7_tr`; tiny labels `u8g2_font_4x6_tr`.
- Big numbers at 2x/3x: U8g2 can't scale fonts. Render the string on a
  one-page canvas (`U8G2_SSD1306_128X64_NONAME_1_HW_I2C`, never `begin()`),
  read its 128-byte buffer (1 byte = 8 vertical px), and draw each pixel as a
  `scale x scale` box.

## Gotchas

- Press Start 2P baseline on the canvas: `drawStr(0, 8, s)` puts the caps on
  rows 0-6. `drawStr(0, 7, s)` loses the top row, despite the font header.
- Don't borrow page 0 of the live framebuffer as the canvas: it blanked
  row 8 across the whole screen.
- To check layouts without a camera, dump `getBufferPtr()` as hex over serial
  behind a debug define and render PNGs on the host.
