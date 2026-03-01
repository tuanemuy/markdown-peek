import {
  BREADCRUMB_CLASSES,
  SLASH_ICON_CLASS,
} from "../../shared/breadcrumb-styles.js";
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
    <nav aria-label="Breadcrumb">
      <ol class="flex items-center min-w-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              class={
                isLast
                  ? BREADCRUMB_CLASSES.fileItem
                  : BREADCRUMB_CLASSES.dirItem
              }
              aria-current={isLast ? "page" : undefined}
            >
              {isLast ? (
                item.label
              ) : (
                <>
                  <a class={BREADCRUMB_CLASSES.dirLink} href={item.href ?? "#"}>
                    {item.label}
                  </a>
                  <SlashIcon class={SLASH_ICON_CLASS} />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
