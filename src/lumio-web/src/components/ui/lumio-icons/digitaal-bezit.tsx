import type { SVGProps } from "react";

/**
 * Digitaal Bezit icon — a globe with orbit lines and a small padlock overlay.
 * Digital identity + security combined. Online presence, protected.
 *
 * viewBox: 0 0 24 24 | stroke: currentColor | strokeWidth: 1.5
 */
export function DigitaalBezitIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Globe circle */}
      <circle cx="11" cy="11" r="8" />
      {/* Equator */}
      <line x1="3" y1="11" x2="19" y2="11" />
      {/* Vertical meridian */}
      <path d="M11 3 C8.5 5.5 8.5 16.5 11 19" />
      <path d="M11 3 C13.5 5.5 13.5 16.5 11 19" />
      {/* Padlock — bottom-right overlay */}
      {/* Shackle arc */}
      <path d="M17 20 L17 18.5 C17 17.4 17.9 16.5 19 16.5 C20.1 16.5 21 17.4 21 18.5 L21 20" />
      {/* Padlock body */}
      <rect x="16" y="20" width="6" height="4" rx="1" />
    </svg>
  );
}
DigitaalBezitIcon.displayName = "DigitaalBezitIcon";
