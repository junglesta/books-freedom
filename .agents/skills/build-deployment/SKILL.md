---
name: build-deployment
description: Build scripts, deployment config, and troubleshooting for this Svelte 5 + Vite static client app
---

# Build and Deployment — Books Freedom

## Package Manager

**pnpm only.** Never npm or yarn.

Lock file: `pnpm-lock.yaml` — never commit `package-lock.json` or `yarn.lock`.

## Scripts

```bash
pnpm dev              # Vite dev server
pnpm format           # Biome format src/
pnpm lint             # Biome check src/
pnpm test             # Vitest (run once)
pnpm build            # Production build to dist/client
pnpm preview          # Preview production build locally
```

## Build Output

- Vite root: `src/client`
- Build output: `dist/client`
- SPA fallback handled by `netlify.toml` redirect to `/index.html`

## Deployment

- Netlify config is in `netlify.toml`
- Build command: `pnpm build`
- Publish directory: `dist/client`

## Pre-Deploy Command Set

Run this sequence before deployment:

```bash
pnpm format && pnpm lint && pnpm test && pnpm build
```

## Troubleshooting

```bash
pnpm lint                   # Catch style/type issues first
pnpm test                   # Validate library behavior
pnpm build                  # Confirm production bundle generation
```

## Key Principles

1. **pnpm Only** — never npm or yarn
2. **Client-Only Static App** — no server runtime
3. **Test Before Build** — run tests before release build
4. **Biome + Vitest Gate** — lint/test/build all pass before deploy
