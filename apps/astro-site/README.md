# Astro Site

Static site entry for the `BOOK BAT CLIENT` component.

## Data source

Default source is the workspace drop-in JSON:

`/data/library.json`

Before running Astro, sync data into app-local files:

```bash
pnpm data:sync
```

Expected shape:

```json
{
  "version": 1,
  "books": []
}
```

## Commands

```bash
pnpm --filter @bookbat/astro-site dev
pnpm --filter @bookbat/astro-site build
```
