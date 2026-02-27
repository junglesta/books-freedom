import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import type { Book } from "../lib/types";
import LibraryPage from "./LibraryPage.svelte";

const {
  getBooks,
  isLoading,
  loadBooks,
  getLibraryName,
  setLibraryName,
  updateBookInCollection,
  removeBookFromCollection,
} = vi.hoisted(() => ({
  getBooks: vi.fn(),
  isLoading: vi.fn(),
  loadBooks: vi.fn(),
  getLibraryName: vi.fn(),
  setLibraryName: vi.fn(),
  updateBookInCollection: vi.fn(),
  removeBookFromCollection: vi.fn(),
}));

vi.mock("../lib/stores.svelte.ts", () => ({
  getBooks,
  isLoading,
  loadBooks,
  getLibraryName,
  setLibraryName,
  updateBookInCollection,
  removeBookFromCollection,
}));

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: "book-1",
    isbn13: "9780141439518",
    title: "Pride and Prejudice",
    authors: ["Jane Austen"],
    status: "to-read",
    dateAdded: "2025-01-01T00:00:00.000Z",
    source: "openlibrary",
    ...overrides,
  };
}

describe("LibraryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isLoading.mockReturnValue(false);
    getLibraryName.mockReturnValue("Library");
    getBooks.mockReturnValue([makeBook()]);
    updateBookInCollection.mockResolvedValue(makeBook({ status: "read" }));
    removeBookFromCollection.mockResolvedValue(undefined);
  });

  it("loads books on mount and opens detail when selecting a book", async () => {
    const user = userEvent.setup();
    render(LibraryPage);

    expect(loadBooks).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /Pride and Prejudice/i }));
    expect(screen.getByLabelText("Book details")).toBeTruthy();
  });

  it("saves updated status from detail modal", async () => {
    const user = userEvent.setup();
    render(LibraryPage);

    await user.click(screen.getByRole("button", { name: /Pride and Prejudice/i }));
    const modal = screen.getByLabelText("Book details");
    await user.click(within(modal).getByRole("button", { name: "Read" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(updateBookInCollection).toHaveBeenCalledWith(
      "book-1",
      expect.objectContaining({ status: "read" }),
    );
  });

  it("removes a book after confirmation", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );

    render(LibraryPage);
    await user.click(screen.getByRole("button", { name: /Pride and Prejudice/i }));
    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(removeBookFromCollection).toHaveBeenCalledWith("book-1");
  });
});
