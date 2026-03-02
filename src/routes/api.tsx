import { readFile } from "node:fs/promises";
import { basename, normalize, resolve } from "node:path";
import { Hono } from "hono";
import { Breadcrumb } from "../components/layout/breadcrumb.js";
import { FileTreeItems } from "../components/navigation/file-tree-items.js";
import { renderMarkdown } from "../markdown/renderer.js";
import type { FileTreeCache } from "../utils/file-tree-cache.js";
import { logger } from "../utils/logger.js";
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
      } catch (e: unknown) {
        logger.error("Failed to read file:", e);
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

    if (!relativePath.endsWith(".md")) {
      return c.text("Not found", 404);
    }

    try {
      const content = await readFile(fullPath, "utf-8");
      return c.html(renderMarkdown(content));
    } catch (e: unknown) {
      logger.error("Failed to read file:", e);
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
    } catch (e: unknown) {
      logger.error("Failed to read directory tree:", e);
      return c.text("Failed to read directory", 500);
    }
  });

  app.get("/api/breadcrumb-html", (c) => {
    if (config.mode === "file") {
      return c.html("");
    }

    const relativePath = c.req.query("path") ?? "";
    const dirTitle = basename(config.targetPath) || config.targetPath;
    const fileTitle = basename(relativePath);

    return c.html(
      <Breadcrumb
        items={[{ label: dirTitle, href: "/" }, { label: fileTitle }]}
      />,
    );
  });

  app.get("/api/tree-html", async (c) => {
    if (config.mode === "file") {
      return c.html("");
    }

    try {
      const currentPath = c.req.query("currentPath") || "";
      const tree = await config.treeCache.get();
      return c.html(<FileTreeItems nodes={tree} currentPath={currentPath} />);
    } catch (e: unknown) {
      logger.error("Failed to render tree HTML:", e);
      return c.text("Failed to read directory", 500);
    }
  });

  return app;
}
