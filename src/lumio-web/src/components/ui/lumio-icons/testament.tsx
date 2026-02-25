import type { SVGProps } from "react";

/**
 * Testament icon — a parchment scroll with title rule, content lines,
 * and a small wax-seal dot. Signals legal legacy, handwritten wishes.
 *
 * viewBox: 0 0 24 24 | stroke: currentColor | strokeWidth: 1.5
 */
export function TestamentIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Scroll body */}
      <rect x="6" y="4" width="12" height="16" rx="1" />
      {/* Top cylinder cap */}
      <ellipse cx="12" cy="4" rx="6" ry="1.5" />
      {/* Bottom cylinder cap */}
      <ellipse cx="12" cy="20" rx="6" ry="1.5" />
      {/* Title rule line */}
      <line x1="8.5" y1="8.5" x2="15.5" y2="8.5" />
      {/* Content line 1 */}
      <line x1="8.5" y1="11.5" x2="15" y2="11.5" />
      {/* Content line 2 */}
      <line x1="8.5" y1="14" x2="14" y2="14" />
      {/* Wax seal dot */}
      <circle cx="15.5" cy="17" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
TestamentIcon.displayName = "TestamentIcon";
