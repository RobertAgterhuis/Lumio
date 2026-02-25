import type { SVGProps } from "react";

/**
 * Shared shield base path — symmetrical shield with flat top, flared sides,
 * and a soft rounded bottom point. Slightly rounder than Lucide's shield to
 * match Lumio's `--radius-md` design language.
 *
 * Used as the foundation for all four shield variant icons.
 */
const shieldPath =
  "M12 2 L20 5.5 L20 12.5 C20 17.2 16.5 21 12 22.5 C7.5 21 4 17.2 4 12.5 L4 5.5 Z";

// ─── Shield (neutral) ─────────────────────────────────────────────────────────

/**
 * Shield — neutral / protected state.
 * Shield base with no inner symbol.
 */
export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d={shieldPath} />
    </svg>
  );
}
ShieldIcon.displayName = "ShieldIcon";

// ─── Shield Check ─────────────────────────────────────────────────────────────

/**
 * Shield Check — secure / verified state.
 * Shield base + rounded check mark inside.
 */
export function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d={shieldPath} />
      {/* Check mark — centred slightly below shield mid */}
      <path d="M9 12.5 L11 14.5 L15 10.5" />
    </svg>
  );
}
ShieldCheckIcon.displayName = "ShieldCheckIcon";

// ─── Shield Alert ─────────────────────────────────────────────────────────────

/**
 * Shield Alert — warning state.
 * Shield base + exclamation mark (line + dot) inside.
 */
export function ShieldAlertIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d={shieldPath} />
      {/* Exclamation vertical line */}
      <line x1="12" y1="9" x2="12" y2="14.5" />
      {/* Exclamation dot */}
      <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
ShieldAlertIcon.displayName = "ShieldAlertIcon";

// ─── Shield X ────────────────────────────────────────────────────────────────

/**
 * Shield X — critical / blocked / failed state.
 * Shield base + rounded X (two diagonal lines) inside.
 */
export function ShieldXIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d={shieldPath} />
      {/* X — two crossing diagonals */}
      <line x1="9.5" y1="10.5" x2="14.5" y2="15.5" />
      <line x1="14.5" y1="10.5" x2="9.5" y2="15.5" />
    </svg>
  );
}
ShieldXIcon.displayName = "ShieldXIcon";
