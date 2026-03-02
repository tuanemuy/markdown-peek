import { chmodSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readMarkdownFile } from "./read-markdown.js";

const testDir = join(import.meta.dirname, "__test_read_md_fixture__");
const validFile = join(testDir, "valid.md");
const nonexistentFile = join(testDir, "nonexistent.md");
const unreadableFile = join(testDir, "unreadable.md");

beforeAll(() => {
  mkdirSync(testDir, { recursive: true });
  writeFileSync(validFile, "# Hello\n\nWorld");
  writeFileSync(unreadableFile, "secret");
  chmodSync(unreadableFile, 0o000);
});

afterAll(() => {
  chmodSync(unreadableFile, 0o644);
  rmSync(testDir, { recursive: true, force: true });
});

describe("readMarkdownFile", () => {
  it("returns ok with file content for a valid file", async () => {
    const result = await readMarkdownFile(validFile);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("# Hello\n\nWorld");
    }
  });

  it("returns err with file-not-found for a nonexistent path", async () => {
    const result = await readMarkdownFile(nonexistentFile);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("file-not-found");
      expect(result.error.path).toBe(nonexistentFile);
    }
  });

  it("returns err with read-error and Error cause for permission denied", async () => {
    const result = await readMarkdownFile(unreadableFile);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("read-error");
      expect(result.error.path).toBe(unreadableFile);
      if (result.error.type === "read-error") {
        expect(result.error.cause).toBeInstanceOf(Error);
      }
    }
  });
});
