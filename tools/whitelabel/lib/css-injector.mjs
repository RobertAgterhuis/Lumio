/**
 * css-injector.mjs — Build-time CSS override generator for the whitelabel engine.
 *
 * Mirrors the TypeScript buildCSSOverride() in src/lumio-desktop/src/main/whitelabel.ts
 * but runs at build time, allowing the generated CSS to be bundled or inspected.
 *
 * Usage:
 *   import { buildCSSOverride } from './lib/css-injector.mjs';
 *   const css = buildCSSOverride(config);   // returns a CSS string
 */

/**
 * Generate a CSS string that overrides all Tailwind v4 brand custom properties.
 *
 * Two selectors:
 *   :root  — light mode + base variables (full override including backgrounds)
 *   .dark  — dark mode brand colors only (preserves dark structural colors)
 *
 * @param {import('../engine.mjs').WhitelabelConfig} config
 * @returns {string}
 */
export function buildCSSOverride(config) {
  const c = config.colors;

  /**
   * @param {string}  selector
   * @param {boolean} includeGhost   — whether to override background/ghost vars
   * @param {boolean} includeAccent  — whether to override accent/ring vars
   */
  function makeBlock(selector, includeGhost, includeAccent) {
    const decl = [];
    const add = (cssVar, value) => { if (value) decl.push(`  ${cssVar}: ${value} !important;`); };

    add("--color-primary-700",              c.primaryDark);
    add("--color-primary",                  c.primaryBase);
    add("--color-primary-600",              c.primaryBase);
    add("--color-sidebar-active",           c.primaryBase);
    add("--color-primary-500",              c.primaryMedium);
    if (includeAccent) {
      add("--color-accent",                 c.primaryMedium);
      add("--color-ring",                   c.primaryMedium);
    }
    add("--color-primary-400",              c.primaryLight);
    add("--color-primary-100",              c.primaryPale);
    if (includeGhost) {
      add("--color-primary-50",             c.primaryGhost);
      add("--color-background",             c.primaryGhost);
    }
    const fg = c.primaryForeground ?? "#ffffff";
    decl.push(`  --color-primary-foreground: ${fg} !important;`);
    decl.push(`  --color-sidebar-active-foreground: ${fg} !important;`);

    if (decl.length === 0) return "";
    return `${selector} {\n${decl.join("\n")}\n}`;
  }

  return [
    makeBlock(":root",  true,  true),
    makeBlock(".dark",  false, false),
  ].filter(Boolean).join("\n\n");
}
