import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyBreadcrumb, fetchBreadcrumb } from "./update-breadcrumb.ts";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal("document", {
    querySelector: vi.fn(),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("fetchBreadcrumb", () => {
  it("fetches breadcrumb HTML with encoded path", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<nav>breadcrumb</nav>"),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchBreadcrumb("docs/readme.md");
    expect(result).toBe("<nav>breadcrumb</nav>");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/breadcrumb-html?path=docs%2Freadme.md",
      { signal: undefined },
    );
  });

  it("returns null on HTTP error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    const result = await fetchBreadcrumb("docs/readme.md");
    expect(result).toBeNull();
  });

  it("re-throws AbortError", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    await expect(fetchBreadcrumb("docs/readme.md")).rejects.toThrow(abortError);
  });

  it("returns null on network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    const result = await fetchBreadcrumb("docs/readme.md");
    expect(result).toBeNull();
  });
});

describe("applyBreadcrumb", () => {
  it("replaces outerHTML of breadcrumb nav element", () => {
    const mockNav = { outerHTML: "<nav>old</nav>" };
    vi.stubGlobal("document", {
      querySelector: vi.fn().mockReturnValue(mockNav),
    });

    applyBreadcrumb("<nav>new breadcrumb</nav>");
    expect(mockNav.outerHTML).toBe("<nav>new breadcrumb</nav>");
  });

  it("does nothing when element not found", () => {
    vi.stubGlobal("document", {
      querySelector: vi.fn().mockReturnValue(null),
    });

    expect(() => applyBreadcrumb("<nav>breadcrumb</nav>")).not.toThrow();
  });
});
