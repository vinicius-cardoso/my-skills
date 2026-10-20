# Orca IDE

Status: **theme file prepared, not imported yet** (desktop, 2026-10-20).

## What can be themed

Found by reading the app bundle (v of 2026-10-20, `resources/app.asar.unpacked/out`):

- **App UI:** only `theme` = dark / light / system. No color themes, no VS
  Code theme support.
- **Code editor (Monaco):** hard-coded to `vs-dark` / `vs`. Not themable.
- **Terminal:** a built-in catalog (`terminalThemeDark`, `terminalThemeLight`)
  plus up to 200 custom themes (`terminalCustomThemes`). Custom themes come in
  by importing **Warp-format YAML**: Settings > Terminal > Terminal Themes >
  *Import from YAML*, then pick it under *Dark Theme*.
- **Left sidebar:** `leftSidebarAppearanceMode: match-terminal` takes its tint
  from the terminal theme, so it follows the import.

So "an Orca theme" means a terminal theme. Since Orca is mostly terminals,
that's most of the window.

## Where

- Settings live in SQLite: `~/.config/orca/profiles/local-default/profile-state.db`,
  table `profile_state_documents`, domain `settings` (JSON payload with a
  revision counter). `orca-data.json` next to it is the old pre-SQLite copy.
- Don't write the DB while Orca runs: the app holds settings in memory and
  writes with an expected revision. Use the UI import.
- The `orca` CLI can't change settings (only agent hooks).

## Warp YAML that Orca reads

`name`, `background`, `foreground`, `cursor` (falls back to `accent`),
`terminal_colors.normal.{black…white}` and `terminal_colors.bright.{…}`.
No selection color, gradients or background images.

Converting a VS Code theme: take `terminal.background/foreground` (or
`editor.*`), and `terminal.ansi*` / `terminal.ansiBright*`. Fill an ANSI
color the theme leaves out with VS Code's default for it.

## Files

- `~/.config/orca-themes/traditional-japanese-fuji.yaml`: Traditional
  Japanese Fuji (VS Code theme by AdriaForcada) converted to Warp YAML.
