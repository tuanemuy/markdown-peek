import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyContent, fetchContent, updateContent } from "./update-content.ts";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal("document", {
    getElementById: vi.fn(),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("fetchContent", () => {
  it("fetches /api/content when no path given", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<p>hello</p>"),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchContent();
    expect(result).toBe("<p>hello</p>");
    expect(mockFetch).toHaveBeenCalledWith("/api/content", {
      signal: undefined,
    });
  });

  it("fetches /api/content?path=... when path given", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<p>content</p>"),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchContent("docs/readme.md");
    expect(result).toBe("<p>content</p>");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/content?path=docs%2Freadme.md",
      { signal: undefined },
    );
  });

  it("returns null on HTTP error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    const result = await fetchContent();
    expect(result).toBeNull();
  });

  it("re-throws AbortError", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    await expect(fetchContent()).rejects.toThrow(abortError);
  });

  it("returns null on network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    const result = await fetchContent();
    expect(result).toBeNull();
  });

  it("passes signal to fetch", async () => {
    const controller = new AbortController();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(""),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchContent("test.md", { signal: controller.signal });
    expect(mockFetch).toHaveBeenCalledWith("/api/content?path=test.md", {
      signal: controller.signal,
    });
  });
});

describe("applyContent", () => {
  it("sets innerHTML on #markdown-content element", () => {
    const mockEl = { innerHTML: "" };
    vi.stubGlobal("document", {
      getElementById: vi.fn().mockReturnValue(mockEl),
    });

    applyContent("<p>new content</p>");
    expect(mockEl.innerHTML).toBe("<p>new content</p>");
  });

  it("does nothing when element not found", () => {
    vi.stubGlobal("document", {
      getElementById: vi.fn().mockReturnValue(null),
    });

    expect(() => applyContent("<p>content</p>")).not.toThrow();
  });
});

describe("updateContent", () => {
  it("fetches and applies content when element exists", async () => {
    const mockEl = { innerHTML: "" };
    vi.stubGlobal("document", {
      getElementById: vi.fn().mockReturnValue(mockEl),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("<p>updated</p>"),
      }),
    );

    await updateContent("test.md");
    expect(mockEl.innerHTML).toBe("<p>updated</p>");
  });

  it("skips fetch when #markdown-content element not found", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("document", {
      getElementById: vi.fn().mockReturnValue(null),
    });
    vi.stubGlobal("fetch", mockFetch);

    await updateContent("test.md");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("does not update DOM on fetch failure", async () => {
    const mockEl = { innerHTML: "original" };
    vi.stubGlobal("document", {
      getElementById: vi.fn().mockReturnValue(mockEl),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await updateContent("test.md");
    expect(mockEl.innerHTML).toBe("original");
  });
});
