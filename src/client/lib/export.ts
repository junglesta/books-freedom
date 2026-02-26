import type { Book } from './types';

function escapeCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function generateCsv(books: Book[]): string {
  const headers = [
    'Title', 'Authors', 'ISBN-13', 'ISBN-10', 'Publisher',
    'Publish Date', 'Year', 'Pages', 'Language', 'Status',
    'Rating', 'Date Added', 'Date Read', 'Tags', 'Notes',
  ];

  const rows = books.map((b) => [
    escapeCsv(b.title),
    escapeCsv(b.authors.join('; ')),
    b.isbn13,
    b.isbn10 || '',
    escapeCsv(b.publisher || ''),
    escapeCsv(b.publishDate || ''),
    b.publishYear?.toString() || '',
    b.pageCount?.toString() || '',
    b.language || '',
    b.status,
    b.rating?.toString() || '',
    b.dateAdded,
    b.dateRead || '',
    escapeCsv((b.tags || []).join('; ')),
    escapeCsv(b.notes || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generateGoodreadsCsv(books: Book[]): string {
  const headers = [
    'Title', 'Author', 'ISBN', 'ISBN13', 'My Rating',
    'Number of Pages', 'Year Published', 'Date Read',
    'Date Added', 'Exclusive Shelf', 'My Review',
  ];

  const shelfMap: Record<string, string> = {
    'to-read': 'to-read',
    'reading': 'currently-reading',
    'read': 'read',
  };

  const rows = books.map((b) => [
    escapeCsv(b.title),
    escapeCsv(b.authors[0] || ''),
    `="${b.isbn10 || ''}"`,
    `="${b.isbn13}"`,
    b.rating?.toString() || '0',
    b.pageCount?.toString() || '',
    b.publishYear?.toString() || '',
    b.dateRead ? formatGoodreadsDate(b.dateRead) : '',
    formatGoodreadsDate(b.dateAdded),
    shelfMap[b.status] || 'to-read',
    escapeCsv(b.notes || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generateLibraryThingTsv(books: Book[]): string {
  const headers = [
    'Title', 'Author (First, Last)', 'Date', 'ISBN',
    'Rating', 'Tags', 'Review', 'Page Count',
    'Publication', 'Date Read',
  ];

  const rows = books.map((b) => [
    b.title,
    b.authors[0] || '',
    b.dateAdded ? b.dateAdded.split('T')[0] : '',
    b.isbn13,
    b.rating?.toString() || '',
    (b.tags || []).join(', '),
    b.notes || '',
    b.pageCount?.toString() || '',
    b.publisher || '',
    b.dateRead ? b.dateRead.split('T')[0] : '',
  ]);

  return [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
}

export function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatGoodreadsDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  } catch {
    return '';
  }
}
