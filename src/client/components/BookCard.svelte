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
  const statusClassNames: Record<Book['status'], string> = {
    'to-read': 'status_to_read',
    'reading': 'status_reading',
    'read': 'status_read',
  };

  function stars(rating: number | undefined): string {
    if (!rating) return '';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
</script>

<button class="book_card" class:compact onclick={onclick} type="button">
  {#if !compact}
    <div class="book_cover">
      {#if book.coverUrl}
        <img src={book.coverUrl} alt={book.title} loading="lazy" />
      {:else}
        <div class="cover_placeholder">📕</div>
      {/if}
    </div>
  {/if}
  <div class="book_info">
    <h3 class="book_title">{book.title}</h3>
    <p class="book_authors">{book.authors.join(', ') || 'Unknown Author'}</p>
    {#if !compact}
      <div class="book_meta">
        <span class="book_status {statusClassNames[book.status]}">{statusLabels[book.status]}</span>
        {#if book.rating}
          <span class="book_rating">{stars(book.rating)}</span>
        {/if}
        {#if book.publishYear}
          <span class="book_year">{book.publishYear}</span>
        {/if}
      </div>
    {/if}
  </div>
</button>
