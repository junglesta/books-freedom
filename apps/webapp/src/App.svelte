<script lang="ts">
    import { onMount } from "svelte";
    import Nav from "./components/Nav.svelte";
    import Toast from "./components/Toast.svelte";
    import ScanPage from "./pages/ScanPage.svelte";
    import LibraryPage from "./pages/LibraryPage.svelte";
    import ExportPage from "./pages/ExportPage.svelte";
    import { getRoute, loadBooks } from "./lib/stores.svelte";
    import splashHelpUrl from "./assets/readme.svg";
    import splashStartUrl from "./assets/startscreen.svg";
    import splashQrUrl from "./assets/splash-qr.svg";
    import { version } from "../package.json";

    let splashDone = $state(false);
    let splashMode = $state<"startup" | "help" | "share">("startup");
    let startupSplashTimer: ReturnType<typeof setTimeout> | null = null;
    let startupSplashPersistent = $state(false);

    function clearStartupSplashTimer() {
        if (startupSplashTimer) {
            clearTimeout(startupSplashTimer);
            startupSplashTimer = null;
        }
    }

    function openStartupSplash(persistent = false) {
        clearStartupSplashTimer();
        startupSplashPersistent = persistent;
        splashMode = "startup";
        splashDone = false;
        if (!persistent) {
            startupSplashTimer = setTimeout(() => {
                splashDone = true;
                startupSplashTimer = null;
            }, 1400);
        }
    }

    onMount(() => {
        document.title = `BOOK BAT v${version}`;
        loadBooks();
        openStartupSplash();
        return () => clearStartupSplashTimer();
    });

    function openHelpSplash() {
        clearStartupSplashTimer();
        startupSplashPersistent = false;
        splashMode = "help";
        splashDone = false;
    }

    function openShareSplash() {
        clearStartupSplashTimer();
        startupSplashPersistent = false;
        splashMode = "share";
        splashDone = false;
    }

    function maybeCloseSplash() {
        if (splashMode !== "startup" || startupSplashPersistent) {
            clearStartupSplashTimer();
            startupSplashPersistent = false;
            splashDone = true;
        }
    }

</script>

{#if !splashDone}
    {#if splashMode === "help"}
        <button type="button" class="splash splash_popover splash_help" onclick={maybeCloseSplash} aria-label="Close splash screen">
            <div class="splash_help_scroll">
                <img class="splash_help_image" src={splashHelpUrl} alt="BOOK BAT readme screen" />
            </div>
        </button>
    {:else if splashMode === "share"}
        <button type="button" class="splash splash_popover" onclick={maybeCloseSplash} aria-label="Close share splash">
            <div class="splash_share_content">
                <img src={splashQrUrl} alt="QR code to share BOOK BAT" />
                <p class="splash_share_url">https://bat.junglestar.org</p>
            </div>
        </button>
    {:else if startupSplashPersistent}
        <button type="button" class="splash splash_popover splash_help splash_startup" onclick={maybeCloseSplash} aria-label="Close start screen">
            <div class="splash_help_scroll">
                <img class="splash_help_image" src={splashStartUrl} alt="BOOK BAT start screen" />
            </div>
        </button>
    {:else}
        <div class="splash splash_startup splash_help">
            <div class="splash_help_scroll">
                <img class="splash_help_image" src={splashStartUrl} alt="BOOK BAT start screen" />
            </div>
        </div>
    {/if}
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
                    <a href="#/" class="app_brand_name_link" onclick={(event) => {
                        event.preventDefault();
                        openStartupSplash(true);
                    }}>
                        BOOK BAT
                    </a>
                    <span class="app_brand_version">v{version}</span>
                </span>
                <span>
                    it's an
                    <a
                        href="https://github.com/junglesta/bookbat"
                        target="_blank"
                        rel="noreferrer noopener"
                        >open source</a
                    >
                    webapp by
                    <a href="https://junglestar.org" target="_blank" rel="noreferrer noopener"
                        >junglestar.org</a
                    >
                </span>
                <div class="footer_actions">
                    <button type="button" class="footer_action_btn" onclick={openHelpSplash}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" stroke-width="2" />
                            <path d="M9.8 9a2.2 2.2 0 1 1 3.8 1.5c-.8.7-1.5 1.2-1.5 2.3" stroke-width="2" />
                            <circle cx="12" cy="17.3" r="1" fill="currentColor" stroke="none" />
                        </svg>
                        <span>HELP</span>
                    </button>
                    <button type="button" class="footer_action_btn" onclick={openShareSplash}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                            <circle cx="18" cy="5.5" r="2" stroke-width="2" />
                            <circle cx="6" cy="12" r="2" stroke-width="2" />
                            <circle cx="18" cy="18.5" r="2" stroke-width="2" />
                            <path d="M8 11l8-4" stroke-width="2" />
                            <path d="M8 13l8 4" stroke-width="2" />
                        </svg>
                        <span>SHARE</span>
                    </button>
                </div>
            </footer>
        </main>

        <Nav />
        <Toast />
    </div>
{/if}
