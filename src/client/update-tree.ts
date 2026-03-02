import { logger } from "../utils/logger.ts";
import { attachTreeToggleHandlers } from "./tree-toggle.ts";

export async function fetchTree(
  currentPath: string,
  options?: { readonly signal?: AbortSignal },
): Promise<string | null> {
  try {
    const res = await fetch(
      `/api/tree-html?currentPath=${encodeURIComponent(currentPath)}`,
      { signal: options?.signal },
    );
    if (!res.ok) {
      logger.error(`Failed to fetch tree: HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    logger.error("Failed to fetch tree:", e);
    return null;
  }
}

export function applyTree(html: string): void {
  const treeEl = document.getElementById("file-tree");
  if (treeEl) {
    treeEl.innerHTML = html;
    attachTreeToggleHandlers();
  }
}

export async function updateTree(
  currentPath: string,
  options?: { readonly signal?: AbortSignal },
): Promise<void> {
  const html = await fetchTree(currentPath, options);
  if (html !== null) {
    applyTree(html);
  }
}
