import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const SOURCE_FILE = process.env.LIBRARY_SOURCE_FILE || 'data/library.json';
const sourcePath = resolve(ROOT, SOURCE_FILE);
const webappPublicPath = resolve(ROOT, 'apps/webapp/src/public/library.json');

function isBook(value) {
  if (!value || typeof value !== 'object') return false;
  return (
    typeof value.id === 'string' &&
    typeof value.isbn13 === 'string' &&
    typeof value.title === 'string' &&
    Array.isArray(value.authors)
  );
}

function normalizeCollection(input) {
  if (!input || typeof input !== 'object') return { version: 1, books: [] };
  const maybeBooks = Array.isArray(input.books) ? input.books : [];
  const books = maybeBooks.filter(isBook);
  return { version: 1, books };
}

async function main() {
  const raw = await readFile(sourcePath, 'utf8');
  const parsed = JSON.parse(raw);
  const collection = normalizeCollection(parsed);

  await mkdir(resolve(ROOT, 'apps/webapp/src/public'), { recursive: true });
  await writeFile(webappPublicPath, JSON.stringify(collection, null, 2) + '\n');

  // Keep Astro's local fallback data in sync for editor previews.
  await mkdir(resolve(ROOT, 'apps/astro-site/src/data'), { recursive: true });
  await writeFile(
    resolve(ROOT, 'apps/astro-site/src/data/library.json'),
    JSON.stringify(collection, null, 2) + '\n',
  );

  console.log(
    `Synced ${SOURCE_FILE} -> apps/webapp/src/public/library.json and apps/astro-site/src/data/library.json`,
  );
}

main().catch((error) => {
  console.error('Failed to sync library data:', error);
  process.exitCode = 1;
});
