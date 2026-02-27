const CACHEABLE_DESTINATIONS = new Set(["document", "script", "style", "image", "font"]);

export function shouldHandleFetch(input: {
  method: string;
  origin: string;
  swOrigin: string;
  pathname: string;
  destination: string;
}): boolean {
  if (input.method !== "GET") return false;
  if (input.origin !== input.swOrigin) return false;
  if (input.pathname.startsWith("/api")) return false;
  if (input.destination && !CACHEABLE_DESTINATIONS.has(input.destination)) return false;
  return true;
}

export function shouldCacheResponse(input: { ok: boolean; type: string }): boolean {
  return input.ok && input.type === "basic";
}
