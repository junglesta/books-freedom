import { Hono } from 'hono';
import { lookupIsbn } from '../services/isbn-lookup';
import { getBookByIsbn } from '../services/storage';

const app = new Hono();

// Look up ISBN — returns preview, does NOT save
app.get('/:isbn', async (c) => {
  const isbn = c.req.param('isbn');

  // Validate ISBN format
  if (!isValidIsbn(isbn)) {
    return c.json({ error: 'Invalid ISBN format' }, 400);
  }

  // Check if already in collection
  const existing = await getBookByIsbn(normalizeToIsbn13(isbn));
  if (existing) {
    return c.json({ book: existing, alreadyExists: true });
  }

  try {
    const book = await lookupIsbn(isbn);
    if (!book) {
      return c.json({ error: 'Book not found for this ISBN' }, 404);
    }
    return c.json({ book, alreadyExists: false });
  } catch (err) {
    console.error('ISBN lookup error:', err);
    return c.json({ error: 'Failed to look up ISBN' }, 500);
  }
});

function isValidIsbn(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, '');
  if (cleaned.length === 13) return isValidIsbn13(cleaned);
  if (cleaned.length === 10) return isValidIsbn10(cleaned);
  return false;
}

function isValidIsbn13(isbn: string): boolean {
  if (!/^\d{13}$/.test(isbn)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(isbn[12]);
}

function isValidIsbn10(isbn: string): boolean {
  if (!/^\d{9}[\dXx]$/.test(isbn)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i]) * (10 - i);
  }
  const last = isbn[9].toUpperCase();
  sum += last === 'X' ? 10 : parseInt(last);
  return sum % 11 === 0;
}

function normalizeToIsbn13(isbn: string): string {
  const cleaned = isbn.replace(/[-\s]/g, '');
  if (cleaned.length === 13) return cleaned;
  // Convert ISBN-10 to ISBN-13
  const prefix = '978' + cleaned.slice(0, 9);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(prefix[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return prefix + check;
}

export default app;
