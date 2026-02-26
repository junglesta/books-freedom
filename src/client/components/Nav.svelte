<script lang="ts">
  import { getRoute, navigate } from '../lib/stores.svelte.ts';

  const tabs = [
    { hash: '#/scan', label: 'Add' },
    { hash: '#/library', label: 'Library' },
    { hash: '#/export', label: 'Export' },
  ];
</script>

<nav class="bottom-nav">
  <div class="nav-brand">
    <span class="nav-brand-text">books</span>
    <svg class="nav-brand-icon" viewBox="0 0 64 58" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 10 C6 10 14 6 22 6 C28 6 32 10 32 10 C32 10 36 6 42 6 C50 6 58 10 58 10 V38 C58 38 50 34 42 34 C36 34 32 38 32 38 C32 38 28 34 22 34 C14 34 6 38 6 38 Z" stroke-width="3"/>
      <path d="M32 10 V38" stroke-width="3"/>
      <path d="M6 43 C14 39 24 39 32 43 C40 39 50 39 58 43" stroke-width="2.5"/>
      <path d="M6 48 C14 44 24 44 32 48 C40 44 50 44 58 48" stroke-width="2.5"/>
    </svg>
    <span class="nav-brand-text">freedom</span>
  </div>
  {#each tabs as tab}
    <button
      class="nav-tab"
      class:active={getRoute() === tab.hash}
      onclick={() => navigate(tab.hash)}
    >
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        {#if tab.hash === '#/scan'}
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        {:else if tab.hash === '#/library'}
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        {:else if tab.hash === '#/export'}
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        {/if}
      </svg>
      <span class="nav-label">{tab.label}</span>
    </button>
  {/each}
</nav>
