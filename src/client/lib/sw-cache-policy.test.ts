import { shouldCacheResponse, shouldHandleFetch } from "./sw-cache-policy";

describe("shouldHandleFetch", () => {
  it("accepts same-origin GET asset requests", () => {
    expect(
      shouldHandleFetch({
        method: "GET",
        origin: "https://app.example",
        swOrigin: "https://app.example",
        pathname: "/assets/app.js",
        destination: "script",
      }),
    ).toBe(true);
  });

  it("rejects non-GET requests", () => {
    expect(
      shouldHandleFetch({
        method: "POST",
        origin: "https://app.example",
        swOrigin: "https://app.example",
        pathname: "/submit",
        destination: "",
      }),
    ).toBe(false);
  });

  it("rejects cross-origin requests", () => {
    expect(
      shouldHandleFetch({
        method: "GET",
        origin: "https://openlibrary.org",
        swOrigin: "https://app.example",
        pathname: "/isbn/123.json",
        destination: "",
      }),
    ).toBe(false);
  });

  it("rejects API paths", () => {
    expect(
      shouldHandleFetch({
        method: "GET",
        origin: "https://app.example",
        swOrigin: "https://app.example",
        pathname: "/api/books",
        destination: "",
      }),
    ).toBe(false);
  });

  it("rejects unknown destination types", () => {
    expect(
      shouldHandleFetch({
        method: "GET",
        origin: "https://app.example",
        swOrigin: "https://app.example",
        pathname: "/video.mp4",
        destination: "video",
      }),
    ).toBe(false);
  });
});

describe("shouldCacheResponse", () => {
  it("accepts successful same-origin basic responses", () => {
    expect(shouldCacheResponse({ ok: true, type: "basic" })).toBe(true);
  });

  it("rejects non-ok or non-basic responses", () => {
    expect(shouldCacheResponse({ ok: false, type: "basic" })).toBe(false);
    expect(shouldCacheResponse({ ok: true, type: "cors" })).toBe(false);
  });
});
