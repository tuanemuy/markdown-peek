import type { Dirent } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import ignore, { type Ignore } from "ignore";
import { tryCatch } from "../types/result.js";
import { isNodeError } from "./error.js";

export type FileTreeNode = {
  readonly name: string;
  readonly path: string;
  readonly type: "file" | "directory";
  readonly children?: readonly FileTreeNode[];
};

const DEFAULT_IGNORE_PATTERNS = [
  ".git/",
  "node_modules/",
  ".next/",
  ".nuxt/",
  ".svelte-kit/",
  "dist/",
  "build/",
  ".cache/",
];

type IgnoreRule = {
  readonly ig: Ignore;
  readonly baseDir: string;
};

async function readGitignore(path: string): Promise<Ignore | null> {
  const result = await tryCatch(
    () => readFile(path, "utf-8"),
    (e) => e,
  );

  if (result.ok) {
    const ig = ignore();
    ig.add(result.value);
    return ig;
  }

  if (!(isNodeError(result.error) && result.error.code === "ENOENT")) {
    console.warn(`[peek] Failed to read .gitignore at ${path}:`, result.error);
  }

  return null;
}

function tryLoadGitignoreFromEntries(
  dir: string,
  entries: readonly Dirent[],
): Promise<Ignore | null> {
  const hasGitignore = entries.some(
    (e) => e.isFile() && e.name === ".gitignore",
  );
  if (!hasGitignore) return Promise.resolve(null);
  return readGitignore(join(dir, ".gitignore"));
}

/**
 * Check whether a path is ignored by any of the loaded .gitignore rules.
 *
 * NOTE: Cross-file negation is not supported.  A negation pattern (`!pattern`)
 * in a child .gitignore will NOT override a match from a parent .gitignore
 * because each rule set is evaluated independently.
 */
function isPathIgnored(
  relPath: string,
  isDir: boolean,
  rules: readonly IgnoreRule[],
): boolean {
  for (const rule of rules) {
    const pathFromBase =
      rule.baseDir === "" ? relPath : relative(rule.baseDir, relPath);
    if (pathFromBase.startsWith("..")) continue;
    const checkPath = isDir ? `${pathFromBase}/` : pathFromBase;
    if (rule.ig.ignores(checkPath)) return true;
  }
  return false;
}

export async function buildFileTree(
  rootDir: string,
): Promise<readonly FileTreeNode[]> {
  const defaultIg = ignore();
  defaultIg.add(DEFAULT_IGNORE_PATTERNS);
  const rules: IgnoreRule[] = [{ ig: defaultIg, baseDir: "" }];

  const rootEntries = await readdir(rootDir, { withFileTypes: true });

  const rootGitignore = await tryLoadGitignoreFromEntries(rootDir, rootEntries);
  if (rootGitignore) {
    rules.push({ ig: rootGitignore, baseDir: "" });
  }

  return processEntries(rootEntries, rootDir, rootDir, rules);
}

async function scanDirectory(
  dir: string,
  rootDir: string,
  parentRules: readonly IgnoreRule[],
): Promise<FileTreeNode[]> {
  const entries = await readdir(dir, { withFileTypes: true });

  const localGitignore = await tryLoadGitignoreFromEntries(dir, entries);
  const rules = localGitignore
    ? [...parentRules, { ig: localGitignore, baseDir: relative(rootDir, dir) }]
    : parentRules;

  return processEntries(entries, dir, rootDir, rules);
}

async function processEntries(
  entries: readonly Dirent[],
  dir: string,
  rootDir: string,
  rules: readonly IgnoreRule[],
): Promise<FileTreeNode[]> {
  const nodes: FileTreeNode[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const fullPath = join(dir, entry.name);
    const relPath = relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (isPathIgnored(relPath, true, rules)) continue;

      const children = await scanDirectory(fullPath, rootDir, rules);
      if (children.length > 0) {
        nodes.push({
          name: entry.name,
          path: relPath,
          type: "directory",
          children,
        });
      }
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      if (isPathIgnored(relPath, false, rules)) continue;

      nodes.push({
        name: entry.name,
        path: relPath,
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
