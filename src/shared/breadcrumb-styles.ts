export const BREADCRUMB_CLASSES = {
  dirItem: "inline-flex items-center shrink-0",
  dirLink: "text-sm text-muted-foreground hover:text-foreground",
  fileItem:
    "inline-flex items-center text-sm font-semibold text-foreground truncate",
} as const;

export const SLASH_ICON_CLASS =
  "shrink-0 mx-1 size-4 text-muted-foreground" as const;

export const SLASH_ICON_HTML = `<svg class="${SLASH_ICON_CLASS}" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 13L10 3" stroke="currentColor" stroke-linecap="round" /></svg>`;
