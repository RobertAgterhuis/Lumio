/**
 * whitelabel.ts — Runtime Whitelabeling Engine for Lumio Desktop
 *
 * Loads an optional `resources/whitelabel/whitelabel.json` config and injects
 * CSS custom-property overrides into the renderer via webContents.insertCSS().
 *
 * This module has NO effect when the config file is absent — the app renders
 * with the default Lumio teal branding in that case.
 *
 * CSS strategy:
 *   Tailwind v4 exposes all brand colors as CSS custom properties on :root
 *   (e.g. --color-primary, --color-primary-700, --color-sidebar-active, …).
 *   Overriding these variables with !important at author-origin repaints every
 *   component that references them, without touching any React/Next.js code.
 *
 * Constraint: src/lumio-web and src/Lumio.Api must NOT be modified.
 */

import * as fs from "fs";
import * as path from "path";
import { app, BrowserWindow, ipcMain } from "electron";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WhitelabelColors {
  /** Darkest shade — replaces --color-primary-700. */
  primaryDark?: string;
  /** Base brand color — required. Replaces --color-primary and --color-primary-600. */
  primaryBase: string;
  /** Medium shade — replaces --color-primary-500, --color-accent, --color-ring. */
  primaryMedium?: string;
  /** Light shade — replaces --color-primary-400. */
  primaryLight?: string;
  /** Pale tint — replaces --color-primary-100. */
  primaryPale?: string;
  /** Ghost tint — replaces --color-primary-50 and --color-background. */
  primaryGhost?: string;
  /** Foreground color used on brand-colored surfaces (default: #ffffff). */
  primaryForeground?: string;
}

export interface WhitelabelLogo {
  /** Filename relative to the whitelabel config directory (e.g. "logo.svg"). */
  file: string;
  /** Rendered height in pixels (16–128, default: 32). */
  height?: number;
  /** Opacity (0.1–1.0, default: 0.7). */
  opacity?: number;
  /** Whether to show the logo on the splash screen (default: false). */
  showOnSplash?: boolean;
  /** Whether to use the logo as the app window icon (default: false). */
  useAsAppIcon?: boolean;
}

export interface WhitelabelConfig {
  companyName: string;
  productName: string;
  appId: string;
  colors: WhitelabelColors;
  /** Windows title-bar overlay background color (hex). */
  titleBarColor?: string;
  /** Windows title-bar symbol (min/max/close) color (hex, default: #E6EFF1). */
  titleBarSymbolColor?: string;
  /** Splash screen background color (hex). */
  splashColor?: string;
  logo?: WhitelabelLogo;
  /** Optional footer message shown on the Dashboard page only (max 320 chars). */
  dashboardMessage?: string;
}

// ── Module-level cache ────────────────────────────────────────────────────────

let _loadAttempted = false;
let _config: WhitelabelConfig | null = null;
/** Absolute path to the directory that contains whitelabel.json and the logo. */
let _configDir: string | null = null;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Load the whitelabel config from the packaged resources directory.
 *
 * Path (packaged): <resources>/whitelabel/whitelabel.json
 * Path (dev):      not present → returns null (standard Lumio branding)
 *
 * The result is cached after the first call; safe to call multiple times.
 */
export function loadWhitelabelConfig(): WhitelabelConfig | null {
  if (_loadAttempted) return _config;
  _loadAttempted = true;

  // Resolve candidate paths in priority order:
  //   1. Packaged app  — resources/whitelabel/whitelabel.json
  //   2. Dev mode      — build/whitelabel/whitelabel.json  (written by the engine)
  const candidates: string[] = [
    path.join(process.resourcesPath, "whitelabel", "whitelabel.json"),
  ];

  if (!app.isPackaged) {
    // __dirname is e.g. …/src/lumio-desktop/dist/main in dev; build/ is a sibling of dist/
    candidates.push(
      path.join(__dirname, "..", "..", "build", "whitelabel", "whitelabel.json")
    );
  }

  const configPath = candidates.find((candidate) => fs.existsSync(candidate));

  if (!configPath) {
    console.log("[whitelabel] No config found — using default Lumio branding.");
    return null;
  }

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    _config = JSON.parse(raw) as WhitelabelConfig;
    _configDir = path.dirname(configPath);
    console.log(
      `[whitelabel] Loaded config for: ${_config.companyName}` +
      (app.isPackaged ? "" : " (dev mode)")
    );
    return _config;
  } catch (err) {
    console.error("[whitelabel] Failed to parse whitelabel.json:", err);
    return null;
  }
}

/**
 * Absolute path to the whitelabel config directory (contains logo file, etc.).
 * Returns null when no config is loaded.
 */
export function getWhitelabelConfigDir(): string | null {
  return _configDir;
}

/**
 * Build a CSS string that overrides all Tailwind v4 primary-brand custom
 * properties to the company colors.
 *
 * Two selectors are emitted:
 *   :root  — covers light-mode (and base) variables
 *   .dark  — covers dark-mode; backgrounds/accents are intentionally excluded
 *            so that dark-mode structural colors (page bg, etc.) are preserved
 */
export function buildCSSOverride(config: WhitelabelConfig): string {
  const c = config.colors;

  /**
   * Produce one CSS selector block.
   * @param selector   CSS selector string, e.g. ":root"
   * @param includeGhost  Whether to override background/ghost vars (light=true, dark=false)
   * @param includeAccent Whether to override accent/ring vars  (light=true, dark=false)
   */
  function makeBlock(
    selector: string,
    includeGhost: boolean,
    includeAccent: boolean
  ): string {
    const declarations: string[] = [];

    const decl = (cssVar: string, value: string | undefined): void => {
      if (value) declarations.push(`  ${cssVar}: ${value} !important;`);
    };

    // ── Darkest shade ────────────────────────────────────────────────────────
    decl("--color-primary-700", c.primaryDark);

    // ── Base / mid-dark ──────────────────────────────────────────────────────
    decl("--color-primary",          c.primaryBase);
    decl("--color-primary-600",      c.primaryBase);
    decl("--color-sidebar-active",   c.primaryBase);

    // ── Medium ───────────────────────────────────────────────────────────────
    decl("--color-primary-500", c.primaryMedium);
    if (includeAccent) {
      decl("--color-accent",  c.primaryMedium);
      decl("--color-ring",    c.primaryMedium);
    }

    // ── Light / pale ─────────────────────────────────────────────────────────
    decl("--color-primary-400", c.primaryLight);
    decl("--color-primary-100", c.primaryPale);

    // ── Ghost / background  ──────────────────────────────────────────────────
    if (includeGhost) {
      decl("--color-primary-50",  c.primaryGhost);
      decl("--color-background",  c.primaryGhost);
    }

    // ── Foreground ───────────────────────────────────────────────────────────
    const fg = c.primaryForeground ?? "#ffffff";
    declarations.push(`  --color-primary-foreground: ${fg} !important;`);
    declarations.push(`  --color-sidebar-active-foreground: ${fg} !important;`);

    if (declarations.length === 0) return "";
    return `${selector} {\n${declarations.join("\n")}\n}`;
  }

  const lightBlock = makeBlock(":root", true, true);
  const darkBlock  = makeBlock(".dark", false, false);

  return [lightBlock, darkBlock].filter(Boolean).join("\n\n");
}

/**
 * Register a `did-finish-load` handler that injects the brand-color CSS
 * override into the renderer via webContents.insertCSS().
 *
 * No-op when config is null.
 * Safe to call before the window is shown.
 *
 * NOTE: Title-bar overlay branding is handled separately by
 * applyWhitelabelTitleBar(), which must be called after the existing
 * applyTitleBarOverlay() in index.ts so the brand color wins.
 */
export function applyWhitelabelCSS(
  win: BrowserWindow,
  config: WhitelabelConfig | null
): void {
  if (!config) return;

  const css = buildCSSOverride(config);

  // Inject CSS on every page load (handles hard refreshes).
  // insertCSS() with cssOrigin:'author' has higher specificity than UA styles,
  // and combined with !important, it reliably overrides Tailwind v4's @theme.
  win.webContents.on("did-finish-load", () => {
    if (css) {
      win.webContents
        .insertCSS(css, { cssOrigin: "author" })
        .catch((err: unknown) =>
          console.error("[whitelabel] insertCSS failed:", err)
        );
    }
  });
}

/**
 * Apply the whitelabel brand color to the Windows title-bar overlay.
 *
 * This must be called AFTER the existing applyTitleBarOverlay() so the brand
 * color takes precedence over the default Lumio teal.  Also call it in the
 * setupThemeSync callback so OS theme changes do not revert to teal.
 *
 * No-op when config is null, when config.titleBarColor is not set, or on
 * platforms other than Windows.
 */
export function applyWhitelabelTitleBar(
  win: BrowserWindow | null,
  config: WhitelabelConfig | null
): void {
  if (!config?.titleBarColor || !win || process.platform !== "win32") return;
  win.setTitleBarOverlay({
    color: config.titleBarColor,
    symbolColor: config.titleBarSymbolColor ?? "#E6EFF1",
    height: 36,
  });
}

// ── IPC handlers for the preload overlay ─────────────────────────────────────

/**
 * Shape returned to the preload's `whitelabel:get-logo` sendSync call.
 * The `dataUrl` is a base64 data URI the preload uses as an <img> src.
 */
export interface LogoIpcPayload {
  dataUrl: string;
  height: number;
  opacity: number;
}

/** Resolve the MIME type for a logo file path based on its extension. */
function logoMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".svg":  return "image/svg+xml";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".webp": return "image/webp";
    default:      return "image/png";
  }
}

/**
 * Register synchronous IPC handlers that the preload calls via `sendSync`
 * to retrieve whitelabel data before the page JS runs.
 *
 * Must be called once during app.whenReady(), before the first window is
 * created.  Safe to call when no config is loaded — handlers return null.
 *
 * Channels:
 *   whitelabel:get-logo    → LogoIpcPayload | null
 *   whitelabel:get-message → string | null
 *   whitelabel:get-name    → string | null
 */
export function registerWhitelabelIpcHandlers(): void {
  // ── Logo ─────────────────────────────────────────────────────────────────
  ipcMain.on("whitelabel:get-logo", (event) => {
    if (!_config?.logo || !_configDir) {
      event.returnValue = null;
      return;
    }
    const logoPath = path.join(_configDir, _config.logo.file);
    if (!fs.existsSync(logoPath)) {
      console.warn(`[whitelabel] Logo file not found: ${logoPath}`);
      event.returnValue = null;
      return;
    }
    try {
      const b64 = fs.readFileSync(logoPath).toString("base64");
      const mime = logoMimeType(logoPath);
      const payload: LogoIpcPayload = {
        dataUrl: `data:${mime};base64,${b64}`,
        height:  _config.logo.height  ?? 32,
        opacity: _config.logo.opacity ?? 0.7,
      };
      event.returnValue = payload;
    } catch (err) {
      console.error("[whitelabel] Failed to read logo file:", err);
      event.returnValue = null;
    }
  });

  // ── Dashboard message ─────────────────────────────────────────────────────
  ipcMain.on("whitelabel:get-message", (event) => {
    event.returnValue = _config?.dashboardMessage ?? null;
  });

  // ── Company name ──────────────────────────────────────────────────────────
  ipcMain.on("whitelabel:get-name", (event) => {
    event.returnValue = _config?.companyName ?? null;
  });
}
