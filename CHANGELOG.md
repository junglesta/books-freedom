# Changelog

## 0.5.0

- Migrated repository to workspace monorepo layout (`apps/webapp`, `apps/astro-site`, `packages/library-core`)
- Added initial Astro `BOOK FREEDDOM CLIENT` list component scaffold with search/sort/details plus thumbnail service-worker caching
- Introduced canonical drop-in dataset flow via `data/library.json` with sync/apply scripts (`data:sync`, `data:apply`, dummy dataset support)
- Added webapp first-load seeding from `/library.json` for easier local bootstrap from drop-in data
- Added local HTTPS/LAN development support with generated certs and `dev:webapp:https` workflow
- Removed legacy Docker/container files and stale build/cache artifacts during cleanup; unified webapp build output to `dist/webapp`

## 0.4.9

- Hid the compact library card when a title is expanded, so only the inline detail panel is shown for the selected book
- Kept lint/test/build preflight checks green after the library row rendering adjustment

## 0.4.8

- Moved single-title details rendering inline under the selected library card row instead of using a detached bottom popover
- Added guarded in-view scrolling when opening details so the expanded item stays visible in long lists
- Updated book detail `Save` action to remain disabled/dimmed until a real field or star-rating change is made

## 0.4.7

- Simplified cover loading flow: always show placeholder while image is loading
- Persist successful fallback cover URL back to `book.coverUrl` so future renders try the known-good source first
- Aligned service-worker cache policy helpers/tests with runtime behavior for approved cross-origin cover hosts

## 0.4.6

- Increased footer branding/attribution text size by another 10% for better readability
- Added app-managed cover image caching in the service worker for supported external cover hosts
- Wired library drop to clear the dedicated cover cache (`CLEAR_COVER_CACHE`) so cached covers are purged with the library

## 0.4.5

- Improved HELP splash behavior across aspect ratios by enabling full-screen vertical scrolling of `readme.svg` with hidden scrollbars
- Added visible top-right circular `X` close control for HELP and SHARE splash overlays
- Updated canonical/share URL usage to `https://bf.junglestar.org/` in app metadata, share splash text, and README logo link
- Refined splash close interactions to avoid accidental close while scrolling help content

## 0.4.4

- Reworked splash UX to use the new `readme.svg` splash screen artwork
- Added footer action buttons (`HELP` and `SHARE`) with larger outlined limegreen tap targets
- `HELP` now opens splash help overlay and closes on click
- `SHARE` now opens a dedicated splash overlay with centered QR code and closes on click
- Removed splash version badge overlay from the splash screen
- Added app meta title version binding (`Books Freedom v<version>`) from `package.json`
- Updated local skill registry and preflight workflow wiring (`preflight` script + step list alignment)

## 0.4.3

- Completed full preflight routine: format, lint, test, build (all passing)
- Refined Scan/Add layout behavior to remove dead vertical space and keep sections top-aligned across viewport sizes
- Improved scanner stop/reset reliability on desktop by forcing clean scanner viewport remount
- Made Export subtitle library name clickable to navigate directly to Library view
- Hardened cover rendering with fallback candidates and persistent placeholder behavior when no real cover exists
- Replaced emoji placeholders with the Library nav icon in lime accent for visual consistency

## 0.4.2

- Removed top logo-heavy branding from app layout; added subtle text footer with version and project attribution links
- Added scan-title info accordion explaining ISBN purpose and usage
- Refined library header UX: moved count to second row with actions, restored `titles` suffix, improved icon/row alignment
- Improved import cover handling by normalizing multiple cover fields and converting legacy URL forms to usable `https` cover URLs
- Polished export and footer details (button text/icons/link styling) and aligned tests to current labels

## 0.4.1

- Refined Scan page visual balance and spacing between action sections for cleaner vertical rhythm
- Aligned Scan and manual-entry heading treatment for consistent hierarchy
- Updated scanner entry/button alignment: camera button now fit-content and centered, manual ISBN action rows use clearer input/button grid alignment

## 0.4.0

- Applied CSS convention skill across app UI: migrated class naming to `snake_case` in Svelte markup, class directives, selector strings, and global stylesheet selectors
- Updated dynamic status badge class binding in book cards to explicit `snake_case` mappings
- Verified convention refactor with full format/lint/test/build preflight

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
- PWA updated: manifest, service worker, canonical URL (bf.junglestar.org)
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
