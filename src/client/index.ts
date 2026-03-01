import { initNavigation } from "./navigation.ts";
import { initSidebar } from "./sidebar.ts";
import { initSse } from "./sse.ts";
import { initTheme } from "./theme.ts";
import { attachTreeToggleHandlers } from "./tree-toggle.ts";

const rawMode = document.body.dataset.mode;
if (rawMode !== "file" && rawMode !== "directory") {
  console.warn(`[peek] Unknown data-mode "${rawMode}", falling back to "file"`);
}
const mode: "file" | "directory" =
  rawMode === "file" || rawMode === "directory" ? rawMode : "file";

initTheme();
initSidebar();
attachTreeToggleHandlers();
initNavigation();
initSse(mode);
