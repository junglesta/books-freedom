# Changelog

## 0.2.0

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
