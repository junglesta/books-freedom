<script lang="ts">
  import type { Book } from '../lib/types';

  interface Props {
    book: Book;
    compact?: boolean;
    onclick?: () => void;
  }

  let { book, compact = false, onclick }: Props = $props();

  const statusLabels: Record<string, string> = {
    'to-read': 'To Read',
    'reading': 'Reading',
    'read': 'Read',
  };

  function stars(rating: number | undefined): string {
    if (!rating) return '';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
</script>

<button class="book-card" class:compact onclick={onclick} type="button">
  {#if !compact}
    <div class="book-cover">
      {#if book.coverUrl}
        <img src={book.coverUrl} alt={book.title} loading="lazy" />
      {:else}
        <div class="cover-placeholder">📕</div>
      {/if}
    </div>
  {/if}
  <div class="book-info">
    <h3 class="book-title">{book.title}</h3>
    <p class="book-authors">{book.authors.join(', ') || 'Unknown Author'}</p>
    {#if !compact}
      <div class="book-meta">
        <span class="book-status status-{book.status}">{statusLabels[book.status]}</span>
        {#if book.rating}
          <span class="book-rating">{stars(book.rating)}</span>
        {/if}
        {#if book.publishYear}
          <span class="book-year">{book.publishYear}</span>
        {/if}
      </div>
    {/if}
  </div>
</button>
