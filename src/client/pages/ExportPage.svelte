<script lang="ts">
    import { getBooks, showToast, getLibraryName } from "../lib/stores.svelte";
    import { getRawCollection } from "../lib/storage";
    import {
        generateCsv,
        generateGoodreadsCsv,
        generateLibraryThingTsv,
        downloadBlob,
    } from "../lib/export";
    import {
        LEGACY_SHEETS_URL_STORAGE_KEY,
        SHEETS_URL_STORAGE_KEY,
    } from "../lib/storage-keys";
    import {
        formatWebhookError,
        getWebhookHost,
        validateWebhookUrl,
    } from "../lib/webhook";
    import { getErrorMessage } from "../lib/error";

    function loadWebhookUrl(): string {
        const current = localStorage.getItem(SHEETS_URL_STORAGE_KEY);
        if (current) return current;

        const legacy = localStorage.getItem(LEGACY_SHEETS_URL_STORAGE_KEY);
        if (legacy) {
            localStorage.setItem(SHEETS_URL_STORAGE_KEY, legacy);
            return legacy;
        }

        return "";
    }

    let webhookUrl = $state(loadWebhookUrl());
    let exporting = $state(false);
    let openHelp = $state<string | null>(null);
    let cardState = $state<Record<string, 'idle' | 'busy' | 'done'>>({});

    function toggleHelp(id: string) {
        openHelp = openHelp === id ? null : id;
    }

    const formats = [
        {
            id: "json",
            label: "JSON",
            desc: "Raw book data",
            ext: "json",
            help: [
                "Click the card to download your full library as a .json file.",
                "This is the raw data — useful as a backup or for importing into other tools.",
                "The file contains all book metadata, ratings, notes, and tags.",
            ],
        },
        {
            id: "csv",
            label: "CSV",
            desc: "Standard spreadsheet format",
            ext: "csv",
            help: [
                "Click to download a .csv file you can open in Excel, Google Sheets, or Numbers.",
                "Columns: Title, Authors, ISBN-13, ISBN-10, Publisher, Year, Pages, Status, Rating, Tags, Notes.",
                "Authors and tags are separated by semicolons.",
            ],
        },
        {
            id: "goodreads",
            label: "Goodreads",
            desc: "Goodreads-compatible CSV",
            ext: "csv",
            help: [
                "Downloads a CSV formatted for Goodreads import.",
                "To import: go to goodreads.com → My Books → Import and Export → Import.",
                'Status maps: "to-read" → To Read, "reading" → Currently Reading, "read" → Read.',
                'Dates are formatted as YYYY/MM/DD. ISBNs use the ="..." format Goodreads expects.',
            ],
        },
        {
            id: "librarything",
            label: "LibraryThing",
            desc: "LibraryThing TSV import",
            ext: "tsv",
            help: [
                "Downloads a tab-separated file for LibraryThing import.",
                "To import: go to librarything.com → More → Import/Export → Import.",
                'Choose "Tab-delimited" as the format and upload the .tsv file.',
                "Includes: Title, Author, ISBN, Rating, Tags, Review, Page Count, Publisher.",
            ],
        },
    ];

    function download(formatId: string, filename: string) {
        if (cardState[formatId] === 'busy') return;
        cardState[formatId] = 'busy';

        // Defer so the UI updates before the sync work
        setTimeout(() => {
            const collection = getRawCollection();
            let content: string;
            let mimeType: string;

            switch (formatId) {
                case "json":
                    content = JSON.stringify(collection, null, 2);
                    mimeType = "application/json";
                    break;
                case "csv":
                    content = generateCsv(collection.books);
                    mimeType = "text/csv";
                    break;
                case "goodreads":
                    content = generateGoodreadsCsv(collection.books);
                    mimeType = "text/csv";
                    break;
                case "librarything":
                    content = generateLibraryThingTsv(collection.books);
                    mimeType = "text/tab-separated-values";
                    break;
                default:
                    cardState[formatId] = 'idle';
                    return;
            }

            downloadBlob(content, filename, mimeType);
            cardState[formatId] = 'done';
            setTimeout(() => { cardState[formatId] = 'idle'; }, 1200);
        }, 50);
    }

    async function pushToSheets() {
        const validation = validateWebhookUrl(webhookUrl);
        if (!validation.ok || !validation.normalizedUrl) {
            showToast(validation.error || "Webhook URL is not valid");
            return;
        }

        const collection = getRawCollection();
        const confirmed = confirm(
            `This will send ${collection.books.length} books (including notes/tags) to ${getWebhookHost(validation.normalizedUrl)}. Continue?`,
        );
        if (!confirmed) return;

        webhookUrl = validation.normalizedUrl;
        localStorage.setItem(SHEETS_URL_STORAGE_KEY, validation.normalizedUrl);
        exporting = true;

        try {
            const resp = await fetch(validation.normalizedUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(collection),
            });
            if (!resp.ok) {
                throw new Error(await formatWebhookError(resp));
            }
            showToast(
                `Exported ${collection.books.length} books to Google Sheets!`,
            );
        } catch (e: unknown) {
            showToast(getErrorMessage(e, "Export failed"));
        } finally {
            exporting = false;
        }
    }
</script>

<div class="export-page">
    <p class="export-subtitle">
        {getBooks().length} Books in
        <span class="export-library-name">{getLibraryName()}</span>
    </p>
    <h2 class="export-heading">Export format:</h2>

    {#each formats as fmt}
        <div class="export-section">
            <div class="export-section-header">
                <button
                    class="export-card"
                    onclick={() =>
                        download(
                            fmt.id,
                            `${getLibraryName().toLowerCase().replace(/\s+/g, "-")}.${fmt.ext}`,
                        )}
                    disabled={getBooks().length === 0 || cardState[fmt.id] === 'busy'}
                >
                    {#if cardState[fmt.id] === 'busy'}
                        <span class="export-card-feedback"><span class="spinner-small"></span> wait...</span>
                    {:else if cardState[fmt.id] === 'done'}
                        <span class="export-card-feedback">done</span>
                    {:else}
                        <h3>{fmt.label}</h3>
                        <p>{fmt.desc}</p>
                    {/if}
                </button>
                <button
                    class="help-btn"
                    onclick={() => toggleHelp(fmt.id)}
                    aria-label="Help for {fmt.label}"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </button>
            </div>
            {#if openHelp === fmt.id}
                <div class="help-panel">
                    <ul>
                        {#each fmt.help as step}
                            <li>{step}</li>
                        {/each}
                    </ul>
                </div>
            {/if}
        </div>
    {/each}

    <div class="export-section">
        <div class="export-section-header">
            <div class="sheets-section">
                <h2>Google Sheets</h2>
                <p class="sheets-desc">
                    Push your library to a Google Sheet via Apps Script webhook.
                </p>
                <input
                    type="url"
                    bind:value={webhookUrl}
                    placeholder="Apps Script webhook URL..."
                    class="sheets-input"
                />
                <button
                    class="btn btn-primary"
                    onclick={pushToSheets}
                    disabled={exporting || getBooks().length === 0}
                >
                    {exporting ? "Exporting..." : "Push to Google Sheets"}
                </button>
            </div>
            <button
                class="help-btn"
                onclick={() => toggleHelp("sheets")}
                aria-label="Help for Google Sheets"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            </button>
        </div>
        {#if openHelp === "sheets"}
            <div class="help-panel">
                <ul>
                    <li>Open Google Sheets → Extensions → Apps Script.</li>
                    <li>
                        Paste this code and deploy as a web app:
                        <code class="help-code"
                            >function doPost(e) &#123; const data =
                            JSON.parse(e.postData.contents); const sheet =
                            SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
                            sheet.clear();
                            sheet.appendRow(['Title','Author','ISBN','Status','Rating']);
                            data.books.forEach(b =&gt; sheet.appendRow([b.title,
                            b.authors.join('; '), b.isbn13, b.status, b.rating
                            || ''])); return
                            ContentService.createTextOutput('ok'); &#125;</code
                        >
                    </li>
                    <li>
                        Deploy → New deployment → Web app → Execute as "Me" →
                        Access "Anyone".
                    </li>
                    <li>Copy the deployment URL and paste it above.</li>
                    <li>
                        Click "Push to Google Sheets" — your books will populate
                        the sheet.
                    </li>
                </ul>
            </div>
        {/if}
    </div>
</div>
