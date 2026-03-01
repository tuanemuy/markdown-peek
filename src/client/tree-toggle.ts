export function attachTreeToggleHandlers(): void {
  document.querySelectorAll("[data-tree-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.nextElementSibling;
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
