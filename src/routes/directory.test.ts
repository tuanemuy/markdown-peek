import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { resolveStyles } from "../config/styles.js";
import { initMarkdown } from "../markdown/renderer.js";
import { createFileTreeCache } from "../utils/file-tree-cache.js";
import { createDirectoryRoutes } from "./directory.js";

const testDir = join(import.meta.dirname, "__test_fixture_dir__");

beforeAll(async () => {
  mkdirSync(testDir, { recursive: true });
  mkdirSync(join(testDir, "docs"), { recursive: true });
  writeFileSync(join(testDir, "README.md"), "# README\n\nHello");
  writeFileSync(join(testDir, "docs", "guide.md"), "# Guide\n\nContent");
  await initMarkdown();
});

afterAll(() => {
  rmSync(testDir, { recursive: true, force: true });
});

describe("directory routes", () => {
  it("GET / returns file tree listing page", async () => {
    const result = await resolveStyles();
    if (!result.ok) throw new Error("Failed to resolve styles");
    const styles = result.value;
    const treeCache = createFileTreeCache(testDir);
    const app = createDirectoryRoutes(testDir, styles, treeCache);

    const res = await app.request("/");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("README.md");
    expect(html).toContain("docs");
  });

  it("GET /view?path=README.md returns sidebar + preview", async () => {
    const result = await resolveStyles();
    if (!result.ok) throw new Error("Failed to resolve styles");
    const styles = result.value;
    const treeCache = createFileTreeCache(testDir);
    const app = createDirectoryRoutes(testDir, styles, treeCache);

    const res = await app.request("/view?path=README.md");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("README.md");
    expect(html).toContain("sidebar");
    expect(html).toContain("Hello");
  });

  it("GET /view?path=docs/guide.md works with nested paths", async () => {
    const result = await resolveStyles();
    if (!result.ok) throw new Error("Failed to resolve styles");
    const styles = result.value;
    const treeCache = createFileTreeCache(testDir);
    const app = createDirectoryRoutes(testDir, styles, treeCache);

    const res = await app.request("/view?path=docs/guide.md");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("Guide");
    expect(html).toContain("Content");
  });

  it("GET /view without path redirects to /", async () => {
    const result = await resolveStyles();
    if (!result.ok) throw new Error("Failed to resolve styles");
    const styles = result.value;
    const treeCache = createFileTreeCache(testDir);
    const app = createDirectoryRoutes(testDir, styles, treeCache);

    const res = await app.request("/view");
    expect(res.status).toBe(302);
  });

  it("GET /view?path=nonexistent.md returns 404", async () => {
    const result = await resolveStyles();
    if (!result.ok) throw new Error("Failed to resolve styles");
    const styles = result.value;
    const treeCache = createFileTreeCache(testDir);
    const app = createDirectoryRoutes(testDir, styles, treeCache);

    const res = await app.request("/view?path=nonexistent.md");
    expect(res.status).toBe(404);
  });

  it("GET /view with path traversal returns 403", async () => {
    const result = await resolveStyles();
    if (!result.ok) throw new Error("Failed to resolve styles");
    const styles = result.value;
    const treeCache = createFileTreeCache(testDir);
    const app = createDirectoryRoutes(testDir, styles, treeCache);

    const res = await app.request("/view?path=../../../etc/passwd");
    expect(res.status).toBe(403);
  });
});
