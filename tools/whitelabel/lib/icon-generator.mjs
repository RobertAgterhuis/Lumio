/**
 * icon-generator.mjs — Resize a logo into all icon formats required by electron-builder.
 *
 * Reads the source logo (SVG, PNG, JPG, or WebP) with `sharp` and produces:
 *   - PNG files at standard sizes in <outDir>/icons/
 *   - A multi-size Windows .ico file at <outDir>/icon.ico
 *   - macOS .icns is skipped on non-macOS hosts (iconutil is macOS-only);
 *     a note is printed to stdout.
 *
 * The output paths match the values referenced in electron-builder.yml.
 *
 * @module icon-generator
 */

import sharp    from "sharp";
import pngToIco  from "png-to-ico";
import * as fs   from "fs";
import * as path from "path";

/** PNG sizes generated for all platforms. */
const PNG_SIZES = [16, 24, 32, 48, 64, 128, 256, 512];

/** Sizes embedded in the Windows .ico (subset of PNG_SIZES). */
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];

/**
 * Generate all icon assets for a whitelabeled build.
 *
 * @param {string} logoPath   Absolute path to the source logo file.
 * @param {string} outDir     Absolute path to the Electron `build/` directory
 *                            (e.g. `src/lumio-desktop/build`).
 * @returns {Promise<void>}
 */
export async function generateIcons(logoPath, outDir) {
  if (!fs.existsSync(logoPath)) {
    throw new Error(`Logo file not found: ${logoPath}`);
  }

  const iconsDir = path.join(outDir, "icons");
  fs.mkdirSync(iconsDir, { recursive: true });

  console.log(`  [icons] Source: ${path.basename(logoPath)}`);

  // ── PNG files ───────────────────────────────────────────────────────────────
  const pngBuffers = {};

  for (const size of PNG_SIZES) {
    const buf = await sharp(logoPath)
      .resize(size, size, {
        fit:        "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // transparent background
      })
      .png({ compressionLevel: 9 })
      .toBuffer();

    pngBuffers[size] = buf;
    // Write both naming conventions:
    //   NxN.png — electron-builder Linux convention; also overwrites existing Lumio icons
    //   N.png   — used internally when composing .ico
    const outPath   = path.join(iconsDir, `${size}x${size}.png`);
    const outPathAlt = path.join(iconsDir, `${size}.png`);
    fs.writeFileSync(outPath, buf);
    fs.writeFileSync(outPathAlt, buf);
    console.log(`  [icons] ${size}×${size} PNG → build/icons/${size}x${size}.png`);
  }

  // Copy 256.png to the root build/ dir as well (some electron-builder configs
  // reference build/icons/256.png, others just build/icon.png).
  const icon256 = path.join(outDir, "icon.png");
  fs.writeFileSync(icon256, pngBuffers[256]);
  console.log(`  [icons] 256×256 PNG → build/icon.png`);

  // ── Windows .ico ────────────────────────────────────────────────────────────
  const icoBuffers = ICO_SIZES.map(s => pngBuffers[s]).filter(Boolean);
  const icoBuffer  = await pngToIco(icoBuffers);
  const icoPath    = path.join(outDir, "icon.ico");
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`  [icons] Windows .ico → build/icon.ico`);

  // ── macOS .icns ─────────────────────────────────────────────────────────────
  if (process.platform === "darwin") {
    await generateIcns(pngBuffers, outDir);
  } else {
    console.log(
      "  [icons] macOS .icns — skipped (not on macOS; run this script on a Mac to generate .icns)"
    );
  }
}

/**
 * Generate a macOS .icns file using the `iconutil` CLI (macOS only).
 * Creates a temporary .iconset directory, populates it, then runs iconutil.
 *
 * @param {Record<number, Buffer>} pngBuffers  Map of size → PNG buffer.
 * @param {string}                 outDir
 */
async function generateIcns(pngBuffers, outDir) {
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);
  const os = await import("os");

  // macOS iconset naming convention: icon_NxN.png and icon_NxN@2x.png
  const icnsMap = [
    { name: "icon_16x16.png",       size: 16   },
    { name: "icon_16x16@2x.png",    size: 32   },
    { name: "icon_32x32.png",       size: 32   },
    { name: "icon_32x32@2x.png",    size: 64   },
    { name: "icon_64x64.png",       size: 64   },
    { name: "icon_64x64@2x.png",    size: 128  },
    { name: "icon_128x128.png",     size: 128  },
    { name: "icon_128x128@2x.png",  size: 256  },
    { name: "icon_256x256.png",     size: 256  },
    { name: "icon_256x256@2x.png",  size: 512  },
    { name: "icon_512x512.png",     size: 512  },
  ];

  const iconsetDir = path.join(os.default.tmpdir(), "lumio_wl.iconset");
  fs.mkdirSync(iconsetDir, { recursive: true });

  for (const { name, size } of icnsMap) {
    if (pngBuffers[size]) {
      fs.writeFileSync(path.join(iconsetDir, name), pngBuffers[size]);
    }
  }

  const icnsPath = path.join(outDir, "icon.icns");
  await execAsync(`iconutil --convert icns --output "${icnsPath}" "${iconsetDir}"`);
  fs.rmSync(iconsetDir, { recursive: true, force: true });
  console.log(`  [icons] macOS .icns → build/icon.icns`);
}
