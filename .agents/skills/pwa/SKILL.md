---
name: pwa
description: PWA setup for this Vite/Svelte app — manifest, service worker, icons, and index.html tags
---

# PWA Setup — Books Freedom

Standard PWA configuration for this repo.

## Required Files

### 1. Web Manifest (`src/client/public/manifest.json`)

Keep: `name`, `short_name`, `start_url`, `scope`, `id`, `display`, `theme_color`, `background_color`, and `icons` (192 + 512 + maskable).

### 2. Service Worker (`src/client/public/sw.js`)

Canonical SW lives only in `public/`; do not duplicate in `src/client/sw.js`.
When cache behavior changes, bump cache name to invalidate stale entries.

### 3. HTML Tags (`src/client/index.html`)

- `<link rel="manifest" href="/manifest.json" />`
- `<meta name="theme-color" ... />`
- Apple web app tags
- SW registration script:

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
</script>
```

## Repo Rules

1. Keep one canonical manifest and one canonical SW in `src/client/public/`
2. Keep icon paths root-absolute (`/icon-192.png`, `/icon-512.png`)
3. Verify installability in browser Application tab after PWA edits

## Common Issues

- **Not installable:** broken manifest path or SW not registering
- **Old cache stuck:** cache name not bumped after strategy change
- **Unexpected stale assets:** over-broad SW caching scope
