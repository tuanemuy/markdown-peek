export function SlashIcon({ class: className }: { readonly class?: string }) {
  return (
    <svg
      class={className}
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 13L10 3" stroke="currentColor" stroke-linecap="round" />
    </svg>
  );
}
