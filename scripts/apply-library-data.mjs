import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const [, , inputArg] = process.argv;

if (!inputArg) {
  console.error('Usage: node scripts/apply-library-data.mjs <path-to-library-json>');
  process.exit(1);
}

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
  if (Array.isArray(input)) {
    return { version: 1, books: input.filter(isBook) };
  }
  if (!input || typeof input !== 'object') return { version: 1, books: [] };
  const books = Array.isArray(input.books) ? input.books.filter(isBook) : [];
  return { version: 1, books };
}

async function main() {
  const inputPath = resolve(process.cwd(), inputArg);
  const source = await readFile(inputPath, 'utf8');
  const parsed = JSON.parse(source);
  const normalized = normalizeCollection(parsed);

  await writeFile(
    resolve(process.cwd(), 'data/library.json'),
    JSON.stringify(normalized, null, 2) + '\n',
  );

  const sync = spawnSync('node', ['scripts/sync-library-data.mjs'], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  if (sync.status !== 0) {
    process.exit(sync.status ?? 1);
  }

  console.log(`Applied ${inputArg} -> data/library.json`);
}

main().catch((error) => {
  console.error('Failed to apply library data:', error);
  process.exitCode = 1;
});
