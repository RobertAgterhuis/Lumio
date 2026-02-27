# Lumio Whitelabel Engine

This folder contains everything needed to produce a company-branded distribution
of the Lumio application.  
**The web app (`src/lumio-web`) and the API (`src/Lumio.Api`) are never modified.**
All branding is applied at build time (icons, splash, metadata) and at runtime
inside the Electron shell (CSS variable injection, logo overlay, dashboard message).

---

## Quick Start

```powershell
# From the repository root:
.\tools\build.ps1 -Whitelabel ".\tools\whitelabel\configs\example-corp"
```

The packaged output lands in `dist\Lumio\win-unpacked\` as usual — just with the
company's colors, icons, and product name.

To produce the standard Lumio build (no whitelabel), omit the parameter:

```powershell
.\tools\build.ps1
```

To validate a config without generating any files:

```powershell
node tools\whitelabel\engine.mjs --config tools\whitelabel\configs\acme-corp --validate-only
```

---

## Folder Structure

```
tools/whitelabel/
├── schema.json              ← JSON Schema (draft-07) validating every whitelabel.json
├── README.md                ← This file
├── engine.mjs               ← Build-time CLI (created in WL-4)
├── lib/
│   ├── color-utils.mjs      ← Hex color manipulation helpers (WL-4)
│   ├── icon-generator.mjs   ← Logo → .ico / .icns / .png (WL-4)
│   ├── css-injector.mjs     ← CSS override string generator (WL-4)
│   └── splash-patcher.mjs   ← Splash HTML color/logo patcher (WL-5)
└── configs/
    └── example-corp/        ← Reference implementation (see below)
        ├── whitelabel.json
        └── logo.svg
```

---

## Creating a New Company Config

### Step 1 — Create a config directory

```
tools/whitelabel/configs/<company-slug>/
```

Use lowercase kebab-case for the slug, e.g. `configs/acme-corp/`.

### Step 2 — Add your logo

Place your logo file in the config directory with any of these formats:

| Format | Notes |
|--------|-------|
| **SVG** | Best — scales perfectly to all icon sizes |
| **PNG** | Minimum 512×512 px recommended |
| **JPG / WebP** | Supported, but PNG/SVG preferred |

The logo is used for:
- In-app overlay (bottom-center of every screen)
- Optionally on the startup splash screen
- Optionally as the Windows `.ico` / macOS `.icns` / Linux `.png` app icon

### Step 3 — Write `whitelabel.json`

Copy the example and fill in your values:

```jsonc
{
  "$schema": "../../schema.json",

  // Company identity
  "companyName": "ACME Corp",
  "productName": "ACME Nalatenschap",
  "appId": "com.acme.nalatenschap",     // Unique reverse-domain ID

  // Brand colors — only primaryBase is required
  "colors": {
    "primaryBase":   "#1e4a75",         // REQUIRED: main brand color
    "primaryDark":   "#1a3a5c",         // title bar, dark backgrounds
    "primaryMedium": "#3a6a99",         // accents, focus rings
    "primaryLight":  "#6898c4",         // hover states
    "primaryPale":   "#c5daf0",         // highlight backgrounds
    "primaryGhost":  "#e8f2fb",         // page background tint
    "primaryForeground": "#ffffff"      // text on primary-colored surfaces
  },

  // Windows title bar overlay (optional — defaults to primaryDark)
  "titleBarColor":       "#1a3a5c",
  "titleBarSymbolColor": "#ffffff",

  // Startup splash background (optional — defaults to primaryDark)
  "splashColor": "#1a3a5c",

  // Logo overlay inside the app
  "logo": {
    "file": "logo.svg",       // relative to this config directory
    "height": 32,             // px height displayed in-app (16–128)
    "opacity": 0.70,          // 0.1 – 1.0
    "showOnSplash": true,     // show logo on startup splash?
    "useAsAppIcon": true      // generate app icons from this logo?
  },

  // Short footer message on the Dashboard page only (optional)
  "dashboardMessage": "Aangeboden door ACME HR. Vragen? hr@acme.nl"
}
```

### Step 4 — Validate your config

Before running the build, validate the JSON:

```powershell
# Install ajv-cli once (if not already installed)
npm install -g ajv-cli

# Validate
ajv validate -s tools\whitelabel\schema.json -d tools\whitelabel\configs\acme-corp\whitelabel.json
```

Or use the online validator at [jsonschemavalidator.net](https://www.jsonschemavalidator.net/)
with the contents of `schema.json` and your `whitelabel.json`.

### Step 5 — Build

```powershell
.\tools\build.ps1 -Whitelabel ".\tools\whitelabel\configs\acme-corp"
```

---

## Verifying Build Output

After running the engine (step 4 in the guide above), confirm the following
files exist before packaging:

### Icons

```
src\lumio-desktop\build\icons\   16x16.png  24x24.png  32x32.png  48x48.png
                                  64x64.png  128x128.png 256x256.png 512x512.png
src\lumio-desktop\build\         icon.ico   icon.png
```

### Whitelabel assets (bundled into the installer)

```
src\lumio-desktop\build\whitelabel\
    whitelabel.json   ← runtime config read by main process
    splash.html       ← patched splash screen
    logo.<ext>        ← copied company logo
    override.css      ← debug reference of injected CSS
    build-info.json   ← engine run metadata
```

### Installer override config

```
src\lumio-desktop\electron-builder.wl.json   ← extends base yml; sets productName / appId
src\lumio-desktop\.whitelabel-active         ← flag read by build.ps1
```

### Quick verification script

```powershell
# Run from repo root after the engine:
$b = "src\lumio-desktop\build"
Test-Path "$b\icon.ico"                          # Windows icon
Test-Path "$b\whitelabel\splash.html"            # Patched splash
Test-Path "$b\whitelabel\whitelabel.json"        # Runtime config
(Get-Content "$b\whitelabel\splash.html" -Raw) -match 'background: #[0-9a-fA-F]{6}'  # Color patched
```

### Runtime visual checklist

After running the packaged app (`dist\Lumio\win-unpacked\<ProductName>.exe`):

| What to check | Expected |
|---|---|
| Splash screen color | `config.splashColor` (not Lumio teal `#2C4A52`) |
| Splash logo | Company logo centered on splash (if `logo.showOnSplash: true`) |
| App header bar | Company `primaryBase` color |
| Sidebar active items | Company `primaryBase` color |
| Primary buttons | Company `primaryMedium` color |
| Window title bar (Windows) | Company `titleBarColor` |
| In-app logo overlay | Company logo fixed at bottom-center on every page |
| Dashboard footer message | Visible on `/` and `/dashboard` only |
| Other pages (Profile, Will, …) | Logo visible, message absent |
| SPA navigation | Logo survives Dashboard → Profile → Dashboard |
| Standard build (`build.ps1` without `-Whitelabel`) | Lumio teal branding, no whitelabel assets |

---

## Color System

Lumio uses Tailwind v4 `@theme` CSS custom properties. The whitelabel engine
generates `:root { … }` overrides that are injected into the Electron renderer
at startup via `webContents.insertCSS()`. No React or Next.js code is touched.

### Mapping: `colors` object → CSS variables overridden

| `whitelabel.json` `colors.*` | CSS custom properties |
|------------------------------|----------------------|
| `primaryDark` | `--color-primary-700` |
| `primaryBase` | `--color-primary`, `--color-primary-600`, `--color-sidebar-active` |
| `primaryMedium` | `--color-primary-500`, `--color-accent`, `--color-ring` |
| `primaryLight` | `--color-primary-400` |
| `primaryPale` | `--color-primary-100` |
| `primaryGhost` | `--color-primary-50`, `--color-background` |
| `primaryForeground` | `--color-primary-foreground`, `--color-sidebar-active-foreground` |

### Auto-deriving missing shades

If you only supply `primaryBase`, the engine automatically derives the other
shades by adjusting lightness (HSL). This gives a coherent palette from a single
hex value.

Example: `primaryBase: "#1e4a75"` auto-generates:

| Auto-derived field | Hex |
|--------------------|-----|
| `primaryDark` | `#162e4a` (−15% lightness) |
| `primaryMedium` | `#2a6499` (+20% lightness) |
| `primaryLight` | `#5692c4` (+45% lightness) |
| `primaryPale` | `#bdd5ed` (+72% lightness) |
| `primaryGhost` | `#e6f0f8` (+82% lightness) |

---

## Logo Overlay Behaviour

| Condition | Logo position |
|-----------|---------------|
| No dashboard message configured | `bottom: 16px` |
| With dashboard message configured | `bottom: 52px` (above the message bar) |

- The logo uses `pointer-events: none` — it never blocks clicks.
- `z-index: 9998` — appears above all app content but below modals.
- The logo re-injects itself after every SPA page navigation (via MutationObserver).

---

## Dashboard Message Behaviour

- Appears **only** on the dashboard / home route (`/` or `/dashboard`).
- Rendered as a `position: fixed; bottom: 0` bar, full width, 36 px tall.
- Disappears automatically when navigating to other pages.
- Limited to 320 characters in the schema.

---

## App Icon Generation (requires WL-4 build engine)

When `logo.useAsAppIcon: true`, the build engine generates:

| Output | Used for |
|--------|----------|
| `build/icons/256x256.png` | electron-builder (Windows) |
| `build/icon.ico` | Windows taskbar / desktop shortcut |
| `build/icon.icns` | macOS dock (macOS build only) |
| `build/icons/512x512.png` | Linux desktop |
| `build/icons/tray-*.png` | System tray icon (16 px Windows, 22 px macOS/Linux) |

The source file (`logo.svg` or `logo.png`) must be at least 512×512 px (SVG has
no size constraint).

---

## Adding a New Company — Checklist

- [ ] Create `tools/whitelabel/configs/<slug>/`
- [ ] Copy logo file to the directory (SVG preferred, min 512×512 for PNG)
- [ ] Create `whitelabel.json` based on the template above
- [ ] Validate JSON against `schema.json`
- [ ] Run `.\tools\build.ps1 -Whitelabel ".\tools\whitelabel\configs\<slug>"`
- [ ] Verify splash color, header color, logo overlay, and dashboard message in
      the packaged app (`dist\Lumio\win-unpacked\Lumio.exe`)

---

## Reference Implementation

See [configs/example-corp/](configs/example-corp/) for a complete working example
with a blue corporate palette and a generated SVG logo.
