import type { IconProps } from "./svg-base.js";
import { SvgBase } from "./svg-base.js";

export function SidebarCloseIcon({ class: className, ...rest }: IconProps) {
  return (
    <SvgBase class={className} {...rest}>
      <polyline points="7 8 3 12 7 16" />
      <line x1="21" x2="11" y1="12" y2="12" />
      <line x1="21" x2="11" y1="6" y2="6" />
      <line x1="21" x2="11" y1="18" y2="18" />
    </SvgBase>
  );
}
