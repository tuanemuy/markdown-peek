import { fetchHtml } from "./fetch-html.ts";
import { attachTreeToggleHandlers } from "./tree-toggle.ts";

export function fetchTree(
  currentPath: string,
  options?: { readonly signal?: AbortSignal },
): Promise<string | null> {
  return fetchHtml(
    `/api/tree-html?currentPath=${encodeURIComponent(currentPath)}`,
    "tree",
    options,
  );
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
