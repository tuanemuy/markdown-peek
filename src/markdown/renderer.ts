import { tasklist } from "@mdit/plugin-tasklist";
import Shiki from "@shikijs/markdown-it";
import MarkdownIt from "markdown-it";
import type { BundledLanguage } from "shiki";

const supportedLangs: BundledLanguage[] = [
  // Web fundamentals
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "html",
  "css",
  "json",
  "vue",
  "svelte",
  "astro",
  // Systems / compiled
  "c",
  "cpp",
  "rust",
  "go",
  "zig",
  "odin",
  "nim",
  // JVM / CLR
  "java",
  "kotlin",
  "scala",
  "csharp",
  "fsharp",
  // Scripting
  "python",
  "ruby",
  "php",
  "lua",
  "r",
  "julia",
  // Functional
  "haskell",
  "elixir",
  "erlang",
  "ocaml",
  "gleam",
  // Mobile
  "swift",
  "dart",
  // Emerging
  "moonbit",
  // Config / data
  "yaml",
  "toml",
  "xml",
  "graphql",
  "protobuf",
  "prisma",
  "sql",
  "hcl",
  // Shell / DevOps
  "bash",
  "shell",
  "dockerfile",
  "nix",
  // Other
  "markdown",
  "diff",
];

let md: MarkdownIt | null = null;
let initPromise: Promise<void> | null = null;

export function initMarkdown(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const instance = MarkdownIt();
      instance.use(tasklist);
      instance.use(
        await Shiki({
          themes: {
            light: "gruvbox-light-hard",
            dark: "gruvbox-dark-hard",
          },
          defaultColor: false,
          langs: supportedLangs,
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
