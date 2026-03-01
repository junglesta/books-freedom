import type { LibraryBook, LibraryPayload } from './types';

export type BookSortMode =
  | 'title-asc'
  | 'title-desc'
  | 'author-asc'
  | 'year-asc'
  | 'year-desc'
  | 'recent';

function firstAuthor(book: LibraryBook): string {
  return (book.authors[0] || '').toLowerCase();
}

function titleValue(book: LibraryBook): string {
  return book.title.toLowerCase();
}

function yearValue(book: LibraryBook): number {
  return book.publishYear || 0;
}

function dateAddedValue(book: LibraryBook): number {
  if (!book.dateAdded) return 0;
  const ts = Date.parse(book.dateAdded);
  return Number.isFinite(ts) ? ts : 0;
}

export function sortBooks(books: LibraryBook[], mode: BookSortMode): LibraryBook[] {
  const cloned = [...books];
  switch (mode) {
    case 'title-desc':
      return cloned.sort((a, b) => titleValue(b).localeCompare(titleValue(a)));
    case 'author-asc':
      return cloned.sort((a, b) => firstAuthor(a).localeCompare(firstAuthor(b)));
    case 'year-asc':
      return cloned.sort((a, b) => yearValue(a) - yearValue(b));
    case 'year-desc':
      return cloned.sort((a, b) => yearValue(b) - yearValue(a));
    case 'recent':
      return cloned.sort((a, b) => dateAddedValue(b) - dateAddedValue(a));
    case 'title-asc':
    default:
      return cloned.sort((a, b) => titleValue(a).localeCompare(titleValue(b)));
  }
}

export function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

export function bookMatchesQuery(book: LibraryBook, query: string): boolean {
  const q = normalizeQuery(query);
  if (!q) return true;
  const haystacks = [
    book.title,
    book.authors.join(' '),
    book.isbn13,
    book.publisher || '',
    (book.tags || []).join(' '),
  ].map((value) => value.toLowerCase());
  return haystacks.some((value) => value.includes(q));
}

function isBook(input: unknown): input is LibraryBook {
  if (!input || typeof input !== 'object') return false;
  const book = input as Partial<LibraryBook>;
  return (
    typeof book.id === 'string' &&
    typeof book.title === 'string' &&
    Array.isArray(book.authors) &&
    book.authors.every((a) => typeof a === 'string') &&
    typeof book.isbn13 === 'string'
  );
}

export function parseLibraryPayload(input: unknown): LibraryBook[] {
  if (Array.isArray(input)) {
    return input.filter(isBook);
  }
  if (!input || typeof input !== 'object') return [];
  const payload = input as Partial<LibraryPayload>;
  if (!Array.isArray(payload.books)) return [];
  return payload.books.filter(isBook);
}
