/**
 * AuthBackground
 *
 * Minimal, app-consistent backgrounds for the two auth-flow pages.
 * Visual language matches the authenticated app: flat neutral base,
 * structured geometry, no decorative blobs.
 *
 *  • "profile" — Profile selector: clean white + very faint dot-grid
 *  • "setup"   — Database setup: white + concentric security arcs + dot grid
 *
 * Token reference (light mode):
 *   --base-primary-50   #F3F7F8
 *   --base-primary-100  #E6EFF1
 *   --base-primary-200  #C8DDE1
 *   --base-primary-300  #A5C2C9
 *   --base-primary-400  #7A9EA6
 *   --base-primary-600  #355E68
 */

interface AuthBackgroundProps {
  variant?: "profile" | "setup";
}

export function AuthBackground({ variant = "profile" }: AuthBackgroundProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {variant === "profile" ? <ProfileBg /> : <SetupBg />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROFILE BACKGROUND  —  "Clean Grid"
   Matches the app's content area: white base, very faint dot-grid echoing
   the structure of a data-management application.
   A single subtle corner gradient adds warmth without decorative distraction.
───────────────────────────────────────────────────────────────────────────── */
function ProfileBg() {
  const DOT_PITCH = 28;
  const COLS = Math.ceil(1440 / DOT_PITCH) + 1;
  const ROWS = Math.ceil(900 / DOT_PITCH) + 1;

  return (
    <svg
      viewBox="0 0 1440 900"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        {/* Base: faint primary-50 → white */}
        <linearGradient id="p-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E6EFF1" />
          <stop offset="100%" stopColor="#F8FAFB" />
        </linearGradient>

        {/* Corner glow — single radial, top-right */}
        <radialGradient id="p-corner" cx="100%" cy="0%" r="55%">
          <stop offset="0%" stopColor="#A5C2C9" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#A5C2C9" stopOpacity="0" />
        </radialGradient>

        {/* Fade mask for dot grid: opaque centre, transparent edges */}
        <radialGradient id="p-dot-fade" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopOpacity="1" />
          <stop offset="100%" stopOpacity="0" />
        </radialGradient>
        <mask id="p-dot-mask">
          <rect width="1440" height="900" fill="url(#p-dot-fade)" />
        </mask>
      </defs>

      {/* Base fill */}
      <rect width="1440" height="900" fill="url(#p-bg)" />

      {/* Subtle corner warmth */}
      <rect width="1440" height="900" fill="url(#p-corner)" />

      {/* Dot grid */}
      <g mask="url(#p-dot-mask)">
        {Array.from({ length: ROWS }, (_, yi) =>
          Array.from({ length: COLS }, (_, xi) => (
            <circle
              key={`${xi}-${yi}`}
              cx={xi * DOT_PITCH}
              cy={yi * DOT_PITCH}
              r="1.2"
              fill="#6B99A3"
              fillOpacity="0.10"
            />
          ))
        )}
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SETUP BACKGROUND  —  "Secure Layer"
   Matches the app's structured feel: white base + concentric arcs from
   below center (visualising encryption rings). Dot grids in corners add
   precision. No blobs — stays consistent with the data-app aesthetic.
───────────────────────────────────────────────────────────────────────────── */
function SetupBg() {
  const ARC_CENTER = { cx: 720, cy: 1100 };
  const arcs = [
    { r: 520, opacity: 0.07 },
    { r: 620, opacity: 0.06 },
    { r: 720, opacity: 0.055 },
    { r: 820, opacity: 0.05 },
    { r: 920, opacity: 0.045 },
    { r: 1020, opacity: 0.04 },
    { r: 1120, opacity: 0.035 },
  ];

  const CORNER_DOTS = [
    // top-left
    ...[48, 96, 144, 192, 240].flatMap((x, xi) =>
      [48, 96, 144, 192, 240].map((y, yi) => ({
        cx: x, cy: y,
        opacity: Math.max(0.04, 0.10 - (xi + yi) * 0.012),
        fill: "#4F7A83",
      }))
    ),
    // top-right
    ...[1392, 1344, 1296, 1248, 1200].flatMap((x, xi) =>
      [48, 96, 144, 192, 240].map((y, yi) => ({
        cx: x, cy: y,
        opacity: Math.max(0.04, 0.10 - (xi + yi) * 0.012),
        fill: "#4F7A83",
      }))
    ),
  ];

  return (
    <svg
      viewBox="0 0 1440 900"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="s-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E6EFF1" />
          <stop offset="100%" stopColor="#F8FAFB" />
        </linearGradient>
      </defs>

      {/* Base fill */}
      <rect width="1440" height="900" fill="url(#s-bg)" />

      {/* Concentric security arcs */}
      {arcs.map(({ r, opacity }) => (
        <circle
          key={r}
          cx={ARC_CENTER.cx}
          cy={ARC_CENTER.cy}
          r={r}
          stroke="#7A9EA6"
          strokeWidth="1"
          fill="none"
          strokeOpacity={opacity}
        />
      ))}

      {/* Corner dot grids */}
      {CORNER_DOTS.map(({ cx, cy, opacity, fill }, i) => (
        <circle key={i} cx={cx} cy={cy} r="1.8" fill={fill} fillOpacity={opacity} />
      ))}
    </svg>
  );
}
