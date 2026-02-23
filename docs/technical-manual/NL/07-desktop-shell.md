# 7 — Desktop Shell (Electron)

## Overzicht

De Electron 35 shell verpakt de .NET backend en Next.js frontend tot een zelfstandige desktop-applicatie. Het doel is **USB-portabiliteit** — kopieer de map naar een USB-stick en start direct, zonder installatie.

| Eigenschap | Waarde |
|------------|--------|
| Framework | Electron 35.2.1 |
| Builder | electron-builder 26 |
| App ID | `nl.lumio.desktop` |
| Distributie | `dir`-only (geen installer) |
| Platforms | Windows (x64), macOS (x64 + arm64), Linux (x64) |

## Architectuur

```
lumio-desktop/
├── src/main/
│   ├── index.ts      # Entrypoint: app lifecycle, IPC, single instance
│   ├── sidecar.ts    # .NET backend starten/stoppen
│   ├── window.ts     # BrowserWindow configuratie
│   ├── paths.ts      # Portable padresolutie
│   ├── autobackup.ts # Automatische backup scheduler
│   └── i18n.ts       # Taalinstelling laden/opslaan
```

## Sidecar Patroon

Het main process start de .NET API als child process:

```
Electron app start
  ├── Find vrije poort (5123–5127)
  ├── Start Lumio.Api.exe met env vars:
  │     ASPNETCORE_URLS=http://127.0.0.1:{port}
  │     LUMIO_DATA_DIR=../data
  │     LUMIO_FRONTEND_DIR=../frontend
  ├── Wacht tot backend bereikbaar is
  ├── Open BrowserWindow → http://127.0.0.1:{port}
  └── Bij afsluiten: stop backend + backup scheduler
```

## Single Instance Lock

Electron's `app.requestSingleInstanceLock()` voorkomt meerdere instanties. Bij een tweede poging wordt het bestaande venster naar voren gebracht.

## IPC Communicatie

| Kanaal | Richting | Doel |
|--------|----------|------|
| `get-locale` | Main → Renderer | Huidige taalinstelling ophalen |
| `set-locale` | Renderer → Main | Taalinstelling opslaan |

De taalinstelling wordt opgeslagen in de data-directory zodat het persistent is over sessies.

## Automatische Backup

De `autobackup` module maakt periodiek een kopie van de database. Dit is configureerbaar en draait als achtergrondproces in het main process.

## Build Output

Na `tools/build.ps1` ziet de distributiemap er als volgt uit:

```
dist/Lumio/
├── Lumio.exe              # Electron executable
├── resources/
│   ├── app.asar           # Electron app code
│   ├── backend/           # Self-contained .NET API
│   │   └── Lumio.Api.exe
│   └── frontend/          # Statische Next.js export
│       └── index.html
└── data/                  # Wordt aangemaakt bij eerste gebruik
    └── profiles.json
```

## Electron Builder Configuratie

Uit `electron-builder.yml`:

```yaml
appId: nl.lumio.desktop
productName: Lumio

# Doel: alleen directory (geen installer, USB-portable)
win:
  target: dir
mac:
  target: dir
linux:
  target: dir

# Backend en frontend als extra resources
extraResources:
  - from: ../dist/backend
    to: ../backend
  - from: ../dist/frontend
    to: ../frontend

# Geen code signing, geen auto-update
publish: null
```

## Portable Gebruik

1. Bouw de applicatie: `.\tools\build.ps1`
2. Kopieer `dist/Lumio/` naar een USB-stick
3. Start `Lumio.exe` — de applicatie draait volledig van de USB-stick
4. Alle gegevens worden opgeslagen in `data/` naast de executable
