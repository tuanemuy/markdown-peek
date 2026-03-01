import { attachTreeToggleHandlers } from "./tree-toggle.ts";

const SSE_MAX_RETRIES = 10;

function normalizePath(p: string): string {
  return p ? p.replace(/\\/g, "/") : p;
}

function handleFileChangedFile(): void {
  const contentEl = document.getElementById("markdown-content");
  if (!contentEl) return;
  fetch("/api/content")
    .then((res) => res.text())
    .then((html) => {
      contentEl.innerHTML = html;
    });
}

function handleFileChangedDirectory(e: MessageEvent): void {
  const contentEl = document.getElementById("markdown-content");
  if (!contentEl) return;
  const data = JSON.parse(e.data) as { path: string };
  const params = new URLSearchParams(window.location.search);
  const currentPath = params.get("path");
  if (currentPath && normalizePath(data.path) === normalizePath(currentPath)) {
    fetch(`/api/content?path=${encodeURIComponent(currentPath)}`)
      .then((res) => res.text())
      .then((html) => {
        contentEl.innerHTML = html;
      });
  }
}

function handleTreeChanged(): void {
  const treeCurrentPath =
    new URLSearchParams(window.location.search).get("path") || "";
  fetch(`/api/tree-html?currentPath=${encodeURIComponent(treeCurrentPath)}`)
    .then((res) => res.text())
    .then((html) => {
      const treeEl = document.getElementById("file-tree");
      if (treeEl) {
        treeEl.innerHTML = html;
        attachTreeToggleHandlers();
      }
    });
}

export function initSse(mode: "file" | "directory"): void {
  let sseRetryCount = 0;
  const evtSource = new EventSource("/sse");

  evtSource.onopen = () => {
    sseRetryCount = 0;
  };

  if (mode === "file") {
    evtSource.addEventListener("file-changed", handleFileChangedFile);
  } else {
    evtSource.addEventListener("file-changed", handleFileChangedDirectory);
    evtSource.addEventListener("tree-changed", handleTreeChanged);
  }

  evtSource.onerror = () => {
    sseRetryCount++;
    if (sseRetryCount >= SSE_MAX_RETRIES) {
      console.log(
        `[peek] SSE connection lost after ${SSE_MAX_RETRIES} retries, giving up.`,
      );
      evtSource.close();
    } else {
      console.log(
        `[peek] SSE connection lost, reconnecting (${sseRetryCount}/${SSE_MAX_RETRIES})...`,
      );
    }
  };
}
