import type { IconProps } from "./svg-base.js";
import { SvgBase } from "./svg-base.js";

export function MoonIcon({ class: className, ...rest }: IconProps) {
  return (
    <SvgBase class={className} {...rest}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </SvgBase>
  );
}
