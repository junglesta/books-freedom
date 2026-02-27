# Changelog

## 0.3.13

- Unified confirmation and error/feedback UX using branded in-app `<details>` panels (drop library, remove book, export push confirmation)
- Refactored scan/manual ISBN feedback to RBAND-style inline notes (camera errors, invalid ISBN checksum, lookup errors)
- Hardened import feedback: unsupported or invalid import files now show in-app RBAND import errors; added parser validation for empty/invalid JSON/CSV
- Export format titles now use limegreen brand accent for clearer visual hierarchy
- Removed unused `ConfirmDialog` component after migrating to inline detail-based confirmations

## 0.3.12

- Fixed "Scan Another" flow by resetting scanner instance deterministically
- Added library append import for JSON/CSV (and `.css` CSV fallback) with dedupe + import summary feedback
- Preserved `coverUrl` and related metadata during JSON import so cover previews survive import
- Added "Drop" action to clear entire library
- Replaced browser delete confirms with in-app confirmation dialogs (book remove + drop library)
- Improved Library header count UX (`N titles` badge instead of unlabeled number)

## 0.3.11

- Added page-level UI tests (Scan, Export, Library) with Testing Library + jsdom setup
- Replaced runtime `any` error handling with typed/centralized error parsing helper
- Hardened ISBN lookup network handling with request timeout + safer JSON parsing
- Fixed Goodreads export date formatting for invalid dates (now blank instead of invalid date tokens)

## 0.3.10

- Export hardening: neutralize spreadsheet formula-like cells in CSV/TSV exports
- Added export tests for formula-injection regression coverage
- Skills overhaul: updated all project skills from old Astro/server assumptions to Svelte + Vite static workflow
- Updated preflight skill and executed preflight checks (format/lint/test/build passed; preview blocked by sandbox port restriction)
## 0.3.9

- now using codex
- Repo Consistency Cleanup (P3): 
- Resolve duplicate PWA artifacts and keep one canonical manifest/sw.
- Standardize localStorage key namespace (books-freedom vs sokola_*), with migration.
- Files: `src/client/manifest.json`, `src/client/public/manifest.json`,`src/client/sw.js`, `src/client/public/sw.js`, `storage.ts`, `stores.svelte.ts`, `ExportPage.svelte`


## 0.3.8

- till now used claudecode 
- Fixed leftover viewfinder overlay after scan (cleanup library DOM after Svelte re-render)
- Added Vitest unit tests (storage, export, isbn-lookup) — 41 tests
- Added Biome linter/formatter (v2.4.4)
- Biome auto-fix: template literals, parseInt radix, import ordering
- New scripts: test, test:watch, lint, format

## 0.3.7

- Fixed frozen UI on stop/scan: force-kill video tracks directly via MediaStream API
- Sync stopScanner for instant UI update (no await blocking)
- Deferred stop in decode callback to avoid library re-entrancy freeze

## 0.3.6

- Fixed camera not starting (reverted inner div approach that caused zero-size container)
- Set isScanning early so container has proper dimensions before library renders
- Removed innerHTML clearing — library clear() + Svelte reactivity handle cleanup
- "Try Again" button on failed ISBN lookup (from 0.3.5)

## 0.3.5

- Fixed stuck UI after failed ISBN lookup (scanner DOM separated from Svelte DOM)
- "Try Again" button shown when book lookup fails
- Scanner viewfinder improved (250x150 aspect ratio)

## 0.3.4

- Improved scanner viewfinder aspect ratio (250x150, easier to aim)

## 0.3.3

- Camera auto-stops after successful barcode scan
- Fixed Stop Camera button not working on desktop
- Simplified scanner cleanup (bulletproof stop/clear/innerHTML fallback)

## 0.3.2

- Fixed barcode scanner: was scanning QR codes instead of EAN-13 barcodes (wrong format enum)
- Added EAN-8 and UPC-A barcode format support
- Fixed scanner DOM swap destroying camera video feed
- Added Permissions-Policy camera header to netlify.toml
- Version number shown on splash screen

## 0.3.1

- Removed seed data — new users start with empty library
- Header logo shown on all pages (removed library-page hide)
- Consistent header spacing across all views

## 0.3.0

- Client-only architecture: removed Hono server, all logic runs in browser
- localStorage persistence (no server, no cloud, no tracking)
- Client-side ISBN lookup (Open Library + Google Books, direct CORS)
- Client-side export generation (JSON, CSV, Goodreads, LibraryThing) via Blob download
- Custom SVG splash screen artwork with dithered noise gradient background
- Custom SVG favicon (BF monogram)
- Header logo: "BOOK FREEDOM" line logo (stroke-only text with echo effect)
- Splash popover restored on both mobile and desktop (nav brand clickable)
- Manual language field in book detail editor
- Inline export feedback (spinner + "wait..." on card click)
- Fixed Svelte 5 `state_referenced_locally` warnings in BookDetail
- Fixed splash popover animation override
- Removed server dependencies (hono, uuid, concurrently)
- a11y: keyboard event handlers on all interactive elements
- README updated: new logo, "no account, no cloud, no tracking" quote, removed docker/server refs

## 0.2.1

- Rebrand app name from "sokola" to "BOOKS FREEDOM"
- New open book icon (replaces crosshair/book combo)
- Brand layout: BOOKS [icon] FREEDOM in one row (stacked on splash)
- Desktop frame: limegreen border with rounded corners at 1235px+, centered x/y
- Desktop scroll contained inside frame with hidden scrollbar
- Sticky nav inside desktop frame (no longer escapes container)
- GitHub repo renamed from bukuku to books-freedom
- Package name updated to books-freedom
- Export page: split subtitle and heading into separate elements
- Netlify deploy config (netlify.toml)
- README.md and LICENSE (CC BY-SA 4.0)
- PWA updated: manifest, service worker, canonical URL (laser.junglestar.org)
- Dithered noise background on desktop (SVG feTurbulence filter)

## 0.1.0

Initial release.

- ISBN barcode scanning via camera (html5-qrcode, EAN-13)
- Manual ISBN-13/ISBN-10 entry with auto-formatting
- Book lookup via Open Library + Google Books fallback
- Library view with search, status filters, sort, language filter
- Book detail editor (rating, status, notes, tags)
- Export: JSON, CSV, Goodreads CSV, LibraryThing TSV, Google Sheets webhook
- PWA installable (manifest, service worker, icons)
- HTTPS with self-signed certs for LAN camera access
- Dark theme, lime green accent, monospace font
- Responsive: bottom nav on mobile, top nav on desktop
- Docker multi-stage build with data volume
- ISBN lookup falls back to Google Books for language when OpenLibrary omits it
