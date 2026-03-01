import { getErrorMessage } from "./error";
import { lookupIsbn } from "./isbn-lookup";
import { scanIsbnWithDeps } from "./scan";
import { addBook, clearBooks, deleteBook, getAllBooks, getBookByIsbn, updateBook } from "./storage";
import {
  COLLECTION_SEEDED_STORAGE_KEY,
  LEGACY_LIBRARY_NAME_STORAGE_KEY,
  LIBRARY_NAME_STORAGE_KEY,
} from "./storage-keys";
import type { Book, ScanResult } from "./types";

// Book collection state
let books = $state<Book[]>([]);
let loading = $state(false);
let error = $state<string | null>(null);

// Toast state
let toastMessage = $state("");
let toastVisible = $state(false);
let toastTimeout: ReturnType<typeof setTimeout> | null = null;

function loadLibraryName(): string {
  const current = localStorage.getItem(LIBRARY_NAME_STORAGE_KEY);
  if (current) return current;

  const legacy = localStorage.getItem(LEGACY_LIBRARY_NAME_STORAGE_KEY);
  if (legacy) {
    localStorage.setItem(LIBRARY_NAME_STORAGE_KEY, legacy);
    return legacy;
  }

  return "Library";
}

// Library name state
let libraryName = $state(loadLibraryName());

export function getLibraryName() {
  return libraryName;
}

export function setLibraryName(name: string) {
  libraryName = name;
  localStorage.setItem(LIBRARY_NAME_STORAGE_KEY, name);
}

// Current route
let currentRoute = $state(window.location.hash || "#/scan");

// Listen for hash changes
window.addEventListener("hashchange", () => {
  currentRoute = window.location.hash || "#/scan";
});

export function getRoute() {
  return currentRoute;
}

export function navigate(hash: string) {
  window.location.hash = hash;
}

export function getBooks() {
  return books;
}

export function isLoading() {
  return loading;
}

export function getError() {
  return error;
}

export function loadBooks() {
  loading = true;
  error = null;
  try {
    books = getAllBooks();
    if (books.length === 0) {
      void seedBooksFromDropInJson();
    }
  } catch (e: unknown) {
    error = getErrorMessage(e, "Failed to load books");
  } finally {
    loading = false;
  }
}

function normalizeSeedStatus(status: unknown): Book["status"] {
  if (status === "to-read" || status === "reading" || status === "read") return status;
  return "to-read";
}

function normalizeSeedSource(source: unknown): Book["source"] {
  if (source === "openlibrary" || source === "googlebooks" || source === "manual") return source;
  return "manual";
}

async function seedBooksFromDropInJson() {
  if (typeof fetch !== "function") return;
  if (localStorage.getItem(COLLECTION_SEEDED_STORAGE_KEY) === "1") return;

  localStorage.setItem(COLLECTION_SEEDED_STORAGE_KEY, "1");

  try {
    const response = await fetch("/library.json", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return;

    const payload = await response.json();
    const candidates = parseSeedPayload(payload);
    if (candidates.length === 0) return;

    const existing = new Set(getAllBooks().map((book) => book.isbn13));

    for (const book of candidates) {
      if (!book.isbn13 || !book.title || !Array.isArray(book.authors)) continue;
      if (existing.has(book.isbn13)) continue;

      const saved = addBook({
        isbn13: book.isbn13,
        isbn10: book.isbn10,
        title: book.title,
        authors: book.authors,
        publisher: book.publisher,
        publishYear: book.publishYear,
        pageCount: book.pageCount,
        language: book.language,
        coverUrl: book.coverUrl,
        rating: book.rating,
        notes: book.notes,
        tags: book.tags,
        dateRead: book.dateRead,
        status: normalizeSeedStatus(book.status),
        source: normalizeSeedSource((book as Partial<Book>).source),
      });
      existing.add(saved.isbn13);
    }

    books = getAllBooks();
  } catch {
    // Silent fallback: missing seed file should not block app startup.
  }
}

function parseSeedPayload(input: unknown): Array<Partial<Book>> {
  if (Array.isArray(input)) {
    return input.filter(isSeedBook);
  }
  if (!input || typeof input !== "object") return [];
  const maybeBooks = (input as { books?: unknown }).books;
  if (!Array.isArray(maybeBooks)) return [];
  return maybeBooks.filter(isSeedBook);
}

function isSeedBook(value: unknown): value is Partial<Book> {
  if (!value || typeof value !== "object") return false;
  const book = value as Partial<Book>;
  return (
    typeof book.isbn13 === "string" &&
    typeof book.title === "string" &&
    Array.isArray(book.authors) &&
    book.authors.every((author) => typeof author === "string")
  );
}

export function addBookToCollection(book: Partial<Book>) {
  try {
    const saved = addBook(book);
    books = [...books, saved];
    showToast("Book added to library!");
    return saved;
  } catch (e: unknown) {
    showToast(getErrorMessage(e, "Failed to add book"));
    throw e;
  }
}

export interface ImportBooksSummary {
  total: number;
  added: number;
  skipped: number;
  failed: number;
}

export function importBooksToCollection(imported: Partial<Book>[]): ImportBooksSummary {
  const existingIsbns = new Set(books.map((b) => b.isbn13));
  const addedBooks: Book[] = [];
  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (const candidate of imported) {
    if (typeof candidate.isbn13 !== "string" || existingIsbns.has(candidate.isbn13)) {
      skipped++;
      continue;
    }
    try {
      const saved = addBook({
        ...candidate,
        status: candidate.status || "to-read",
        source: candidate.source || "manual",
      });
      existingIsbns.add(saved.isbn13);
      addedBooks.push(saved);
      added++;
    } catch {
      failed++;
    }
  }

  if (addedBooks.length > 0) {
    books = [...books, ...addedBooks];
  }

  return { total: imported.length, added, skipped, failed };
}

export function updateBookInCollection(id: string, updates: Partial<Book>) {
  try {
    const updated = updateBook(id, updates);
    books = books.map((b) => (b.id === id ? updated : b));
    showToast("Book updated!");
    return updated;
  } catch (e: unknown) {
    showToast(getErrorMessage(e, "Failed to update book"));
    throw e;
  }
}

export function setBookCoverUrl(id: string, coverUrl: string) {
  const current = books.find((b) => b.id === id);
  if (!current || current.coverUrl === coverUrl) return;
  const updated = updateBook(id, { coverUrl });
  books = books.map((b) => (b.id === id ? updated : b));
}

export function removeBookFromCollection(id: string) {
  try {
    deleteBook(id);
    books = books.filter((b) => b.id !== id);
    showToast("Book removed.");
  } catch (e: unknown) {
    showToast(getErrorMessage(e, "Failed to remove book"));
    throw e;
  }
}

export function clearLibraryCollection() {
  try {
    clearBooks();
    books = [];
    navigator.serviceWorker?.controller?.postMessage({ type: "CLEAR_COVER_CACHE" });
    showToast("Library cleared.");
  } catch (e: unknown) {
    showToast(getErrorMessage(e, "Failed to clear library"));
    throw e;
  }
}

export async function scanIsbn(isbn: string): Promise<ScanResult> {
  return scanIsbnWithDeps(isbn, {
    findByIsbn13: getBookByIsbn,
    lookupByIsbn: lookupIsbn,
  });
}

export function showToast(message: string) {
  toastMessage = message;
  toastVisible = true;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastVisible = false;
  }, 3000);
}

export function getToastMessage() {
  return toastMessage;
}

export function isToastVisible() {
  return toastVisible;
}
