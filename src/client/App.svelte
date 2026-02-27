<script lang="ts">
    import { onMount } from "svelte";
    import Nav from "./components/Nav.svelte";
    import Toast from "./components/Toast.svelte";
    import ScanPage from "./pages/ScanPage.svelte";
    import LibraryPage from "./pages/LibraryPage.svelte";
    import ExportPage from "./pages/ExportPage.svelte";
    import { getRoute, loadBooks } from "./lib/stores.svelte";
    import logoUrl from "./assets/logo.svg";
    import headerLogoUrl from "./assets/header-logo.svg";
    import splashQrUrl from "./assets/splash-qr.svg";
    import { version } from "../../package.json";

    let splashDone = $state(false);
    let showSplash = $state(false);

    onMount(() => {
        loadBooks();
        setTimeout(() => {
            splashDone = true;
        }, 1400);
    });

    function toggleSplash() {
        showSplash = !showSplash;
    }
</script>

{#if !splashDone}
    <div class="splash">
        <div class="splash_qr">
            <img src={splashQrUrl} alt="QR code to open Book Freedom" />
            <p>Scan to open</p>
        </div>
        <span class="splash_version">version {version}</span>
        <img class="splash_logo" src={logoUrl} alt="Book's Freedom" />
    </div>
{:else}
    {#if showSplash}
        <div
            class="splash splash_popover"
            onclick={toggleSplash}
            onkeydown={(e) => e.key === 'Enter' && toggleSplash()}
            role="button"
            tabindex="-1"
        >
            <div class="splash_qr">
                <img src={splashQrUrl} alt="QR code to open Book Freedom" />
                <p>Scan to open</p>
            </div>
            <span class="splash_version">version {version}</span>
            <img class="splash_logo" src={logoUrl} alt="Book's Freedom" />
        </div>
    {/if}

    <div class="app">
        <header
            class="brand"
            onclick={toggleSplash}
            onkeydown={(e) => e.key === 'Enter' && toggleSplash()}
            role="button"
            tabindex="0"
        >
            <img class="brand_logo" src={headerLogoUrl} alt="Book Freedom" />
        </header>
        <main class="page">
            {#if getRoute() === "#/scan" || getRoute() === "" || getRoute() === "#/"}
                <ScanPage />
            {:else if getRoute() === "#/library"}
                <LibraryPage />
            {:else if getRoute() === "#/export"}
                <ExportPage />
            {:else}
                <ScanPage />
            {/if}
        </main>

        <Nav onBrandClick={toggleSplash} />
        <Toast />
    </div>
{/if}
