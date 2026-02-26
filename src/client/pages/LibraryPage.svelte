<script lang="ts">
  import { onMount } from 'svelte';
  import BookList from '../components/BookList.svelte';
  import BookDetail from '../components/BookDetail.svelte';
  import SearchBar from '../components/SearchBar.svelte';
  import { getBooks, isLoading, loadBooks, getLibraryName, setLibraryName } from '../lib/stores.svelte.ts';
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
      <span class="count">{getBooks().length}</span>
    </div>
    <div class="library-header-actions">
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
