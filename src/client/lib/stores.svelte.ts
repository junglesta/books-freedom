import type { Book } from './types';
import { fetchBooks, addBook as apiAddBook, updateBook as apiUpdateBook, deleteBook as apiDeleteBook } from './api';

// Book collection state
let books = $state<Book[]>([]);
let loading = $state(false);
let error = $state<string | null>(null);

// Toast state
let toastMessage = $state('');
let toastVisible = $state(false);
let toastTimeout: ReturnType<typeof setTimeout> | null = null;

// Library name state
let libraryName = $state(localStorage.getItem('bukuku_library_name') || 'Library');

export function getLibraryName() {
  return libraryName;
}

export function setLibraryName(name: string) {
  libraryName = name;
  localStorage.setItem('bukuku_library_name', name);
}

// Current route
let currentRoute = $state(window.location.hash || '#/scan');

// Listen for hash changes
window.addEventListener('hashchange', () => {
  currentRoute = window.location.hash || '#/scan';
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

export async function loadBooks() {
  loading = true;
  error = null;
  try {
    books = await fetchBooks();
  } catch (e: any) {
    error = e.message;
  } finally {
    loading = false;
  }
}

export async function addBookToCollection(book: Partial<Book>) {
  try {
    const saved = await apiAddBook(book);
    books = [...books, saved];
    showToast('Book added to library!');
    return saved;
  } catch (e: any) {
    showToast(e.message);
    throw e;
  }
}

export async function updateBookInCollection(id: string, updates: Partial<Book>) {
  try {
    const updated = await apiUpdateBook(id, updates);
    books = books.map((b) => (b.id === id ? updated : b));
    showToast('Book updated!');
    return updated;
  } catch (e: any) {
    showToast(e.message);
    throw e;
  }
}

export async function removeBookFromCollection(id: string) {
  try {
    await apiDeleteBook(id);
    books = books.filter((b) => b.id !== id);
    showToast('Book removed.');
  } catch (e: any) {
    showToast(e.message);
    throw e;
  }
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
