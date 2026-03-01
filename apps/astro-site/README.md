# Astro Site

Static site entry for the `BOOK FREEDDOM CLIENT` component.

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
pnpm --filter @books-freedom/astro-site dev
pnpm --filter @books-freedom/astro-site build
```
