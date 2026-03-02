import { logger } from "../utils/logger.ts";

export async function fetchContent(
  path?: string,
  options?: { readonly signal?: AbortSignal },
): Promise<string | null> {
  const url =
    path === undefined
      ? "/api/content"
      : `/api/content?path=${encodeURIComponent(path)}`;

  try {
    const res = await fetch(url, { signal: options?.signal });
    if (!res.ok) {
      logger.error(`Failed to fetch content: HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    logger.error("Failed to fetch content:", e);
    return null;
  }
}

export function applyContent(html: string): void {
  const contentEl = document.getElementById("markdown-content");
  if (contentEl) {
    contentEl.innerHTML = html;
  }
}

export async function updateContent(
  path?: string,
  options?: { readonly signal?: AbortSignal },
): Promise<void> {
  if (!document.getElementById("markdown-content")) return;
  const html = await fetchContent(path, options);
  if (html !== null) {
    applyContent(html);
  }
}
