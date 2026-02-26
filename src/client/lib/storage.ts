import type { Book, BookCollection } from './types';

const STORAGE_KEY = 'books-freedom';

function emptyCollection(): BookCollection {
  return { version: 1, books: [] };
}

export function loadCollection(): BookCollection {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCollection();
    return JSON.parse(raw) as BookCollection;
  } catch {
    return emptyCollection();
  }
}

export function saveCollection(collection: BookCollection): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

export function getAllBooks(): Book[] {
  return loadCollection().books;
}

export function getBookByIsbn(isbn13: string): Book | undefined {
  return loadCollection().books.find((b) => b.isbn13 === isbn13);
}

export function addBook(book: Partial<Book>): Book {
  const collection = loadCollection();
  const full: Book = {
    ...book,
    id: crypto.randomUUID(),
    dateAdded: new Date().toISOString(),
  } as Book;
  collection.books.push(full);
  saveCollection(collection);
  return full;
}

export function updateBook(id: string, updates: Partial<Book>): Book {
  const collection = loadCollection();
  const index = collection.books.findIndex((b) => b.id === id);
  if (index === -1) throw new Error('Book not found');
  const updated = { ...collection.books[index], ...updates, id };
  collection.books[index] = updated;
  saveCollection(collection);
  return updated;
}

export function deleteBook(id: string): void {
  const collection = loadCollection();
  collection.books = collection.books.filter((b) => b.id !== id);
  saveCollection(collection);
}

export function getRawCollection(): BookCollection {
  return loadCollection();
}
