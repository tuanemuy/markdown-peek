import type { IconProps } from "./svg-base.js";
import { SvgBase } from "./svg-base.js";

export function SidebarOpenIcon({ class: className, ...rest }: IconProps) {
  return (
    <SvgBase class={className} {...rest}>
      <path d="M17 8L21 12L17 16M3 12H13M3 6H13M3 18H13" />
    </SvgBase>
  );
}
