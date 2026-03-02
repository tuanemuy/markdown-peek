import { logger } from "../utils/logger.ts";

export async function fetchBreadcrumb(
  path: string,
  options?: { readonly signal?: AbortSignal },
): Promise<string | null> {
  try {
    const res = await fetch(
      `/api/breadcrumb-html?path=${encodeURIComponent(path)}`,
      { signal: options?.signal },
    );
    if (!res.ok) {
      logger.error(`Failed to fetch breadcrumb: HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    logger.error("Failed to fetch breadcrumb:", e);
    return null;
  }
}

export function applyBreadcrumb(html: string): void {
  const breadcrumbNav = document.querySelector(
    "#header-bar nav[aria-label='Breadcrumb']",
  );
  if (breadcrumbNav) {
    breadcrumbNav.outerHTML = html;
  }
}
