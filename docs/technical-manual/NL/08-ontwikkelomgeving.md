# 8. Ontwikkelomgeving

## 8.1 Vereisten

| Software | Versie | Doel |
|----------|--------|------|
| .NET SDK | 10.0+ | Backend compilatie en uitvoeren |
| Node.js | 22+ (LTS) | Frontend en Electron builds |
| PowerShell | 7.0+ | Build- en start-scripts |
| Git | 2.x | Versiebeheer |
| VS Code | (aanbevolen) | IDE |

### Aanbevolen VS Code-extensies

- C# Dev Kit (ms-dotnettools.csdevkit)
- ESLint
- Tailwind CSS IntelliSense
- Prettier

## 8.2 Eerste keer opzetten

```powershell
# 1. Repository clonen
git clone <repo-url> Lumio
cd Lumio

# 2. Backend dependencies
dotnet restore src/Lumio.Api/Lumio.Api.csproj

# 3. Frontend dependencies
cd src/lumio-web
npm install
cd ../..

# 4. Desktop dependencies (optioneel, alleen voor Electron-dev)
cd src/lumio-desktop
npm install
cd ../..

# 5. Data-directory aanmaken
New-Item -ItemType Directory -Force -Path data
```

## 8.3 Ontwikkelen

### Snelle start

```powershell
.\start-dev.ps1
```

Dit script:

1. **Stopt** alle draaiende Lumio-processen (Lumio.Api, dotnet, poort-listeners)
2. **Bouwt** de Next.js frontend (`npx next build` → statische export)
3. **Bouwt** de .NET backend (`dotnet build --configuration Debug`)
4. **Start** de backend met de juiste omgevingsvariabelen
5. **Opent** de browser op `http://127.0.0.1:5123` na 3 seconden

### Parameters

```powershell
# Zonder herbouwen (herstart alleen de backend)
.\start-dev.ps1 -SkipBuild

# Op een andere poort
.\start-dev.ps1 -Port 5200
```

### Omgevingsvariabelen (automatisch ingesteld)

| Variabele | Waarde | Beschrijving |
|-----------|--------|-------------|
| `ASPNETCORE_URLS` | `http://127.0.0.1:5123` | Backend luisteradres |
| `ASPNETCORE_ENVIRONMENT` | `Development` | Activeert Swagger & debug logging |
| `LUMIO_DATA_DIR` | `{projectroot}/data` | Data-directory |
| `LUMIO_FRONTEND_DIR` | `src/lumio-web/out` | Frontend-bestanden |

### Beschikbare URL's

| URL | Beschrijving |
|-----|-------------|
| `http://127.0.0.1:5123` | Frontend (statische export via backend) |
| `http://127.0.0.1:5123/swagger` | Swagger UI (alleen in Development) |
| `http://127.0.0.1:5123/api/status` | Backend status-check |

## 8.4 Projectstructuur

```
Lumio/
├── lumio.slnx                    ← Solution file
├── README.md                     ← Project overzicht
├── start-dev.ps1                 ← Ontwikkelscript
├── data/                         ← Lokale data (gitignored)
│   ├── profiles.json
│   └── *.db / *.salt
├── src/
│   ├── Lumio.Api/                ← .NET backend
│   │   ├── Lumio.Api.csproj
│   │   ├── Program.cs
│   │   ├── Controllers/          ← API endpoints
│   │   ├── Data/                 ← DbContext
│   │   ├── Domain/               ← Entiteiten
│   │   ├── Dtos/                 ← Request/response modellen
│   │   ├── Middleware/           ← HTTP pipeline
│   │   ├── Services/             ← Business logica
│   │   └── Validators/           ← FluentValidation
│   ├── lumio-web/                ← Next.js frontend
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   └── src/
│   │       ├── app/              ← Pages (App Router)
│   │       ├── components/       ← React componenten
│   │       ├── hooks/            ← Custom hooks
│   │       ├── lib/              ← Utilities
│   │       └── stores/           ← Zustand
│   └── lumio-desktop/            ← Electron shell
│       ├── package.json
│       ├── electron-builder.yml
│       └── src/
│           ├── main/             ← Main process
│           └── preload/          ← Context bridge
├── tools/
│   └── build.ps1                 ← Production build
├── docs/                         ← Documentatie
│   └── technical-manual/
└── Analyse/                      ← Feature-analyses
```

## 8.5 Ontwikkelworkflow

### Backend wijzigingen

```powershell
# Na wijzigingen in C# bestanden:
# Stop start-dev.ps1 (Ctrl+C)
.\start-dev.ps1 -SkipBuild    # Herstart met bestaande build

# Of volledige herbouw:
.\start-dev.ps1
```

**Tip:** `dotnet watch` wordt momenteel niet gebruikt vanwege de SQLCipher-integratie. Handmatig herstarten is betrouwbaarder.

### Frontend wijzigingen

De frontend draait als statische export, niet in dev-modus. Na wijzigingen:

```powershell
# Frontend herbouwen
cd src/lumio-web
npx next build
cd ../..

# Backend hoeft niet herstart (serveert uit out/)
# Ververs de browser pagina (F5)
```

### Electron wijzigingen

```powershell
cd src/lumio-desktop
npx tsc                # TypeScript compileren
npm run dev            # Start Electron met gecompileerde code

# Of handmatig:
npx tsc && npx electron .
```

## 8.6 Database-inspectie

### Swagger

Bij `ASPNETCORE_ENVIRONMENT=Development` is Swagger beschikbaar op `/swagger`. Hiermee kunnen alle 131 API-endpoints getest worden.

### SQLite-browsers

Databases zijn versleuteld met SQLCipher. Standaard SQLite-browsers (DB Browser for SQLite) kunnen de bestanden niet openen. Gebruik een SQLCipher-compatibele tool of de Swagger API voor data-inspectie.

### Audit log

Via `GET /api/audit` zijn alle wijzigingen in te zien — nuttig voor debugging.

## 8.7 Veelvoorkomende problemen

### Poort bezet

```
De poort 5123 is al in gebruik.
```

**Oplossing:** `start-dev.ps1` doodt automatisch bestaande processen op de poort. Handmatig:

```powershell
Get-NetTCPConnection -LocalPort 5123 -State Listen | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force
}
```

### SQLCipher fouten

```
SQLite Error 26: 'file is not a database'
```

**Oorzaak:** Verkeerd wachtwoord of beschadigde database.

**Oplossing:** Controleer dat de correcte master password wordt gebruikt. Bij een beschadigde database dient een backup te worden hersteld.

### Frontend build mislukt

```
Could not find a production build in the '.next' directory.
```

**Oplossing:** Controleer of `node_modules` aanwezig is en voer `npm install` uit gevolgd door `npx next build`.

### .NET SDK niet gevonden

```
Could not locate .NET SDK. Install .NET SDK from https://dot.net
```

**Oplossing:** Installeer .NET 10 SDK van <https://dot.net/download>.

## 8.8 Configuratiebestanden

| Bestand | Doel |
|---------|------|
| `src/Lumio.Api/appsettings.json` | Backend basisconfiguratie (logging) |
| `src/Lumio.Api/appsettings.Development.json` | Development-specifiek (debug logging) |
| `src/Lumio.Api/Properties/launchSettings.json` | VS/Rider launch configuratie |
| `src/lumio-web/next.config.ts` | Next.js configuratie (output: export) |
| `src/lumio-web/postcss.config.mjs` | PostCSS/Tailwind configuratie |
| `src/lumio-web/tsconfig.json` | TypeScript configuratie frontend |
| `src/lumio-web/openapi-ts.config.ts` | OpenAPI client codegen (niet in gebruik) |
| `src/lumio-desktop/electron-builder.yml` | Electron packaging configuratie |
| `src/lumio-desktop/tsconfig.json` | TypeScript configuratie desktop |
| `lumio.slnx` | .NET solution file |

## 8.9 OpenAPI Codegen (optioneel)

Het project bevat een `openapi-ts.config.ts` configuratie voor automatische TypeScript client-generatie uit de Swagger-specificatie. Dit is voorbereid maar niet in gebruik — de huidige frontend gebruikt handgeschreven API-calls via `lib/api-client.ts`.

```typescript
// openapi-ts.config.ts
export default {
    input: "http://127.0.0.1:5123/swagger/v1/swagger.json",
    output: "src/lib/api",
};
```

Om te activeren:

```powershell
cd src/lumio-web
npx openapi-ts
```

Dit genereert TypeScript types en een typed client op basis van de Swagger-specificatie.
