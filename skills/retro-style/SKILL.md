---
name: retro-style
description: The personal retro look (Nintendo console hardware, SFC / SNES / NES / Famicom, 16-color palettes in light and dark, Press Start 2P pixel font, keycaps, block bars) that started on the claude-usage-display CYD, and how to apply it to anything on the desktop or laptop. Use whenever the user asks to customize, theme, restyle, rice or change colors/fonts/look of any app or part of the system (VS Code, terminal, Konsole, KDE/Plasma, browser, Obsidian, prompt, wallpaper, GRUB, SDDM, a web page or project UI), especially when they say "retro", "my style", "my theme", "pixel", "8-bit", "SNES", "Nintendo", "like the CYD", "estilo retrô", or ask which colors/fonts the retro style uses.
---

# Retro style

One look across every machine and app, taken from the claude-usage-display
desk console (an ESP32 "CYD" touch screen): Nintendo hardware, 16 colors per palette, bitmap fonts, flat
fills with hard 2px offsets. "Retro" in a customization request means **this**,
not a generic synthwave/CRT/vaporwave look.

## Reference

Read only what the task needs:

| file | what it has |
|---|---|
| `references/palette.md` | the 4 themes × light/dark, the 16 **roles** and what each is for, all hex values, the terminal mapping |
| `scripts/palette.py` | the palette data; exports `md`, `css`, `ansi`, `json` for one theme/mode |
| `references/typography.md` | which font for which role, sizes, how to install them |
| `references/motifs.md` | the shapes (keycaps, cards, header strip, block bars, A B X Y dots) + a CSS starter |
| `references/recipes/<app>.md` | how this style maps onto a specific app: config paths, keys, gotchas |
| `references/applied.md` | the **house choice** (theme + mode) and the log of what's applied on which machine |

The original lives in `~/projects/hardware/claude-usage-display`
(`firmware/esp32_tft/theme.h`, `gfx.h`, `ui.h`, `docs/screenshots/`). Look at
the screenshots when you need to see the look rather than read about it.

## Applying it to something

1. **Where am I and what exists.** `hostname` (`vinicius-antunes-desktop` or
   `vinicius-antunes-laptop`). Read `references/applied.md`: the house choice,
   and whether this app is already done here or on the other machine.
2. **Theme and mode.** Use the house choice. If the mode isn't chosen yet, or
   the request names a different theme, ask with AskUserQuestion (show the 4
   themes and light/dark) and record a house-level answer in `applied.md`.
   A one-off (e.g. "famicom just for the terminal") is logged on the entry,
   not as the house choice.
3. **Recipe.** If `references/recipes/<app>.md` exists, follow it. If not,
   find out how that app is themed (its config files on this machine, its
   docs; search the web when unsure, because version details matter), map its
   color slots to **roles** from `palette.md`, and write the new recipe before
   applying it: config paths, the role mapping, fonts, gotchas. Mark it
   "mapping only, not applied yet" until it's been applied.
4. **Map by role, not by hex.** Generate values with
   `python3 scripts/palette.py <theme> <mode> --format css|ansi|json`.
   Keep the semantics in `palette.md`: green ok, yellow attention (with dark
   `key2` text on it), red error, `accent` = selected/focus, levels 60/85.
5. **Fonts.** Follow `typography.md`: Press Start 2P only for titles/labels at
   multiples of 8 px, a readable pixel mono for code, and system UI fonts left
   alone unless asked. Check `fc-list` before assuming a font is installed.
6. **Back up, then apply.** Before touching a config file, copy it to
   `<file>.bak-retro-YYYYMMDD`. Prefer reversible mechanisms: an app's own
   theme/scheme file or a scoped override over editing a shipped theme.
   Anything under `/etc` or `/usr` needs sudo (see the sudo/askpass memory)
   and disappears on a reinstall, so say so.
7. **Show it.** Tell the user what changed and how to see it (restart the
   app, reload the window). If you can take a screenshot, do and look at it.
   Check the motifs rules: no gradients or soft shadows, nothing outside the
   16 colors.
8. **Record and push.** Add an entry to `applied.md` (date, app, machine,
   look, files, backup, undo). Update the recipe with anything learned. Then
   commit and push the skill repo, so the other machine gets it:

   ```bash
   cd ~/projects/claude/my-skills
   git add skills/retro-style && git commit -m "retro-style: <app> on <machine>" && git push
   ```

   Never add a co-author line to these commits.
9. **The other machine.** Offer to apply the same there. Both are reachable
   over SSH (`ssh laptop` from the desktop, `ssh desktop` from the laptop).
   On that machine, first `git pull` in `~/projects/claude/my-skills`, then
   follow the recipe and log a separate entry.

## Answering "what's my style"

When the user asks about the style itself (colors, fonts, "what's the hex for
the SNES purple", "give me the palette for X"), answer from the references
and offer the `palette.py` export in whatever format they need. Don't apply
anything.

## Keeping it in sync with the device

If `claude-usage-display/firmware/esp32_tft/theme.h` changes (new theme,
tweaked colors), update `PALETTES` in `scripts/palette.py`, regenerate the
tables at the bottom of `palette.md` (`python3 scripts/palette.py`), and list
in `applied.md` the apps that now need re-applying.
