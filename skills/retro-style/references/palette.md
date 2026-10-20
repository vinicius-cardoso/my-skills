# Palette

Four consoles, each in light and dark: 8 combinations of the same 16 roles.
Source: `claude-usage-display/firmware/esp32_tft/theme.h`. The data lives in
`scripts/palette.py`, and the tables below are its output (`python3
scripts/palette.py`). Change the palette there, never by hand here.

| theme | look | accent |
|---|---|---|
| `sfc` | Super Famicom / PAL SNES: gray body, A B X Y button colors | red |
| `snes` | North American SNES: cool gray, purple and lavender | purple |
| `nes` | NES: warm gray, charcoal strip, red keys | red |
| `famicom` | Famicom: cream body, maroon keys, black A and B | near-black (light), red (dark) |

Dark modes use the console's darkest plastic as the body, keycap colors for
text, and the same button colors brightened a touch.

## Roles

Map an app's color slots to **roles**, never to raw hex. Then switching theme
or mode only means swapping the table.

| role | what it is on the device | typical app slot |
|---|---|---|
| `bg` | console body | window/app background, sidebars |
| `panel` | light keycap, card | editor/content area, cards, popups, inputs |
| `panel2` | inset, empty bar segment | hover, current line, selection (subtle), separators, empty progress |
| `ink` | main text | foreground text |
| `dim` | secondary text | comments, placeholders, inactive tab text, line numbers |
| `key` | dark key | buttons, unselected tabs/keys |
| `key2` | header strip, key side, card border | title bar, status bar, borders, 2px "key side" shadow |
| `keyink` | text on dark keys | text on `key`/`key2`/`accent`/color fills |
| `red` `yellow` `green` `blue` | the A B X Y buttons | error, warning, success, info |
| `purple` | SNES purple | keywords, secondary accent |
| `lav` | lavender | selection fill, badges; in dark mode it's a fill color, too dark for text |
| `white` | card top highlight | 1px top edge of cards (in dark mode it's a lighter edge, not white) |
| `accent` | selected tab, header rule | focus, active tab/item, primary button, cursor, links |

Rules that keep the meaning in every palette:

- **Text on yellow uses `key2`** (dark) in both modes. Text on any other
  color fill uses `keyink`.
- **Levels:** green below 60%, yellow 60 to 84%, red from 85%.
- **States:** green = busy/running/ok, yellow = waiting for me/attention,
  red = error/alarm, `dim` = idle.
- **Accounts:** WORK = blue, PERSONAL = green, unknown = purple.

## Terminal (ANSI 16)

`python3 scripts/palette.py <theme> <mode> --format ansi` prints the 16
colors plus background, foreground, cursor and selection. The palette has no
cyan, so cyan is lavender taken from the opposite mode (the same mode's
lavender doesn't read as text). Brights: in dark mode the hue mixed 25% toward
white; in light mode the dark palette's version of the hue.

## Other formats

- `--format css`: `:root { --retro-<role>: … }`
- `--format json`: roles and ANSI, for scripts that write config files

## All combinations

### Light

| role | sfc | snes | nes | famicom |
|---|---|---|---|---|
| bg | `#C6C3BD` | `#BEBEC6` | `#CFCBC2` | `#E9E1D0` |
| panel | `#E4E1DA` | `#DDDDE3` | `#E9E6DE` | `#F7F1E4` |
| panel2 | `#D2CFC8` | `#CDCDD5` | `#D9D5CC` | `#EDE5D4` |
| ink | `#2B2A2E` | `#25242B` | `#2D2C2F` | `#2A1C1C` |
| dim | `#76737A` | `#6E6D78` | `#7A787C` | `#8A796C` |
| key | `#4C4B52` | `#4A4954` | `#5A595E` | `#8E1D24` |
| key2 | `#323137` | `#302F38` | `#2F2E33` | `#5C1218` |
| keyink | `#EEEBE4` | `#ECECF2` | `#EFECE5` | `#F6EEDF` |
| red | `#D7372E` | `#C9353F` | `#C8202F` | `#B3262E` |
| yellow | `#F0BC22` | `#E8B830` | `#D9A21F` | `#C99A3E` |
| green | `#2F9E52` | `#3A9B6A` | `#3E8E5A` | `#4E8A55` |
| blue | `#3B55B0` | `#4C5BB0` | `#3F5BA9` | `#3D5596` |
| purple | `#5A4A9E` | `#4E3F93` | `#5B4C96` | `#6A4C8C` |
| lav | `#A9A5D6` | `#ABA7DE` | `#A8A4D2` | `#B9A6CE` |
| white | `#FAF8F3` | `#F8F8FB` | `#F7F5F0` | `#FFFBF2` |
| accent | `#D7372E` | `#4E3F93` | `#C8202F` | `#1E1A1A` |

### Dark

| role | sfc | snes | nes | famicom |
|---|---|---|---|---|
| bg | `#1C1B20` | `#1A1A21` | `#1D1C1F` | `#1E1416` |
| panel | `#2A292F` | `#272730` | `#2B2A2E` | `#2D1E21` |
| panel2 | `#3A3940` | `#363641` | `#3B3A3F` | `#3E2A2D` |
| ink | `#EEEBE4` | `#ECECF2` | `#EFECE5` | `#F6EEDF` |
| dim | `#8E8B92` | `#8A8996` | `#8F8C90` | `#A08C80` |
| key | `#46454D` | `#43424F` | `#48474C` | `#6E1A21` |
| key2 | `#121115` | `#111117` | `#131215` | `#120B0C` |
| keyink | `#EEEBE4` | `#ECECF2` | `#EFECE5` | `#F6EEDF` |
| red | `#E5483F` | `#E04A55` | `#E0303F` | `#D8363F` |
| yellow | `#F2C232` | `#EEC244` | `#E8B12C` | `#D9AA4E` |
| green | `#3DB566` | `#45B07C` | `#45A56A` | `#5CA266` |
| blue | `#5A74D6` | `#6274D0` | `#5671C8` | `#5068B0` |
| purple | `#7564C2` | `#6B58C2` | `#7262B8` | `#8160A6` |
| lav | `#4D4880` | `#4A4486` | `#4C467E` | `#5A3F6E` |
| white | `#38373E` | `#34343E` | `#38373C` | `#3B2A2D` |
| accent | `#E5483F` | `#6B58C2` | `#E0303F` | `#C8303A` |

