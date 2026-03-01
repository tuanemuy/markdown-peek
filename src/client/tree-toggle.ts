const INITIALIZED_ATTR = "data-tree-toggle-bound";

export function attachTreeToggleHandlers(): void {
  document
    .querySelectorAll(`[data-tree-toggle]:not([${INITIALIZED_ATTR}])`)
    .forEach((btn) => {
      btn.setAttribute(INITIALIZED_ATTR, "");
      btn.addEventListener("click", () => {
        const target =
          btn.parentElement?.querySelector("[data-tree-content]") ?? null;
        if (target) {
          target.classList.toggle("hidden");
          const icon = btn.querySelector("[data-chevron]");
          if (icon) {
            icon.classList.toggle("-rotate-180");
          }
        }
      });
    });
}
