import { describe, expect, it } from "vitest";
import { renderHtmlDocument } from "./html-document.js";

describe("renderHtmlDocument", () => {
  it("renders a complete HTML document with DOCTYPE", () => {
    const html = renderHtmlDocument("My Page", "/api/raw?file=test.html");
    expect(html).toMatch(/^<!DOCTYPE html>/);
    expect(html).toContain("<title>My Page - peek</title>");
  });

  it("renders iframe with correct src, id, and sandbox attributes", () => {
    const html = renderHtmlDocument("test", "/api/raw?file=hello.html");
    expect(html).toContain('src="/api/raw?file=hello.html"');
    expect(html).toContain('id="content-frame"');
    expect(html).toContain(
      'sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"',
    );
  });

  describe("SSE reload script", () => {
    it("contains exponential backoff parameters", () => {
      const html = renderHtmlDocument("test", "/api/raw");
      expect(html).toContain("maxRetries = 10");
      expect(html).toContain("initialDelay = 1000");
      expect(html).toContain("maxDelay = 30000");
    });

    it("resets retryCount on successful connection via es.onopen", () => {
      const html = renderHtmlDocument("test", "/api/raw");
      expect(html).toContain("es.onopen");
      // Verify retryCount = 0 appears inside the onopen handler
      expect(html).toMatch(
        /es\.onopen\s*=\s*function\s*\(\)\s*\{[^}]*retryCount\s*=\s*0/,
      );
    });

    it("uses exponential delay calculation with Math.pow", () => {
      const html = renderHtmlDocument("test", "/api/raw");
      expect(html).toContain("Math.min");
      expect(html).toContain("Math.pow(2, retryCount - 1)");
    });

    it("stops retrying after maxRetries exceeded", () => {
      const html = renderHtmlDocument("test", "/api/raw");
      expect(html).toContain("if (retryCount > maxRetries) return");
    });

    it("checks getElementById and contentWindow before reload", () => {
      const html = renderHtmlDocument("test", "/api/raw");
      expect(html).toContain('getElementById("content-frame")');
      expect(html).toContain("f.contentWindow");
      // Verify there's a null check (if f && f.contentWindow)
      expect(html).toMatch(/if\s*\(f\s*&&\s*f\.contentWindow\)/);
    });

    it("closes EventSource on error before retrying", () => {
      const html = renderHtmlDocument("test", "/api/raw");
      expect(html).toContain("es.close()");
    });

    it("connects to /sse endpoint", () => {
      const html = renderHtmlDocument("test", "/api/raw");
      expect(html).toContain('EventSource("/sse")');
    });

    it("listens for file-changed events", () => {
      const html = renderHtmlDocument("test", "/api/raw");
      expect(html).toContain('"file-changed"');
    });
  });
});
