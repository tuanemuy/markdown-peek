import { ExternalLinkIcon } from "../icons/index.js";

type ExternalLinkProps = {
  readonly href: string;
};

export function ExternalLink({ href }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      class="shrink-0 w-7 h-7 inline-flex justify-center items-center rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
      aria-label="Open in new tab"
    >
      <ExternalLinkIcon class="size-4" />
    </a>
  );
}
