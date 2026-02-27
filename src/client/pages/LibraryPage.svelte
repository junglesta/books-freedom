<script lang="ts">
  import { onMount } from 'svelte';
  import BookList from '../components/BookList.svelte';
  import BookDetail from '../components/BookDetail.svelte';
  import SearchBar from '../components/SearchBar.svelte';
  import { getErrorMessage } from "../lib/error";
  import {
    getSupportedImportExtensionsLabel,
    isSupportedImportFileName,
    parseImportedBooks,
  } from "../lib/import";
  import {
    clearLibraryCollection,
    getBooks,
    getLibraryName,
    importBooksToCollection,
    isLoading,
    loadBooks,
    setLibraryName,
    showToast,
  } from "../lib/stores.svelte.ts";
  import type { Book } from '../lib/types';

  onMount(() => { loadBooks(); });

  let selectedBook = $state<Book | null>(null);
  let searchQuery = $state('');
  let statusFilter = $state<string>('all');
  let sortBy = $state<'dateAdded' | 'title' | 'author' | 'rating'>('dateAdded');
  let sortMenuOpen = $state(false);
  let viewMode = $state<'card' | 'list'>('card');
  let languageFilter = $state<string>('all');
  let languageMenuOpen = $state(false);
  let importInputRef = $state<HTMLInputElement>();
  let dropConfirmOpen = $state(false);
  let importFeedbackError = $state("");

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'to-read', label: 'To Read' },
    { value: 'reading', label: 'Reading' },
    { value: 'read', label: 'Read' },
  ];

  const sortOptions = [
    { value: 'dateAdded' as const, label: 'Recent' },
    { value: 'title' as const, label: 'Title' },
    { value: 'author' as const, label: 'Author' },
    { value: 'rating' as const, label: 'Rating' },
  ];

  function uniqueLanguages(): string[] {
    const langs = new Set<string>();
    for (const b of getBooks()) {
      langs.add(b.language || '');
    }
    return [...langs].sort((a, b) => {
      if (a === '') return 1;
      if (b === '') return -1;
      return a.localeCompare(b);
    });
  }

  function pickSort(value: typeof sortBy) {
    sortBy = value;
    sortMenuOpen = false;
  }

  function pickLanguage(value: string) {
    languageFilter = value;
    languageMenuOpen = false;
  }

  function toggleSortMenu() {
    sortMenuOpen = !sortMenuOpen;
  }

  function toggleLanguageMenu() {
    languageMenuOpen = !languageMenuOpen;
  }

  function closeMenus(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.sort-menu-wrap')) {
      sortMenuOpen = false;
    }
    if (!target.closest('.lang-menu-wrap')) {
      languageMenuOpen = false;
    }
  }

  function filteredBooks(): Book[] {
    let result = getBooks();

    if (statusFilter !== 'all') {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (languageFilter !== 'all') {
      result = result.filter((b) => (b.language || '') === languageFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.authors.some((a) => a.toLowerCase().includes(q))
      );
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return (a.authors[0] || '').localeCompare(b.authors[0] || '');
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'dateAdded':
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

    return result;
  }

  function countLabel(): string {
    const count = getBooks().length;
    return `${count} ${count === 1 ? "title" : "titles"}`;
  }

  function openImportPicker() {
    importFeedbackError = "";
    importInputRef?.click();
  }

  function dropLibrary() {
    if (getBooks().length === 0) {
      showToast("Library is already empty.");
      return;
    }
    dropConfirmOpen = !dropConfirmOpen;
  }

  function cancelDropLibrary() {
    dropConfirmOpen = false;
  }

  function confirmDropLibrary() {
    clearLibraryCollection();
    selectedBook = null;
    dropConfirmOpen = false;
  }

  async function handleImportChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      if (!isSupportedImportFileName(file.name)) {
        importFeedbackError = `Unsupported file type (${file.name}). Use ${getSupportedImportExtensionsLabel()}.`;
        return;
      }

      const content = await file.text();
      const importedBooks = parseImportedBooks(content, file.name);
      importFeedbackError = "";
      const summary = importBooksToCollection(importedBooks);
      if (summary.total === 0) {
        showToast("No valid books found in file.");
      } else if (summary.added === 0) {
        showToast("No new books imported (duplicates or invalid rows).");
      } else {
        showToast(
          `Imported ${summary.added} book${summary.added === 1 ? "" : "s"} (${summary.skipped} skipped${summary.failed > 0 ? `, ${summary.failed} failed` : ""}).`,
        );
      }
    } catch (error: unknown) {
      importFeedbackError = getErrorMessage(error, "Import failed");
    } finally {
      input.value = "";
    }
  }
</script>

<svelte:window onclick={closeMenus} />

<div class="library-page">
  <div class="library-header">
    <div class="library-header-left">
      <input
        class="library-name-input"
        type="text"
        value={getLibraryName()}
        oninput={(e) => setLibraryName(e.currentTarget.value)}
      />
      <span class="library-count" aria-label={`${getBooks().length} books in library`}>
        {countLabel()}
      </span>
    </div>
    <div class="library-header-actions">
      <button class="view-toggle" onclick={dropLibrary} aria-label="Drop library">
        Drop
      </button>
      <button class="view-toggle" onclick={openImportPicker} aria-label="Import books">
        Import
      </button>
      <input
        bind:this={importInputRef}
        type="file"
        accept=".json,.csv,.css"
        style="display:none"
        onchange={handleImportChange}
      />
      <button class="view-toggle" onclick={() => viewMode = viewMode === 'card' ? 'list' : 'card'} aria-label="Toggle view">
        {#if viewMode === 'card'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        {/if}
      </button>

      <div class="sort-menu-wrap">
        <button class="sort-trigger" onclick={toggleSortMenu} aria-label="Sort options">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        {#if sortMenuOpen}
          <div class="sort-dropdown">
            {#each sortOptions as opt}
              <button
                class="sort-option"
                class:active={sortBy === opt.value}
                onclick={() => pickSort(opt.value)}
              >{opt.label}</button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if dropConfirmOpen}
    <details class="rband-confirm rband-confirm-inline" open aria-label="Drop library confirmation">
      <summary class="rband-confirm-summary">Drop Library</summary>
      <div class="rband-confirm-copy">
        <p>Delete all books from this library? This cannot be undone.</p>
      </div>
      <div class="rband-confirm-actions">
        <button class="btn btn-ghost" onclick={cancelDropLibrary}>Cancel</button>
        <button class="btn btn-danger" onclick={confirmDropLibrary}>Delete</button>
      </div>
    </details>
  {/if}

  {#if importFeedbackError}
    <details class="rband-note rband-note-error" open>
      <summary class="rband-note-summary">Import Error</summary>
      <p>{importFeedbackError}</p>
    </details>
  {/if}

  <SearchBar value={searchQuery} onInput={(v) => (searchQuery = v)} />

  <div class="library-controls">
    <div class="status-tabs">
      {#each statusOptions as opt}
        <button
          class="tab"
          class:active={statusFilter === opt.value}
          onclick={() => (statusFilter = opt.value)}
        >{opt.label}</button>
      {/each}
    </div>

    {#if uniqueLanguages().length > 0}
      <div class="lang-menu-wrap">
        <button class="lang-trigger" onclick={toggleLanguageMenu} aria-label="Filter by language">
          {languageFilter === 'all' ? 'Lang' : languageFilter === '' ? '??' : languageFilter.toUpperCase()} ▾
        </button>

        {#if languageMenuOpen}
          <div class="lang-dropdown">
            <button
              class="lang-option"
              class:active={languageFilter === 'all'}
              onclick={() => pickLanguage('all')}
            >All</button>
            {#each uniqueLanguages() as lang}
              <button
                class="lang-option"
                class:active={languageFilter === lang}
                onclick={() => pickLanguage(lang)}
              >{lang === '' ? '??' : lang.toUpperCase()}</button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  {#if isLoading()}
    <div class="loading">
      <div class="spinner"></div>
    </div>
  {:else}
    <BookList books={filteredBooks()} onSelect={(b) => (selectedBook = b)} compact={viewMode === 'list'} />
  {/if}

  {#if selectedBook}
    <BookDetail book={selectedBook} onClose={() => (selectedBook = null)} />
  {/if}
</div>
