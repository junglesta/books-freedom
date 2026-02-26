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
    <svg class="nav-brand-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <g fill="none" stroke="currentColor" stroke-width="2" opacity="0.35">
        <path d="M8 13V46c3-1 6-1.5 9-1.5 5 0 10 2 15 5.5V16C27 13 22 11 17 11c-3 0-6 .7-9 2z" />
        <path d="M56 13V46c-3-1-6-1.5-9-1.5-5 0-10 2-15 5.5V16C37 13 42 11 47 11c3 0 6 .7 9 2z" />
      </g>
      <g fill="none" stroke="currentColor" stroke-width="2.5" transform="translate(20,40) scale(0.6) translate(-32,-32)">
        <circle cx="32" cy="32" r="14" />
        <circle cx="32" cy="32" r="2" />
        <line x1="32" y1="12" x2="32" y2="18" />
        <line x1="32" y1="46" x2="32" y2="52" />
        <line x1="12" y1="32" x2="18" y2="32" />
        <line x1="46" y1="32" x2="52" y2="32" />
      </g>
    </svg>
    <span>bukuku</span>
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
