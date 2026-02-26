import type { Book, ScanResult } from './types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const resp = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(body.error || `HTTP ${resp.status}`);
  }
  return resp.json();
}

export function scanIsbn(isbn: string): Promise<ScanResult> {
  return request(`/scan/${isbn}`);
}

export function fetchBooks(): Promise<Book[]> {
  return request('/books');
}

export function addBook(book: Partial<Book>): Promise<Book> {
  return request('/books', {
    method: 'POST',
    body: JSON.stringify(book),
  });
}

export function updateBook(id: string, updates: Partial<Book>): Promise<Book> {
  return request(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export function deleteBook(id: string): Promise<{ success: boolean }> {
  return request(`/books/${id}`, { method: 'DELETE' });
}

export function exportGoogleSheets(webhookUrl: string): Promise<{ success: boolean; count: number }> {
  return request('/export/google-sheets', {
    method: 'POST',
    body: JSON.stringify({ webhookUrl }),
  });
}
