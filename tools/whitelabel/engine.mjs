#!/usr/bin/env node
/**
 * engine.mjs — Lumio Whitelabel Build Engine
 *
 * Prepares all build artefacts required to package a whitelabeled version
 * of Lumio Desktop.  Run this from the repo root or from tools/whitelabel/.
 *
 * Usage:
 *   node tools/whitelabel/engine.mjs --config <configDir> [options]
 *
 * Options:
 *   --config  <dir>   Path to whitelabel config directory (required)
 *   --validate-only   Validate whitelabel.json; do not produce any files
 *   --repo-root <dir> Override auto-detected repo root
 *   --help            Print usage
 *
 * Steps executed (unless --validate-only):
 *   1. VALIDATE   — parse and validate whitelabel.json against schema.json
 *   2. ICONS      — generate PNG + .ico (and .icns on macOS) from the logo
 *   3. SPLASH     — delegate to lib/splash-patcher.mjs (WL-5); skipped here
 *   4. CONFIG     — copy whitelabel.json + logo to build/whitelabel/
 *   5. METADATA   — write electron-builder.wl.json (extends base config)
 *   6. SIGNAL     — write .whitelabel-active flag file
 *
 * @module engine
 */

import * as fs   from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import Ajv from "ajv";

import { deriveColorPalette }   from "./lib/color-utils.mjs";
import { generateIcons }        from "./lib/icon-generator.mjs";
import { buildCSSOverride }     from "./lib/css-injector.mjs";

// ── Type documentation (JSDoc only — no TypeScript) ──────────────────────────
/**
 * @typedef {{
 *   primaryDark?:       string;
 *   primaryBase:        string;
 *   primaryMedium?:     string;
 *   primaryLight?:      string;
 *   primaryPale?:       string;
 *   primaryGhost?:      string;
 *   primaryForeground?: string;
 * }} WhitelabelColors
 *
 * @typedef {{
 *   file:           string;
 *   height?:        number;
 *   opacity?:       number;
 *   showOnSplash?:  boolean;
 *   useAsAppIcon?:  boolean;
 * }} WhitelabelLogo
 *
 * @typedef {{
 *   companyName:        string;
 *   productName:        string;
 *   appId:              string;
 *   colors:             WhitelabelColors;
 *   titleBarColor?:     string;
 *   splashColor?:       string;
 *   logo?:              WhitelabelLogo;
 *   dashboardMessage?:  string;
 * }} WhitelabelConfig
 */

// ── Path resolution ───────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Find the repo root by walking up from engine.mjs until we find lumio.slnx
 * (the solution file that only exists at the repo root).
 */
function findRepoRoot(startDir) {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, "lumio.slnx"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback: assume engine lives at tools/whitelabel/engine.mjs → ../../ = repo root
  return path.resolve(__dirname, "..", "..");
}

// ── CLI argument parsing ──────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: node engine.mjs --config <configDir> [options]

Options:
  --config <dir>   Path to whitelabel config directory (contains whitelabel.json + logo)
  --validate-only  Validate config only; produce no output files
  --repo-root <dir> Override auto-detected repository root
  --help           Show this help message
`);
  process.exit(0);
}

const configArgIdx = args.indexOf("--config");
if (configArgIdx === -1 || !args[configArgIdx + 1]) {
  console.error("ERROR: --config <dir> is required.");
  process.exit(1);
}

const configArgRaw  = args[configArgIdx + 1];
const validateOnly  = args.includes("--validate-only");

const repoRootArgIdx = args.indexOf("--repo-root");
const repoRoot = repoRootArgIdx !== -1 && args[repoRootArgIdx + 1]
  ? path.resolve(args[repoRootArgIdx + 1])
  : findRepoRoot(__dirname);

const configDir   = path.resolve(configArgRaw);
const desktopDir  = path.join(repoRoot, "src", "lumio-desktop");
const buildDir    = path.join(desktopDir, "build");
const engineDir   = __dirname; // tools/whitelabel/

// ── Logging helpers ───────────────────────────────────────────────────────────

const ok  = (msg) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
const err = (msg) => console.error(`  \x1b[31m✗\x1b[0m ${msg}`);
const hdr = (msg) => console.log(`\n\x1b[36m[${msg}]\x1b[0m`);
const inf = (msg) => console.log(`    ${msg}`);

// ── Step 1: VALIDATE ─────────────────────────────────────────────────────────

async function stepValidate() {
  hdr("1/5  VALIDATE");

  const configFile = path.join(configDir, "whitelabel.json");
  const schemaFile = path.join(engineDir, "schema.json");

  if (!fs.existsSync(configDir)) {
    err(`Config directory not found: ${configDir}`);
    process.exit(1);
  }
  if (!fs.existsSync(configFile)) {
    err(`whitelabel.json not found in: ${configDir}`);
    process.exit(1);
  }
  if (!fs.existsSync(schemaFile)) {
    err(`schema.json not found at: ${schemaFile}`);
    process.exit(1);
  }

  // Parse
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
  } catch (e) {
    err(`whitelabel.json is not valid JSON: ${e.message}`);
    process.exit(1);
  }

  // Validate against JSON Schema (draft-07)
  const schemaRaw = JSON.parse(fs.readFileSync(schemaFile, "utf-8"));
  // AJV v8: remove the $schema meta-declaration to avoid meta-schema resolution
  const schema = { ...schemaRaw };
  delete schema["$schema"];

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  if (!validate(config)) {
    err("whitelabel.json failed schema validation:");
    for (const e of validate.errors ?? []) {
      inf(`• ${e.instancePath || "(root)"}: ${e.message}`);
    }
    process.exit(1);
  }
  ok(`whitelabel.json is valid`);

  // Derive missing color shades from primaryBase
  config.colors = deriveColorPalette(config.colors.primaryBase, config.colors);
  inf(`Colors: ${Object.entries(config.colors).map(([k, v]) => `${k}=${v}`).join(", ")}`);

  // Verify logo file exists (if specified)
  if (config.logo?.file) {
    const logoPath = path.join(configDir, config.logo.file);
    if (!fs.existsSync(logoPath)) {
      err(`Logo file not found: ${logoPath}`);
      process.exit(1);
    }
    ok(`Logo file found: ${config.logo.file}`);
  }

  return config;
}

// ── Step 2: ICONS ────────────────────────────────────────────────────────────

async function stepIcons(config) {
  hdr("2/5  ICONS");

  if (!config.logo?.file) {
    inf("No logo configured — skipping icon generation.");
    inf("electron-builder will use the default Lumio icon files already in build/.");
    return;
  }

  if (config.logo.useAsAppIcon === false) {
    inf("logo.useAsAppIcon is false — skipping icon generation.");
    return;
  }

  const logoPath = path.join(configDir, config.logo.file);
  fs.mkdirSync(buildDir, { recursive: true });

  await generateIcons(logoPath, buildDir);
  ok("Icon generation complete");
}

// ── Step 3: SPLASH ────────────────────────────────────────────────────────────

async function stepSplash(config) {
  hdr("3/5  SPLASH");

  const { patchSplash } = await import("./lib/splash-patcher.mjs");
  const defaultSplash = path.join(buildDir, "splash.html");
  const outSplash     = path.join(buildDir, "whitelabel", "splash.html");

  if (fs.existsSync(defaultSplash)) {
    await patchSplash(defaultSplash, outSplash, config, configDir);
    ok("splash.html patched → build/whitelabel/splash.html");
  } else {
    inf("build/splash.html not found — skipping splash patch (run after TypeScript compilation).");
  }
}

// ── Step 4: CONFIG COPY ──────────────────────────────────────────────────────

async function stepConfigCopy(config) {
  hdr("4/5  CONFIG COPY");

  const wlBuildDir = path.join(buildDir, "whitelabel");
  fs.mkdirSync(wlBuildDir, { recursive: true });

  // Write canonical whitelabel.json (with derived colors + $schema stripped)
  const cleanConfig = { ...config };
  delete cleanConfig["$schema"];
  const configOutPath = path.join(wlBuildDir, "whitelabel.json");
  fs.writeFileSync(configOutPath, JSON.stringify(cleanConfig, null, 2), "utf-8");
  ok(`whitelabel.json → build/whitelabel/whitelabel.json`);

  // Copy logo file (binary)
  if (config.logo?.file) {
    const logoSrc = path.join(configDir, config.logo.file);
    const logoDst = path.join(wlBuildDir, config.logo.file);
    fs.copyFileSync(logoSrc, logoDst);
    ok(`logo → build/whitelabel/${config.logo.file}`);
  }

  // Write the CSS override as a side-channel artefact (useful for debugging)
  const cssOverride = buildCSSOverride(config);
  const cssOutPath  = path.join(wlBuildDir, "override.css");
  fs.writeFileSync(cssOutPath, cssOverride, "utf-8");
  ok(`override.css → build/whitelabel/override.css  (debug reference)`);
}

// ── Step 5: METADATA (electron-builder override config) ──────────────────────

async function stepMetadata(config) {
  hdr("5/5  METADATA");

  // Write a minimal electron-builder override config that:
  //   • Overrides appId and productName with company values
  //   • Adds build/whitelabel/ as an extraResource so the runtime engine
  //     finds whitelabel.json at process.resourcesPath/whitelabel/
  //
  // Passed to electron-builder with: --config electron-builder.wl.json
  // The `extends` field tells electron-builder to merge this over the base config.
  //
  // Note: electron-builder merges scalar fields (appId, productName) but REPLACES
  // arrays (extraResources).  We therefore include ALL extraResources entries here.

  const overrideConfig = {
    extends: "./electron-builder.yml",
    appId:       config.appId,
    productName: config.productName,
    copyright:   `Copyright © ${new Date().getFullYear()} ${config.companyName}`,
    // Arrays are replaced (not merged) by electron-builder's extends mechanism.
    // We must include the original backend/frontend entries here.
    extraResources: [
      {
        from: "../../dist/backend",
        to:   "../backend",
        filter: ["**/*"],
      },
      {
        from: "../../dist/frontend",
        to:   "../frontend",
        filter: ["**/*"],
      },
      {
        from: "build/whitelabel/",
        to:   "whitelabel/",
        filter: ["**/*"],
      },
    ],
    // Windows: use the whitelabel icon
    win: config.logo?.useAsAppIcon !== false && config.logo?.file
      ? { icon: "build/icon.ico" }
      : undefined,
    // macOS: use the whitelabel icon (if generated)
    mac: config.logo?.useAsAppIcon !== false && process.platform === "darwin"
      ? { icon: "build/icon.icns" }
      : undefined,
  };

  // Remove undefined values (JSON.stringify would include null; we want omission)
  if (!overrideConfig.win)  delete overrideConfig.win;
  if (!overrideConfig.mac)  delete overrideConfig.mac;

  const overridePath = path.join(desktopDir, "electron-builder.wl.json");
  fs.writeFileSync(overridePath, JSON.stringify(overrideConfig, null, 2), "utf-8");
  ok(`electron-builder.wl.json written`);
  inf(`  appId:       ${config.appId}`);
  inf(`  productName: ${config.productName}`);

  // Write .whitelabel-active flag — build.ps1 reads this to decide which
  // electron-builder config to use.
  const flagPath = path.join(desktopDir, ".whitelabel-active");
  fs.writeFileSync(flagPath, config.companyName, "utf-8");
  ok(`.whitelabel-active flag written`);

  // Convenience: also write a JSON summary for CI/CD systems
  const summaryPath = path.join(buildDir, "whitelabel", "build-info.json");
  const summary = {
    engineVersion:   "1.0.0",
    generatedAt:     new Date().toISOString(),
    companyName:     config.companyName,
    productName:     config.productName,
    appId:           config.appId,
    logoFile:        config.logo?.file ?? null,
    useAsAppIcon:    config.logo?.useAsAppIcon ?? true,
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf-8");
  ok(`build-info.json → build/whitelabel/build-info.json`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n\x1b[36m╔══════════════════════════════════════════╗\x1b[0m");
  console.log(  "\x1b[36m║   Lumio Whitelabel Engine  v1.0.0        ║\x1b[0m");
  console.log(  "\x1b[36m╚══════════════════════════════════════════╝\x1b[0m");
  console.log(`  Config dir:  ${configDir}`);
  console.log(`  Repo root:   ${repoRoot}`);
  if (validateOnly) console.log("  Mode:        validate-only");

  try {
    const config = await stepValidate();

    if (validateOnly) {
      console.log("\n\x1b[32mValidation passed.\x1b[0m\n");
      process.exit(0);
    }

    await stepIcons(config);
    await stepSplash(config);
    await stepConfigCopy(config);
    await stepMetadata(config);

    console.log("\n\x1b[32m╔══════════════════════════════════════════╗\x1b[0m");
    console.log(  "\x1b[32m║   Engine complete — all steps passed ✓   ║\x1b[0m");
    console.log(  "\x1b[32m╚══════════════════════════════════════════╝\x1b[0m\n");
    console.log("Next step:");
    console.log("  .\\tools\\build.ps1 -Whitelabel \"<configDir>\"\n");

  } catch (e) {
    err(`Unexpected error: ${e.message}`);
    if (process.env.DEBUG) console.error(e.stack);
    process.exit(1);
  }
}

main();
