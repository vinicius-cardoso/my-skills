# Typography

The device uses two bitmap fonts, both drawn without anti-aliasing:

| font | cell | used for |
|---|---|---|
| **Press Start 2P** (CodeMan38, SIL OFL 1.1) | 8×8, scaled 1× to 5× | titles, labels, tabs, keys, big numbers |
| **GLCD 5×7** (Adafruit GFX, BSD) | 6×8 | dense text: commands, question bodies, details |

Both are ASCII-only on the device. Labels and status text are UPPERCASE. Text
that doesn't fit is cut with a trailing `~`, not `…`.

## On the desktop

The GLCD font has no TTF, so dense text needs a stand-in. Go by role:

| role | font | notes |
|---|---|---|
| titles, headings, labels, big numbers | **Press Start 2P** | only at 8, 16, 24, 32 px (multiples of 8). Never for body text or code: it can't be read at small sizes. |
| code, terminal, dense UI text | **Departure Mono** (Helena Zhang, OFL) | the closest to the GLCD feel that's still readable. Pixel grid of 11 px: use 11, 22… |
| same, bitmap fallback | **Terminus** | already installed (`/usr/share/fonts/misc/ter-*.otb`). Bitmap `.otb` works in Qt/KDE apps and terminals, but **not** in Chromium/Electron apps (VS Code, Chrome): those need a TTF. |
| long reading, system UI (menus, dialogs) | keep the system sans | a pixel font on every menu tires the eyes. Here the retro look comes from colors and shapes. Change it only if asked. |

Before recommending a font, check that it's installed (`fc-list | grep -i
<name>`). If it isn't, install it per user, no sudo:

```bash
mkdir -p ~/.local/share/fonts/retro
# Press Start 2P (Google Fonts repo)
curl -fsSLo ~/.local/share/fonts/retro/PressStart2P-Regular.ttf \
  https://github.com/google/fonts/raw/main/ofl/pressstart2p/PressStart2P-Regular.ttf
# Departure Mono: get the release zip from https://departuremono.com
# (GitHub: rektdeckard/departure-mono), copy the .otf/.ttf here
fc-cache -f ~/.local/share/fonts
```

Download URLs change; if one fails, look up the current one rather than
guessing. Record what was installed in `applied.md` (fonts live in `~`, so the
other machine needs them too).

## Rendering

- Pixel fonts look right only at integer multiples of their grid. Off-grid
  sizes blur.
- Turn off font smoothing where the app allows it per font (e.g. on the web,
  `-webkit-font-smoothing: none`; a CSS `font-smooth` property isn't
  reliable). On KDE, global anti-aliasing applies to every font, so don't turn
  it off system-wide just for this.
- Images and icons: `image-rendering: pixelated`, integer scale.
