---
name: theme-picker
description: Build an interactive theme picker artifact for a project's visual identity - N design directions (default 10), each with heading, body and mono Google Fonts plus a light and dark palette, previewed on a realistic mock of the project's own screens, with a Light/Dark/System switch, per-role mixing (heading font from one, mono from another, palette from a third), a live "your combination" card and a copy-my-choice button. Then record the chosen look as docs/design/visual-identity.md. Use when Vinícius types /theme-picker, or asks to choose fonts/colors/palette/visual identity/look for a project, "give me font and color options", "let me pick the design", "escolher fontes e cores", before any UI design work starts on a new project.
---

# Theme picker

Vinícius picks the look of every new project from a hands-on artifact, not from
a description. He switches light/dark/system, compares directions on a
realistic screen, mixes roles across directions and copies the result back.
This skill reproduces the page he liked on Wiredex. `template.html` next to
this file is that page, generalized.

## 1. Get the context

Read what the repo already says before asking: `README.md`, `CLAUDE.md`,
`docs/`, any existing tokens or theme file. If a design system already
exists, say so and ask whether he really wants to replace it.

Then ask, with AskUserQuestion, only for what the repo doesn't answer:

- **What the app is**, in one or two sentences, and who uses it (device, how often).
- **Main screens**: the 2-3 screens the preview should imitate.
- **Mood or constraints**: e.g. "technical but not cold", "no pure black",
  brand colors to keep. "None" is a valid answer.
- **How many directions**: default 10.

## 2. Design the directions

Each direction is one entry in `OPTIONS`:

```js
{ name, concept,            // concept: one line from the subject's own world
  display, body, mono,      // Google Fonts families
  light: { bg, surface, text, muted, border, primary, onPrimary, accent, accentInk },
  dark:  { …same keys… } }
```

Rules:

- **Rooted in the subject.** Names and concepts come from the project's world:
  its materials, tools, jargon. Wiredex used solder mask, Kapton tape,
  oscilloscope channels and blueprints. Adjectives like "Modern" or "Bold"
  are not concepts.
- **Actually different.** Spread across hue families, serif vs sans,
  geometric vs humanist, condensed vs wide, and warm vs cool neutrals. No two
  directions share a primary hue family unless their grounds differ sharply.
- **Avoid the AI-default looks** unless a concept truly calls for one: warm
  cream with a serif display and terracotta; near-black with one acid-green
  or vermilion pop; purple-to-blue gradients; Inter or Space Grotesk as the
  safe choice.
- **Both themes are designed**, not inverted. Dark grounds carry a slight hue
  bias toward the direction's primary.
- **Contrast is checked, not guessed.** Run a quick WCAG script over every
  direction and mode: `text`, `muted`, `primary`, `accentInk` and the
  semantic colors on `bg` and `surface` must be ≥ 4.5:1, and `onPrimary` on
  `primary` must be ≥ 4.5:1. Fix any failure before building.
- `accent` is for fills. `accentInk` is the accent when used as text.
- `SEM` holds the semantic colors (ok / warn / crit) per mode. They are status
  colors, never the brand accent.

## 3. Build the page

1. The Artifact tool's `quickstart` (intent `other`) comes first, as that
   tool requires.
2. Copy `template.html` into the scratchpad and replace only the marked
   project-specific parts:
   - the `<!-- REPLACE -->` header: eyebrow, title (`Pick a look for <Project>`) and the count
   - `<title>`: `<Project> Theme Picker`
   - the Google Fonts `<link>`: exactly the families used, and their weights
   - `SEM`, `OPTIONS` and `previewHTML()`
   - the `.note` paragraph's example status names
3. **The preview is the point.** `previewHTML()` imitates a real screen of
   *this* app with real example data, never lorem ipsum. It includes:
   - a top nav with the app name
   - a big line in the display font
   - a data table with status pills in `--o-ok` / `--o-warn` / `--o-crit`
   - a code or technical snippet in the mono font
   - a primary and a secondary button
   - one detail only this domain has (Wiredex: a pin table and a netlist line)

   Style it only through the `--o-*` variables, so every direction and the
   combination card render correctly. Add CSS for new preview elements next
   to the existing `.pv-*` rules.
4. Leave the generic machinery alone: the Light/Dark/System switch, the
   per-role buttons (heading / body / mono / palette / all), the
   combination card, the copy button, and localStorage with try/catch.
5. Publish with icon `palette` and a one-sentence description. Look at it
   once at most, fix anything visibly wrong, then give him the link.

## 4. Record the choice

When he says what he picked (usually by pasting the "Copy my choice" line),
write `docs/design/visual-identity.md` in the project:

- The chosen direction(s) and any cross-direction mixing, stated explicitly
  (e.g. "code uses Roboto Mono from *ESD Bench*").
- A typography table: role, family, weights, what it is used for. Recommend
  self-hosting fonts (`@fontsource/*`) instead of the Google CDN at runtime.
- Light and dark token tables with **computed** contrast ratios. Add
  `surface-2` (hover and raised areas) and `border-strong` (input borders,
  ≥ 3:1 on surface) if the palette lacks them.
- The semantic colors table, and the rule that status is never shown by color
  alone.
- The theme contract: `:root` light tokens, dark tokens under
  `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }`
  and `:root[data-theme="dark"]`, with system as the default and `data-theme`
  set before first paint.
- A "Still open" checklist (logo, syntax-highlight theme, spacing and radius scale).

If the project has a README roadmap with a visual-identity item, tick it.
Commit the design doc and the README change **as separate commits**, with no
co-author trailer. Also save a copy of the published picker as
`docs/design/theme-picker.html` in its own commit, if he wants it in the repo.
