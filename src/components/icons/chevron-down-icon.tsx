import type { IconProps } from "./svg-base.js";
import { SvgBase } from "./svg-base.js";

export function ChevronDownIcon(props: IconProps) {
  return (
    <SvgBase {...props}>
      <path d="m6 9 6 6 6-6" />
    </SvgBase>
  );
}
