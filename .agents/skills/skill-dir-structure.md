# Skills Directory Structure

Skills live globally at `~/.claude/skills/` using the `<name>/SKILL.md` directory format.

## Source of truth

```
~/.claude/skills/
├── skill-dir-structure.md        ← this file
├── preflight/SKILL.md
├── css-conventions/SKILL.md
├── typescript-patterns/SKILL.md
├── build-deployment/SKILL.md
├── pwa/SKILL.md
├── version-in-metatitle/SKILL.md
├── version-in-footer/SKILL.md
└── package-json/SKILL.md
```

## Format

Each skill is a directory containing a `SKILL.md` file with YAML frontmatter:

```yaml
---
name: preflight
description: Short description shown in the /slash menu
---

# Skill content here...
```

## Discovery

Claude Code automatically discovers skills from `~/.claude/skills/<name>/SKILL.md`.
No symlinks or project-level setup needed — personal skills are available in all projects.

## Editing

Edit the global `SKILL.md` file directly. All projects see the change instantly.
