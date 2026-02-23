# 9 — Build & Deployment

## Overview

Lumio has two build workflows: **development** (`start-dev.ps1`) and **production** (`tools/build.ps1`). The end product is a USB-portable directory — no installer needed.

## Development Environment — start-dev.ps1

The `start-dev.ps1` script starts the complete development environment in five steps:

```
Step 1: Clean up existing processes
  ├── Lumio.Api, dotnet on port 5123
  └── Storybook on port 6006

Step 2: Build frontend
  ├── npm install (if needed)
  └── npx next build → static export to out/

Step 3: Build backend
  └── dotnet build (Debug)

Step 4: Start Storybook
  └── Background process on port 6006

Step 5: Start backend
  ├── Set environment variables
  ├── Start Lumio.Api.exe (or dotnet run fallback)
  └── Open browser → http://127.0.0.1:5123 + Storybook
```

### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `-SkipBuild` | `$false` | Skip frontend and backend build |
| `-Port` | `5123` | Port for the .NET API |
| `-StorybookPort` | `6006` | Port for Storybook |

### Usage

```powershell
# Full start
.\start-dev.ps1

# Restart only (no build)
.\start-dev.ps1 -SkipBuild

# Different port
.\start-dev.ps1 -Port 5200
```

## Production Build — tools/build.ps1

The `tools/build.ps1` script produces a USB-portable distribution in three steps:

```
Step 1: .NET Backend
  └── dotnet publish --self-contained true --runtime win-x64
      → dist/backend/

Step 2: Next.js Frontend
  ├── npm ci
  └── npx next build → static export
      → dist/frontend/

Step 3: Electron Shell
  ├── npx tsc (TypeScript compilation)
  └── npx electron-builder --dir
      → dist/Lumio/
```

### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `-Configuration` | `Release` | Build configuration (`Release` \| `Debug`) |
| `-Runtime` | `win-x64` | .NET runtime identifier |
| `-SkipBackend` | `$false` | Skip backend build |
| `-SkipFrontend` | `$false` | Skip frontend build |
| `-SkipElectron` | `$false` | Skip Electron packaging |

### Usage

```powershell
# Full production build
.\tools\build.ps1

# Only rebuild frontend
.\tools\build.ps1 -SkipBackend -SkipElectron

# Debug build
.\tools\build.ps1 -Configuration Debug
```

## NPM Scripts

### lumio-web (Next.js)

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev --port 3000` | Development server with hot reload |
| `build` | `next build` | Static export |
| `start` | `next start` | Server mode (not used in production) |
| `lint` | `next lint` | ESLint check |
| `generate-api` | `openapi-ts` | Generate API client from Swagger |
| `storybook` | `storybook dev -p 6006` | Storybook development server |
| `build-storybook` | `storybook build` | Static Storybook build |

### lumio-desktop (Electron)

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `tsc && electron .` | TypeScript compile + start Electron |
| `build` | `tsc` | TypeScript compile only |
| `package` | `tsc && electron-builder --dir` | Full packaging |
| `start` | `electron .` | Start Electron (without compilation) |

## Distribution Output

After `tools/build.ps1`, the output is:

```
dist/Lumio/
├── Lumio.exe              # Electron executable
├── resources/
│   ├── app.asar           # Electron app code (bundled)
│   ├── backend/           # Self-contained .NET API
│   │   ├── Lumio.Api.exe
│   │   ├── Lumio.Api.dll
│   │   └── ...            # All .NET dependencies
│   └── frontend/          # Static Next.js files
│       ├── index.html
│       └── ...
└── data/                  # Created on first use
    └── profiles.json
```

## USB Distribution

1. Run `.\tools\build.ps1`
2. Copy `dist/Lumio/` to a USB drive
3. Give the USB drive to the user
4. User starts `Lumio.exe` — no installation required
5. All data is stored in `data/` next to the executable

## Supported Platforms

| Platform | Runtime | Status |
|----------|---------|--------|
| Windows x64 | `win-x64` | Primary |
| macOS x64 | `osx-x64` | Supported |
| macOS ARM | `osx-arm64` | Supported |
| Linux x64 | `linux-x64` | Supported |

> **Note**: No code signing is currently applied. `publish: null` in electron-builder — there is no auto-update mechanism.
