# 7 — Desktop Shell (Electron)

## Overview

The Electron 35 shell packages the .NET backend and Next.js frontend into a standalone desktop application. The goal is **USB portability** — copy the folder to a USB drive and start directly, without installation.

| Property | Value |
|----------|-------|
| Framework | Electron 35.2.1 |
| Builder | electron-builder 26 |
| App ID | `nl.lumio.desktop` |
| Distribution | `dir`-only (no installer) |
| Platforms | Windows (x64), macOS (x64 + arm64), Linux (x64) |

## Architecture

```
lumio-desktop/
├── src/main/
│   ├── index.ts      # Entrypoint: app lifecycle, IPC, single instance
│   ├── sidecar.ts    # .NET backend start/stop
│   ├── window.ts     # BrowserWindow configuration
│   ├── paths.ts      # Portable path resolution
│   ├── autobackup.ts # Automatic backup scheduler
│   └── i18n.ts       # Language setting load/save
```

## Sidecar Pattern

The main process starts the .NET API as a child process:

```
Electron app starts
  ├── Find free port (5123–5127)
  ├── Start Lumio.Api.exe with env vars:
  │     ASPNETCORE_URLS=http://127.0.0.1:{port}
  │     LUMIO_DATA_DIR=../data
  │     LUMIO_FRONTEND_DIR=../frontend
  ├── Wait until backend is reachable
  ├── Open BrowserWindow → http://127.0.0.1:{port}
  └── On close: stop backend + backup scheduler
```

## Single Instance Lock

Electron's `app.requestSingleInstanceLock()` prevents multiple instances. On a second attempt, the existing window is brought to the foreground.

## IPC Communication

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `get-locale` | Main → Renderer | Retrieve current language setting |
| `set-locale` | Renderer → Main | Save language setting |

The language setting is stored in the data directory so it persists across sessions.

## Automatic Backup

The `autobackup` module periodically copies the database. This is configurable and runs as a background process in the main process.

## Build Output

After `tools/build.ps1`, the distribution directory looks like this:

```
dist/Lumio/
├── Lumio.exe              # Electron executable
├── resources/
│   ├── app.asar           # Electron app code
│   ├── backend/           # Self-contained .NET API
│   │   └── Lumio.Api.exe
│   └── frontend/          # Static Next.js export
│       └── index.html
└── data/                  # Created on first use
    └── profiles.json
```

## Electron Builder Configuration

From `electron-builder.yml`:

```yaml
appId: nl.lumio.desktop
productName: Lumio

# Target: directory only (no installer, USB-portable)
win:
  target: dir
mac:
  target: dir
linux:
  target: dir

# Backend and frontend as extra resources
extraResources:
  - from: ../dist/backend
    to: ../backend
  - from: ../dist/frontend
    to: ../frontend

# No code signing, no auto-update
publish: null
```

## Portable Usage

1. Build the application: `.\tools\build.ps1`
2. Copy `dist/Lumio/` to a USB drive
3. Start `Lumio.exe` — the application runs entirely from the USB drive
4. All data is stored in `data/` next to the executable
