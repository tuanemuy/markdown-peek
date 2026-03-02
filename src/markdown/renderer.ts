import Shiki from "@shikijs/markdown-it";
import MarkdownIt from "markdown-it";
// @ts-expect-error -- no type declarations available
import taskLists from "markdown-it-task-lists";

let md: MarkdownIt | null = null;

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

export async function initMarkdown(): Promise<void> {
  if (md) return;
  md = MarkdownIt();
  md.use(taskLists);
  md.use(
    await Shiki({
      themes: {
        light: "gruvbox-light-hard",
        dark: "gruvbox-dark-hard",
      },
      defaultColor: false,
      langs: [...supportedLangs],
    }),
  );
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
