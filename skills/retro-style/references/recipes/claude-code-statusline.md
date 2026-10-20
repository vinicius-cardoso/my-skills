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
- **Font:** the terminal's, and it stays that way. The user rejected a pixel
  font here (2026-10-20, "very ugly"). A terminal has one font for the whole
  grid, so the only route was a fallback trick: Press Start 2P glyphs on the
  fullwidth forms (U+FF01-FF5E), a fontconfig rule to prefer them, and the
  script printing labels in fullwidth. It was reverted along with the font
  and the rule. Don't offer it again.

## Mapping

The script has a `ROLE` table (hex per role, from `palette.py <theme> <mode>
--format json`) and builds `FG_<role>` / `BG_<role>` from it once. To switch
theme or mode, replace that table only.

| element | look | roles |
|---|---|---|
| signature | `●●●●` | red, yellow, green, blue |
| account | rounded chip, lowercase | WORK `blue`, PERSONAL `green`, unknown `purple`; text `keyink` |
| 5h / 7d / context | `5h ▌▌▌▌▌▌▌▌▌▌ 42% 1h20m` | label and reset `dim`; bar and % in the level color; empty segments `panel2` |
| levels | 60/85 house rule | green < 60, yellow 60–84, red ≥ 85 |
| directory | plain text | `cyan` = light-mode `lav` (#ABA7DE), the palette's ANSI cyan |
| git branch | plain text, `*` when dirty | `ink`; the `*` in `yellow` (attention) |
| model · effort | rounded chip, lowercase | `accent` fill, `keyink` text |
| separators | two spaces | — |

The bar uses `▌` (left half block): the empty half of each cell is the 2px gap
between segments on the device. 10 segments, rounded (42% → 4).

## Gotchas

- Build escapes once with `printf -v`. A `$(…)` per color adds a fork for
  every use, and the script runs on every update. With the loop, a run takes
  ~40 ms (the plain version took ~30 ms).
- **All text lowercase** (`personal`, `5h`, `1h20m`, `opus 5.5 · xhigh`): the
  user's choice for this app, overriding the UPPERCASE copy rule in
  `motifs.md`.
- Keep `LC_NUMERIC=C` (pt_BR rejects `45.2` in `printf '%.0f'`), and
  `LC_CTYPE=C.UTF-8` so the `$''` caps work under any caller locale.
- Text on a yellow chip would need `key2`. No element uses one today.
- The old thresholds were 80% (5h/7d) and 70% (context). They now follow the
  60/85 house rule.
