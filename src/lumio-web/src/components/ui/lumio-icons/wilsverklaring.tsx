import type { SVGProps } from "react";

/**
 * Wilsverklaring icon — a stethoscope with a heart inside the chest piece.
 * Medical but personal — not clinical. Your own medical wishes.
 *
 * viewBox: 0 0 24 24 | stroke: currentColor | strokeWidth: 1.5
 */
export function WilsverklaringIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Left ear piece arc */}
      <path d="M5 3 C5 3 4.5 6.5 7 8" />
      {/* Right ear piece arc */}
      <path d="M19 3 C19 3 19.5 6.5 17 8" />
      {/* Merge to tube */}
      <path d="M7 8 C9 9 15 9 17 8" />
      {/* Tube down to chest piece */}
      <path d="M12 9 L12 14.5" />
      {/* Chest piece circle */}
      <circle cx="12" cy="18" r="3.5" />
      {/* Tiny heart inside chest piece */}
      <path
        d="M12 19.5 C12 19.5 9.5 17.8 9.5 16.5 C9.5 15.6 10.3 15 11 15.6 C11.4 15.9 11.7 16.4 12 16.8 C12.3 16.4 12.6 15.9 13 15.6 C13.7 15 14.5 15.6 14.5 16.5 C14.5 17.8 12 19.5 12 19.5Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
WilsverklaringIcon.displayName = "WilsverklaringIcon";
