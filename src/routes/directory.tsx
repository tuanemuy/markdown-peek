import { readFile } from "node:fs/promises";
import { basename, normalize, resolve } from "node:path";
import { Hono } from "hono";
import type { ResolvedStyles } from "../config/styles.js";
import { renderMarkdown } from "../markdown/renderer.js";
import {
  DirectoryListPage,
  DirectoryViewPage,
  FilePreviewPage,
} from "../pages/index.js";
import type { FileTreeCache } from "../utils/file-tree-cache.js";
import { isWithinBase } from "../utils/path.js";

export function createDirectoryRoutes(
  dirPath: string,
  styles: ResolvedStyles,
  treeCache: FileTreeCache,
): Hono {
  const app = new Hono();

  app.get("/", async (c) => {
    const tree = await treeCache.get();
    const title = basename(dirPath) || dirPath;
    return c.html(
      <DirectoryListPage title={title} tree={tree} styles={styles} />,
    );
  });

  app.get("/view", async (c) => {
    const relativePath = c.req.query("path");
    if (!relativePath) {
      return c.redirect("/");
    }

    const fullPath = resolve(dirPath, normalize(relativePath));
    if (!isWithinBase(dirPath, fullPath)) {
      return c.text("Forbidden", 403);
    }

    try {
      const content = await readFile(fullPath, "utf-8");
      const html = renderMarkdown(content);
      const tree = await treeCache.get();
      const dirTitle = basename(dirPath) || dirPath;
      const fileTitle = basename(relativePath);
      return c.html(
        <DirectoryViewPage
          dirTitle={dirTitle}
          fileTitle={fileTitle}
          htmlContent={html}
          tree={tree}
          currentPath={relativePath}
          styles={styles}
        />,
      );
    } catch {
      return c.text("File not found", 404);
    }
  });

  app.get("/:path{.+}", async (c) => {
    const relativePath = c.req.param("path");
    const fullPath = resolve(dirPath, normalize(relativePath));
    if (!isWithinBase(dirPath, fullPath)) {
      return c.text("Forbidden", 403);
    }

    try {
      const content = await readFile(fullPath, "utf-8");
      const html = renderMarkdown(content);
      const fileTitle = basename(relativePath);
      return c.html(
        <FilePreviewPage
          title={fileTitle}
          htmlContent={html}
          styles={styles}
        />,
      );
    } catch {
      return c.text("File not found", 404);
    }
  });

  return app;
}
