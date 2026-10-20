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

### 2026-10-20 · fonts · vinicius-antunes-desktop
- **Look:** Press Start 2P (google/fonts) and Departure Mono v1.500
  (rektdeckard/departure-mono release zip), installed per user.
- **Files:** `~/.local/share/fonts/retro/` (`PressStart2P-Regular.ttf`,
  `DepartureMono-Regular.otf`, `DepartureMono-LICENSE`)
- **Undo:** delete the folder, `fc-cache -f`.
- **Notes:** the laptop needs the same folder before any app there uses them.

### 2026-10-20 · VS Code · vinicius-antunes-desktop
- **Look:** snes dark; editor and terminal in Departure Mono 22px, ligatures
  off, block cursor (solid).
- **Files:** `~/.config/Code/User/settings.json` (backup:
  `settings.json.bak-retro-20261020`)
- **Undo:** set `workbench.colorTheme` back to `Dracula Theme` (the colors are
  scoped to `[Default Dark Modern]` and go dormant), or restore the backup.
- **Notes:** previous theme was Dracula. Settings Sync is off, so the laptop
  needs its own apply. Already-running VS Code needs a full restart to see
  newly installed fonts.
