# Applied

What has been customized, on which machine, and how to undo it. Read this
before applying anything, so the machines stay consistent and nothing is done
twice. This repo is public: no secrets, tokens, IDs or IP addresses here.

## House choice

The default for every new customization, unless a request says otherwise.

- **Theme:** `snes` (North American SNES), the CYD's default in `config.h`.
- **Mode:** `dark` (chosen 2026-10-20, when VS Code was themed).

## Log

Newest first. One entry per app per machine.

<!--
### YYYY-MM-DD · <app> · <machine hostname>
- **Look:** <theme> <mode>; fonts: …
- **Files:** `~/.config/…` (backup: `….bak-retro-YYYYMMDD`)
- **Undo:** <how, in one line>
- **Notes:** what broke or surprised, if anything
-->

### 2026-10-20 · Claude Code status line · vinicius-antunes-desktop
- **Look:** snes dark, 24-bit ANSI: A B X Y dots, account and model as
  rounded chips, 5h/7d/context as 10-segment `▌` bars at 60/85 levels.
  Labels, numbers and chips in Press Start 2P through the fullwidth fallback
  font. Everything else uses the terminal's font.
- **Files:** `~/.claude/statusline-command.sh` (backup:
  `statusline-command.sh.bak-retro-20261020`), `settings.json` untouched;
  `~/.local/share/fonts/retro/RetroFullwidth-Regular.ttf` (built with
  `scripts/fullwidth_font.py`); `~/.config/fontconfig/conf.d/60-retro-fullwidth.conf`
  (new, the directory didn't exist).
- **Undo:** copy the backup over the script; delete the font and the
  fontconfig file, `fc-cache -f`.
- **Notes:** colors and rounded chips checked live in Orca. The pixel font
  checked in a fresh headless Chrome; Orca needs a restart to load it. Usage
  thresholds went from 80/70 to 60/85. See `recipes/claude-code-statusline.md`.

### 2026-10-20 · fonts · vinicius-antunes-desktop
- **Look:** Press Start 2P (google/fonts) and Departure Mono v1.500
  (rektdeckard/departure-mono release zip), installed per user.
- **Files:** `~/.local/share/fonts/retro/` (`PressStart2P-Regular.ttf`,
  `DepartureMono-Regular.otf`, `DepartureMono-LICENSE`)
- **Undo:** delete the folder, `fc-cache -f`.
- **Notes:** the laptop needs the same folder before any app there uses them.

### 2026-10-20 · Orca IDE · vinicius-antunes-desktop
- **Look:** terminal theme `Traditional Japanese Fuji` (from the VS Code
  theme), imported through the UI. The app UI and code editor can't be themed.
- **Files:** `~/.config/orca-themes/traditional-japanese-fuji.yaml`. Orca
  stores the import in its own settings DB. Previous terminal theme:
  `Tokyo Night`.
- **Undo:** Settings > Terminal > Dark Theme > `Tokyo Night`.
- **Notes:** import pending on 2026-10-20 (the user does it in Settings).
  See `recipes/orca.md`.

### 2026-10-20 · VS Code · vinicius-antunes-desktop
- **Look:** Marketplace theme `Traditional Japanese Shrine`
  (extension `AdriaForcada.traditional-japanese-vscode-theme` v1.3.3), picked
  from the Famicom-colors shortlist
  (https://claude.ai/artifact/RJJWiTjCxB7DzehqDkxBzp). Font unchanged.
- **Files:** `~/.config/Code/User/settings.json`, only `workbench.colorTheme`
  (was `Dracula Theme`; backup `settings.json.bak-retro-20261020`)
- **Undo:** set the theme back to Dracula; optionally uninstall the extension.
- **Notes:** a first attempt with hand-written snes dark overrides plus
  Departure Mono was reverted: the user wants an existing theme and the
  default font. Settings Sync is off, so the laptop needs its own install.
