import type { SVGProps } from "react";

/**
 * Documenten icon — a document with a dog-ear fold at the top-right corner,
 * a title rule, and two content lines. Approachable, not bureaucratic.
 *
 * viewBox: 0 0 24 24 | stroke: currentColor | strokeWidth: 1.5
 */
export function DocumentenIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Document body — top-right corner folded */}
      <path d="M6 2 L14 2 L18 6 L18 22 L6 22 Z" rx="1" />
      {/* Fold crease lines */}
      <path d="M14 2 L14 6 L18 6" />
      {/* Title rule */}
      <line x1="9" y1="10" x2="15" y2="10" />
      {/* Content line 1 */}
      <line x1="9" y1="13.5" x2="15" y2="13.5" />
      {/* Content line 2 — slightly shorter */}
      <line x1="9" y1="17" x2="13.5" y2="17" />
    </svg>
  );
}
DocumentenIcon.displayName = "DocumentenIcon";
