---
name: preflight
description: Pre-deploy checklist for this static client app: format, lint, test, build, optional preview, version bump, changelog. Stops before commit.
---

# Preflight

Pre-deploy checklist for this repo (client-only static build). Run this before every production push.

## Steps

1. **Format** — `pnpm format`
2. **Lint** — `pnpm lint`
3. **Test** — `pnpm test`
4. **Build** — `pnpm build`
5. **Preview (manual)** — `pnpm preview` and do a quick browser spot-check
6. **Version bump** — update `version` in `package.json` (usually patch bump unless user asks otherwise)
7. **Changelog** — update `CHANGELOG.md` with a short entry for the new version
8. **Stop** — report results and propose commit message. Do NOT commit or push. Wait for human approval.

## Commit message format

```
3.5.7 | PWA installability
```

Keep it short. Version number, pipe, what changed.

## Notes

- Always use `pnpm`, never npm/yarn
- This repo is static client-side (no Hono/server deploy checks in preflight)
- If `pnpm preview` cannot run (sandbox/port restrictions), report it as blocked and continue
- If `pnpm build` fails, re-run `pnpm test` and `pnpm build` separately and report the first failing command
- Check Netlify deploy status after push at the deploy_check URL
