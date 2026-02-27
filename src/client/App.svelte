<script lang="ts">
    import { onMount } from "svelte";
    import Nav from "./components/Nav.svelte";
    import Toast from "./components/Toast.svelte";
    import ScanPage from "./pages/ScanPage.svelte";
    import LibraryPage from "./pages/LibraryPage.svelte";
    import ExportPage from "./pages/ExportPage.svelte";
    import { getRoute, loadBooks } from "./lib/stores.svelte";
    import logoUrl from "./assets/logo.svg";
    import splashQrUrl from "./assets/splash-qr.svg";
    import { version } from "../../package.json";

    let splashDone = $state(false);

    onMount(() => {
        loadBooks();
        setTimeout(() => {
            splashDone = true;
        }, 1400);
    });
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
    <div class="app">
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
            <footer class="app_brand_footer">
                <span>
                    book's freedom
                    <span class="app_brand_version">v{version}</span>
                </span>
                <span>
                    it's an
                    <a
                        href="https://github.com/junglesta/books-freedom"
                        target="_blank"
                        rel="noreferrer noopener"
                        >open source</a
                    >
                    webapp by
                    <a href="https://junglestar.org" target="_blank" rel="noreferrer noopener"
                        >junglestar.org</a
                    >
                </span>
            </footer>
        </main>

        <Nav />
        <Toast />
    </div>
{/if}
