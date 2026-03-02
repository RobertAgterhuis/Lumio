/**
 * build-icons.mjs
 *
 * Converts build/source/icon.svg → all platform icon formats:
 *   build/icon.ico        (Windows: multi-resolution PNG-compressed ICO)
 *   build/icon.icns       (macOS: ICNS with PNG chunks)
 *   build/icons/*.png     (Linux: 16, 32, 48, 64, 128, 256, 512, 1024 px)
 *   build/source/icon.png (1024×1024 master PNG)
 *
 * Usage:  npm run build:icons
 *
 * Requires: sharp (devDependency) — no other packages; ICO + ICNS are written
 * with pure Node.js Buffer operations to avoid any phantom-js / request / svg2png
 * vulnerable chain (replaces electron-icon-builder).
 *
 * ICO format: PNG-compressed multi-image ICO (supported by Windows Vista+).
 * ICNS format: ICNS container with PNG payloads (supported by macOS 10.7+).
 */

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const svgInput   = path.join(root, 'build', 'source', 'icon.svg');
const masterPng  = path.join(root, 'build', 'source', 'icon.png');
const iconsDir   = path.join(root, 'build', 'icons');

// ── Utility: build ICO binary from an array of PNG Buffers ───────────────────
// Each entry: { width: number, height: number, data: Buffer (PNG) }
// Produces a PNG-compressed ICO (all modern Windows versions support this).
function buildIco(images) {
  const count = images.length;
  const dirSize = 6 + count * 16;

  // ICONDIR header (6 bytes)
  const dir = Buffer.alloc(dirSize);
  dir.writeUInt16LE(0, 0); // reserved
  dir.writeUInt16LE(1, 2); // type: 1 = ICO
  dir.writeUInt16LE(count, 4);

  let offset = dirSize;
  for (let i = 0; i < count; i++) {
    const { width, height, data } = images[i];
    const base = 6 + i * 16;
    dir.writeUInt8(width  === 256 ? 0 : width,  base);      // width  (0 = 256)
    dir.writeUInt8(height === 256 ? 0 : height, base + 1);  // height (0 = 256)
    dir.writeUInt8(0, base + 2);  // colorCount
    dir.writeUInt8(0, base + 3);  // reserved
    dir.writeUInt16LE(1,  base + 4); // planes
    dir.writeUInt16LE(32, base + 6); // bit depth
    dir.writeUInt32LE(data.length, base + 8);
    dir.writeUInt32LE(offset,      base + 12);
    offset += data.length;
  }

  return Buffer.concat([dir, ...images.map(i => i.data)]);
}

// ── Utility: build ICNS binary from an array of PNG Buffers ──────────────────
// Type-code table (PNG payloads, macOS 10.7+):
//   icp4=16, icp5=32, icp6=64, ic07=128, ic08=256, ic09=512, ic10=1024
function buildIcns(entries) {
  // entries: [{ type: string, data: Buffer }]
  const chunks = entries.map(({ type, data }) => {
    const header = Buffer.alloc(8);
    header.write(type, 0, 'ascii');
    header.writeUInt32BE(data.length + 8, 4);
    return Buffer.concat([header, data]);
  });
  const body = Buffer.concat(chunks);
  const header = Buffer.alloc(8);
  header.write('icns', 0, 'ascii');
  header.writeUInt32BE(body.length + 8, 4);
  return Buffer.concat([header, body]);
}

// ── Step 1: SVG → 1024×1024 master PNG ──────────────────────────────────────
// libvips (used by sharp) is strict about XML: <!-- comments containing -- are
// invalid. Strip all XML comments from the SVG before passing it to sharp.
console.log('[icons] Converting SVG → master PNG (1024×1024)…');
const svgRaw   = fs.readFileSync(svgInput, 'utf8');
const svgClean = Buffer.from(svgRaw.replace(/<!--[\s\S]*?-->/g, ''));

await sharp(svgClean)
  .resize(1024, 1024)
  .png()
  .toFile(masterPng);
console.log(`[icons] Written: ${masterPng}`);

// ── Step 2: Master PNG → Linux PNG set ───────────────────────────────────────
const linuxSizes = [16, 32, 48, 64, 128, 256, 512, 1024];
fs.mkdirSync(iconsDir, { recursive: true });

console.log('[icons] Generating Linux PNG set…');
await Promise.all(
  linuxSizes.map(async (size) => {
    const dest = path.join(iconsDir, `${size}.png`);
    await sharp(masterPng).resize(size, size).png().toFile(dest);
    console.log(`[icons]   ${dest}`);
  })
);

// ── Step 3a: Master PNG → Windows ICO (pure Buffer, no external npm) ─────────
console.log('[icons] Building Windows ICO…');
const icoSizes = [16, 32, 48, 64, 256];
const icoImages = await Promise.all(
  icoSizes.map(async (size) => {
    const data = await sharp(masterPng).resize(size, size).png().toBuffer();
    return { width: size, height: size, data };
  })
);
const icoBuffer = buildIco(icoImages);
fs.writeFileSync(path.join(root, 'build', 'icon.ico'), icoBuffer);
console.log('[icons]   build/icon.ico');

// ── Step 3b: Master PNG → macOS ICNS (pure Buffer, no external npm) ──────────
console.log('[icons] Building macOS ICNS…');
const icnsMap = [
  { type: 'icp4', size: 16  },
  { type: 'icp5', size: 32  },
  { type: 'icp6', size: 64  },
  { type: 'ic07', size: 128 },
  { type: 'ic08', size: 256 },
  { type: 'ic09', size: 512 },
  { type: 'ic10', size: 1024 },
];
const icnsEntries = await Promise.all(
  icnsMap.map(async ({ type, size }) => {
    const data = await sharp(masterPng).resize(size, size).png().toBuffer();
    return { type, data };
  })
);
const icnsBuffer = buildIcns(icnsEntries);
fs.writeFileSync(path.join(root, 'build', 'icon.icns'), icnsBuffer);
console.log('[icons]   build/icon.icns');

// ── Step 4: Taskbar overlay icons (Windows, 16×16) ──────────────────────────
// Small status indicators shown on the app's taskbar button (EL-5-06).
console.log('[icons] Generating taskbar overlay icons…');

const overlaySvgs = {
  'overlay-ok.png': Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">'
    + '<circle cx="8" cy="8" r="8" fill="#22c55e"/>'
    + '<path d="M4 8l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>'
    + '</svg>'
  ),
  'overlay-warn.png': Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">'
    + '<circle cx="8" cy="8" r="8" fill="#f59e0b"/>'
    + '<path d="M8 4v5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>'
    + '<circle cx="8" cy="11.5" r="1" fill="#fff"/>'
    + '</svg>'
  ),
};

await Promise.all(
  Object.entries(overlaySvgs).map(async ([filename, svgBuf]) => {
    const dest = path.join(root, 'build', filename);
    await sharp(svgBuf).resize(16, 16).png().toFile(dest);
    console.log(`[icons]   build/${filename}`);
  })
);

console.log('[icons] Done. Output:');
console.log('[icons]   build/icon.ico');
console.log('[icons]   build/icon.icns');
console.log('[icons]   build/icons/{size}.png');
console.log('[icons]   build/overlay-ok.png');
console.log('[icons]   build/overlay-warn.png');
