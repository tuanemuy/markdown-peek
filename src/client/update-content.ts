import { fetchHtml } from "./fetch-html.ts";

export function fetchContent(
  path?: string,
  options?: { readonly signal?: AbortSignal },
): Promise<string | null> {
  const url =
    path === undefined
      ? "/api/content"
      : `/api/content?path=${encodeURIComponent(path)}`;
  return fetchHtml(url, "content", options);
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
