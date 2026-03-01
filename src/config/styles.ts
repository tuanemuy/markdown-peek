import { access, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, resolve } from "node:path";
import contentCssDefault from "../styles/content.css";
import tailwindCss from "../generated/global.css";
import type { Result } from "../types/result.js";
import { err, ok, tryCatch } from "../types/result.js";

export type ResolvedStyles = {
  readonly tailwindCss: string;
  readonly contentCss: string;
};

type FileNotFoundError = {
  readonly type: "file-not-found";
  readonly path: string;
};

type ReadError = {
  readonly type: "read-error";
  readonly path: string;
  readonly cause: unknown;
};

export type StylesError = FileNotFoundError | ReadError;

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function getXdgConfigPath(): string {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    return resolve(xdgConfigHome, "peek", "style.css");
  }
  return resolve(homedir(), ".config", "peek", "style.css");
}

export async function resolveStyles(
  cssOption?: string,
): Promise<Result<ResolvedStyles, StylesError>> {
  if (cssOption) {
    const cssPath = isAbsolute(cssOption)
      ? cssOption
      : resolve(process.cwd(), cssOption);
    if (!(await fileExists(cssPath))) {
      return err({ type: "file-not-found", path: cssPath });
    }
    const result = await tryCatch(
      () => readFile(cssPath, "utf-8"),
      (cause) => ({ type: "read-error" as const, path: cssPath, cause }),
    );
    if (!result.ok) return result;
    return ok({ tailwindCss, contentCss: result.value });
  }

  const xdgPath = getXdgConfigPath();
  if (await fileExists(xdgPath)) {
    const result = await tryCatch(
      () => readFile(xdgPath, "utf-8"),
      (cause) => ({ type: "read-error" as const, path: xdgPath, cause }),
    );
    if (!result.ok) return result;
    return ok({ tailwindCss, contentCss: result.value });
  }

  return ok({ tailwindCss, contentCss: contentCssDefault });
}
