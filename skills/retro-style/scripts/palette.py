#!/usr/bin/env python3
"""
The retro palettes, as one source of truth, exported in whatever format an app
wants. Copied from claude-usage-display/firmware/esp32_tft/theme.h: if that
file changes, update PALETTES here and regenerate references/palette.md.

Usage:
    palette.py                         # every theme/mode as markdown tables
    palette.py snes dark               # one combination, roles as a table
    palette.py snes dark --format css  # CSS custom properties
    palette.py snes dark --format ansi # 16 terminal colors + bg/fg/cursor
    palette.py snes dark --format json # roles + ansi, for scripts

Themes: sfc, snes, nes, famicom. Modes: light, dark.
"""

import argparse
import json

ROLES = [
    "bg",       # console body
    "panel",    # light keycap / card
    "panel2",   # inset, empty bar segments
    "ink",      # main text
    "dim",      # secondary text
    "key",      # dark key
    "key2",     # header strip, key sides, LCD window, card border
    "keyink",   # text on dark keys
    "red",
    "yellow",
    "green",
    "blue",
    "purple",
    "lav",      # lavender
    "white",    # card highlight (a lighter edge, not white, in dark mode)
    "accent",   # selected tab and header rule
]

THEMES = {
    "sfc": "Super Famicom / PAL SNES: gray body, A B X Y colors",
    "snes": "North American SNES: cool gray, purple and lavender",
    "nes": "NES: warm gray, charcoal strip, red keys",
    "famicom": "Famicom: cream body, maroon keys, black A and B",
}

PALETTES = {
    "light": {
        "sfc": [0xC6C3BD, 0xE4E1DA, 0xD2CFC8, 0x2B2A2E, 0x76737A, 0x4C4B52, 0x323137, 0xEEEBE4,
                0xD7372E, 0xF0BC22, 0x2F9E52, 0x3B55B0, 0x5A4A9E, 0xA9A5D6, 0xFAF8F3, 0xD7372E],
        "snes": [0xBEBEC6, 0xDDDDE3, 0xCDCDD5, 0x25242B, 0x6E6D78, 0x4A4954, 0x302F38, 0xECECF2,
                 0xC9353F, 0xE8B830, 0x3A9B6A, 0x4C5BB0, 0x4E3F93, 0xABA7DE, 0xF8F8FB, 0x4E3F93],
        "nes": [0xCFCBC2, 0xE9E6DE, 0xD9D5CC, 0x2D2C2F, 0x7A787C, 0x5A595E, 0x2F2E33, 0xEFECE5,
                0xC8202F, 0xD9A21F, 0x3E8E5A, 0x3F5BA9, 0x5B4C96, 0xA8A4D2, 0xF7F5F0, 0xC8202F],
        "famicom": [0xE9E1D0, 0xF7F1E4, 0xEDE5D4, 0x2A1C1C, 0x8A796C, 0x8E1D24, 0x5C1218, 0xF6EEDF,
                    0xB3262E, 0xC99A3E, 0x4E8A55, 0x3D5596, 0x6A4C8C, 0xB9A6CE, 0xFFFBF2, 0x1E1A1A],
    },
    "dark": {
        "sfc": [0x1C1B20, 0x2A292F, 0x3A3940, 0xEEEBE4, 0x8E8B92, 0x46454D, 0x121115, 0xEEEBE4,
                0xE5483F, 0xF2C232, 0x3DB566, 0x5A74D6, 0x7564C2, 0x4D4880, 0x38373E, 0xE5483F],
        "snes": [0x1A1A21, 0x272730, 0x363641, 0xECECF2, 0x8A8996, 0x43424F, 0x111117, 0xECECF2,
                 0xE04A55, 0xEEC244, 0x45B07C, 0x6274D0, 0x6B58C2, 0x4A4486, 0x34343E, 0x6B58C2],
        "nes": [0x1D1C1F, 0x2B2A2E, 0x3B3A3F, 0xEFECE5, 0x8F8C90, 0x48474C, 0x131215, 0xEFECE5,
                0xE0303F, 0xE8B12C, 0x45A56A, 0x5671C8, 0x7262B8, 0x4C467E, 0x38373C, 0xE0303F],
        "famicom": [0x1E1416, 0x2D1E21, 0x3E2A2D, 0xF6EEDF, 0xA08C80, 0x6E1A21, 0x120B0C, 0xF6EEDF,
                    0xD8363F, 0xD9AA4E, 0x5CA266, 0x5068B0, 0x8160A6, 0x5A3F6E, 0x3B2A2D, 0xC8303A],
    },
}


def hexs(v: int) -> str:
    return f"#{v:06X}"


def mix(a: int, b: int, t: float) -> int:
    """a moved toward b by t (0..1), per channel."""
    out = 0
    for shift in (16, 8, 0):
        ca, cb = (a >> shift) & 0xFF, (b >> shift) & 0xFF
        out |= round(ca + (cb - ca) * t) << shift
    return out


def roles(theme: str, mode: str) -> dict[str, int]:
    return dict(zip(ROLES, PALETTES[mode][theme]))


def ansi(theme: str, mode: str) -> dict[str, int]:
    """Terminal mapping. The palette has no cyan, so cyan is lavender taken
    from the opposite mode (the same mode's lavender is a fill color and is
    unreadable as text). Brights: dark mode mixes 25% toward white; light mode
    uses the dark palette's versions, which theme.h already brightened."""
    r = roles(theme, mode)
    other = roles(theme, "light" if mode == "dark" else "dark")
    hues = ["red", "green", "yellow", "blue", "purple"]
    if mode == "dark":
        base = {"black": r["panel"], "white": r["ink"], "cyan": other["lav"]}
        bright = {h: mix(r[h], 0xFFFFFF, 0.25) for h in hues}
        bright |= {"black": r["dim"], "white": mix(r["ink"], 0xFFFFFF, 0.6),
                   "cyan": mix(other["lav"], 0xFFFFFF, 0.25)}
    else:
        base = {"black": r["key2"], "white": r["key"], "cyan": other["lav"]}
        bright = {h: other[h] for h in hues}
        bright |= {"black": r["dim"], "white": r["ink"], "cyan": mix(other["lav"], 0x000000, 0.2)}
    base |= {h: r[h] for h in hues}
    order = ["black", "red", "green", "yellow", "blue", "purple", "cyan", "white"]
    out = {"background": r["bg"], "foreground": r["ink"], "cursor": r["accent"],
           "selection": r["panel2"]}
    for i, name in enumerate(order):
        out[f"color{i}"] = base[name]
        out[f"color{i + 8}"] = bright[name]
    return out


def as_md(theme: str, mode: str) -> str:
    lines = [f"### {theme} · {mode}", "", "| role | hex |", "|---|---|"]
    lines += [f"| {k} | `{hexs(v)}` |" for k, v in roles(theme, mode).items()]
    return "\n".join(lines)


def as_css(theme: str, mode: str) -> str:
    body = "\n".join(f"  --retro-{k}: {hexs(v)};" for k, v in roles(theme, mode).items())
    return f"/* retro-style: {theme} {mode} */\n:root {{\n{body}\n}}"


def overview_md() -> str:
    """Every combination in one table per mode: roles down, themes across."""
    out = []
    for mode in ("light", "dark"):
        out += [f"### {mode.capitalize()}", "",
                "| role | " + " | ".join(THEMES) + " |",
                "|---|" + "---|" * len(THEMES)]
        for i, role in enumerate(ROLES):
            out.append(f"| {role} | " + " | ".join(f"`{hexs(PALETTES[mode][t][i])}`" for t in THEMES) + " |")
        out.append("")
    return "\n".join(out)


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("theme", nargs="?", choices=THEMES)
    p.add_argument("mode", nargs="?", choices=("light", "dark"))
    p.add_argument("--format", choices=("md", "css", "ansi", "json"), default="md")
    a = p.parse_args()
    if not a.theme:
        print(overview_md())
        return
    mode = a.mode or "light"
    if a.format == "css":
        print(as_css(a.theme, mode))
    elif a.format == "ansi":
        for k, v in ansi(a.theme, mode).items():
            print(f"{k:<11} {hexs(v)}")
    elif a.format == "json":
        print(json.dumps({"theme": a.theme, "mode": mode,
                          "roles": {k: hexs(v) for k, v in roles(a.theme, mode).items()},
                          "ansi": {k: hexs(v) for k, v in ansi(a.theme, mode).items()}}, indent=2))
    else:
        print(as_md(a.theme, mode))


if __name__ == "__main__":
    main()
