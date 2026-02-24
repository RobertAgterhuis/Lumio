import type { SVGProps } from "react";

/**
 * Uitvaart icon — a circle of continuity above a soft memorial arch.
 * Religiously neutral — respects all traditions.
 * The circle signals wholeness, eternity; the arch signals passage.
 *
 * viewBox: 0 0 24 24 | stroke: currentColor | strokeWidth: 1.5
 */
export function UitvaartIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Circle of continuity / sun */}
      <circle cx="12" cy="8.5" r="4" />
      {/* Simple radiating lines — light */}
      <line x1="12" y1="2" x2="12" y2="3" />
      <line x1="16.9" y1="3.6" x2="16.2" y2="4.4" />
      <line x1="7.1" y1="3.6" x2="7.8" y2="4.4" />
      {/* Memorial arch / gate below — passage */}
      <path d="M4 21 L4 17.5 C4 14.5 7.5 13 12 13 C16.5 13 20 14.5 20 17.5 L20 21" />
      {/* Base line */}
      <line x1="3" y1="21" x2="21" y2="21" />
    </svg>
  );
}
UitvaartIcon.displayName = "UitvaartIcon";
