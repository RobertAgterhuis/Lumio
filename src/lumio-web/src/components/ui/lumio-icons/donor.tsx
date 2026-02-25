import type { SVGProps } from "react";

/**
 * Donor icon — a filled heart with a leaf sprout growing from the top cleft.
 * Life as gift — donation giving life continuation. Warm, full, generous.
 *
 * viewBox: 0 0 24 24 | fill: currentColor (heart) + stroke (sprout)
 */
export function DonorIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Filled heart */}
      <path
        d="M12 21 C12 21 3 15 3 9 C3 6.2 5.2 4 8 4.8 C9.5 5.2 11 6.5 12 8 C13 6.5 14.5 5.2 16 4.8 C18.8 4 21 6.2 21 9 C21 15 12 21 12 21Z"
        fill="currentColor"
        stroke="none"
      />
      {/* Sprout stem from top cleft */}
      <path d="M12 8 L12 2.5" strokeWidth="1.25" />
      {/* Left leaf */}
      <path d="M12 5.5 C10.5 5 9.5 3.5 10.5 2.5" strokeWidth="1.25" />
      {/* Right leaf */}
      <path d="M12 4 C13.5 3.5 14.5 2 13.5 1.5" strokeWidth="1.25" />
    </svg>
  );
}
DonorIcon.displayName = "DonorIcon";
