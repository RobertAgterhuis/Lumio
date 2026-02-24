import type { SVGProps } from "react";

/**
 * Noodcontacten icon — a classic telephone handset silhouette (earpiece,
 * grip, mouthpiece) on the left, with a heartbeat/pulse line to the right.
 * Signals emergency + human care.
 *
 * viewBox: 0 0 24 24 | stroke: currentColor | strokeWidth: 1.5
 */
export function NoodcontactenIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Earpiece — top rounded rectangle */}
      <rect x="2.5" y="2.5" width="7" height="5" rx="3.5" />
      {/* Grip — curved handle */}
      <path d="M4 7.5 C3.5 11 3.5 13 4 16.5" />
      {/* Mouthpiece — bottom rounded rectangle */}
      <rect x="2.5" y="16.5" width="7" height="5" rx="3.5" />
      {/* Heartbeat / pulse line */}
      <polyline points="12,12 13.5,12 14.5,9 15.5,15 16.5,10 17.5,14 19,12 21,12" />
    </svg>
  );
}
NoodcontactenIcon.displayName = "NoodcontactenIcon";
