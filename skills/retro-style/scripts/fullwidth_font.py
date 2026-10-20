#!/usr/bin/env python3
"""
Builds "Retro Fullwidth": Press Start 2P's ASCII glyphs placed on the fullwidth
forms (U+FF01-FF5E, plus U+3000 for space). A terminal draws each fullwidth
character in two cells, which fits the font's square glyphs, so a program can
print pixel-font labels in a terminal whose main font stays a normal mono.
Used by the Claude Code status line (references/recipes/claude-code-statusline.md).

Press Start 2P reserves its name under the OFL, so the derived font must be
called something else.

    pip install fonttools   # in a venv
    python3 fullwidth_font.py ~/.local/share/fonts/retro/PressStart2P-Regular.ttf \
        ~/.local/share/fonts/retro/RetroFullwidth-Regular.ttf

--scale 1.142857 makes one font pixel 2 px at 14 px text (8/7). --shift moves
the glyphs down, in font pixels, so the caps sit inside the terminal cell.
"""
import argparse

from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

PIXEL = 125  # Press Start 2P: 1000 units per em, 8 pixels per em

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("dst")
ap.add_argument("--scale", type=float, default=8 / 7)
ap.add_argument("--shift", type=int, default=2)
args = ap.parse_args()

f = TTFont(args.src)
cmap = f.getBestCmap()

opts = Options()
opts.notdef_outline = True
opts.name_IDs = ["*"]
opts.layout_features = []
sub = Subsetter(opts)
sub.populate(glyphs=[cmap[c] for c in range(0x20, 0x7F) if c in cmap])
sub.subset(f)

glyf, hmtx, glyphs = f["glyf"], f["hmtx"], f.getGlyphSet()
dy = -args.shift * PIXEL * args.scale
for name in f.getGlyphOrder():
    pen = TTGlyphPen(None)
    glyphs[name].draw(TransformPen(pen, (args.scale, 0, 0, args.scale, 0, dy)))
    glyf[name] = pen.glyph()
    adv, lsb = hmtx[name]
    hmtx[name] = (round(adv * args.scale), round(lsb * args.scale))

fullwidth = {0x3000: cmap[0x20]}
fullwidth.update({c + 0xFEE0: cmap[c] for c in range(0x21, 0x7F) if c in cmap})
for table in f["cmap"].tables:
    table.cmap = dict(fullwidth)

for rec in f["name"].names:
    if rec.nameID in (1, 16):
        rec.string = "Retro Fullwidth"
    elif rec.nameID == 4:
        rec.string = "Retro Fullwidth Regular"
    elif rec.nameID == 6:
        rec.string = "RetroFullwidth-Regular"
    elif rec.nameID == 3:
        rec.string = "RetroFullwidth-Regular;derived from Press Start 2P"

os2 = f["OS/2"]
os2.ulUnicodeRange1 = os2.ulUnicodeRange2 = os2.ulUnicodeRange3 = os2.ulUnicodeRange4 = 0
os2.usFirstCharIndex, os2.usLastCharIndex = 0x3000, 0xFF5E

f.save(args.dst)
print(f"{args.dst}: {len(fullwidth)} code points")
