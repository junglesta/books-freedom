<script lang="ts">
  import { onMount } from 'svelte';
  import Nav from './components/Nav.svelte';
  import Toast from './components/Toast.svelte';
  import ScanPage from './pages/ScanPage.svelte';
  import LibraryPage from './pages/LibraryPage.svelte';
  import ExportPage from './pages/ExportPage.svelte';
  import { getRoute, loadBooks } from './lib/stores.svelte.ts';

  let splashDone = $state(false);
  let showSplash = $state(false);

  onMount(() => {
    loadBooks();
    setTimeout(() => { splashDone = true; }, 1400);
  });

  function toggleSplash() {
    showSplash = !showSplash;
  }
</script>

{#if !splashDone}
  <div class="splash">
    <svg class="splash-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <!-- open book (background) -->
      <g fill="none" stroke="currentColor" stroke-width="2" opacity="0.35" transform="translate(32,32) scale(1.2) translate(-32,-32)">
        <path d="M8 13V46c3-1 6-1.5 9-1.5 5 0 10 2 15 5.5V16C27 13 22 11 17 11c-3 0-6 .7-9 2z" />
        <path d="M56 13V46c-3-1-6-1.5-9-1.5-5 0-10 2-15 5.5V16C37 13 42 11 47 11c3 0 6 .7 9 2z" />
      </g>
      <!-- crosshair (foreground) -->
      <g fill="none" stroke="currentColor" stroke-width="2.5" transform="translate(22,40) scale(0.7) translate(-32,-32)">
        <circle cx="32" cy="32" r="14" />
        <circle cx="32" cy="32" r="2" />
        <line x1="32" y1="12" x2="32" y2="18" />
        <line x1="32" y1="46" x2="32" y2="52" />
        <line x1="12" y1="32" x2="18" y2="32" />
        <line x1="46" y1="32" x2="52" y2="32" />
      </g>
    </svg>
    <div class="splash-title">bukuku</div>
  </div>
{:else}
  {#if showSplash}
    <div class="splash splash-popover" onclick={toggleSplash} role="button" tabindex="-1">
      <svg class="splash-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <!-- open book (background) -->
        <g fill="none" stroke="currentColor" stroke-width="2" opacity="0.35" transform="translate(32,32) scale(1.2) translate(-32,-32)">
          <path d="M3 9.5V50c3-1 6-1.5 9-1.5 7 0 14 2.5 20 7V14C26 10 19 8 12 8 9 8 6 8.5 3 9.5z" />
          <path d="M61 9.5V50c-3-1-6-1.5-9-1.5-7 0-14 2.5-20 7V14C38 10 45 8 52 8c3 0 6 .5 9 1.5z" />
        </g>
        <!-- crosshair (foreground) -->
        <g fill="none" stroke="currentColor" stroke-width="2.5" transform="translate(22,40) scale(0.7) translate(-32,-32)">
          <circle cx="32" cy="32" r="14" />
          <circle cx="32" cy="32" r="2" />
          <line x1="32" y1="12" x2="32" y2="18" />
          <line x1="32" y1="46" x2="32" y2="52" />
          <line x1="12" y1="32" x2="18" y2="32" />
          <line x1="46" y1="32" x2="52" y2="32" />
        </g>
      </svg>
      <div class="splash-title">bukuku</div>
    </div>
  {/if}

  <div class="app">
    <header class="brand" class:hidden={getRoute() === '#/library'} onclick={toggleSplash} role="button" tabindex="0">
      <svg class="brand-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <!-- open book (background) -->
        <g fill="none" stroke="currentColor" stroke-width="2" opacity="0.35">
          <path d="M8 13V46c3-1 6-1.5 9-1.5 5 0 10 2 15 5.5V16C27 13 22 11 17 11c-3 0-6 .7-9 2z" />
          <path d="M56 13V46c-3-1-6-1.5-9-1.5-5 0-10 2-15 5.5V16C37 13 42 11 47 11c3 0 6 .7 9 2z" />
        </g>
        <!-- crosshair (foreground) -->
        <g fill="none" stroke="currentColor" stroke-width="2.5" transform="translate(20,40) scale(0.6) translate(-32,-32)">
          <circle cx="32" cy="32" r="14" />
          <circle cx="32" cy="32" r="2" />
          <line x1="32" y1="12" x2="32" y2="18" />
          <line x1="32" y1="46" x2="32" y2="52" />
          <line x1="12" y1="32" x2="18" y2="32" />
          <line x1="46" y1="32" x2="52" y2="32" />
        </g>
      </svg>
      bukuku
    </header>
    <main class="page">
      {#if getRoute() === '#/scan' || getRoute() === '' || getRoute() === '#/'}
        <ScanPage />
      {:else if getRoute() === '#/library'}
        <LibraryPage />
      {:else if getRoute() === '#/export'}
        <ExportPage />
      {:else}
        <ScanPage />
      {/if}
    </main>

    <Nav />
    <Toast />
  </div>
{/if}
