# VS Code

Status: **reverted.** Applied on the desktop on 2026-10-20 and undone the same
day at the user's request.

**User preference (read this first):** for VS Code, only the color theme
changes, and it should be an existing Marketplace theme, not overrides written
by hand. Don't touch the editor or terminal font. Show options first: search
the Marketplace API, pull each theme's colors from its VSIX, and render
previews side by side. Shortlist from 2026-10-20:
https://claude.ai/artifact/21S6XM4bCzobUD2F1KX1ZB (Earthbound, GameBoy
Classic, PICO-8, NES Light, 8-Bit, CRT Themes, Arcade, Mario): **rejected**,
the user wants Famicom colors (cream, maroon, red, gold). Second shortlist,
scored by color distance over 1,668 variants:
https://claude.ai/artifact/RJJWiTjCxB7DzehqDkxBzp (Showa Retro Caramel,
Amber CRT Daylight, Paddy Ox, Traditional Japanese Shrine, Earth Tone,
Primary-ish Warm, Darker+ Material Red, Bearded Ruby). The mapping
below stays as a reference for a custom theme, used only if asked.

## Where

- Settings: `~/.config/Code/User/settings.json`. The package has already
  renamed things once (see the `vscode-pin-breaks-on-desktop-rename` memory),
  so check which of `~/.config/Code`, `~/.config/Code - OSS` or
  `~/.config/VSCodium` exists.
- No extension needed: use `workbench.colorCustomizations`,
  `editor.tokenColorCustomizations` and `terminal.ansi*` in settings.json,
  scoped to a base theme so it can be switched off:
  `"workbench.colorCustomizations": { "[Default Dark Modern]": { … } }`.
  Base: `Default Dark Modern` for dark mode, `Default Light Modern` for light.
- Settings Sync may push this to the other machine on its own. Check whether
  it's on before applying on the second machine.

## Role mapping

| VS Code key | role |
|---|---|
| `titleBar.activeBackground`, `activityBar.background`, `statusBar.background` | `key2` |
| `titleBar.activeForeground`, `activityBar.foreground`, `statusBar.foreground` | `keyink` |
| `statusBar.border`, `titleBar.border` | `accent` (the header rule) |
| `activityBar.activeBorder`, `tab.activeBorderTop`, `focusBorder`, `progressBar.background` | `accent` |
| `activityBarBadge.background`, `badge.background` | `accent` / text `keyink` |
| `sideBar.background`, `editorGroupHeader.tabsBackground`, `tab.inactiveBackground`, `panel.background` | `bg` |
| `editor.background`, `tab.activeBackground`, `editorWidget.background`, `input.background`, `dropdown.background` | `panel` |
| `editor.lineHighlightBackground`, `list.hoverBackground`, `editorIndentGuide.background1` | `panel2` |
| `editor.selectionBackground`, `list.activeSelectionBackground` | `lav` (dark) / `panel2` (light) |
| `editor.foreground`, `foreground`, `tab.activeForeground` | `ink` |
| `tab.inactiveForeground`, `editorLineNumber.foreground`, `descriptionForeground` | `dim` |
| `editorLineNumber.activeForeground` | `ink` |
| `button.background` / `button.foreground` | `accent` / `keyink` |
| `button.secondaryBackground` | `key` |
| `sideBar.border`, `panel.border`, `editorGroup.border`, `widget.border` | `key2` |
| `editorError.foreground`, `errorForeground` | `red` |
| `editorWarning.foreground` | `yellow` |
| `editorInfo.foreground` | `blue` |
| `gitDecoration.addedResourceForeground` / `modified` / `deleted` | `green` / `yellow` / `red` |
| `terminal.background` / `terminal.foreground` / `terminal.ansi*` | from `palette.py --format ansi` |
| `editorCursor.foreground` | `accent` |

Also set, beyond the table: menus (`menu.*`: `panel`, selection `accent`),
suggest/hover/quick-input widgets (`panel`, border `key2`, selected `lav`),
`sideBarSectionHeader.*` (`key`/`keyink`), status bar items for error/warning
(`red`/`yellow`, yellow with `key2` text), `statusBar.debuggingBackground`
`yellow`, scrollbar sliders (`key` → `dim` → `accent`), gutter diff colors
(green/yellow/red).

Find matches: no alpha (motifs rule 1), so `editor.findMatchBackground` is
`lav` with a `yellow` border, other matches `panel2` with a `lav` border.
A solid `yellow` fill would need `key2` text, which VS Code can't set.

No soft shadows (motifs rule 1): set `widget.shadow` and `scrollbar.shadow`
to `#00000000`.

## Syntax (`editor.tokenColorCustomizations.textMateRules`)

| scope | role |
|---|---|
| `comment` | `dim`, italic off |
| `keyword`, `storage`, `storage.type` | `purple` |
| `string` | `green` |
| `constant.numeric`, `constant.language` | `yellow` in dark, `red` in light (yellow has no contrast on a light body) |
| `entity.name.function`, `support.function` | `blue` |
| `entity.name.type`, `entity.name.class`, `support.type` | `accent` (dark) / `purple` (light) |
| `variable`, `punctuation` | `ink` |
| `invalid` | `red` |

## Fonts

- `editor.fontFamily`: `'Departure Mono', monospace`, `editor.fontSize`: 11
  or 22 (the font's grid). VS Code can't use the bitmap Terminus `.otb`.
  The desktop (96 DPI, no scaling) uses 22: 11 is crisp but too small to
  read. Same for `terminal.integrated.font*`.
- `editor.cursorStyle: block` + `cursorBlinking: solid` (and the terminal's
  cursor block) for the CYD feel.
- Fonts installed while VS Code is open don't show up until a full restart
  (Reload Window isn't enough).
- Settings Sync check: no `sync.*enable*` keys in
  `~/.config/Code/User/globalStorage/state.vscdb` means it's off.
- Applying: a small Python script that loads settings.json, fills the
  `[Default Dark Modern]` block from `palette.py --format json` and sets
  `workbench.colorTheme`. Only works while settings.json is strict JSON (no
  comments); check with `json.load` first.
- `editor.fontLigatures`: false.
- Leave the workbench UI font alone unless asked (see typography.md).
