import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchHtml } from "./fetch-html.ts";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("fetchHtml", () => {
  it("returns text on successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("<p>hello</p>"),
      }),
    );

    const result = await fetchHtml("/api/test", "test");
    expect(result).toBe("<p>hello</p>");
  });

  it("passes signal to fetch", async () => {
    const controller = new AbortController();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(""),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchHtml("/api/test", "test", { signal: controller.signal });
    expect(mockFetch).toHaveBeenCalledWith("/api/test", {
      signal: controller.signal,
    });
  });

  it("returns null on HTTP error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    const result = await fetchHtml("/api/test", "test");
    expect(result).toBeNull();
  });

  it("re-throws AbortError", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    await expect(fetchHtml("/api/test", "test")).rejects.toThrow(abortError);
  });

  it("returns null on network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    const result = await fetchHtml("/api/test", "test");
    expect(result).toBeNull();
  });
});
