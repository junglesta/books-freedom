# Changelog

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
