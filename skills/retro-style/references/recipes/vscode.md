# VS Code

Status: **mapping only, not applied yet.** Once it's applied, update this file
with whatever had to change.

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
- `editor.fontLigatures`: false.
- Leave the workbench UI font alone unless asked (see typography.md).
