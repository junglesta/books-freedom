import { cleanIsbn, toIsbn13 } from "./isbn";
import type { Book } from "./types";

const BOOK_STATUSES = new Set<Book["status"]>(["to-read", "reading", "read"]);
const BOOK_SOURCES = new Set<Book["source"]>(["openlibrary", "googlebooks", "manual"]);

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((v) => typeof v === "string") ? value : undefined;
}

function asOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function parseStatus(value: unknown): Book["status"] {
  const normalized = asString(value)?.trim().toLowerCase();
  if (normalized && BOOK_STATUSES.has(normalized as Book["status"])) {
    return normalized as Book["status"];
  }
  return "to-read";
}

function parseSource(value: unknown): Book["source"] {
  const normalized = asString(value)?.trim().toLowerCase();
  if (normalized && BOOK_SOURCES.has(normalized as Book["source"])) {
    return normalized as Book["source"];
  }
  return "manual";
}

function normalizeAuthors(value: unknown): string[] {
  const arr = asStringArray(value);
  if (arr && arr.length > 0) return arr;
  const single = asString(value);
  if (!single) return ["Unknown Author"];
  return single
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeImportedBook(input: unknown): Partial<Book> | null {
  const raw = asRecord(input);
  if (!raw) return null;

  const rawIsbn = asString(raw.isbn13) || asString(raw["ISBN-13"]) || asString(raw.isbn);
  const isbn13 = rawIsbn ? toIsbn13(cleanIsbn(rawIsbn)) : null;
  if (!isbn13) return null;

  const title = asString(raw.title) || asString(raw.Title);
  if (!title || title.trim() === "") return null;

  const parsedAuthors = normalizeAuthors(raw.authors || raw.Authors || raw.Author);
  const authors = parsedAuthors.length > 0 ? parsedAuthors : ["Unknown Author"];

  return {
    isbn13,
    isbn10: asString(raw.isbn10) || asString(raw["ISBN-10"]),
    title: title.trim(),
    authors,
    publisher: asString(raw.publisher) || asString(raw.Publisher),
    publishDate: asString(raw.publishDate) || asString(raw["Publish Date"]),
    publishYear: asOptionalNumber(raw.publishYear || raw.Year),
    pageCount: asOptionalNumber(raw.pageCount || raw.Pages),
    language: asString(raw.language) || asString(raw.Language),
    status: parseStatus(raw.status || raw.Status),
    rating: asOptionalNumber(raw.rating || raw.Rating),
    notes: asString(raw.notes) || asString(raw.Notes),
    tags: (asString(raw.tags) || asString(raw.Tags))
      ?.split(";")
      .map((t) => t.trim())
      .filter(Boolean),
    subjects: asStringArray(raw.subjects),
    coverUrl: asString(raw.coverUrl) || asString(raw["Cover URL"]),
    dateAdded: asString(raw.dateAdded) || asString(raw["Date Added"]),
    dateRead: asString(raw.dateRead) || asString(raw["Date Read"]),
    source: parseSource(raw.source),
  };
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

function parseCsv(content: string): Partial<Book>[] {
  const lines = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const books: Partial<Book>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const row: UnknownRecord = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = cols[j] ?? "";
    }
    const normalized = normalizeImportedBook(row);
    if (normalized) books.push(normalized);
  }

  return books;
}

function parseJson(content: string): Partial<Book>[] {
  const parsed = JSON.parse(content);
  const records = Array.isArray(parsed)
    ? parsed
    : Array.isArray(asRecord(parsed)?.books)
      ? (asRecord(parsed)?.books as unknown[])
      : [];
  return records.map((r) => normalizeImportedBook(r)).filter((b): b is Partial<Book> => b !== null);
}

export function parseImportedBooks(content: string, fileName: string): Partial<Book>[] {
  const name = fileName.toLowerCase();
  if (name.endsWith(".json")) {
    return parseJson(content);
  }
  if (name.endsWith(".csv") || name.endsWith(".css")) {
    return parseCsv(content);
  }
  throw new Error("Unsupported file type. Use JSON or CSV.");
}
