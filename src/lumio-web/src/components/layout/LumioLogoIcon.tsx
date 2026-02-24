/**
 * LumioLogoIcon
 *
 * A small custom SVG brand mark placed before the "Lumio" wordmark in the sidebar.
 *
 * Design concept: "Lumen" (light) — a stylised flame/leaf that rises from a
 * circular base, evoking continuity, warmth and legacy. Built exclusively from
 * design-system token values:
 *
 *   --base-primary-500  #4F7A83   inner flame top
 *   --base-primary-400  #7A9EA6   inner flame mid / outer ring stroke
 *   --base-primary-300  #A5C2C9   outer flame highlight
 *   --base-primary-200  #C8DDE1   base circle fill
 *   --base-sage-500     #84A793   right-leaf accent
 *
 * The icon follows the 8pt grid: default size = 32×32 px (--space-5 equivalent).
 * Pass `size` to override.
 */

interface LumioLogoIconProps {
  /** Width/height in px. Follows the 8pt grid — multiples of 8 recommended. */
  size?: number;
  className?: string;
}

export function LumioLogoIcon({ size = 32, className }: LumioLogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        {/* Flame fill: primary-500 → primary-300 (bottom → top) */}
        <linearGradient id="logo-flame" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%"   stopColor="#4F7A83" />
          <stop offset="100%" stopColor="#A5C2C9" />
        </linearGradient>

        {/* Circle base: primary-200 → primary-100 */}
        <radialGradient id="logo-base" cx="50%" cy="55%" r="50%">
          <stop offset="0%"   stopColor="#C8DDE1" stopOpacity="1" />
          <stop offset="100%" stopColor="#E6EFF1" stopOpacity="1" />
        </radialGradient>

        {/* Soft inner glow on flame */}
        <filter id="logo-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Base circle ── */}
      <circle
        cx="16"
        cy="19"
        r="10"
        fill="url(#logo-base)"
        stroke="#7A9EA6"
        strokeWidth="1"
        strokeOpacity="0.45"
      />

      {/* ── Main flame — primary-500→primary-300 ──
           A teardrop path rising from the base centre toward the top */}
      <path
        d="M16 4
           C16 4 9.5 11 9.5 16.5
           C9.5 20.1 12.5 22.5 16 22.5
           C19.5 22.5 22.5 20.1 22.5 16.5
           C22.5 11 16 4 16 4Z"
        fill="url(#logo-flame)"
        filter="url(#logo-glow)"
      />

      {/* ── Inner highlight — primary-200 teardrop ──
           Creates the glassy "lit" appearance */}
      <path
        d="M16 8
           C16 8 12.5 13 12.5 16.5
           C12.5 18.4 14 19.5 15.5 19.5
           C15.5 15 16 8 16 8Z"
        fill="#C8DDE1"
        fillOpacity="0.55"
      />

      {/* ── Sage accent leaf — right side of flame ──
           sage-500 (#84A793) subtle secondary tone */}
      <path
        d="M18.5 12
           C20 13.5 21 15.5 21 17
           C21 18.2 20.3 19 19.5 19.5
           C20.5 17.5 19.5 14.5 18.5 12Z"
        fill="#84A793"
        fillOpacity="0.40"
      />
    </svg>
  );
}
