import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

export type FileTreeNode = {
  readonly name: string;
  readonly path: string;
  readonly type: "file" | "directory";
  readonly children?: readonly FileTreeNode[];
};

const EXCLUDED_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  ".nuxt",
  ".svelte-kit",
  "dist",
  "build",
  ".cache",
]);

export async function buildFileTree(
  rootDir: string,
): Promise<readonly FileTreeNode[]> {
  return scanDirectory(rootDir, rootDir);
}

async function scanDirectory(
  dir: string,
  rootDir: string,
): Promise<FileTreeNode[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nodes: FileTreeNode[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;

      const fullPath = join(dir, entry.name);
      const children = await scanDirectory(fullPath, rootDir);
      if (children.length > 0) {
        nodes.push({
          name: entry.name,
          path: relative(rootDir, fullPath),
          type: "directory",
          children,
        });
      }
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const fullPath = join(dir, entry.name);
      nodes.push({
        name: entry.name,
        path: relative(rootDir, fullPath),
        type: "file",
      });
    }
  }

  nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  return nodes;
}
