<script lang="ts">
  interface Props {
    open: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }

  let {
    open,
    title = "Confirm",
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    danger = false,
    onConfirm,
    onCancel,
  }: Props = $props();
</script>

{#if open}
  <div class="confirm-overlay" role="dialog" aria-label="Confirmation dialog">
    <div class="confirm-panel">
      <h3>{title}</h3>
      <p>{message}</p>
      <div class="confirm-actions">
        <button class="btn btn-ghost" onclick={onCancel}>{cancelLabel}</button>
        <button class="btn" class:btn-danger={danger} class:btn-primary={!danger} onclick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: grid;
    place-items: center;
    z-index: 1200;
    padding: 16px;
  }

  .confirm-panel {
    width: min(92vw, 420px);
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 14px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
    padding: 16px;
  }

  .confirm-panel h3 {
    margin: 0 0 8px;
    font-size: 1rem;
  }

  .confirm-panel p {
    margin: 0 0 14px;
    color: var(--text-muted);
    line-height: 1.45;
  }

  .confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
