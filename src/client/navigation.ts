import {
  BREADCRUMB_CLASSES,
  SLASH_ICON_HTML,
} from "../shared/breadcrumb-styles.ts";
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

  const breadcrumbNav = document.querySelector(
    "#header-bar nav[aria-label='Breadcrumb']",
  );
  if (breadcrumbNav) {
    const ol = breadcrumbNav.querySelector("ol");
    if (ol) {
      const dirTitle = document.body.dataset.dirTitle ?? "";
      const fileName = getFileNameFromPath(path);

      ol.textContent = "";

      const dirLi = document.createElement("li");
      dirLi.className = BREADCRUMB_CLASSES.dirItem;
      const dirLink = document.createElement("a");
      dirLink.className = BREADCRUMB_CLASSES.dirLink;
      dirLink.href = "/";
      dirLink.textContent = dirTitle;
      dirLi.appendChild(dirLink);
      dirLi.insertAdjacentHTML("beforeend", SLASH_ICON_HTML);
      ol.appendChild(dirLi);

      const fileLi = document.createElement("li");
      fileLi.className = BREADCRUMB_CLASSES.fileItem;
      fileLi.setAttribute("aria-current", "page");
      fileLi.textContent = fileName;
      ol.appendChild(fileLi);
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
    navigateToFile(path, true).catch((e: unknown) =>
      console.error("[peek] Failed to navigate:", e),
    );
  });

  window.addEventListener("popstate", (e: PopStateEvent) => {
    const state = e.state as { path?: string } | null;
    if (state?.path) {
      navigateToFile(state.path, false).catch((e: unknown) =>
        console.error("[peek] Failed to navigate:", e),
      );
    } else {
      window.location.reload();
    }
  });
}
