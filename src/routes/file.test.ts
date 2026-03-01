import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { resolveStyles } from "../config/styles.js";
import { initMarkdown } from "../markdown/renderer.js";
import { createFileRoutes } from "./file.js";

const testDir = join(import.meta.dirname, "__test_fixture__");
const testFile = join(testDir, "test.md");

beforeAll(async () => {
  mkdirSync(testDir, { recursive: true });
  writeFileSync(testFile, "# Test File\n\nHello world");
  await initMarkdown();
});

afterAll(() => {
  rmSync(testDir, { recursive: true, force: true });
});

describe("file routes", () => {
  it("GET / returns rendered HTML page", async () => {
    const result = await resolveStyles();
    if (!result.ok) throw new Error("Failed to resolve styles");
    const app = createFileRoutes(testFile, result.value);

    const res = await app.request("/");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("test.md - peek");
    expect(html).toContain("Test File");
    expect(html).toContain("Hello world");
  });
});
