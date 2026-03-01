import { initNavigation } from "./navigation.ts";
import { initSidebar } from "./sidebar.ts";
import { initSse } from "./sse.ts";
import { initTheme } from "./theme.ts";
import { attachTreeToggleHandlers } from "./tree-toggle.ts";

const mode = document.body.dataset.mode as "file" | "directory";

initTheme();
initSidebar();
attachTreeToggleHandlers();
initNavigation();
initSse(mode);
