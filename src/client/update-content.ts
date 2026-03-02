import { logger } from "../utils/logger.ts";

export async function updateContent(
  path: string | undefined,
  options?: { signal?: AbortSignal },
): Promise<boolean> {
  const contentEl = document.getElementById("markdown-content");
  if (!contentEl) return false;

  const url =
    path === undefined
      ? "/api/content"
      : `/api/content?path=${encodeURIComponent(path)}`;

  try {
    const res = await fetch(url, { signal: options?.signal });
    if (!res.ok) {
      logger.error(`Failed to fetch content: HTTP ${res.status}`);
      return false;
    }
    contentEl.innerHTML = await res.text();
    return true;
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    logger.error("Failed to fetch content:", e);
    return false;
  }
}

export async function updateBreadcrumb(
  path: string,
  options?: { signal?: AbortSignal },
): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/breadcrumb-html?path=${encodeURIComponent(path)}`,
      { signal: options?.signal },
    );
    if (!res.ok) {
      logger.error(`Failed to fetch breadcrumb: HTTP ${res.status}`);
      return false;
    }
    const html = await res.text();
    const breadcrumbNav = document.querySelector(
      "#header-bar nav[aria-label='Breadcrumb']",
    );
    if (breadcrumbNav) {
      breadcrumbNav.outerHTML = html;
    }
    return true;
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    logger.error("Failed to fetch breadcrumb:", e);
    return false;
  }
}
