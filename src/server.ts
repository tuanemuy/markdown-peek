import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { ResolvedStyles } from "./config/styles.js";
import type { ApiConfig } from "./routes/api.js";
import { createApiRoutes } from "./routes/api.js";
import { createDirectoryRoutes } from "./routes/directory.js";
import { createFileRoutes } from "./routes/file.js";
import type { SseManager } from "./routes/sse.js";
import { createSseManager } from "./routes/sse.js";
import { createFileTreeCache } from "./utils/file-tree-cache.js";
import type { FileWatcherHandle } from "./watcher/index.js";
import { createFileWatcher } from "./watcher/index.js";

type FileServerConfig = {
  readonly mode: "file";
  readonly targetPath: string;
  readonly port: number;
  readonly hostname: string;
  readonly styles: ResolvedStyles;
};

type DirectoryServerConfig = {
  readonly mode: "directory";
  readonly targetPath: string;
  readonly port: number;
  readonly hostname: string;
  readonly styles: ResolvedStyles;
};

export type ServerConfig = FileServerConfig | DirectoryServerConfig;

export type ServerInstance = {
  readonly close: () => void;
  readonly watcher: FileWatcherHandle;
  readonly sseCloseAll: () => void;
};

function createApp(config: ServerConfig, sse: SseManager): Hono {
  const app = new Hono();

  app.get("/favicon.ico", (c) => c.body(null, 204));
  app.route("/", sse.app);

  if (config.mode === "file") {
    const apiRoutes = createApiRoutes({
      mode: "file",
      targetPath: config.targetPath,
    });
    app.route("/", apiRoutes);

    const fileRoutes = createFileRoutes(config.targetPath, config.styles);
    app.route("/", fileRoutes);
  } else {
    const treeCache = createFileTreeCache(config.targetPath);

    const apiConfig: ApiConfig = {
      mode: "directory",
      targetPath: config.targetPath,
      treeCache,
    };
    app.route("/", createApiRoutes(apiConfig));
    app.route(
      "/",
      createDirectoryRoutes(config.targetPath, config.styles, treeCache),
    );
  }

  return app;
}

function setupWatcher(
  config: ServerConfig,
  sse: SseManager,
): FileWatcherHandle {
  const watcher = createFileWatcher();

  if (config.mode === "file") {
    watcher.watchFile(config.targetPath, () => {
      sse.broadcast("file-changed", JSON.stringify({}));
    });
  } else {
    const treeCache = createFileTreeCache(config.targetPath);
    watcher.watchDirectory(config.targetPath, (filePath) => {
      const normalizedPath = filePath.replace(/\\/g, "/");
      treeCache.invalidate();
      sse.broadcast("file-changed", JSON.stringify({ path: normalizedPath }));
      sse.broadcast("tree-changed", JSON.stringify({}));
    });
  }

  return watcher;
}

export async function startServer(
  config: ServerConfig,
): Promise<ServerInstance> {
  const sse = createSseManager();
  const app = createApp(config, sse);
  const watcher = setupWatcher(config, sse);

  const server = serve({
    fetch: app.fetch,
    hostname: config.hostname,
    port: config.port,
  });

  await new Promise<void>((resolve, reject) => {
    const onListening = () => {
      server.removeListener("error", onError);
      resolve();
    };
    const onError = (err: Error) => {
      server.removeListener("listening", onListening);
      watcher.close();
      reject(err);
    };
    server.once("listening", onListening);
    server.once("error", onError);
  });

  return {
    close: () => {
      server.close();
    },
    watcher,
    sseCloseAll: () => sse.closeAll(),
  };
}
