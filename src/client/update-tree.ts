import { logger } from "../utils/logger.ts";
import { attachTreeToggleHandlers } from "./tree-toggle.ts";

export async function updateTree(
  currentPath: string,
  options?: { signal?: AbortSignal },
): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/tree-html?currentPath=${encodeURIComponent(currentPath)}`,
      { signal: options?.signal },
    );
    if (!res.ok) {
      logger.error(`Failed to fetch tree: HTTP ${res.status}`);
      return false;
    }
    const html = await res.text();
    const treeEl = document.getElementById("file-tree");
    if (treeEl) {
      treeEl.innerHTML = html;
      attachTreeToggleHandlers();
    }
    return true;
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    logger.error("Failed to fetch tree:", e);
    return false;
  }
}
