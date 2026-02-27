<script lang="ts">
    import Scanner from "../components/Scanner.svelte";
    import BookCard from "../components/BookCard.svelte";
    import {
        scanIsbn,
        addBookToCollection,
        showToast,
        navigate,
    } from "../lib/stores.svelte";
    import { getErrorMessage } from "../lib/error";
    import type { ScanResult } from "../lib/types";

    let preview = $state<ScanResult | null>(null);
    let scanning = $state(false);
    let lastScannedIsbn = $state("");
    let justAdded = $state(false);
    let lookupError = $state("");
    let scannerResetKey = $state(0);

    async function handleScan(isbn: string) {
        if (isbn === lastScannedIsbn && preview) return;
        lastScannedIsbn = isbn;
        scanning = true;
        justAdded = false;
        lookupError = "";

        try {
            const result = await scanIsbn(isbn);
            preview = result;
            if (result.alreadyExists) {
                showToast("This book is already in your library.");
            }
        } catch (e: unknown) {
            lookupError = getErrorMessage(e, "Book not found");
            preview = null;
        } finally {
            scanning = false;
        }
    }

    async function addToLibrary() {
        if (!preview || preview.alreadyExists) return;

        try {
            await addBookToCollection(preview.book);
            justAdded = true;
        } catch {
            // Toast shown by store
        }
    }

    function viewInLibrary() {
        navigate("#/library");
    }

    function scanAnother() {
        preview = null;
        lastScannedIsbn = "";
        justAdded = false;
        lookupError = "";
        scanning = false;
        scannerResetKey += 1;
    }
</script>

<div class="scan-page">
    <h1>Scan ISBN</h1>

    {#key scannerResetKey}
        <Scanner onScan={handleScan} />
    {/key}

    {#if scanning}
        <div class="scan-loading">
            <div class="spinner"></div>
            <p>Looking up ISBN...</p>
        </div>
    {/if}

    {#if lookupError}
        <div class="scan-preview scan-error-panel">
            <details class="rband-note rband-note-error" open>
                <summary class="rband-note-summary">Lookup Error</summary>
                <p>{lookupError}</p>
            </details>
            <button class="btn btn-primary" style="width:100%" onclick={scanAnother}>Try Again</button>
        </div>
    {/if}

    {#if preview}
        <div class="scan-preview" class:added={justAdded}>
            {#if justAdded}
                <div class="added-badge">Added to library</div>
            {/if}

            <BookCard book={preview.book} compact />

            <div class="preview-actions">
                {#if justAdded}
                    <button class="btn btn-primary" onclick={viewInLibrary}
                        >View in Library</button
                    >
                    <button class="btn btn-secondary" onclick={scanAnother}
                        >Scan Another</button
                    >
                {:else if preview.alreadyExists}
                    <button class="btn btn-secondary" onclick={viewInLibrary}
                        >View in Library</button
                    >
                    <button class="btn btn-ghost" onclick={scanAnother}
                        >Dismiss</button
                    >
                {:else}
                    <button class="btn btn-primary" onclick={addToLibrary}
                        >Add to Library</button
                    >
                    <button class="btn btn-ghost" onclick={scanAnother}
                        >Dismiss</button
                    >
                {/if}
            </div>
        </div>
    {/if}
</div>
