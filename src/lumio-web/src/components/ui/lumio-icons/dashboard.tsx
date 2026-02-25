import type { SVGProps } from "react";

/**
 * Dashboard icon — 2×2 grid of rounded tiles.
 * Top-left tile is the lead/accent tile (slightly larger).
 * Conveys: overview, structure, home base.
 *
 * viewBox: 0 0 24 24 | stroke: currentColor | strokeWidth: 1.5
 */
export function DashboardIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Lead tile — top-left, larger */}
      <rect x="3" y="3" width="10" height="10" rx="2" />
      {/* Top-right tile */}
      <rect x="15" y="3" width="6" height="4.5" rx="1.5" />
      {/* Mid-right tile */}
      <rect x="15" y="9.5" width="6" height="3.5" rx="1.5" />
      {/* Bottom-left tile */}
      <rect x="3" y="15" width="5" height="6" rx="1.5" />
      {/* Bottom-right tile — wider */}
      <rect x="10" y="15" width="11" height="6" rx="1.5" />
    </svg>
  );
}
DashboardIcon.displayName = "DashboardIcon";
