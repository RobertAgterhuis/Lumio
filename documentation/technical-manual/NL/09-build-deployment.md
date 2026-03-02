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
| `test` | `vitest` | Unit tests uitvoeren |
| `test:coverage` | `vitest --coverage` | Tests uitvoeren met coverage |
| `validate-tokens` | `npx tsx scripts/validate-tokens.ts` | Token synchronisatie valideren |
| `detect-breaking-changes` | `npx tsx scripts/detect-breaking-changes.ts` | API compatibiliteit controleren |

### lumio-desktop (Electron)

| Script | Commando | Doel |
|--------|----------|------|
| `dev` | `tsc && electron .` | TypeScript compileren + Electron starten |
| `build` | `tsc` | Alleen TypeScript compileren |
| `package` | `tsc && electron-builder --dir` | Volledige packaging |
| `start` | `electron .` | Electron starten (zonder compilatie) |

## Kwaliteitspoorten

Kwaliteitscontroles worden afgedwongen in de CI-pipeline en kunnen lokaal worden uitgevoerd.

### Token Validatie

Zorgt ervoor dat `tokens.css` primitieven gesynchroniseerd zijn met `globals.css @theme` semantische mappings:

```bash
npm run validate-tokens
```

**Controleert:**
- Alle `tokens.css` custom properties hebben corresponderende `@theme` entries
- Geen verweesde `@theme` mappings
- Valideert 122 primitieve + 72 semantische tokens

### Breaking Change Detectie

Vergelijkt de huidige OpenAPI spec met een baseline om API breaking changes te detecteren:

```bash
npm run detect-breaking-changes
```

**Detecteert:**
- Verwijderde endpoints
- Verwijderde verplichte request parameters
- Gewijzigde HTTP methodes
- Versmalde response schema wijzigingen

**Gebruik in CI:** Het script eindigt met exit code 1 als breaking changes worden gevonden.

### Codekwaliteitscontroles

| Controle | Commando | Beschrijving |
|----------|----------|--------------|
| TypeScript | `npm run build` | Type checking tijdens build |
| ESLint | `npm run lint` | Codestijl + custom regels (no-raw-colors, no-raw-spacing) |
| Unit Tests | `npm run test` | Vitest test suite |
| Coverage | `npm run test:coverage` | Coverage rapportage |

### PR Review Checklist

Het project bevat een uitgebreide PR-template (`.github/pull_request_template.md`) met checklists voor:

1. Beschrijving & scope
2. Type wijziging (feature/bugfix/breaking)
3. Codekwaliteit (TypeScript, ESLint, tests)
4. Beveiligingsoverwegingen
5. Documentatie-updates

Zie [CONTRIBUTING.md](../../CONTRIBUTING.md) voor de volledige reviewer checklist.

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

## Continuous Integration (GitHub Actions)

### CI pipeline (ci.yml)

Activatie: push naar `main` of een PR gericht op `main`.

| Job | Tool | Doel |
|-----|------|------|
| `secret-scan` | TruffleHog v3.93.6 | Scant diff op gelekte secrets — **blokkeert alle andere jobs** |
| `frontend` | Vitest, ESLint, Storybook | Tests, linting, a11y |
| `site` | Next.js, Playwright | Marketing site smoke + a11y |
| `icon-guard` | PowerShell | SVG-licentiecontrole |
| `backend` | dotnet build + test | .NET build + xunit tests |
| `whitelabel-validate` | PowerShell | Whitelabel manifest check |

> Alle jobs behalve `secret-scan` zijn geblokkeerd met `needs: [secret-scan]` — als een secret gevonden wordt, loopt geen enkele andere job.

### Secret Scan — TruffleHog

TruffleHog scant de diff tussen `base` en `head` op **alleen geverifieerde** secrets:

```yaml
- uses: trufflesecurity/trufflehog@v3.93.6
  with:
    path: ./
    base: <PR base SHA of push vorig commit>
    head: <PR head SHA of huidige commit>
    extra_args: --only-verified
```

Een build faalt onmiddellijk als er een geverifieerd secret wordt gevonden — de merge is geblokkeerd.
