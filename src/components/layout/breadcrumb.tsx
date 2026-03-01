import { SlashIcon } from "../icons/index.js";

export type BreadcrumbItem = {
  readonly label: string;
  readonly href?: string;
};

type BreadcrumbProps = {
  readonly items: readonly BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <ol class="flex items-center min-w-0">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li
            class={
              isLast
                ? "inline-flex items-center text-sm font-semibold text-foreground truncate"
                : "inline-flex items-center shrink-0"
            }
            aria-current={isLast ? "page" : undefined}
          >
            {isLast ? (
              item.label
            ) : (
              <>
                <a
                  class="text-sm text-muted-foreground hover:text-foreground"
                  href={item.href ?? "#"}
                >
                  {item.label}
                </a>
                <SlashIcon class="shrink-0 mx-1 size-4 text-muted-foreground" />
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}
