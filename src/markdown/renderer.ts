import { tasklist } from "@mdit/plugin-tasklist";
import Shiki from "@shikijs/markdown-it";
import MarkdownIt from "markdown-it";

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
