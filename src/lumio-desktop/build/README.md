# Lumio Desktop — Icon Build Assets

This directory contains the source SVG for the Lumio application icon and
instructions for generating the platform-specific icon formats required by
`electron-builder`.

## Source file

```
build/source/icon.svg   ← 512×512 SVG (design source of truth)
```

## Required output files

| File | Platform | Notes |
|------|----------|-------|
| `build/icons/512x512.png` | Linux | Required by electron-builder |
| `build/icons/256x256.png` | Linux (optional) | |
| `build/icon.icns` | macOS | Generated from PNG set |
| `build/icon.ico` | Windows | Generated from PNG set |

## Generating icons

### Prerequisites

```bash
# macOS
brew install librsvg  # rsvg-convert
brew install imagemagick

# Ubuntu / CI
sudo apt-get install librsvg2-bin imagemagick
```

### Step 1 — Export PNG from SVG

```bash
# From src/lumio-desktop/
rsvg-convert -w 512 -h 512 build/source/icon.svg -o build/icons/512x512.png
rsvg-convert -w 256 -h 256 build/source/icon.svg -o build/icons/256x256.png
rsvg-convert -w 128 -h 128 build/source/icon.svg -o build/icons/128x128.png
```

### Step 2 — Windows .ico (multi-resolution)

```bash
convert build/icons/512x512.png \
  -define icon:auto-resize=256,128,64,48,32,16 \
  build/icon.ico
```

### Step 3 — macOS .icns

```bash
# Create iconset directory
mkdir -p Lumio.iconset
rsvg-convert -w 16   -h 16   build/source/icon.svg -o Lumio.iconset/icon_16x16.png
rsvg-convert -w 32   -h 32   build/source/icon.svg -o Lumio.iconset/icon_16x16@2x.png
rsvg-convert -w 32   -h 32   build/source/icon.svg -o Lumio.iconset/icon_32x32.png
rsvg-convert -w 64   -h 64   build/source/icon.svg -o Lumio.iconset/icon_32x32@2x.png
rsvg-convert -w 128  -h 128  build/source/icon.svg -o Lumio.iconset/icon_128x128.png
rsvg-convert -w 256  -h 256  build/source/icon.svg -o Lumio.iconset/icon_128x128@2x.png
rsvg-convert -w 256  -h 256  build/source/icon.svg -o Lumio.iconset/icon_256x256.png
rsvg-convert -w 512  -h 512  build/source/icon.svg -o Lumio.iconset/icon_256x256@2x.png
rsvg-convert -w 512  -h 512  build/source/icon.svg -o Lumio.iconset/icon_512x512.png
iconutil -c icns Lumio.iconset -o build/icon.icns
rm -rf Lumio.iconset
```

### PowerShell (Windows, using Inkscape)

```powershell
# Requires Inkscape in PATH
$src = "build\source\icon.svg"
foreach ($size in @(512, 256, 128, 64, 48, 32, 16)) {
  inkscape $src --export-png="build\icons\${size}x${size}.png" -w $size -h $size
}
# Then use ImageMagick or a dedicated .ico tool for icon.ico
```

## Notes

- The `build/icons/` and `build/icon.icns` / `build/icon.ico` files are
  **gitignored** — they are build artefacts generated from `source/icon.svg`.
- `source/icon.svg` **is** committed — it is the design source of truth.
- Regenerate the icons whenever the brand SVG changes.
