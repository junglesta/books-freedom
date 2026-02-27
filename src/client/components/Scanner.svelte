<script lang="ts">
  import { onDestroy } from 'svelte';

  interface Props {
    onScan: (isbn: string) => void;
  }

  let { onScan }: Props = $props();

  let scannerRef: HTMLDivElement | undefined = $state();
  let scanner: any = null;
  let scannerError = $state('');
  let isScanning = $state(false);

  let isbn13 = $state('');
  let isbn10 = $state('');
  let inputError = $state('');

  // ISBN-13 dash positions: 978-3-161484-10-0 → after digit 3, 4, 10, 12
  const ISBN13_DASHES = [3, 4, 10, 12];
  // ISBN-10 dash positions: 0-306406-15-2 → after digit 1, 7, 9
  const ISBN10_DASHES = [1, 7, 9];

  function autoFormat(digits: string, dashPositions: number[]): string {
    let result = '';
    let di = 0;
    for (let i = 0; i < digits.length; i++) {
      result += digits[i];
      di++;
      if (dashPositions.includes(di) && i < digits.length - 1) {
        result += '-';
      }
    }
    return result;
  }

  function handleIsbn13Input(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const cursorBefore = input.selectionStart ?? 0;
    const oldVal = isbn13;

    // Strip to digits only
    const digits = input.value.replace(/[^\d]/g, '').slice(0, 13);
    const formatted = autoFormat(digits, ISBN13_DASHES);
    isbn13 = formatted;

    // Fix cursor position after formatting
    requestAnimationFrame(() => {
      const digitsBeforeCursor = oldVal.slice(0, cursorBefore).replace(/[^\d]/g, '').length;
      let newPos = 0;
      let counted = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (formatted[i] !== '-') counted++;
        if (counted >= digitsBeforeCursor + 1) { newPos = i + 1; break; }
      }
      if (counted < digitsBeforeCursor + 1) newPos = formatted.length;
      input.setSelectionRange(newPos, newPos);
    });

    inputError = '';
  }

  function handleIsbn10Input(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const cursorBefore = input.selectionStart ?? 0;
    const oldVal = isbn10;

    // Strip to digits + X only (X only allowed at end)
    let raw = input.value.replace(/[^\dXx]/g, '');
    // Ensure X only at position 10
    const xPos = raw.search(/[Xx]/);
    if (xPos !== -1 && xPos < 9) {
      raw = raw.replace(/[Xx]/g, '');
    }
    const digits = raw.slice(0, 10);
    const formatted = autoFormat(digits, ISBN10_DASHES);
    isbn10 = formatted;

    requestAnimationFrame(() => {
      const digitsBeforeCursor = oldVal.slice(0, cursorBefore).replace(/[^\dXx]/g, '').length;
      let newPos = 0;
      let counted = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (formatted[i] !== '-') counted++;
        if (counted >= digitsBeforeCursor + 1) { newPos = i + 1; break; }
      }
      if (counted < digitsBeforeCursor + 1) newPos = formatted.length;
      input.setSelectionRange(newPos, newPos);
    });

    inputError = '';
  }

  onDestroy(() => {
    stopScanner();
  });

  function killVideoTracks() {
    if (!scannerRef) return;
    const video = scannerRef.querySelector('video');
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
    scannerRef.querySelectorAll('video, canvas').forEach(el => el.remove());
  }

  async function startScanner() {
    if (!scannerRef || isScanning) return;
    scannerError = '';
    isScanning = true;

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
      scanner = new Html5Qrcode(scannerRef.id);

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
          ],
        },
        (decodedText: string) => {
          const cleaned = decodedText.replace(/[^0-9]/g, '');
          if (cleaned.length === 13 || cleaned.length === 10) {
            // Defer stop to avoid re-entrancy inside library callback
            setTimeout(() => stopScanner(), 0);
            onScan(cleaned);
          }
        },
        () => {}
      );
    } catch (err: any) {
      scannerError = err?.message || 'Failed to start camera';
      killVideoTracks();
      isScanning = false;
    }
  }

  function stopScanner() {
    const s = scanner;
    scanner = null;
    isScanning = false;
    if (s) {
      try { s.stop().catch(() => {}); } catch {}
      try { s.clear(); } catch {}
    }
    killVideoTracks();
    // Remove leftover library DOM (viewfinder overlays) after Svelte re-renders the button
    setTimeout(() => {
      if (scannerRef && !isScanning) {
        Array.from(scannerRef.children).forEach(el => {
          if (el.tagName !== 'BUTTON') el.remove();
        });
      }
    }, 50);
  }

  function submitIsbn13(e: Event) {
    e.preventDefault();
    inputError = '';
    const cleaned = isbn13.replace(/[-\s]/g, '');
    if (cleaned.length !== 13 || !/^\d{13}$/.test(cleaned)) {
      inputError = 'ISBN-13 must be exactly 13 digits';
      return;
    }
    onScan(cleaned);
    isbn13 = '';
  }

  function submitIsbn10(e: Event) {
    e.preventDefault();
    inputError = '';
    const cleaned = isbn10.replace(/[-\s]/g, '');
    if (cleaned.length !== 10 || !/^\d{9}[\dXx]$/.test(cleaned)) {
      inputError = 'ISBN-10 must be 9 digits + a check digit (0-9 or X)';
      return;
    }
    onScan(cleaned);
    isbn10 = '';
  }
</script>

<div class="scanner-container">
  <div id="scanner-view" bind:this={scannerRef} class={isScanning ? 'scanner-view' : 'scanner-view-idle'}>
    {#if !isScanning}
      <button class="btn btn-primary scanner-start-btn" onclick={startScanner}>
        Open Camera Scanner
      </button>
    {/if}
  </div>
  {#if isScanning}
    <button class="btn btn-primary" onclick={stopScanner}>Stop Camera</button>
  {/if}
  {#if !isScanning && scannerError}
    <div class="scanner-error">
      <p>{scannerError}</p>
    </div>
  {/if}

  <div class="manual-section">
    <p class="manual-label">Or enter ISBN manually</p>

    <form class="manual-input" onsubmit={submitIsbn13}>
      <input
        type="text"
        value={isbn13}
        oninput={handleIsbn13Input}
        placeholder="978-3-161484-10-0"
        inputmode="numeric"
        maxlength="17"
      />
      <button type="submit" class="btn btn-primary" disabled={!isbn13.trim()}>ISBN-13</button>
    </form>

    <form class="manual-input" onsubmit={submitIsbn10}>
      <input
        type="text"
        value={isbn10}
        oninput={handleIsbn10Input}
        placeholder="0-306406-15-2"
        inputmode="numeric"
        maxlength="13"
      />
      <button type="submit" class="btn btn-primary" disabled={!isbn10.trim()}>ISBN-10</button>
    </form>

    {#if inputError}
      <p class="input-error">{inputError}</p>
    {/if}
  </div>
</div>
