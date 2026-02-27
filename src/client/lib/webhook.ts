const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export interface WebhookValidationResult {
  ok: boolean;
  error?: string;
  normalizedUrl?: string;
}

export function validateWebhookUrl(input: string): WebhookValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Please enter a webhook URL" };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, error: "Webhook URL is not valid" };
  }

  if (url.protocol !== "https:") {
    return { ok: false, error: "Webhook URL must start with https://" };
  }

  if (!url.hostname) {
    return { ok: false, error: "Webhook URL must include a hostname" };
  }

  if (url.username || url.password) {
    return { ok: false, error: "Webhook URL must not include username/password" };
  }

  if (LOCAL_HOSTS.has(url.hostname) || url.hostname.endsWith(".local")) {
    return { ok: false, error: "Webhook URL must be publicly reachable (not local)" };
  }

  return { ok: true, normalizedUrl: url.toString() };
}

export function getWebhookHost(urlStr: string): string {
  try {
    return new URL(urlStr).host;
  } catch {
    return "unknown host";
  }
}

export async function formatWebhookError(resp: Response): Promise<string> {
  const base = `Export failed (${resp.status} ${resp.statusText})`;
  let detail = "";

  try {
    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await resp.json();
      if (typeof json?.message === "string") detail = json.message;
      else if (typeof json?.error === "string") detail = json.error;
      else detail = JSON.stringify(json);
    } else {
      detail = (await resp.text()).trim();
    }
  } catch {
    return base;
  }

  if (!detail) return base;
  const shortened = detail.length > 140 ? `${detail.slice(0, 140)}...` : detail;
  return `${base}: ${shortened}`;
}
