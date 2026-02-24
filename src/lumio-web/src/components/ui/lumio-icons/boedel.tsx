import type { SVGProps } from "react";

/**
 * Boedel icon — a house silhouette inside a rounded portfolio/wallet.
 * Estate as home + assets combined. Personal, warm, tangible.
 *
 * viewBox: 0 0 24 24 | stroke: currentColor | strokeWidth: 1.5
 */
export function BoedelIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Outer portfolio/wallet frame */}
      <rect x="2" y="5" width="20" height="16" rx="2.5" />
      {/* Portfolio clasp / top flap fold */}
      <path d="M2 10 L22 10" />
      <path d="M8 5 L8 3 C8 2.4 8.4 2 9 2 L15 2 C15.6 2 16 2.4 16 3 L16 5" />
      {/* House — inside the wallet body */}
      {/* Roof */}
      <path d="M8 16.5 L12 13 L16 16.5" />
      {/* House walls */}
      <path d="M9 16.5 L9 20 L15 20 L15 16.5" />
      {/* Door */}
      <path d="M10.5 20 L10.5 17.5 C10.5 17.2 10.7 17 11 17 L13 17 C13.3 17 13.5 17.2 13.5 17.5 L13.5 20" />
    </svg>
  );
}
BoedelIcon.displayName = "BoedelIcon";
