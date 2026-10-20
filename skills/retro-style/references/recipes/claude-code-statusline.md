# Claude Code status line

Status: **applied** on the desktop (2026-10-20).

## Where

- `~/.claude/settings.json` → `"statusLine": {"type": "command", "command":
  "bash \"$HOME/.claude/statusline-command.sh\""}`. Settings stay as they are.
  Only the script changes.
- `~/.claude/statusline-command.sh` gets the session JSON on stdin and prints
  one line with ANSI escapes. Claude Code re-runs it on every update, so a
  change shows up right away. No restart is needed.
- The script is **local to each machine** (Syncthing only syncs
  `~/.claude/projects`), and it holds account emails, so it stays out of this
  public repo. To copy it: `scp desktop:~/.claude/statusline-command.sh
  ~/.claude/` (back up the target first).

## What can be themed

- **Colors:** 24-bit escapes (`ESC[38;2;R;G;Bm` foreground, `ESC[48;2;R;G;Bm`
  background). Orca's terminal (xterm.js) renders them, and so does Konsole.
- **Rounded chips:** the Nerd Font half circles U+E0B6 / U+E0B4, drawn in the
  chip color on the default background. The terminal font (Orca:
  `DejaVu Sans Mono`, which isn't installed, so it's really Noto Sans Mono)
  lacks them, but fallback finds `MesloLGS NF` / `Noto Mono NF`.
- **Pixel font:** a terminal has one font for the whole grid, so Press Start 2P
  can't be set for the status line alone, and as the main terminal font it's
  unreadable. The workaround is fallback:
  1. `scripts/fullwidth_font.py` builds **Retro Fullwidth**, with Press Start
     2P's glyphs on the fullwidth forms (U+FF01-FF5E). Install it to
     `~/.local/share/fonts/retro/RetroFullwidth-Regular.ttf`.
  2. `~/.config/fontconfig/conf.d/60-retro-fullwidth.conf` prepends it for
     any lookup whose charset contains U+FF21. Without it the CJK fonts
     (Source Han Sans) win. Generic matches (`fc-match monospace`) don't
     change.
  3. The script's `px()` turns ASCII into fullwidth (`5H` → `５Ｈ`). Each
     character takes 2 cells, which fits the square glyphs.

  ```xml
  <match target="pattern">
    <test name="charset" compare="contains"><charset><int>0xff21</int></charset></test>
    <edit name="family" mode="prepend" binding="strong"><string>Retro Fullwidth</string></edit>
  </match>
  ```

  Check with `fc-match -s ':charset=ff21:lang=en' family | head -1` (should
  print `Retro Fullwidth`). An app picks up the new font only after a
  restart; until then it shows the fullwidth text in a CJK font.

## Mapping

The script has a `ROLE` table (hex per role, from `palette.py <theme> <mode>
--format json`) and builds `FG_<role>` / `BG_<role>` from it once. To switch
theme or mode, replace that table only.

| element | look | roles |
|---|---|---|
| signature | `●●●●` | red, yellow, green, blue |
| account | rounded chip, pixel font, UPPERCASE | WORK `blue`, PERSONAL `green`, unknown `purple`; text `keyink` |
| 5h / 7d / context | `5H ▌▌▌▌▌▌▌▌▌▌ 42% 1H20M` | label and % in the pixel font; reset time in mono; label and reset `dim`; bar and % in the level color; empty segments `panel2` |
| levels | 60/85 house rule | green < 60, yellow 60–84, red ≥ 85 |
| directory | plain text | `cyan` = light-mode `lav` (#ABA7DE), the palette's ANSI cyan |
| git branch | plain text, `*` when dirty | `ink`; the `*` in `yellow` (attention) |
| model · effort | rounded chip, pixel font, UPPERCASE | `accent` fill, `keyink` text |
| separators | two spaces | — |

The bar uses `▌` (left half block): the empty half of each cell is the 2px gap
between segments on the device. 10 segments, rounded (42% → 4).

## Gotchas

- Build escapes once with `printf -v`. A `$(…)` per color adds a fork for
  every use, and the script runs on every update. With the loop, a run takes
  ~40 ms (the plain version took ~30 ms).
- Keep `LC_NUMERIC=C` (pt_BR rejects `45.2` in `printf '%.0f'`), and
  `LC_CTYPE=C.UTF-8` so `px()` and the `$''` caps work under any caller
  locale.
- The pixel font goes on labels, numbers and chips only. Path, branch and
  reset times stay mono (the device's GLCD role), because fullwidth doubles
  the width and the line is already ~180 cells.
- At 14 px a font pixel is 2 px (scale 8/7), so caps are 14 px tall, taller
  than the mono text. That's the crisp size; 1 px pixels would be too small.
- Text on a yellow chip would need `key2`. No element uses one today.
- The old thresholds were 80% (5h/7d) and 70% (context). They now follow the
  60/85 house rule.
