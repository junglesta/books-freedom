import type { Book } from './types';

export async function lookupIsbn(isbn: string): Promise<Book | null> {
  const cleaned = isbn.replace(/[-\s]/g, '');

  // Try Open Library first
  const olResult = await tryOpenLibrary(cleaned);
  if (olResult) {
    // If OpenLibrary didn't provide language, try Google Books for it
    if (!olResult.language) {
      const gbLang = await tryGoogleBooksLanguage(cleaned);
      if (gbLang) olResult.language = gbLang;
    }
    return olResult;
  }

  // Fallback to Google Books
  const gbResult = await tryGoogleBooks(cleaned);
  if (gbResult) return gbResult;

  return null;
}

async function tryOpenLibrary(isbn: string): Promise<Book | null> {
  try {
    const resp = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
    if (!resp.ok) return null;

    const data = await resp.json();

    // Resolve author names
    const authors: string[] = [];
    if (data.authors) {
      for (const authorRef of data.authors) {
        const key = authorRef.key;
        if (key) {
          try {
            const authorResp = await fetch(`https://openlibrary.org${key}.json`);
            if (authorResp.ok) {
              const authorData = await authorResp.json();
              authors.push(authorData.name || 'Unknown Author');
            }
          } catch {
            // Skip failed author lookups
          }
        }
      }
    }

    // Extract ISBNs
    const isbn13 = normalizeToIsbn13(isbn);
    const isbn10 = isbn.length === 10 ? isbn : (data.isbn_10?.[0] || undefined);

    // Extract cover URL
    const coverId = data.covers?.[0];
    const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : undefined;

    // Extract publish year
    const publishDate = data.publish_date || undefined;
    const publishYear = publishDate ? extractYear(publishDate) : undefined;

    // Extract subjects from works
    let subjects: string[] | undefined;
    if (data.works?.[0]?.key) {
      try {
        const worksResp = await fetch(`https://openlibrary.org${data.works[0].key}.json`);
        if (worksResp.ok) {
          const worksData = await worksResp.json();
          subjects = worksData.subjects?.slice(0, 10);
        }
      } catch {
        // Skip
      }
    }

    return {
      id: '',
      isbn13,
      isbn10,
      title: data.title || 'Unknown Title',
      authors,
      publisher: data.publishers?.[0] || undefined,
      publishDate,
      publishYear,
      pageCount: data.number_of_pages || undefined,
      language: data.languages?.[0]?.key?.replace('/languages/', '') || undefined,
      subjects,
      coverUrl,
      status: 'to-read',
      dateAdded: '',
      source: 'openlibrary',
    };
  } catch {
    return null;
  }
}

async function tryGoogleBooks(isbn: string): Promise<Book | null> {
  try {
    const resp = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    if (!resp.ok) return null;

    const data = await resp.json();
    if (!data.items || data.items.length === 0) return null;

    const vol = data.items[0].volumeInfo;
    const isbn13 = normalizeToIsbn13(isbn);

    // Find ISBNs from response
    let isbn10: string | undefined;
    if (vol.industryIdentifiers) {
      for (const id of vol.industryIdentifiers) {
        if (id.type === 'ISBN_10') isbn10 = id.identifier;
      }
    }

    const publishYear = vol.publishedDate ? extractYear(vol.publishedDate) : undefined;

    return {
      id: '',
      isbn13,
      isbn10,
      title: vol.title || 'Unknown Title',
      authors: vol.authors || [],
      publisher: vol.publisher || undefined,
      publishDate: vol.publishedDate || undefined,
      publishYear,
      pageCount: vol.pageCount || undefined,
      language: vol.language || undefined,
      subjects: vol.categories?.slice(0, 10),
      coverUrl: vol.imageLinks?.thumbnail?.replace('http:', 'https:') || undefined,
      status: 'to-read',
      dateAdded: '',
      source: 'googlebooks',
    };
  } catch {
    return null;
  }
}

async function tryGoogleBooksLanguage(isbn: string): Promise<string | null> {
  try {
    const resp = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.items?.[0]?.volumeInfo?.language || null;
  } catch {
    return null;
  }
}

function normalizeToIsbn13(isbn: string): string {
  const cleaned = isbn.replace(/[-\s]/g, '');
  if (cleaned.length === 13) return cleaned;
  const prefix = '978' + cleaned.slice(0, 9);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(prefix[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return prefix + check;
}

function extractYear(dateStr: string): number | undefined {
  const match = dateStr.match(/(\d{4})/);
  return match ? parseInt(match[1]) : undefined;
}
