import { getErrorMessage } from "./error";
import { lookupIsbn } from "./isbn-lookup";
import { scanIsbnWithDeps } from "./scan";
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
  } catch (e: unknown) {
    error = getErrorMessage(e, "Failed to load books");
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
  } catch (e: unknown) {
    showToast(getErrorMessage(e, "Failed to add book"));
    throw e;
  }
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
