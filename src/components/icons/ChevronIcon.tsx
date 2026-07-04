interface Props {
  direction: 'left' | 'right';
}

/** Chevron SVG décoratif (trait épais), taille suivant `font-size` du parent via `1em`. */
export function ChevronIcon({ direction }: Props) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={direction === 'left' ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
