/**
 * splash-patcher.mjs — Build-time splash screen branding for the whitelabel engine.
 *
 * Reads the standard Lumio `build/splash.html` and produces a whitelabeled copy
 * at `build/whitelabel/splash.html` with the following modifications:
 *
 *   1. Background color  — replaces `#2C4A52` with `config.splashColor`
 *   2. Title element     — `<title>Lumio</title>` → `<title>config.productName</title>`
 *   3. App name text     — `<div class="title">Lumio</div>` → company/product name
 *   4. Tagline text      — `<div class="tagline">Nalatenschap</div>` → second product name word
 *   5. Company logo      — when `logo.showOnSplash === true`, replace the inline SVG
 *                          icon block with a centred `<img>` sourced from the config logo
 *
 * Invoked by engine.mjs step 3 (SPLASH).  All operations are pure string/regex
 * replacements — no HTML parser dependency needed for this well-known template.
 */

import * as fs   from "fs";
import * as path from "path";

/**
 * Produce a whitelabeled copy of `srcHtmlPath` at `destHtmlPath`.
 *
 * @param {string} srcHtmlPath   Absolute path to the original `build/splash.html`.
 * @param {string} destHtmlPath  Absolute path for the patched output.
 * @param {import('../engine.mjs').WhitelabelConfig} config
 * @param {string} configDir     Absolute path to the whitelabel config directory
 *                               (used to resolve logo in the output HTML).
 */
export async function patchSplash(srcHtmlPath, destHtmlPath, config, configDir) {
  if (!fs.existsSync(srcHtmlPath)) {
    throw new Error(`Source splash.html not found: ${srcHtmlPath}`);
  }

  let html = fs.readFileSync(srcHtmlPath, "utf-8");

  // ── 1. Background color ────────────────────────────────────────────────────
  const splashColor = config.splashColor ?? config.colors?.primaryDark ?? "#2C4A52";

  // Replace the body/html background declaration.  The template uses the hex
  // literal `#2C4A52` in exactly one place in the CSS.
  html = html.replace(
    /background:\s*#2C4A52/g,
    `background: ${splashColor}`
  );

  // BrowserWindow backgroundColor is controlled at runtime via splash.ts —
  // we embed the color as a data attribute on <html> so splash.ts can read it
  // without re-parsing the full HTML.
  html = html.replace(
    /<html\b([^>]*)>/,
    `<html$1 data-wl-bg="${splashColor}">`
  );

  // ── 2. <title> ─────────────────────────────────────────────────────────────
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(config.productName)}</title>`
  );

  // ── 3. App name text (.title div) ─────────────────────────────────────────
  // The productName is typically "<Company> <Product>", e.g. "ExampleCorp Nalatenschap".
  // We put the first token in `.title` and the remainder in `.tagline`.
  const nameParts   = config.productName.split(/\s+/);
  const titleText   = nameParts[0] ?? config.companyName;
  const taglineText = nameParts.slice(1).join(" ") || config.companyName;

  html = html.replace(
    /(<div\s+class="title">)[^<]*(<\/div>)/,
    `$1${escapeHtml(titleText)}$2`
  );

  // ── 4. Tagline text ────────────────────────────────────────────────────────
  html = html.replace(
    /(<div\s+class="tagline">)[^<]*(<\/div>)/,
    `$1${escapeHtml(taglineText)}$2`
  );

  // ── 5. Error title (references "Lumio" by name) ───────────────────────────
  html = html.replace(
    /(<div\s+class="error-title">)[^<]*(<\/div>)/,
    `$1${escapeHtml(config.productName)} kon niet worden gestart$2`
  );

  // ── 6. Company logo (optional) ────────────────────────────────────────────
  if (config.logo?.showOnSplash && config.logo?.file && configDir) {
    const logoSrcPath = path.join(configDir, config.logo.file);
    if (fs.existsSync(logoSrcPath)) {
      // Embed as base64 data URI so the patched HTML is self-contained
      const b64    = fs.readFileSync(logoSrcPath).toString("base64");
      const mimeOf = logoMime(config.logo.file);
      const dataUri = `data:${mimeOf};base64,${b64}`;

      const logoHeight = config.logo.height ?? 64;
      const logoOpacity = config.logo.opacity ?? 0.9;

      const logoImg = `<img\n` +
        `        src="${dataUri}"\n` +
        `        alt="${escapeAttr(config.companyName)}"\n` +
        `        style="height:${logoHeight * 2}px;width:auto;opacity:${logoOpacity};` +
        `display:block;user-select:none;-webkit-user-drag:none;"\n` +
        `        draggable="false"\n` +
        `      />`;

      // Replace the entire .icon <div> block (opening tag through its closing </div>)
      // The icon div contains one inline <svg> element.
      html = html.replace(
        /<!-- Icon:.*?-->\s*<div class="icon">[\s\S]*?<\/div>/,
        `<!-- Company logo (whitelabel) -->\n    <div class="icon" style="width:auto;height:auto;border-radius:0;overflow:visible;filter:none;">\n      ${logoImg}\n    </div>`
      );

      console.log(`  [splash] Company logo embedded (${config.logo.file}, ${logoHeight * 2}px)`);
    } else {
      console.warn(`  [splash] logo.showOnSplash is true but logo file not found: ${logoSrcPath}`);
    }
  }

  // ── Write output ───────────────────────────────────────────────────────────
  fs.mkdirSync(path.dirname(destHtmlPath), { recursive: true });
  fs.writeFileSync(destHtmlPath, html, "utf-8");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function logoMime(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".svg":  return "image/svg+xml";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".webp": return "image/webp";
    default:      return "image/png";
  }
}
