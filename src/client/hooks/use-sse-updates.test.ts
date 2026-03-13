import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from "vitest";
import type { ContentType } from "../../core/content-type.js";
import type { SseCallbacks } from "../lib/sse.js";

// Mock useEffect to run callback synchronously (no DOM needed)
vi.mock("preact/hooks", () => ({
  useEffect: (fn: () => (() => void) | undefined) => {
    fn();
  },
}));

vi.mock("../lib/sse.js", () => ({
  createSseConnection: vi.fn(() => vi.fn()),
}));

vi.mock("../lib/api-client.js", () => ({
  fetchContent: vi.fn(),
  fetchTree: vi.fn(),
}));

// Import after mocks are set up
const { createSseConnection } = await import("../lib/sse.js");
const { fetchContent, fetchTree } = await import("../lib/api-client.js");
const { useSseUpdates } = await import("./use-sse-updates.js");

function getSseCallbacks(): SseCallbacks {
  return (createSseConnection as Mock).mock.calls.at(-1)?.[0] as SseCallbacks;
}

beforeEach(() => {
  vi.mocked(fetchContent).mockResolvedValue("<p>content</p>");
  vi.mocked(fetchTree).mockResolvedValue([]);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useSseUpdates", () => {
  describe("directory mode with HTML contentType", () => {
    it("calls onContentUpdate with empty string and skips fetchContent for HTML files", () => {
      const onContentUpdate = vi.fn();

      useSseUpdates({
        onContentUpdate,
        getCurrentPath: () => "docs/page.html",
        getCurrentContentType: () => "html",
        onTreeUpdate: vi.fn(),
      });

      const { onFileChanged } = getSseCallbacks();
      onFileChanged("docs/page.html");

      expect(onContentUpdate).toHaveBeenCalledWith("");
      expect(fetchContent).not.toHaveBeenCalled();
    });

    it("does not call onContentUpdate for HTML files when path does not match", () => {
      const onContentUpdate = vi.fn();

      useSseUpdates({
        onContentUpdate,
        getCurrentPath: () => "docs/page.html",
        getCurrentContentType: () => "html",
        onTreeUpdate: vi.fn(),
      });

      const { onFileChanged } = getSseCallbacks();
      onFileChanged("other/file.html");

      expect(onContentUpdate).not.toHaveBeenCalled();
      expect(fetchContent).not.toHaveBeenCalled();
    });
  });

  describe("directory mode with markdown contentType", () => {
    it("calls fetchContent for markdown files", async () => {
      const onContentUpdate = vi.fn();

      useSseUpdates({
        onContentUpdate,
        getCurrentPath: () => "docs/readme.md",
        getCurrentContentType: () => "markdown",
        onTreeUpdate: vi.fn(),
      });

      const { onFileChanged } = getSseCallbacks();
      onFileChanged("docs/readme.md");

      // Wait for the fetchContent promise to resolve
      await vi.waitFor(() => {
        expect(fetchContent).toHaveBeenCalledWith("docs/readme.md");
        expect(onContentUpdate).toHaveBeenCalledWith("<p>content</p>");
      });
    });
  });

  describe("directory mode HTML→MD→HTML file transitions", () => {
    it("changes behavior when contentType switches from HTML to MD to HTML", async () => {
      const onContentUpdate = vi.fn();
      let currentPath = "page.html";
      let currentContentType: ContentType = "html";

      useSseUpdates({
        onContentUpdate,
        getCurrentPath: () => currentPath,
        getCurrentContentType: () => currentContentType,
        onTreeUpdate: vi.fn(),
      });

      const { onFileChanged } = getSseCallbacks();

      // Phase 1: HTML file — should call onContentUpdate(""), skip fetchContent
      onFileChanged("page.html");
      expect(onContentUpdate).toHaveBeenCalledWith("");
      expect(fetchContent).not.toHaveBeenCalled();

      // Phase 2: Navigate to MD (simulate DirectoryApp state change)
      currentPath = "readme.md";
      currentContentType = "markdown";
      onContentUpdate.mockClear();

      onFileChanged("readme.md");
      await vi.waitFor(() => {
        expect(fetchContent).toHaveBeenCalledWith("readme.md");
        expect(onContentUpdate).toHaveBeenCalledWith("<p>content</p>");
      });

      // Phase 3: Navigate back to HTML
      currentPath = "page.html";
      currentContentType = "html";
      onContentUpdate.mockClear();
      vi.mocked(fetchContent).mockClear();

      onFileChanged("page.html");
      expect(onContentUpdate).toHaveBeenCalledWith("");
      expect(fetchContent).not.toHaveBeenCalled();
    });
  });

  describe("directory mode general behavior", () => {
    it("ignores null changedPath", () => {
      const onContentUpdate = vi.fn();

      useSseUpdates({
        onContentUpdate,
        getCurrentPath: () => "docs/readme.md",
        getCurrentContentType: () => "markdown",
        onTreeUpdate: vi.fn(),
      });

      const { onFileChanged } = getSseCallbacks();
      onFileChanged(null);

      expect(onContentUpdate).not.toHaveBeenCalled();
      expect(fetchContent).not.toHaveBeenCalled();
    });

    it("ignores events for non-matching paths", () => {
      const onContentUpdate = vi.fn();

      useSseUpdates({
        onContentUpdate,
        getCurrentPath: () => "docs/readme.md",
        getCurrentContentType: () => "markdown",
        onTreeUpdate: vi.fn(),
      });

      const { onFileChanged } = getSseCallbacks();
      onFileChanged("other/file.md");

      expect(onContentUpdate).not.toHaveBeenCalled();
      expect(fetchContent).not.toHaveBeenCalled();
    });
  });

  describe("file mode", () => {
    it("always calls fetchContent without path argument", async () => {
      const onContentUpdate = vi.fn();

      useSseUpdates({
        onContentUpdate,
      });

      const { onFileChanged } = getSseCallbacks();
      onFileChanged("any/file.md");

      await vi.waitFor(() => {
        expect(fetchContent).toHaveBeenCalledWith();
        expect(onContentUpdate).toHaveBeenCalledWith("<p>content</p>");
      });
    });
  });

  describe("tree updates", () => {
    it("registers onTreeChanged when onTreeUpdate is provided", async () => {
      const onTreeUpdate = vi.fn();
      const treeData = [
        { name: "readme.md", path: "readme.md", type: "file" as const },
      ];
      vi.mocked(fetchTree).mockResolvedValue(treeData);

      useSseUpdates({
        onContentUpdate: vi.fn(),
        getCurrentPath: () => "readme.md",
        getCurrentContentType: () => "markdown",
        onTreeUpdate,
      });

      const { onTreeChanged } = getSseCallbacks();
      expect(onTreeChanged).toBeDefined();

      onTreeChanged?.();

      await vi.waitFor(() => {
        expect(fetchTree).toHaveBeenCalled();
        expect(onTreeUpdate).toHaveBeenCalledWith(treeData);
      });
    });

    it("does not register onTreeChanged when onTreeUpdate is not provided", () => {
      useSseUpdates({
        onContentUpdate: vi.fn(),
      });

      const { onTreeChanged } = getSseCallbacks();
      expect(onTreeChanged).toBeUndefined();
    });
  });
});
