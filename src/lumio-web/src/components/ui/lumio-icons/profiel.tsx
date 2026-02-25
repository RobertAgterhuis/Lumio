import type { SVGProps } from "react";

/**
 * Profiel icon — person silhouette with a soft personal halo ring.
 * Conveys: individual, personal sphere, identity.
 *
 * viewBox: 0 0 24 24 | stroke: currentColor | strokeWidth: 1.5
 */
export function ProfielIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Head */}
      <circle cx="12" cy="8" r="3.5" />
      {/* Soft halo ring around head */}
      <circle cx="12" cy="8" r="5.5" strokeOpacity="0.30" strokeDasharray="2 2" />
      {/* Shoulders / torso arc */}
      <path d="M4.5 20.5 C4.5 16.5 7.8 13.5 12 13.5 C16.2 13.5 19.5 16.5 19.5 20.5" />
    </svg>
  );
}
ProfielIcon.displayName = "ProfielIcon";
