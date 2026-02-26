# Changelog

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
