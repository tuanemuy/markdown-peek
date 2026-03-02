import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { Hono } from "hono";
import type { ResolvedStyles } from "../config/styles.js";
import { renderMarkdown } from "../markdown/renderer.js";
import { FilePreviewPage } from "../pages/index.js";
import { logger } from "../utils/logger.js";

export function createFileRoutes(
  filePath: string,
  styles: ResolvedStyles,
  cspNonce: string,
): Hono {
  const app = new Hono();

  app.get("/", async (c) => {
    try {
      const content = await readFile(filePath, "utf-8");
      const html = renderMarkdown(content);
      const title = basename(filePath);
      return c.html(
        <FilePreviewPage
          title={title}
          htmlContent={html}
          styles={styles}
          cspNonce={cspNonce}
        />,
      );
    } catch (e: unknown) {
      logger.error("Failed to read file:", e);
      return c.text("Failed to read file", 500);
    }
  });

  return app;
}
