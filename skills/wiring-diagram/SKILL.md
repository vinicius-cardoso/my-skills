---
name: wiring-diagram
description: Draw the wiring between parts as a PNG image in Wiredex's style (parts as boxes, coloured wires with right angles, net names, junction dots), so Vinícius sees how to connect them. Use whenever he asks how parts connect or wire together - "how do I connect the PN532 to the ESP32", "wire the BME280 to the T-Display", "como ligo o sensor no ESP32", "draw the wiring", "wiring diagram", "diagrama de ligação", "make an image of the connections" - and every time the `wiring` skill or a hand-written wiring table answers such a question: the image goes with the table. Also use to redraw a wiring after a pin changes.
---

# Wiring diagrams like Wiredex

The image is the drawing Wiredex shows on a project's Wiring section
(`~/projects/deployed/wiredex/apps/web/src/features/projects/netlist/`,
`diagram.ts` for the layout and `WiringDiagram.tsx` for the look), made
offline by `scripts/render.mjs`. That script is a port of `layoutDiagram`
with the same tokens and fonts. If Wiredex's drawing changes, port it again:
the app wins over this copy.

## Steps

1. **Settle the wiring first.** The pins, levels and pin choices are the
   real work. Follow the `wiring` skill's rules: look up datasheets, never
   guess a pin, and check the voltage levels. The drawing only shows what you
   decided.
2. **Write the wiring as JSON.** In a project directory, put it in
   `docs/wiring/<setup>.json`. Otherwise put it in the session scratchpad.
   Use one file per setup. If there are two alternative setups, make two
   images, not one with everything.
3. **Render it:**
   ```bash
   node ~/.claude/skills/wiring-diagram/scripts/render.mjs docs/wiring/<setup>.json
   ```
   This writes `<setup>.svg` and `<setup>.png` (2× scale) next to the JSON.
   Optional flags:
   - `-o <path/basename>`: write the files somewhere else.
   - `--theme light`: the default is `dark`, as Wiredex shows it.
   - `--scale 3`: a sharper PNG.
4. **Look at the PNG with Read before handing it over.** Check for clipped
   labels (pins over 26 characters, part names over 30, net names over 16),
   a wrong hub, or a pin drawn in the warning colour that you didn't mean.
5. **Give him the absolute PNG path,** since the terminal can't show the
   image. If SendUserFile is available, send the PNG as well. Keep the
   wiring table in the text answer. The image goes with the table and
   doesn't replace it.

## The JSON

```json
{
  "theme": "dark",
  "parts": {
    "U1": { "name": "T-Display ESP32 1.14in",
            "pins": { "3V3": "", "GND": "", "21": "GPIO21", "22": "GPIO22" } },
    "U2": { "name": "PN532 NFC Module V3",
            "pins": { "J1-1": "GND", "J1-2": "VCC", "J1-3": "SDA", "J1-4": "SCL" } }
  },
  "nets": [
    { "name": "3V3", "color": "red",    "pins": ["U1.3V3", "U2.J1-2"] },
    { "name": "GND", "color": "black",  "pins": ["U1.GND", "U2.J1-1"] },
    { "name": "SDA", "color": "blue",   "pins": ["U1.21",  "U2.J1-3"] },
    { "name": "SCL", "color": "yellow", "pins": ["U1.22",  "U2.J1-4"] }
  ]
}
```

- **Pins** are `<designator>.<pin>`, split at the first dot. Use the same
  designators and pin numbers as the `wiring` table and the `pinout` skill
  (`J3-1` on a board with several headers). That way the image, the table
  and Wiredex all agree.
- **`parts.<designator>.pins`** maps each pin number to its label. A box
  reads `<pin> <label>`, or only `<pin>` when the label is `""`. Only wired
  pins are drawn, sorted by number (natural order).
- **A pin missing from its part's `pins`** is drawn in the warning colour,
  as Wiredex marks a pin that isn't on the pinout. Use this on purpose for
  a pin you couldn't confirm, and say so in the text. Leave `pins` out
  entirely to draw everything as confirmed.
- **Nets:** one per electrical node. A net with three or more pins (GND, 3V3,
  a shared bus) gets junction dots. Give each net a short upper-case name.
- **Colour** is one of `black brown red orange yellow green blue violet grey
  white pink`, or no colour (drawn muted). Use the same rules as the
  `wiring` skill: `red` for supply and `black` for ground, the part's real
  lead colours when it has them (motor wires, sensor cables), and otherwise
  colours that tell neighbouring wires apart.

## How it lays out

The part with the most wired pins is the **hub**, on the left, with its pins
on its right edge. Every other part stacks on the right, facing it, in the
order of the hub pins it's wired to. Each net has its own vertical run in the
channel between the two columns, and runs are swapped around to reduce
crossings. The same JSON always gives the same picture.

So the microcontroller should be the part with the most wired pins. If a
breakout ends up as the hub, the drawing looks backwards. In that case, split
the wiring into one image per pair.

## Rendering

The PNG is rendered with headless Chrome, Chromium or Brave, trying each in
turn, using the bundled Roboto Mono and Manrope fonts (OFL, in `fonts/`). If
none of those browsers runs, the script falls back to `rsvg-convert`, then
`magick`, with system fonts. The script prints which renderer it used. The
SVG has the fonts embedded and looks the same in any browser.

`examples/nfc-tdisplay-tft.json` is a full example: a T-Display hub with a
PN532 over I2C and a 2.4" ST7789 TFT with an EC11 encoder over SPI.
