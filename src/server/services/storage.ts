import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import type { Book, BookCollection } from '../types';

const DATA_DIR = join(import.meta.dir, '../../../data');
const DATA_FILE = join(DATA_DIR, 'books.json');

let cache: BookCollection | null = null;
let writeLock = false;

function emptyCollection(): BookCollection {
  return { version: 1, books: [] };
}

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

export async function loadBooks(): Promise<BookCollection> {
  if (cache) return cache;

  await ensureDataDir();

  if (!existsSync(DATA_FILE)) {
    cache = emptyCollection();
    await saveCollection(cache);
    return cache;
  }

  try {
    const raw = await readFile(DATA_FILE, 'utf-8');
    cache = JSON.parse(raw) as BookCollection;
    return cache;
  } catch {
    cache = emptyCollection();
    return cache;
  }
}

async function saveCollection(collection: BookCollection): Promise<void> {
  while (writeLock) {
    await new Promise((r) => setTimeout(r, 10));
  }
  writeLock = true;
  try {
    await ensureDataDir();
    await writeFile(DATA_FILE, JSON.stringify(collection, null, 2), 'utf-8');
    cache = collection;
  } finally {
    writeLock = false;
  }
}

export async function getAllBooks(): Promise<Book[]> {
  const collection = await loadBooks();
  return collection.books;
}

export async function getBookById(id: string): Promise<Book | undefined> {
  const collection = await loadBooks();
  return collection.books.find((b) => b.id === id);
}

export async function getBookByIsbn(isbn13: string): Promise<Book | undefined> {
  const collection = await loadBooks();
  return collection.books.find((b) => b.isbn13 === isbn13);
}

export async function addBook(book: Book): Promise<Book> {
  const collection = await loadBooks();
  collection.books.push(book);
  await saveCollection(collection);
  return book;
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
  const collection = await loadBooks();
  const index = collection.books.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const updated = { ...collection.books[index], ...updates, id };
  collection.books[index] = updated;
  await saveCollection(collection);
  return updated;
}

export async function deleteBook(id: string): Promise<boolean> {
  const collection = await loadBooks();
  const index = collection.books.findIndex((b) => b.id === id);
  if (index === -1) return false;

  collection.books.splice(index, 1);
  await saveCollection(collection);
  return true;
}

export async function getRawCollection(): Promise<BookCollection> {
  return loadBooks();
}
