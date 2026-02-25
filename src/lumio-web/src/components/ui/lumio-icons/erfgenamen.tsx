import type { SVGProps } from "react";

/**
 * Erfgenamen icon — two person silhouettes in the same design language as
 * `profiel`: a larger primary person and a smaller secondary person overlapping
 * to the right. Depth through size, not opacity.
 *
 * viewBox: 0 0 24 24 | stroke: currentColor | strokeWidth: 1.5
 */
export function ErfgenamenIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Secondary person (right, slightly behind — drawn first) */}
      {/* Head */}
      <circle cx="16.5" cy="9" r="2.5" />
      {/* Shoulders */}
      <path d="M11.5 20.5 C11.5 17.5 13.7 15.5 16.5 15.5 C19.3 15.5 21.5 17.5 21.5 20.5" />

      {/* Primary person (left, larger — drawn on top) */}
      {/* Head */}
      <circle cx="9" cy="7.5" r="3.5" />
      {/* Shoulders */}
      <path d="M2.5 20.5 C2.5 16.5 5.3 13.5 9 13.5 C12.7 13.5 15.5 16.5 15.5 20.5" />
    </svg>
  );
}
ErfgenamenIcon.displayName = "ErfgenamenIcon";
