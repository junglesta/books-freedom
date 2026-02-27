<script lang="ts">
  import type { Book } from '../lib/types';
  import { updateBookInCollection, removeBookFromCollection } from '../lib/stores.svelte.ts';

  interface Props {
    book: Book;
    onClose: () => void;
  }

  let { book, onClose }: Props = $props();

  let status = $state<Book['status']>('to-read');
  let rating = $state(0);
  let language = $state('');
  let notes = $state('');
  let tagsInput = $state('');
  let saving = $state(false);
  let statusOpen = $state(false);
  let removeConfirmOpen = $state(false);

  $effect(() => {
    status = book.status;
    rating = book.rating || 0;
    language = book.language || '';
    notes = book.notes || '';
    tagsInput = (book.tags || []).join(', ');
  });

  const statusOptions: { value: Book['status']; label: string }[] = [
    { value: 'to-read', label: 'To Read' },
    { value: 'reading', label: 'Reading' },
    { value: 'read', label: 'Read' },
  ];

  function pickStatus(value: Book['status']) {
    status = value;
    statusOpen = false;
  }

  async function save() {
    saving = true;
    try {
      await updateBookInCollection(book.id, {
        status,
        rating: rating || undefined,
        language: language || undefined,
        notes: notes || undefined,
        tags: tagsInput ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
        dateRead: status === 'read' && !book.dateRead ? new Date().toISOString() : book.dateRead,
      });
      onClose();
    } finally {
      saving = false;
    }
  }

  function remove() {
    removeConfirmOpen = !removeConfirmOpen;
  }

  function cancelRemove() {
    removeConfirmOpen = false;
  }

  async function confirmRemove() {
    await removeBookFromCollection(book.id);
    removeConfirmOpen = false;
    onClose();
  }
</script>

<div class="detail-overlay" role="dialog" aria-label="Book details">
  <div class="detail-panel">
    <div class="detail-topbar">
      <button class="detail-close" onclick={onClose} aria-label="Close">&times;</button>
    </div>

    <div class="detail-header">
      <div class="detail-cover">
        {#if book.coverUrl}
          <img src={book.coverUrl} alt={book.title} />
        {:else}
          <div class="cover-placeholder large">📕</div>
        {/if}
      </div>
      <div class="detail-title-area">
        <h2>{book.title}</h2>
        <p class="detail-authors">{book.authors.join(', ')}</p>
        {#if book.publisher}
          <p class="detail-publisher">{book.publisher}</p>
        {/if}
        {#if book.publishYear}
          <p class="detail-year">{book.publishYear}</p>
        {/if}
        {#if book.pageCount}
          <p class="detail-pages">{book.pageCount} pages</p>
        {/if}
        <p class="detail-isbn">ISBN: {book.isbn13}</p>
      </div>
    </div>

    <div class="detail-form">
      <div class="form-group">
        <span>Status</span>
        <div class="status-picker">
          {#each statusOptions as opt}
            <button
              type="button"
              class="status-choice"
              class:active={status === opt.value}
              onclick={() => pickStatus(opt.value)}
            >{opt.label}</button>
          {/each}
        </div>
      </div>

      <div class="form-group">
        <span>Rating</span>
        <div class="rating-input">
          {#each [1, 2, 3, 4, 5] as star}
            <button
              type="button"
              class="star-btn"
              class:active={star <= rating}
              onclick={() => (rating = rating === star ? 0 : star)}
              aria-label="{star} star{star > 1 ? 's' : ''}"
            >★</button>
          {/each}
        </div>
      </div>

      <label class="form-group">
        <span>Language</span>
        <input type="text" bind:value={language} placeholder="eng, it, fr..." />
      </label>

      <label class="form-group">
        <span>Notes</span>
        <textarea bind:value={notes} rows="3" placeholder="Your thoughts..."></textarea>
      </label>

      <label class="form-group">
        <span>Tags</span>
        <input type="text" bind:value={tagsInput} placeholder="fiction, sci-fi, favorite" />
      </label>
    </div>

    <div class="detail-actions">
      <button class="btn btn-primary" onclick={save} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
      <button class="btn btn-danger" onclick={remove}>Remove</button>
    </div>

    {#if removeConfirmOpen}
      <details class="rband-confirm rband-confirm-inline" open aria-label="Remove book confirmation">
        <summary class="rband-confirm-summary">Remove Book</summary>
        <div class="rband-confirm-copy">
          <p>Remove "{book.title}" from your library? This cannot be undone.</p>
        </div>
        <div class="rband-confirm-actions">
          <button class="btn btn-ghost" onclick={cancelRemove}>Cancel</button>
          <button class="btn btn-danger" onclick={confirmRemove}>Delete</button>
        </div>
      </details>
    {/if}
  </div>
</div>
