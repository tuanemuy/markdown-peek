import { attachTreeToggleHandlers } from "./tree-toggle.ts";

function getFileNameFromPath(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

async function navigateToFile(path: string, pushState: boolean): Promise<void> {
  const [contentRes, treeRes] = await Promise.all([
    fetch(`/api/content?path=${encodeURIComponent(path)}`),
    fetch(`/api/tree-html?currentPath=${encodeURIComponent(path)}`),
  ]);

  if (!contentRes.ok || !treeRes.ok) return;

  const [contentHtml, treeHtml] = await Promise.all([
    contentRes.text(),
    treeRes.text(),
  ]);

  const contentEl = document.getElementById("markdown-content");
  if (contentEl) {
    contentEl.innerHTML = contentHtml;
  }

  const treeEl = document.getElementById("file-tree");
  if (treeEl) {
    treeEl.innerHTML = treeHtml;
    attachTreeToggleHandlers();
  }

  const breadcrumbList = document.querySelector("#header-bar ol");
  if (breadcrumbList) {
    const lastItem = breadcrumbList.querySelector("li:last-child");
    if (lastItem) {
      lastItem.textContent = getFileNameFromPath(path);
    }
  }

  document.title = `${getFileNameFromPath(path)} - peek`;

  const newUrl = `/view?path=${encodeURIComponent(path)}`;
  if (pushState) {
    history.pushState({ path }, "", newUrl);
  }
}

export function initNavigation(): void {
  if (!document.getElementById("sidebar")) return;

  const initialPath = new URLSearchParams(window.location.search).get("path");
  if (initialPath) {
    history.replaceState({ path: initialPath }, "");
  }

  document.addEventListener("click", (e: MouseEvent) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

    const link = (e.target as Element).closest(
      "a[href]",
    ) as HTMLAnchorElement | null;
    if (!link) return;

    let url: URL;
    try {
      url = new URL(link.href, window.location.origin);
    } catch {
      return;
    }

    if (url.pathname !== "/view") return;
    const path = url.searchParams.get("path");
    if (!path) return;

    e.preventDefault();
    navigateToFile(path, true);
  });

  window.addEventListener("popstate", (e: PopStateEvent) => {
    const state = e.state as { path?: string } | null;
    if (state?.path) {
      navigateToFile(state.path, false);
    } else {
      window.location.reload();
    }
  });
}
