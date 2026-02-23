# 7. Build & Deployment

## 7.1 Overzicht

Lumio wordt gedistribueerd als USB-portable applicatie. Het build-proces produceert een enkele map die naar een USB-stick gekopieerd kan worden.

```
Broncode                          Distributie
──────────                        ───────────
src/Lumio.Api/     ──┐
                     ├── build.ps1 ──→  dist/Lumio/
src/lumio-web/     ──┤                    ├── Lumio.exe
                     │                    ├── resources/app.asar
src/lumio-desktop/ ──┘                    ├── backend/
                                          ├── frontend/
                                          └── data/ (leeg bij eerste gebruik)
```

## 7.2 Build-script (`tools/build.ps1`)

### Parameters

| Parameter | Type | Default | Beschrijving |
|-----------|------|---------|-------------|
| `-Configuration` | `"Debug"\|"Release"` | `Release` | Build-configuratie |
| `-Runtime` | `string` | `win-x64` | .NET runtime identifier |
| `-SkipBackend` | `switch` | `$false` | Sla backend-build over |
| `-SkipFrontend` | `switch` | `$false` | Sla frontend-build over |
| `-SkipElectron` | `switch` | `$false` | Sla Electron-packaging over |

### Gebruik

```powershell
# Volledig bouwen (Release)
.\tools\build.ps1

# Alleen backend herbouwen
.\tools\build.ps1 -SkipFrontend -SkipElectron

# Debug-build
.\tools\build.ps1 -Configuration Debug
```

### Stappen

#### Stap 1: .NET Backend

```powershell
dotnet publish src/Lumio.Api/Lumio.Api.csproj `
    --configuration Release `
    --runtime win-x64 `
    --self-contained true `
    --output dist/backend `
    /p:PublishSingleFile=false `
    /p:PublishTrimmed=false
```

| Optie | Waarde | Reden |
|-------|--------|-------|
| `--self-contained true` | Bevat .NET runtime | Geen .NET installatie nodig op doelmachine |
| `PublishSingleFile=false` | Losse bestanden | Betere foutopsporing, SQLCipher native DLL |
| `PublishTrimmed=false` | Geen trimming | Voorkomt problemen met reflection (EF Core) |

#### Stap 2: Next.js Frontend

```powershell
cd src/lumio-web
npm ci                    # Dependencies installeren (als node_modules ontbreekt)
npx next build            # Statische export naar out/
cp -r out/ ../../dist/frontend/
```

De `next.config.ts` met `output: "export"` zorgt ervoor dat `next build` statische HTML/JS/CSS produceert.

#### Stap 3: Electron Shell

```powershell
cd src/lumio-desktop
npm ci                    # Dependencies installeren
npx tsc                   # TypeScript compileren naar dist/
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"  # Geen code signing
npx electron-builder --dir --config electron-builder.yml
```

### electron-builder configuratie

```yaml
appId: nl.lumio.desktop
productName: Lumio

# Dir target — geen installer, geen auto-update
directories:
  output: ../../dist/Lumio

# Electron app code
files:
  - dist/**/*
  - package.json

# Backend en frontend als extra resources
extraResources:
  - from: ../../dist/backend
    to: ../backend
  - from: ../../dist/frontend
    to: ../frontend

win:
  target: [{ target: dir, arch: [x64] }]
  signAndEditExecutable: false    # Geen code signing
  forceCodeSigning: false

publish: null                     # Geen auto-update
asar: true                        # Electron code in asar-archief
```

## 7.3 Distributie-output

### Mapstructuur

```
dist/Lumio/
├── Lumio.exe                          ← Electron executable
├── chrome_100_percent.pak             ← Chromium resources
├── d3dcompiler_47.dll                 ← GPU rendering
├── ffmpeg.dll                         ← Media renderer
├── icudtl.dat                         ← Unicode data
├── libEGL.dll / libGLESv2.dll         ← OpenGL ES
├── locales/                           ← UI vertalingen
├── resources/
│   ├── app.asar                       ← Electron app (gecompileerd TS)
│   ├── backend/
│   │   ├── Lumio.Api.exe              ← .NET backend
│   │   ├── Lumio.Api.dll              ← .NET assemblies
│   │   ├── e_sqlcipher.dll            ← SQLCipher native library
│   │   └── ... (~200 .NET bestanden)
│   └── frontend/
│       ├── index.html                 ← Root pagina
│       ├── dashboard/index.html       ← Dashboard pagina
│       ├── _next/                     ← Next.js assets
│       └── ... (alle route-pagina's)
└── (data/ wordt aangemaakt bij eerste gebruik)
```

### Grootte-indicatie

| Component | Geschatte grootte |
|-----------|------------------|
| Electron runtime | ~200 MB |
| .NET backend (self-contained) | ~150 MB |
| Next.js frontend | ~5 MB |
| **Totaal** | **~355 MB** |

## 7.4 USB-distributie

### Eerste gebruik

1. Kopieer de gehele `dist/Lumio/` map naar een USB-stick
2. Start `Lumio.exe`
3. De `data/` map wordt automatisch aangemaakt naast de executable
4. De data directory bevat `profiles.json` en per profiel een `.db` en `.salt` bestand

### Backup & verplaatsing

De data-directory bevat alle gebruikersgegevens:

```
data/
├── profiles.json         ← Kopieer mee!
├── {id}.db               ← Versleutelde database (kopieer mee!)
├── {id}.salt             ← Veldversleuteling salt (kopieer mee!)
└── auto-backup.json      ← Optioneel
```

Om Lumio naar een andere USB-stick te verplaatsen:
1. Kopieer `dist/Lumio/` naar de nieuwe stick
2. Kopieer de `data/` map naast de executable
3. Start `Lumio.exe`

## 7.5 Cross-platform ondersteuning

Het build-script is primair ontworpen voor Windows (`win-x64`). De electron-builder configuratie bevat ook targets voor:

| Platform | Target | Architectuur |
|----------|--------|-------------|
| Windows | `dir` | x64 |
| macOS | `dir` | x64, arm64 |
| Linux | `dir` | x64 |

Voor cross-platform builds moet de `-Runtime` parameter van het build-script worden aangepast:

```powershell
# macOS (Intel)
.\tools\build.ps1 -Runtime osx-x64

# macOS (Apple Silicon)
.\tools\build.ps1 -Runtime osx-arm64

# Linux
.\tools\build.ps1 -Runtime linux-x64
```

## 7.6 Geen installer, geen auto-update

Bewuste ontwerpkeuzes:

| Keuze | Reden |
|-------|-------|
| Geen installer (NSIS/MSI) | USB-portable: geen installatie nodig |
| Geen code signing | Geen certificaat nodig, vereenvoudigt distributie |
| Geen auto-update | Offline-first: geen internetverbinding vereist |
| `publish: null` | Electron-builder publiceert niet naar update-server |
| `forceCodeSigning: false` | Voorkomt build-fouten zonder certificaat |
