import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildFileTree } from "./file-tree.js";

const testDir = join(import.meta.dirname, "__test_fixture__");

beforeAll(() => {
  mkdirSync(testDir, { recursive: true });
  mkdirSync(join(testDir, "docs"), { recursive: true });
  mkdirSync(join(testDir, "guides"), { recursive: true });
  mkdirSync(join(testDir, ".git"), { recursive: true });
  mkdirSync(join(testDir, "node_modules"), { recursive: true });
  mkdirSync(join(testDir, "empty-dir"), { recursive: true });

  writeFileSync(join(testDir, "README.md"), "# README");
  writeFileSync(join(testDir, "docs", "overview.md"), "# Overview");
  writeFileSync(join(testDir, "docs", "setup.md"), "# Setup");
  writeFileSync(join(testDir, "guides", "intro.md"), "# Intro");
  writeFileSync(join(testDir, "notes.txt"), "not markdown");
  writeFileSync(join(testDir, ".git", "config"), "git config");
  writeFileSync(join(testDir, "node_modules", "pkg.md"), "# pkg");
  writeFileSync(join(testDir, ".hidden.md"), "# Hidden");
});

afterAll(() => {
  rmSync(testDir, { recursive: true, force: true });
});

describe("buildFileTree", () => {
  it("builds a tree with directories and files", async () => {
    const tree = await buildFileTree(testDir);
    expect(tree.length).toBeGreaterThan(0);

    const dirs = tree.filter((n) => n.type === "directory");
    const files = tree.filter((n) => n.type === "file");

    expect(dirs.some((d) => d.name === "docs")).toBe(true);
    expect(dirs.some((d) => d.name === "guides")).toBe(true);
    expect(files.some((f) => f.name === "README.md")).toBe(true);
  });

  it("excludes .git and node_modules", async () => {
    const tree = await buildFileTree(testDir);
    const allNames = flattenNames(tree);

    expect(allNames).not.toContain(".git");
    expect(allNames).not.toContain("node_modules");
  });

  it("only includes .md files", async () => {
    const tree = await buildFileTree(testDir);
    const allFiles = flattenFiles(tree);

    for (const f of allFiles) {
      expect(f.name).toMatch(/\.md$/);
    }
    expect(allFiles.some((f) => f.name === "notes.txt")).toBe(false);
  });

  it("sorts directories before files, alphabetically", async () => {
    const tree = await buildFileTree(testDir);
    const types = tree.map((n) => n.type);
    const lastDirIndex = types.lastIndexOf("directory");
    const firstFileIndex = types.indexOf("file");

    if (lastDirIndex >= 0 && firstFileIndex >= 0) {
      expect(lastDirIndex).toBeLessThan(firstFileIndex);
    }
  });

  it("excludes dotfiles", async () => {
    const tree = await buildFileTree(testDir);
    const allNames = flattenNames(tree);
    expect(allNames).not.toContain(".hidden.md");
  });

  it("excludes empty directories", async () => {
    const tree = await buildFileTree(testDir);
    const allNames = flattenNames(tree);
    expect(allNames).not.toContain("empty-dir");
  });

  it("uses relative paths", async () => {
    const tree = await buildFileTree(testDir);
    const docsDir = tree.find((n) => n.name === "docs");
    expect(docsDir?.path).toBe("docs");

    if (docsDir?.children) {
      const overview = docsDir.children.find((n) => n.name === "overview.md");
      expect(overview?.path).toBe("docs/overview.md");
    }
  });
});

type TreeNode = {
  readonly name: string;
  readonly type: string;
  readonly children?: readonly TreeNode[];
};

function flattenNames(nodes: readonly TreeNode[]): string[] {
  const names: string[] = [];
  for (const node of nodes) {
    names.push(node.name);
    if (node.children) {
      names.push(...flattenNames(node.children));
    }
  }
  return names;
}

function flattenFiles(nodes: readonly TreeNode[]): TreeNode[] {
  const files: TreeNode[] = [];
  for (const node of nodes) {
    if (node.type === "file") {
      files.push(node);
    }
    if (node.children) {
      files.push(...flattenFiles(node.children));
    }
  }
  return files;
}
