import { lookupIsbn } from "./isbn-lookup";
import { addBook, deleteBook, getAllBooks, getBookByIsbn, updateBook } from "./storage";
import { LEGACY_LIBRARY_NAME_STORAGE_KEY, LIBRARY_NAME_STORAGE_KEY } from "./storage-keys";
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
  } catch (e: any) {
    error = e.message;
  } finally {
    loading = false;
  }
}

export function addBookToCollection(book: Partial<Book>) {
  try {
    const saved = addBook(book);
    books = [...books, saved];
    showToast("Book added to library!");
    return saved;
  } catch (e: any) {
    showToast(e.message);
    throw e;
  }
}

export function updateBookInCollection(id: string, updates: Partial<Book>) {
  try {
    const updated = updateBook(id, updates);
    books = books.map((b) => (b.id === id ? updated : b));
    showToast("Book updated!");
    return updated;
  } catch (e: any) {
    showToast(e.message);
    throw e;
  }
}

export function removeBookFromCollection(id: string) {
  try {
    deleteBook(id);
    books = books.filter((b) => b.id !== id);
    showToast("Book removed.");
  } catch (e: any) {
    showToast(e.message);
    throw e;
  }
}

export async function scanIsbn(isbn: string): Promise<ScanResult> {
  const cleaned = isbn.replace(/[-\s]/g, "");
  if (!/^(\d{10}|\d{13})$/.test(cleaned)) {
    throw new Error("Invalid ISBN format");
  }

  // Check if already in collection
  const normalizedIsbn13 = cleaned.length === 13 ? cleaned : normalizeToIsbn13(cleaned);
  const existing = getBookByIsbn(normalizedIsbn13);
  if (existing) {
    return { book: existing, alreadyExists: true };
  }

  const book = await lookupIsbn(cleaned);
  if (!book) {
    throw new Error("Book not found");
  }

  return { book, alreadyExists: false };
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

function normalizeToIsbn13(isbn: string): string {
  const prefix = `978${isbn.slice(0, 9)}`;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(prefix[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return prefix + check;
}
