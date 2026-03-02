import Shiki from "@shikijs/markdown-it";
import MarkdownIt from "markdown-it";
// @ts-expect-error -- no type declarations available
import taskLists from "markdown-it-task-lists";

let md: MarkdownIt | null = null;
let initPromise: Promise<void> | null = null;

const supportedLangs = [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
  "csharp",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "html",
  "css",
  "json",
  "yaml",
  "toml",
  "xml",
  "sql",
  "bash",
  "shell",
  "dockerfile",
  "markdown",
  "diff",
  "jsx",
  "tsx",
] as const;

export function initMarkdown(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const instance = MarkdownIt();
      instance.use(taskLists);
      instance.use(
        await Shiki({
          themes: {
            light: "gruvbox-light-hard",
            dark: "gruvbox-dark-hard",
          },
          defaultColor: false,
          langs: [...supportedLangs],
        }),
      );
      md = instance;
    })().catch((e: unknown) => {
      initPromise = null;
      throw e;
    });
  }
  return initPromise;
}

export function renderMarkdown(content: string): string {
  if (!md) {
    throw new Error(
      "Markdown renderer not initialized. Call initMarkdown() first.",
    );
  }
  if (content === "") return "";
  return md.render(content);
}
