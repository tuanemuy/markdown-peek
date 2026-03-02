import { logger } from "../utils/logger.ts";

export async function fetchHtml(
  url: string,
  label: string,
  options?: { readonly signal?: AbortSignal },
): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: options?.signal });
    if (!res.ok) {
      logger.error(`Failed to fetch ${label}: HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    logger.error(`Failed to fetch ${label}:`, e);
    return null;
  }
}
