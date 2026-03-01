import { readFile } from "node:fs/promises";
import { normalize, resolve } from "node:path";
import { Hono } from "hono";
import { FileTreeItems } from "../components/navigation/file-tree-items.js";
import { renderMarkdown } from "../markdown/renderer.js";
import type { FileTreeCache } from "../utils/file-tree-cache.js";
import { isWithinBase } from "../utils/path.js";

type FileApiConfig = {
  readonly mode: "file";
  readonly targetPath: string;
};

type DirectoryApiConfig = {
  readonly mode: "directory";
  readonly targetPath: string;
  readonly treeCache: FileTreeCache;
};

export type ApiConfig = FileApiConfig | DirectoryApiConfig;

export function createApiRoutes(config: ApiConfig): Hono {
  const app = new Hono();

  app.get("/api/content", async (c) => {
    if (config.mode === "file") {
      try {
        const content = await readFile(config.targetPath, "utf-8");
        return c.html(renderMarkdown(content));
      } catch {
        return c.text("Failed to read file", 500);
      }
    }

    const relativePath = c.req.query("path");
    if (!relativePath) {
      return c.text("Missing path parameter", 400);
    }

    const fullPath = resolve(config.targetPath, normalize(relativePath));
    if (!isWithinBase(config.targetPath, fullPath)) {
      return c.text("Forbidden", 403);
    }

    try {
      const content = await readFile(fullPath, "utf-8");
      return c.html(renderMarkdown(content));
    } catch {
      return c.text("File not found", 404);
    }
  });

  app.get("/api/tree", async (c) => {
    if (config.mode === "file") {
      return c.json([]);
    }

    try {
      const tree = await config.treeCache.get();
      return c.json(tree);
    } catch {
      return c.text("Failed to read directory", 500);
    }
  });

  app.get("/api/tree-html", async (c) => {
    if (config.mode === "file") {
      return c.html("");
    }

    try {
      const currentPath = c.req.query("currentPath") || "";
      const tree = await config.treeCache.get();
      return c.html(<FileTreeItems nodes={tree} currentPath={currentPath} />);
    } catch {
      return c.text("Failed to read directory", 500);
    }
  });

  return app;
}
