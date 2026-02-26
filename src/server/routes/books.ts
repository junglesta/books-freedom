import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { getAllBooks, getBookById, addBook, updateBook, deleteBook, getBookByIsbn } from '../services/storage';
import type { Book } from '../types';

const app = new Hono();

// List all books
app.get('/', async (c) => {
  const books = await getAllBooks();
  return c.json(books);
});

// Add a book
app.post('/', async (c) => {
  const body = await c.req.json<Partial<Book>>();

  if (!body.isbn13 || !body.title) {
    return c.json({ error: 'isbn13 and title are required' }, 400);
  }

  // Check for duplicates
  const existing = await getBookByIsbn(body.isbn13);
  if (existing) {
    return c.json({ error: 'Book with this ISBN already exists', book: existing }, 409);
  }

  const book: Book = {
    id: uuidv4(),
    isbn13: body.isbn13,
    isbn10: body.isbn10,
    title: body.title,
    authors: body.authors || [],
    publisher: body.publisher,
    publishDate: body.publishDate,
    publishYear: body.publishYear,
    pageCount: body.pageCount,
    language: body.language,
    subjects: body.subjects,
    coverUrl: body.coverUrl,
    rating: body.rating,
    status: body.status || 'to-read',
    notes: body.notes,
    tags: body.tags,
    dateAdded: new Date().toISOString(),
    dateRead: body.dateRead,
    source: body.source || 'manual',
  };

  const saved = await addBook(book);
  return c.json(saved, 201);
});

// Update a book
app.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<Book>>();

  const updated = await updateBook(id, body);
  if (!updated) {
    return c.json({ error: 'Book not found' }, 404);
  }
  return c.json(updated);
});

// Delete a book
app.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const deleted = await deleteBook(id);
  if (!deleted) {
    return c.json({ error: 'Book not found' }, 404);
  }
  return c.json({ success: true });
});

export default app;
