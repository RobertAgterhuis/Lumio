import type { SVGProps } from "react";

/**
 * Tijdlijn icon — three dots on a vertical centre line conveying process
 * progression. Top dot: open (future). Middle dot: half-filled (in progress).
 * Bottom dot: filled with a check inside (completed).
 *
 * viewBox: 0 0 24 24 | stroke: currentColor | strokeWidth: 1.5
 */
export function TijdlijnIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Connecting line segments between dots */}
      <line x1="12" y1="7.5" x2="12" y2="9.5" />
      <line x1="12" y1="14.5" x2="12" y2="16.5" />

      {/* Top dot — open circle (future) */}
      <circle cx="12" cy="5" r="2.5" />

      {/* Middle dot — left half filled (in progress) */}
      {/* Stroke circle */}
      <circle cx="12" cy="12" r="2.5" />
      {/* Left semicircle fill */}
      <path d="M 12 9.5 A 2.5 2.5 0 0 0 12 14.5 Z" fill="currentColor" stroke="none" />

      {/* Bottom dot — filled circle (completed) */}
      <circle cx="12" cy="19" r="2.5" fill="currentColor" stroke="none" />
      {/* Check mark inside */}
      <path
        d="M 10.5 19 L 11.5 20 L 13.5 18"
        stroke="canvas"
        strokeWidth="1.25"
        style={{ stroke: "var(--color-canvas, white)" }}
        fill="none"
      />
    </svg>
  );
}
TijdlijnIcon.displayName = "TijdlijnIcon";
