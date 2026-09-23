# my-skills

My personal [Claude Code skills](https://docs.claude.com/en/docs/claude-code/skills).

| Skill | What it does |
| --- | --- |
| [`theme-picker`](skills/theme-picker/SKILL.md) | Builds an interactive artifact to choose a project's fonts and colors: N design directions previewed on a mock of the project's own screens, a light/dark/system switch, and mixing of heading, body and mono fonts and palette across directions. Then writes the choice to `docs/design/visual-identity.md`. |

## Install

Claude Code loads personal skills from `~/.claude/skills/<name>/SKILL.md`.
Symlink each skill so a `git pull` here updates it:

```bash
git clone git@github.com:vinicius-cardoso/my-skills.git ~/projects/claude/my-skills

mkdir -p ~/.claude/skills
ln -s ~/projects/claude/my-skills/skills/theme-picker ~/.claude/skills/theme-picker
```

Then type `/theme-picker` in any session, or just ask to choose a project's
fonts and colors.

## Layout

```
skills/
└── <skill-name>/
    ├── SKILL.md       # frontmatter (name, description) + instructions
    └── …              # templates and references the skill uses
```

## License

[MIT](LICENSE)
