<script lang="ts">
  import { getBooks, showToast, getLibraryName } from '../lib/stores.svelte.ts';
  import { exportGoogleSheets } from '../lib/api';

  let webhookUrl = $state(localStorage.getItem('bukuku_sheets_url') || '');
  let exporting = $state(false);
  let openHelp = $state<string | null>(null);

  function toggleHelp(id: string) {
    openHelp = openHelp === id ? null : id;
  }

  const formats = [
    {
      id: 'json',
      label: 'JSON',
      desc: 'Raw book data',
      url: '/api/export/json',
      ext: 'json',
      help: [
        'Click the card to download your full library as a .json file.',
        'This is the raw data — useful as a backup or for importing into other tools.',
        'The file contains all book metadata, ratings, notes, and tags.',
      ],
    },
    {
      id: 'csv',
      label: 'CSV',
      desc: 'Standard spreadsheet format',
      url: '/api/export/csv',
      ext: 'csv',
      help: [
        'Click to download a .csv file you can open in Excel, Google Sheets, or Numbers.',
        'Columns: Title, Authors, ISBN-13, ISBN-10, Publisher, Year, Pages, Status, Rating, Tags, Notes.',
        'Authors and tags are separated by semicolons.',
      ],
    },
    {
      id: 'goodreads',
      label: 'Goodreads',
      desc: 'Goodreads-compatible CSV',
      url: '/api/export/goodreads',
      ext: 'csv',
      help: [
        'Downloads a CSV formatted for Goodreads import.',
        'To import: go to goodreads.com → My Books → Import and Export → Import.',
        'Status maps: "to-read" → To Read, "reading" → Currently Reading, "read" → Read.',
        'Dates are formatted as YYYY/MM/DD. ISBNs use the ="..." format Goodreads expects.',
      ],
    },
    {
      id: 'librarything',
      label: 'LibraryThing',
      desc: 'LibraryThing TSV import',
      url: '/api/export/librarything',
      ext: 'tsv',
      help: [
        'Downloads a tab-separated file for LibraryThing import.',
        'To import: go to librarything.com → More → Import/Export → Import.',
        'Choose "Tab-delimited" as the format and upload the .tsv file.',
        'Includes: Title, Author, ISBN, Rating, Tags, Review, Page Count, Publisher.',
      ],
    },
  ];

  function download(url: string, filename: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  async function pushToSheets() {
    if (!webhookUrl.trim()) {
      showToast('Please enter a webhook URL');
      return;
    }

    localStorage.setItem('bukuku_sheets_url', webhookUrl);
    exporting = true;

    try {
      const result = await exportGoogleSheets(webhookUrl);
      showToast(`Exported ${result.count} books to Google Sheets!`);
    } catch (e: any) {
      showToast(e.message || 'Export failed');
    } finally {
      exporting = false;
    }
  }
</script>

<div class="export-page">
  <p class="export-subtitle">{getBooks().length} Books in <span class="export-library-name">{getLibraryName()}</span> | Pick Export format:</p>

  {#each formats as fmt}
    <div class="export-section">
      <div class="export-section-header">
        <button
          class="export-card"
          onclick={() => download(fmt.url, `${getLibraryName().toLowerCase().replace(/\s+/g, '-')}.${fmt.ext}`)}
          disabled={getBooks().length === 0}
        >
          <h3>{fmt.label}</h3>
          <p>{fmt.desc}</p>
        </button>
        <button class="help-btn" onclick={() => toggleHelp(fmt.id)} aria-label="Help for {fmt.label}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          {exporting ? 'Exporting...' : 'Push to Google Sheets'}
        </button>
      </div>
      <button class="help-btn" onclick={() => toggleHelp('sheets')} aria-label="Help for Google Sheets">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
    </div>
    {#if openHelp === 'sheets'}
      <div class="help-panel">
        <ul>
          <li>Open Google Sheets → Extensions → Apps Script.</li>
          <li>Paste this code and deploy as a web app:
            <code class="help-code">function doPost(e) &#123; const data = JSON.parse(e.postData.contents); const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); sheet.clear(); sheet.appendRow(['Title','Author','ISBN','Status','Rating']); data.books.forEach(b =&gt; sheet.appendRow([b.title, b.authors.join('; '), b.isbn13, b.status, b.rating || ''])); return ContentService.createTextOutput('ok'); &#125;</code>
          </li>
          <li>Deploy → New deployment → Web app → Execute as "Me" → Access "Anyone".</li>
          <li>Copy the deployment URL and paste it above.</li>
          <li>Click "Push to Google Sheets" — your books will populate the sheet.</li>
        </ul>
      </div>
    {/if}
  </div>
</div>
