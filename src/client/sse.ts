import { logger } from "../utils/logger.ts";
import { attachTreeToggleHandlers } from "./tree-toggle.ts";

const SSE_MAX_RETRIES = 10;
const SSE_INITIAL_RETRY_MS = 1000;
const SSE_MAX_RETRY_MS = 30000;
const SSE_STABLE_THRESHOLD_MS = 5000;

function normalizePath(p: string): string {
  return p ? p.replace(/\\/g, "/") : p;
}

function parseFileChangedData(raw: string): { path: string } | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (typeof obj.path !== "string") return null;
  return { path: obj.path };
}

function handleFileChangedFile(): void {
  const contentEl = document.getElementById("markdown-content");
  if (!contentEl) return;
  fetch("/api/content")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then((html) => {
      contentEl.innerHTML = html;
    })
    .catch((e: unknown) => logger.error("Failed to fetch content:", e));
}

function handleFileChangedDirectory(e: MessageEvent): void {
  const contentEl = document.getElementById("markdown-content");
  if (!contentEl) return;
  const parsed = parseFileChangedData(e.data);
  if (!parsed) return;
  const params = new URLSearchParams(window.location.search);
  const currentPath = params.get("path");
  if (
    currentPath &&
    normalizePath(parsed.path) === normalizePath(currentPath)
  ) {
    fetch(`/api/content?path=${encodeURIComponent(currentPath)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((html) => {
        contentEl.innerHTML = html;
      })
      .catch((e: unknown) => logger.error("Failed to fetch content:", e));
  }
}

function handleTreeChanged(): void {
  const treeCurrentPath =
    new URLSearchParams(window.location.search).get("path") || "";
  fetch(`/api/tree-html?currentPath=${encodeURIComponent(treeCurrentPath)}`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then((html) => {
      const treeEl = document.getElementById("file-tree");
      if (treeEl) {
        treeEl.innerHTML = html;
        attachTreeToggleHandlers();
      }
    })
    .catch((e: unknown) => logger.error("Failed to fetch tree:", e));
}

type SseEventHandlers = {
  readonly onFileChanged: (e: MessageEvent) => void;
  readonly onTreeChanged?: () => void;
};

function createConnection(
  handlers: SseEventHandlers,
  onDisconnect: () => void,
): EventSource {
  const evtSource = new EventSource("/sse");

  evtSource.addEventListener("file-changed", handlers.onFileChanged);
  if (handlers.onTreeChanged) {
    evtSource.addEventListener("tree-changed", handlers.onTreeChanged);
  }

  evtSource.onerror = () => {
    evtSource.close();
    onDisconnect();
  };

  return evtSource;
}

export function initSse(mode: "file" | "directory"): void {
  let retryCount = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let stableTimer: ReturnType<typeof setTimeout> | null = null;
  let currentSource: EventSource | null = null;

  const handlers: SseEventHandlers =
    mode === "file"
      ? { onFileChanged: handleFileChangedFile }
      : {
          onFileChanged: handleFileChangedDirectory,
          onTreeChanged: handleTreeChanged,
        };

  function connect(): void {
    if (stableTimer) {
      clearTimeout(stableTimer);
      stableTimer = null;
    }

    currentSource = createConnection(handlers, () => {
      currentSource = null;
      if (stableTimer) {
        clearTimeout(stableTimer);
        stableTimer = null;
      }

      retryCount++;
      if (retryCount > SSE_MAX_RETRIES) {
        logger.warn(
          `SSE connection lost after ${SSE_MAX_RETRIES} retries, giving up.`,
        );
        return;
      }

      const delay = Math.min(
        SSE_INITIAL_RETRY_MS * 2 ** (retryCount - 1),
        SSE_MAX_RETRY_MS,
      );
      logger.info(
        `SSE reconnecting in ${delay}ms (${retryCount}/${SSE_MAX_RETRIES})...`,
      );
      retryTimer = setTimeout(connect, delay);
    });

    // Reset retry count after stable connection
    stableTimer = setTimeout(() => {
      retryCount = 0;
      stableTimer = null;
    }, SSE_STABLE_THRESHOLD_MS);
  }

  connect();

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    if (retryTimer) clearTimeout(retryTimer);
    if (stableTimer) clearTimeout(stableTimer);
    if (currentSource) currentSource.close();
  });
}
