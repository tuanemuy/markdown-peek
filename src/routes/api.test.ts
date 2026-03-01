import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { initMarkdown } from "../markdown/renderer.js";
import { createFileTreeCache } from "../utils/file-tree-cache.js";
import { createApiRoutes } from "./api.js";

const testDir = join(import.meta.dirname, "__test_fixture_api__");
const testFile = join(testDir, "readme.md");

beforeAll(async () => {
  mkdirSync(testDir, { recursive: true });
  writeFileSync(testFile, "# API Test\n\nContent here");
  await initMarkdown();
});

afterAll(() => {
  rmSync(testDir, { recursive: true, force: true });
});

describe("api routes - file mode", () => {
  it("GET /api/content returns rendered HTML", async () => {
    const app = createApiRoutes({ mode: "file", targetPath: testFile });
    const res = await app.request("/api/content");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("API Test");
  });

  it("GET /api/tree returns empty array in file mode", async () => {
    const app = createApiRoutes({ mode: "file", targetPath: testFile });
    const res = await app.request("/api/tree");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });
});

describe("api routes - directory mode", () => {
  it("GET /api/content?path=readme.md returns rendered HTML", async () => {
    const treeCache = createFileTreeCache(testDir);
    const app = createApiRoutes({
      mode: "directory",
      targetPath: testDir,
      treeCache,
    });
    const res = await app.request("/api/content?path=readme.md");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("API Test");
  });

  it("GET /api/content without path returns 400", async () => {
    const treeCache = createFileTreeCache(testDir);
    const app = createApiRoutes({
      mode: "directory",
      targetPath: testDir,
      treeCache,
    });
    const res = await app.request("/api/content");
    expect(res.status).toBe(400);
  });

  it("GET /api/content with nonexistent path returns 404", async () => {
    const treeCache = createFileTreeCache(testDir);
    const app = createApiRoutes({
      mode: "directory",
      targetPath: testDir,
      treeCache,
    });
    const res = await app.request("/api/content?path=nonexistent.md");
    expect(res.status).toBe(404);
  });

  it("GET /api/tree returns file tree JSON", async () => {
    const treeCache = createFileTreeCache(testDir);
    const app = createApiRoutes({
      mode: "directory",
      targetPath: testDir,
      treeCache,
    });
    const res = await app.request("/api/tree");
    expect(res.status).toBe(200);
    const data = (await res.json()) as { name: string }[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.some((n) => n.name === "readme.md")).toBe(true);
  });

  it("GET /api/tree-html returns rendered HTML", async () => {
    const treeCache = createFileTreeCache(testDir);
    const app = createApiRoutes({
      mode: "directory",
      targetPath: testDir,
      treeCache,
    });
    const res = await app.request("/api/tree-html");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("readme.md");
    expect(html).toContain("<li");
  });

  it("GET /api/tree-html highlights current path", async () => {
    const treeCache = createFileTreeCache(testDir);
    const app = createApiRoutes({
      mode: "directory",
      targetPath: testDir,
      treeCache,
    });
    const res = await app.request("/api/tree-html?currentPath=readme.md");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("bg-sidebar-accent");
  });

  it("GET /api/content with path traversal returns 403", async () => {
    const treeCache = createFileTreeCache(testDir);
    const app = createApiRoutes({
      mode: "directory",
      targetPath: testDir,
      treeCache,
    });
    const res = await app.request("/api/content?path=../../../etc/passwd");
    expect(res.status).toBe(403);
  });
});
