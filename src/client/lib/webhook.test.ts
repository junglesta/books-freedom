import { formatWebhookError, getWebhookHost, validateWebhookUrl } from "./webhook";

describe("validateWebhookUrl", () => {
  it("accepts valid https URL", () => {
    const result = validateWebhookUrl("https://script.google.com/macros/s/abc/exec");
    expect(result.ok).toBe(true);
    expect(result.normalizedUrl).toBe("https://script.google.com/macros/s/abc/exec");
  });

  it("rejects empty URL", () => {
    const result = validateWebhookUrl("   ");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Please enter");
  });

  it("rejects non-https URL", () => {
    const result = validateWebhookUrl("http://example.com/hook");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("https://");
  });

  it("rejects local URLs", () => {
    const result = validateWebhookUrl("https://localhost:3000/hook");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("publicly reachable");
  });

  it("rejects URLs with credentials", () => {
    const result = validateWebhookUrl("https://user:pass@example.com/hook");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("username/password");
  });
});

describe("getWebhookHost", () => {
  it("extracts host", () => {
    expect(getWebhookHost("https://script.google.com/macros/s/abc/exec")).toBe("script.google.com");
  });
});

describe("formatWebhookError", () => {
  it("formats plain-text response errors", async () => {
    const resp = new Response("bad request", { status: 400, statusText: "Bad Request" });
    const msg = await formatWebhookError(resp);
    expect(msg).toContain("400");
    expect(msg).toContain("bad request");
  });

  it("formats JSON response errors", async () => {
    const resp = new Response(JSON.stringify({ message: "invalid payload" }), {
      status: 422,
      statusText: "Unprocessable Entity",
      headers: { "content-type": "application/json" },
    });
    const msg = await formatWebhookError(resp);
    expect(msg).toContain("422");
    expect(msg).toContain("invalid payload");
  });
});
