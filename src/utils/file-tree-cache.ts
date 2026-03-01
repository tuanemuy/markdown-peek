import type { FileTreeNode } from "./file-tree.js";
import { buildFileTree } from "./file-tree.js";

export type FileTreeCache = {
  readonly get: () => Promise<readonly FileTreeNode[]>;
  readonly invalidate: () => void;
};

export function createFileTreeCache(rootDir: string): FileTreeCache {
  let cached: readonly FileTreeNode[] | null = null;

  return {
    async get() {
      if (!cached) {
        cached = await buildFileTree(rootDir);
      }
      return cached;
    },
    invalidate() {
      cached = null;
    },
  };
}
