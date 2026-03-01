import { init, mdToHtml } from "md4w";

export async function initMarkdown(): Promise<void> {
  await init();
}

export function renderMarkdown(content: string): string {
  if (!content) return "";
  return mdToHtml(content, {
    parseFlags: ["DEFAULT", "LATEX_MATH_SPANS"],
  });
}
