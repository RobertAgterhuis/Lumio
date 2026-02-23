# 9 — Build & Deployment

## Overzicht

Lumio kent twee build-workflows: **ontwikkeling** (`start-dev.ps1`) en **productie** (`tools/build.ps1`). Het eindproduct is een USB-draagbare map — geen installer nodig.

## Ontwikkelomgeving — start-dev.ps1

Het script `start-dev.ps1` start de volledige ontwikkelomgeving in vijf stappen:

```
Stap 1: Bestaande processen opruimen
  ├── Lumio.Api, dotnet op poort 5123
  └── Storybook op poort 6006

Stap 2: Frontend bouwen
  ├── npm install (indien nodig)
  └── npx next build → statische export naar out/

Stap 3: Backend bouwen
  └── dotnet build (Debug)

Stap 4: Storybook starten
  └── Achtergrondproces op poort 6006

Stap 5: Backend starten
  ├── Omgevingsvariabelen instellen
  ├── Lumio.Api.exe starten (of dotnet run fallback)
  └── Browser openen → http://127.0.0.1:5123 + Storybook
```

### Parameters

| Parameter | Standaard | Beschrijving |
|-----------|-----------|--------------|
| `-SkipBuild` | `$false` | Sla frontend en backend build over |
| `-Port` | `5123` | Poort voor de .NET API |
| `-StorybookPort` | `6006` | Poort voor Storybook |

### Gebruik

```powershell
# Volledige start
.\start-dev.ps1

# Alleen herstarten (geen build)
.\start-dev.ps1 -SkipBuild

# Andere poort
.\start-dev.ps1 -Port 5200
```

## Productie Build — tools/build.ps1

Het script `tools/build.ps1` produceert een USB-draagbare distributie in drie stappen:

```
Stap 1: .NET Backend
  └── dotnet publish --self-contained true --runtime win-x64
      → dist/backend/

Stap 2: Next.js Frontend
  ├── npm ci
  └── npx next build → statische export
      → dist/frontend/

Stap 3: Electron Shell
  ├── npx tsc (TypeScript compileren)
  └── npx electron-builder --dir
      → dist/Lumio/
```

### Parameters

| Parameter | Standaard | Beschrijving |
|-----------|-----------|--------------|
| `-Configuration` | `Release` | Build configuratie (`Release` \| `Debug`) |
| `-Runtime` | `win-x64` | .NET runtime identifier |
| `-SkipBackend` | `$false` | Backend build overslaan |
| `-SkipFrontend` | `$false` | Frontend build overslaan |
| `-SkipElectron` | `$false` | Electron packaging overslaan |

### Gebruik

```powershell
# Volledige productie build
.\tools\build.ps1

# Alleen frontend herbouwen
.\tools\build.ps1 -SkipBackend -SkipElectron

# Debug build
.\tools\build.ps1 -Configuration Debug
```

## NPM Scripts

### lumio-web (Next.js)

| Script | Commando | Doel |
|--------|----------|------|
| `dev` | `next dev --port 3000` | Ontwikkelserver met hot reload |
| `build` | `next build` | Statische export |
| `start` | `next start` | Server-mode (niet gebruikt in productie) |
| `lint` | `next lint` | ESLint controle |
| `generate-api` | `openapi-ts` | API client genereren uit Swagger |
| `storybook` | `storybook dev -p 6006` | Storybook ontwikkelserver |
| `build-storybook` | `storybook build` | Statische Storybook build |

### lumio-desktop (Electron)

| Script | Commando | Doel |
|--------|----------|------|
| `dev` | `tsc && electron .` | TypeScript compileren + Electron starten |
| `build` | `tsc` | Alleen TypeScript compileren |
| `package` | `tsc && electron-builder --dir` | Volledige packaging |
| `start` | `electron .` | Electron starten (zonder compilatie) |

## Distributie Output

Na `tools/build.ps1` is de output:

```
dist/Lumio/
├── Lumio.exe              # Electron executable
├── resources/
│   ├── app.asar           # Electron app code (gebundeld)
│   ├── backend/           # Self-contained .NET API
│   │   ├── Lumio.Api.exe
│   │   ├── Lumio.Api.dll
│   │   └── ...            # Alle .NET dependencies
│   └── frontend/          # Statische Next.js bestanden
│       ├── index.html
│       └── ...
└── data/                  # Aangemaakt bij eerste gebruik
    └── profiles.json
```

## USB Distributie

1. Voer `.\tools\build.ps1` uit
2. Kopieer `dist/Lumio/` naar een USB-stick
3. Geef de USB-stick aan de gebruiker
4. Gebruiker start `Lumio.exe` — geen installatie nodig
5. Alle data wordt opgeslagen in `data/` naast de executable

## Ondersteunde Platforms

| Platform | Runtime | Status |
|----------|---------|--------|
| Windows x64 | `win-x64` | Primair |
| macOS x64 | `osx-x64` | Ondersteund |
| macOS ARM | `osx-arm64` | Ondersteund |
| Linux x64 | `linux-x64` | Ondersteund |

> **Let op**: Er wordt momenteel geen code signing toegepast. `publish: null` in electron-builder — er is geen auto-update mechanisme.
