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
    <div class="splash-title">books</div>
    <svg class="splash-icon" viewBox="0 0 64 58" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 10 C6 10 14 6 22 6 C28 6 32 10 32 10 C32 10 36 6 42 6 C50 6 58 10 58 10 V38 C58 38 50 34 42 34 C36 34 32 38 32 38 C32 38 28 34 22 34 C14 34 6 38 6 38 Z" stroke-width="3"/>
      <path d="M32 10 V38" stroke-width="3"/>
      <path d="M6 43 C14 39 24 39 32 43 C40 39 50 39 58 43" stroke-width="2.5"/>
      <path d="M6 48 C14 44 24 44 32 48 C40 44 50 44 58 48" stroke-width="2.5"/>
    </svg>
    <div class="splash-title">freedom</div>
  </div>
{:else}
  {#if showSplash}
    <div class="splash splash-popover" onclick={toggleSplash} role="button" tabindex="-1">
      <div class="splash-title">books</div>
      <svg class="splash-icon" viewBox="0 0 64 58" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 10 C6 10 14 6 22 6 C28 6 32 10 32 10 C32 10 36 6 42 6 C50 6 58 10 58 10 V38 C58 38 50 34 42 34 C36 34 32 38 32 38 C32 38 28 34 22 34 C14 34 6 38 6 38 Z" stroke-width="3"/>
        <path d="M32 10 V38" stroke-width="3"/>
        <path d="M6 43 C14 39 24 39 32 43 C40 39 50 39 58 43" stroke-width="2.5"/>
        <path d="M6 48 C14 44 24 44 32 48 C40 44 50 44 58 48" stroke-width="2.5"/>
      </svg>
      <div class="splash-title">freedom</div>
    </div>
  {/if}

  <div class="app">
    <header class="brand" class:hidden={getRoute() === '#/library'} onclick={toggleSplash} role="button" tabindex="0">
      <span class="brand-text">books</span>
      <svg class="brand-icon" viewBox="0 0 64 58" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 10 C6 10 14 6 22 6 C28 6 32 10 32 10 C32 10 36 6 42 6 C50 6 58 10 58 10 V38 C58 38 50 34 42 34 C36 34 32 38 32 38 C32 38 28 34 22 34 C14 34 6 38 6 38 Z" stroke-width="3"/>
        <path d="M32 10 V38" stroke-width="3"/>
        <path d="M6 43 C14 39 24 39 32 43 C40 39 50 39 58 43" stroke-width="2.5"/>
        <path d="M6 48 C14 44 24 44 32 48 C40 44 50 44 58 48" stroke-width="2.5"/>
      </svg>
      <span class="brand-text">freedom</span>
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
