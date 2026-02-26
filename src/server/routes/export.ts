import { Hono } from 'hono';
import { getRawCollection, getAllBooks } from '../services/storage';
import { generateCsv, generateGoodreadsCsv, generateLibraryThingTsv } from '../services/export';

const app = new Hono();

// Download raw JSON
app.get('/json', async (c) => {
  const collection = await getRawCollection();
  c.header('Content-Disposition', 'attachment; filename="books.json"');
  return c.json(collection);
});

// Download CSV
app.get('/csv', async (c) => {
  const books = await getAllBooks();
  const csv = generateCsv(books);
  c.header('Content-Type', 'text/csv; charset=utf-8');
  c.header('Content-Disposition', 'attachment; filename="books.csv"');
  return c.text(csv);
});

// Download Goodreads-compatible CSV
app.get('/goodreads', async (c) => {
  const books = await getAllBooks();
  const csv = generateGoodreadsCsv(books);
  c.header('Content-Type', 'text/csv; charset=utf-8');
  c.header('Content-Disposition', 'attachment; filename="goodreads-import.csv"');
  return c.text(csv);
});

// Download LibraryThing TSV
app.get('/librarything', async (c) => {
  const books = await getAllBooks();
  const tsv = generateLibraryThingTsv(books);
  c.header('Content-Type', 'text/tab-separated-values; charset=utf-8');
  c.header('Content-Disposition', 'attachment; filename="librarything-import.tsv"');
  return c.text(tsv);
});

// Push to Google Sheets
app.post('/google-sheets', async (c) => {
  const { webhookUrl } = await c.req.json<{ webhookUrl: string }>();
  if (!webhookUrl) {
    return c.json({ error: 'webhookUrl is required' }, 400);
  }

  const books = await getAllBooks();

  try {
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ books }),
    });

    if (!resp.ok) {
      return c.json({ error: 'Google Sheets webhook returned an error' }, 502);
    }

    return c.json({ success: true, count: books.length });
  } catch (err) {
    console.error('Google Sheets export error:', err);
    return c.json({ error: 'Failed to reach Google Sheets webhook' }, 502);
  }
});

export default app;
