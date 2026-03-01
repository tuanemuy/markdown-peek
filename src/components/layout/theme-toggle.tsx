import { MoonIcon, SunIcon, SunMoonIcon } from "../icons/index.js";

export function ThemeToggle() {
  return (
    <button
      type="button"
      id="theme-toggle"
      class="shrink-0 w-7 h-7 inline-flex justify-center items-center rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
      aria-label="Toggle theme"
    >
      <SunIcon class="hidden size-4" id="icon-theme-light" />
      <MoonIcon class="hidden size-4" id="icon-theme-dark" />
      <SunMoonIcon class="hidden size-4" id="icon-theme-system" />
    </button>
  );
}
