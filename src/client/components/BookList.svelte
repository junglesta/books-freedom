<script lang="ts">
  import type { Book } from '../lib/types';
  import BookCard from './BookCard.svelte';

  interface Props {
    books: Book[];
    onSelect: (book: Book) => void;
    compact?: boolean;
  }

  let { books, onSelect, compact = false }: Props = $props();
</script>

{#if books.length === 0}
  <div class="empty-state">
    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="13" y2="11" />
    </svg>
    <p>No books yet. Scan an ISBN to get started!</p>
  </div>
{:else}
  <div class="book-list" class:compact>
    {#each books as book (book.id)}
      <BookCard {book} {compact} onclick={() => onSelect(book)} />
    {/each}
  </div>
{/if}
