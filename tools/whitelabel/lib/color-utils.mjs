/**
 * color-utils.mjs — Hex color helpers for the whitelabel engine.
 *
 * Provides:
 *  - hexToRgb / rgbToHex conversions
 *  - RGB ↔ HSL conversions
 *  - deriveColorPalette(primaryBase) — auto-generates all 6 palette shades
 *    when only primaryBase is specified in whitelabel.json
 */

// ── Conversion helpers ────────────────────────────────────────────────────────

/** Parse a 3- or 6-digit hex string to {r, g, b} (0–255). */
export function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full  = clean.length === 3
    ? clean.split("").map(c => c + c).join("")
    : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Format {r, g, b} (0–255) to a lowercase 6-digit hex string. */
export function rgbToHex({ r, g, b }) {
  return "#" + [r, g, b]
    .map(v => Math.max(0, Math.min(255, Math.round(v)))
      .toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convert {r, g, b} (0–255) to {h (0–360), s (0–100), l (0–100)}.
 * Uses the standard HSL algorithm.
 */
export function rgbToHsl({ r, g, b }) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (delta > 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if      (max === rn) h = ((gn - bn) / delta + 6) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else                 h = (rn - gn) / delta + 4;
    h = h * 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

/**
 * Convert {h (0–360), s (0–100), l (0–100)} to {r, g, b} (0–255).
 */
export function hslToRgb({ h, s, l }) {
  const sn = s / 100, ln = l / 100;
  const c  = (1 - Math.abs(2 * ln - 1)) * sn;
  const x  = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m  = ln - c / 2;
  let r = 0, g = 0, b = 0;

  if      (h <  60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }

  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  };
}

/**
 * Return a new hex color with its HSL lightness clamped to `targetL` (0–100).
 */
export function setLightness(hex, targetL) {
  const hsl = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb({ ...hsl, l: Math.max(0, Math.min(100, targetL)) }));
}

/**
 * Slightly darken or lighten a hex color by shifting HSL lightness by `delta`.
 * Positive delta → lighter; negative delta → darker.
 */
export function shiftLightness(hex, delta) {
  const hsl = rgbToHsl(hexToRgb(hex));
  return setLightness(hex, hsl.l + delta);
}

// ── Palette derivation ────────────────────────────────────────────────────────

/**
 * Derive all six palette shades from a single `primaryBase` hex color.
 *
 * The strategy follows the Tailwind palette pattern:
 *   - primaryDark   → −10 lightness (darkest, used for 700)
 *   - primaryBase   → unchanged (used for primary / 600 / sidebar-active)
 *   - primaryMedium → +10 lightness (used for 500 / accent / ring)
 *   - primaryLight  → +22 lightness (used for 400)
 *   - primaryPale   → +38 lightness, reduced saturation (used for 100)
 *   - primaryGhost  → +46 lightness, very low saturation (used for 50 / bg)
 *
 * All derived values respect the [0, 100] lightness clamp.
 * Returns only the fields that are *not* already set in `existingColors`.
 */
export function deriveColorPalette(primaryBase, existingColors = {}) {
  const hsl = rgbToHsl(hexToRgb(primaryBase));

  function derive(deltaL, deltaSPct = 0) {
    const newL = Math.max(5, Math.min(95, hsl.l + deltaL));
    const newS = Math.max(0, Math.min(100, hsl.s * (1 + deltaSPct)));
    return rgbToHex(hslToRgb({ h: hsl.h, s: newS, l: newL }));
  }

  const defaults = {
    primaryDark:        derive(-10),
    primaryBase,
    primaryMedium:      derive(+10),
    primaryLight:       derive(+22),
    primaryPale:        derive(+38, -0.4),
    primaryGhost:       derive(+46, -0.7),
    primaryForeground:  "#ffffff",
  };

  // Only fill in fields that are absent in the config
  const result = { ...existingColors };
  for (const [key, value] of Object.entries(defaults)) {
    if (!result[key]) result[key] = value;
  }
  return result;
}
