---
name: package-json
description: Required package.json fields, scripts, and version bumping rules for this Vite/Svelte app
---

# Package.json Standard — Books Freedom

Use this as the baseline for this repo.

## Required Fields

```json
{
  "name": "books-freedom",
  "type": "module",
  "version": "0.x.y",
  "private": true
}
```

- **`name`** — keep as `books-freedom`
- **`type`** — always `"module"` (ESM)
- **`version`** — semver, used in splash/version display and changelog
- **`private`** — always `true` (not published to npm)

## Required Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "biome check src/",
    "format": "biome format --write src/"
  }
}
```

Do not add Astro scripts (`astro`, `check`, `buildwithtest`, `upg`) in this project.

## Version Bumping

- Bump in `package.json` during preflight, before commit/push
- Usually patch bump for small fixes (`0.3.9` -> `0.3.10`)
- Update `CHANGELOG.md` in the same pass

## Dependency Placement

- Runtime dependencies used in app code must be in `dependencies`
- Tooling goes in `devDependencies`
- Re-check runtime imports after dependency changes (e.g. scanner libraries)
