const SIDEBAR_WIDTH_KEY = "sidebar-width";
const SIDEBAR_STATE_KEY = "sidebar-open";
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;
const DESKTOP_BREAKPOINT = 1024;

function isDesktop(): boolean {
  return window.innerWidth >= DESKTOP_BREAKPOINT;
}

function setSidebarWidth(width: number): void {
  document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
}

function restoreSidebarWidth(): void {
  const stored = localStorage.getItem(SIDEBAR_WIDTH_KEY);
  if (stored) {
    const width = Number(stored);
    if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
      setSidebarWidth(width);
    }
  }
}

function updateToggleIcon(open: boolean): void {
  const iconOpen = document.getElementById("icon-sidebar-open");
  const iconClose = document.getElementById("icon-sidebar-close");
  if (iconOpen) iconOpen.classList.toggle("hidden", open);
  if (iconClose) iconClose.classList.toggle("hidden", !open);
}

function openSidebar(): void {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  if (sidebar) sidebar.classList.remove("-translate-x-full");
  document.body.setAttribute("data-sidebar-open", "");
  updateToggleIcon(true);

  if (!isDesktop() && overlay) {
    overlay.classList.remove("hidden");
  }

  if (isDesktop()) {
    localStorage.setItem(SIDEBAR_STATE_KEY, "true");
  }
}

function closeSidebar(): void {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  if (sidebar) sidebar.classList.add("-translate-x-full");
  document.body.removeAttribute("data-sidebar-open");
  updateToggleIcon(false);

  if (!isDesktop() && overlay) {
    overlay.classList.add("hidden");
  }

  if (isDesktop()) {
    localStorage.setItem(SIDEBAR_STATE_KEY, "false");
  }
}

function isSidebarOpen(): boolean {
  return document.body.hasAttribute("data-sidebar-open");
}

function toggleSidebar(): void {
  if (isSidebarOpen()) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function initSidebarResize(): void {
  const handle = document.getElementById("sidebar-resize");
  if (!handle) return;

  function onPointerMove(e: PointerEvent): void {
    const width = Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH);
    setSidebarWidth(width);
  }

  handle.addEventListener("pointerdown", (e: PointerEvent) => {
    e.preventDefault();
    const sidebar = document.getElementById("sidebar");
    document.body.style.setProperty("user-select", "none");
    sidebar?.style.setProperty("transition", "none");

    function onPointerUp(e: PointerEvent): void {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.body.style.removeProperty("user-select");
      sidebar?.style.removeProperty("transition");

      const width = Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH);
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(width));
    }

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  });
}

export function initSidebar(): void {
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const overlay = document.getElementById("sidebar-overlay");

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }
  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  restoreSidebarWidth();
  initSidebarResize();

  // On desktop, restore sidebar state (default: open)
  if (isDesktop()) {
    const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (stored !== "false") {
      // Suppress transition on initial load to avoid flicker
      const sidebar = document.getElementById("sidebar");
      const header = document.getElementById("header-bar");
      const main = document.getElementById("main-content");
      if (sidebar) sidebar.style.transition = "none";
      if (header) header.style.transition = "none";
      if (main) main.style.transition = "none";

      openSidebar();

      // Force reflow then re-enable transitions
      void document.body.offsetHeight;
      if (sidebar) sidebar.style.removeProperty("transition");
      if (header) header.style.removeProperty("transition");
      if (main) main.style.removeProperty("transition");
    }
  }

  // Sync overlay state when crossing the desktop/mobile breakpoint
  let wasDesktop = isDesktop();
  window.addEventListener("resize", () => {
    const nowDesktop = isDesktop();
    if (wasDesktop === nowDesktop) return;
    wasDesktop = nowDesktop;

    const overlay = document.getElementById("sidebar-overlay");
    if (!isSidebarOpen()) return;

    if (nowDesktop) {
      // Switched to desktop: hide overlay
      overlay?.classList.add("hidden");
    } else {
      // Switched to mobile: show overlay for open sidebar
      overlay?.classList.remove("hidden");
    }
  });
}
