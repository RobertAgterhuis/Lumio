/**
 * AuthBackground
 *
 * Design-system driven SVG backgrounds for the two auth-flow pages:
 *   • "profile"  — Profile selector (calm, welcoming, organic soft blobs)
 *   • "setup"    — Database setup / welcome (structured, secure, concentric arcs)
 *
 * All colors are sourced directly from tokens.css primitives.
 * No raw colours appear in component code — values are taken verbatim from
 * the token architecture layer described in 06-design-system.md.
 *
 * Token reference (light mode):
 *   --base-primary-300  #A5C2C9   --base-primary-200  #C8DDE1
 *   --base-primary-400  #7A9EA6   --base-primary-500  #4F7A83
 *   --base-primary-100  #E6EFF1   --base-primary-50   #F3F7F8
 *   --base-sage-300     #B6D7C5   --base-sage-400     #9DBFAC
 *   --base-sage-500     #84A793
 */

interface AuthBackgroundProps {
  /** Which auth-flow step is active. Defaults to "profile". */
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
   PROFILE BACKGROUND  —  "Soft Horizon"
   Concept: welcoming calm. Organic radial blobs in primary-teal and sage
   evoke still water and sky — peace of mind for digital legacy planning.
   Two gentle flowing arcs hint at continuity across time.
───────────────────────────────────────────────────────────────────────────── */
function ProfileBg() {
  return (
    <svg
      viewBox="0 0 1440 900"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        {/* ── Base gradient: primary-100 → primary-50 (top-to-bottom) ── */}
        <linearGradient id="p-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E6EFF1" />
          <stop offset="100%" stopColor="#F3F7F8" />
        </linearGradient>

        {/* ── Blur filters for soft blob effect ── */}
        <filter id="p-blur-xl" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="90" />
        </filter>
        <filter id="p-blur-lg" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="60" />
        </filter>
        <filter id="p-blur-md" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>

      {/* ── Base fill ── */}
      <rect width="1440" height="900" fill="url(#p-bg)" />

      {/* ── Large teal blob — top-right ──
           primary-300 (#A5C2C9) at 30% → blurred into a soft luminous glow */}
      <circle
        cx="1170"
        cy="120"
        r="340"
        fill="#A5C2C9"
        fillOpacity="0.30"
        filter="url(#p-blur-xl)"
      />

      {/* ── Large sage blob — bottom-left ──
           sage-300 (#B6D7C5) at 26% — earthy calm counterbalance */}
      <circle
        cx="210"
        cy="790"
        r="290"
        fill="#B6D7C5"
        fillOpacity="0.26"
        filter="url(#p-blur-xl)"
      />

      {/* ── Medium teal accent — far right edge ──
           primary-200 (#C8DDE1) at 20% */}
      <circle
        cx="1400"
        cy="500"
        r="180"
        fill="#C8DDE1"
        fillOpacity="0.20"
        filter="url(#p-blur-lg)"
      />

      {/* ── Small sage accent — top-left corner ──
           sage-400 (#9DBFAC) at 18% */}
      <circle
        cx="70"
        cy="190"
        r="130"
        fill="#9DBFAC"
        fillOpacity="0.18"
        filter="url(#p-blur-md)"
      />

      {/* ── Flowing arc 1 — gentle mid-page wave ──
           primary-400 (#7A9EA6) stroke, opacity 16% */}
      <path
        d="M -60 610 C 200 490 480 570 720 495 C 960 420 1160 505 1500 375"
        stroke="#7A9EA6"
        strokeWidth="1.5"
        fill="none"
        strokeOpacity="0.16"
      />

      {/* ── Flowing arc 2 — lower secondary wave ──
           sage-400 (#9DBFAC) stroke, opacity 13% */}
      <path
        d="M -60 755 C 310 655 610 710 900 645 C 1100 600 1310 655 1500 585"
        stroke="#9DBFAC"
        strokeWidth="1"
        fill="none"
        strokeOpacity="0.13"
      />

      {/* ── Vertical accent arc — left side ──
           primary-300 (#A5C2C9) stroke, opacity 11% */}
      <path
        d="M 185 -20 C 290 120 240 280 310 390 C 380 500 325 610 395 700"
        stroke="#A5C2C9"
        strokeWidth="1"
        fill="none"
        strokeOpacity="0.11"
      />

      {/* ── Sparse organic dot nodes ──
           Represent life moments / connections — primary-400 & sage-500 */}
      <circle cx="96"  cy="92"  r="3.5" fill="#7A9EA6" fillOpacity="0.20" />
      <circle cx="148" cy="128" r="2"   fill="#7A9EA6" fillOpacity="0.15" />
      <circle cx="355" cy="275" r="2.5" fill="#84A793" fillOpacity="0.18" />
      <circle cx="920" cy="148" r="2.5" fill="#A5C2C9" fillOpacity="0.16" />
      <circle cx="1200" cy="300" r="3"  fill="#7A9EA6" fillOpacity="0.13" />
      <circle cx="1350" cy="88"  r="4"  fill="#4F7A83" fillOpacity="0.13" />
      <circle cx="1405" cy="118" r="2.5" fill="#4F7A83" fillOpacity="0.10" />
      <circle cx="502"  cy="848" r="3"  fill="#84A793" fillOpacity="0.14" />
      <circle cx="680"  cy="805" r="2"  fill="#9DBFAC" fillOpacity="0.12" />
      <circle cx="1055" cy="782" r="4"  fill="#7A9EA6" fillOpacity="0.14" />
      <circle cx="1108" cy="822" r="2"  fill="#7A9EA6" fillOpacity="0.10" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SETUP BACKGROUND  —  "Secure Layer"
   Concept: trust and structure. Concentric expanding arcs (like encryption
   rings protecting a vault) radiate from below the viewport centre.
   A geometric dot-grid in the upper corners adds ordered precision.
   Blob accents mirror the profile page but are repositioned to feel distinct.
───────────────────────────────────────────────────────────────────────────── */
function SetupBg() {
  return (
    <svg
      viewBox="0 0 1440 900"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        {/* ── Base gradient: diagonal primary-100 → primary-50 → sage tint ── */}
        <linearGradient id="s-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#E6EFF1" />
          <stop offset="60%"  stopColor="#F3F7F8" />
          <stop offset="100%" stopColor="#EEF5F1" />
        </linearGradient>

        {/* ── Blur filters ── */}
        <filter id="s-blur-xl" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="90" />
        </filter>
        <filter id="s-blur-lg" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="55" />
        </filter>
        <filter id="s-blur-md" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="32" />
        </filter>
      </defs>

      {/* ── Base fill ── */}
      <rect width="1440" height="900" fill="url(#s-bg)" />

      {/* ── Large teal blob — top-left ──
           primary-300 (#A5C2C9) at 26% */}
      <circle
        cx="215"
        cy="145"
        r="310"
        fill="#A5C2C9"
        fillOpacity="0.26"
        filter="url(#s-blur-xl)"
      />

      {/* ── Large sage blob — bottom-right ──
           sage-300 (#B6D7C5) at 24% */}
      <circle
        cx="1290"
        cy="810"
        r="285"
        fill="#B6D7C5"
        fillOpacity="0.24"
        filter="url(#s-blur-xl)"
      />

      {/* ── Central accent — softly echoes form card behind ──
           primary-200 (#C8DDE1) at 14% */}
      <circle
        cx="720"
        cy="370"
        r="210"
        fill="#C8DDE1"
        fillOpacity="0.14"
        filter="url(#s-blur-lg)"
      />

      {/* ── Right-edge accent ──
           primary-200 (#C8DDE1) at 18% */}
      <circle
        cx="1430"
        cy="370"
        r="160"
        fill="#C8DDE1"
        fillOpacity="0.18"
        filter="url(#s-blur-md)"
      />

      {/* ─────────────────────────────────────────────
           CONCENTRIC SECURITY ARCS
           Centre point: (720, 1160) — well below viewport.
           Only the upper portion of each ring is visible,
           creating an upward-expanding "protection aura".
           primary-400 → primary-300 (#7A9EA6 → #A5C2C9)
      ───────────────────────────────────────────── */}
      <circle
        cx="720" cy="1160" r="560"
        stroke="#7A9EA6" strokeWidth="1.5" fill="none" strokeOpacity="0.11"
      />
      <circle
        cx="720" cy="1160" r="665"
        stroke="#7A9EA6" strokeWidth="1.2" fill="none" strokeOpacity="0.09"
      />
      <circle
        cx="720" cy="1160" r="770"
        stroke="#9DBFAC" strokeWidth="1.0" fill="none" strokeOpacity="0.08"
      />
      <circle
        cx="720" cy="1160" r="875"
        stroke="#9DBFAC" strokeWidth="0.9" fill="none" strokeOpacity="0.07"
      />
      <circle
        cx="720" cy="1160" r="980"
        stroke="#A5C2C9" strokeWidth="0.8" fill="none" strokeOpacity="0.06"
      />
      <circle
        cx="720" cy="1160" r="1085"
        stroke="#A5C2C9" strokeWidth="0.7" fill="none" strokeOpacity="0.05"
      />

      {/* ─────────────────────────────────────────────
           GEOMETRIC DOT GRID — upper-left corner
           Structured, precise — signals encryption & order.
           primary-500 (#4F7A83) at very low opacity, fading inward.
      ───────────────────────────────────────────── */}
      {/* col × row = 4×4 grid, 64px pitch, top-left origin */}
      {[64, 128, 192, 256].flatMap((x, xi) =>
        [64, 128, 192, 256].map((y, yi) => (
          <circle
            key={`tl-${xi}-${yi}`}
            cx={x}
            cy={y}
            r="2"
            fill="#4F7A83"
            fillOpacity={Math.max(0.04, 0.11 - (xi + yi) * 0.012)}
          />
        ))
      )}

      {/* ── Dot grid — upper-right corner (mirrored) ── */}
      {[1376, 1312, 1248, 1184].flatMap((x, xi) =>
        [64, 128, 192, 256].map((y, yi) => (
          <circle
            key={`tr-${xi}-${yi}`}
            cx={x}
            cy={y}
            r="2"
            fill="#4F7A83"
            fillOpacity={Math.max(0.04, 0.11 - (xi + yi) * 0.012)}
          />
        ))
      )}

      {/* ── Dot grid — bottom-left corner (sage tone) ── */}
      {[64, 128, 192].flatMap((x, xi) =>
        [836, 772, 708].map((y, yi) => (
          <circle
            key={`bl-${xi}-${yi}`}
            cx={x}
            cy={y}
            r="2"
            fill="#84A793"
            fillOpacity={Math.max(0.04, 0.09 - (xi + yi) * 0.01)}
          />
        ))
      )}
    </svg>
  );
}
