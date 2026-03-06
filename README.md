[![Netlify Status](https://api.netlify.com/api/v1/badges/28542ff1-4d69-4518-abdc-5cb625f0befe/deploy-status)](https://app.netlify.com/projects/bookfreedom/deploys)

<a href="https://bat.junglestar.org">
  <img src="apps/webapp/src/assets/startscreen.svg" alt="BOOK BAT" width="480">
</a>

> no account. no cloud. no tracking. scan it. shelve it. own your data.

## What This Repo Is

This monorepo contains two related clients:

- `BOOK BAT`: the active Svelte app for scanning, organizing, annotating, importing, exporting, and sharing your library
- `BAOBAB`: the Astro static site/client layer for presenting and publishing library data

The repo is fully client-side. No hosted app database. No user accounts. `BOOK BAT` stores your library in browser `localStorage`.

## What BOOK BAT Does

- scan ISBN barcodes with camera or type ISBN manually
- fetch title, authors, publisher, cover, and other metadata
- backfill synopsis from book APIs when available
- organize books with status, rating, notes, tags, and language
- search, filter, and sort your library
- copy or share single-book info from the detail view
- export library data as JSON, CSV, Goodreads CSV, LibraryThing TSV, or Google Sheets webhook payload
- import library files and merge duplicate ISBNs safely
- work offline as a PWA

## Import Merge Rules

Imports do not replace your whole library.

When you import a file:

- new ISBNs are appended as new books
- duplicate ISBNs are merged into the existing book
- personal fields are preserved and are not overwritten:
  - status
  - rating
  - notes
  - tags
  - date read
- missing metadata can be filled from the imported file:
  - authors when the current author is just `Unknown Author`
  - ISBN-10
  - publisher
  - publish date
  - publish year
  - page count
  - language
  - subjects
  - synopsis
  - cover URL

## Repo Structure

- `apps/webapp` -> `BOOK BAT` Svelte 5 + Vite app
- `apps/astro-site` -> `BAOBAB` Astro site
- `data/library.json` -> canonical library dataset used for sync into app/site data

## Stack

- Svelte 5
- Vite
- Astro
- Vitest
- Biome
- `html5-qrcode`

## Run Locally

Install dependencies:

```bash
pnpm install
```

Run `BOOK BAT`:

```bash
pnpm dev:webapp
```

Run `BAOBAB`:

```bash
pnpm dev:astro
```

## HTTPS Dev For Camera Testing

Generate local certificates:

```bash
pnpm certs:generate
```

Run the webapp over HTTPS:

```bash
pnpm dev:webapp:https
```

Then open:

- `https://localhost:5173`
- `https://<your-lan-ip>:5173`

Phone browsers may still require trusting the local certificate before camera APIs behave as a secure context.

## Data Sync

The workspace syncs `data/library.json` into both apps.

Run manually:

```bash
pnpm data:sync
pnpm data:sync:dummy
pnpm data:apply ./my-export.json
```

Sync targets:

- `apps/webapp/src/public/library.json`
- `apps/astro-site/src/data/library.json`

Expected shape:

```json
{
  "version": 1,
  "books": []
}
```

## Build

Build `BOOK BAT`:

```bash
pnpm build:webapp
```

Build `BAOBAB`:

```bash
pnpm build:astro
```

## Quality Gates

```bash
pnpm format
pnpm lint
pnpm test
pnpm build
```

For release preflight:

```bash
pnpm preflight
```

## Netlify

Two Netlify sites are connected to this repo:

1. `bat.junglestar.org` for `BOOK BAT`
2. `baobab.junglestar.org` for `BAOBAB`

### BOOK BAT

- Base directory: repo root
- Build command: `pnpm build:webapp`
- Publish directory: `dist/webapp`
- Config file: `netlify.toml`
- Ignore/build gating: `scripts/netlify-ignore-webapp.sh`

### BAOBAB

- Base directory: `apps/astro-site`
- Build command: `pnpm -C ../.. build:astro`
- Publish directory: `dist`
- Config file: `apps/astro-site/netlify.toml`
- Ignore/build gating: `scripts/netlify-ignore-astro.sh`

## Product URLs

- `BOOK BAT`: [https://bat.junglestar.org](https://bat.junglestar.org)
- `BAOBAB`: [https://baobab.junglestar.org](https://baobab.junglestar.org)

## License

[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en)

## Commercial

For SDK or commercial use, contact **info@junglestar.org**.
