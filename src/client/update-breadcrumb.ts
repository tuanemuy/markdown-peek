import { fetchHtml } from "./fetch-html.ts";

export function fetchBreadcrumb(
  path: string,
  options?: { readonly signal?: AbortSignal },
): Promise<string | null> {
  return fetchHtml(
    `/api/breadcrumb-html?path=${encodeURIComponent(path)}`,
    "breadcrumb",
    options,
  );
}

export function applyBreadcrumb(html: string): void {
  const breadcrumbNav = document.querySelector(
    "#header-bar nav[aria-label='Breadcrumb']",
  );
  if (breadcrumbNav) {
    breadcrumbNav.outerHTML = html;
  }
}
