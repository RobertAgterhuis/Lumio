# 1. Architectuuroverzicht

## 1.1 Systeemdiagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Electron Shell                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    BrowserWindow                          │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              Next.js Frontend (SPA)                 │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │  │  │
│  │  │  │ Pagina's │ │Componenten│ │  Stores  │           │  │  │
│  │  │  └────┬─────┘ └──────────┘ └──────────┘           │  │  │
│  │  │       │ fetch()                                     │  │  │
│  │  └───────┼─────────────────────────────────────────────┘  │  │
│  └──────────┼────────────────────────────────────────────────┘  │
│             │ HTTP (same origin)                                 │
│  ┌──────────┼────────────────────────────────────────────────┐  │
│  │          ▼          ASP.NET Core API                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │  Middleware   │  │  Controllers │  │   Services     │  │  │
│  │  │              │  │              │  │                │  │  │
│  │  │ • Exception  │  │ • Auth       │  │ • Password     │  │  │
│  │  │ • DB Unlock  │  │ • Eigenaar   │  │ • Encryption   │  │  │
│  │  │ • RSC Rewrite│  │ • Erfgenamen │  │ • Shamir       │  │  │
│  │  │              │  │ • Testament  │  │ • Profile      │  │  │
│  │  │              │  │ • Boedel     │  │ • PDF          │  │  │
│  │  │              │  │ • Export     │  │ • Audit        │  │  │
│  │  │              │  │ • ...        │  │                │  │  │
│  │  └──────────────┘  └──────┬───────┘  └────────────────┘  │  ││  │                           │                               │
│  │                    ┌──────▼───────────────────────────┐   │
│  │                    │       Rules Layer                 │   │
│  │                    │  ┌────────────┐ ┌─────────────┐  │   │
│  │                    │  │ Domain     │ │ Rules Engine │  │   │
│  │                    │  │ Services   │ │ (Workflows)  │  │   │
│  │                    │  └────────────┘ └─────────────┘  │   │
│  │                    │  ┌────────────┐ ┌─────────────┐  │   │
│  │                    │  │ IOptions<T>│ │ JSON Config  │  │   │
│  │                    │  └────────────┘ └─────────────┘  │   │
│  │                    └──────┬───────────────────────────┘   ││  │                           │ EF Core                       │  │
│  │                    ┌──────▼───────┐                       │  │
│  │                    │ LumioDbContext│                       │  │
│  │                    └──────┬───────┘                       │  │
│  └───────────────────────────┼───────────────────────────────┘  │
│                              │ SQLCipher                        │
│                       ┌──────▼───────┐                          │
│                       │  {profiel}.db │ (AES-256 versleuteld)   │
│                       └──────────────┘                          │
│                              │                                  │
│                       ┌──────▼───────┐                          │
│                       │  data/       │ (USB-portabel)           │
│                       │  ├ profiles.json                        │
│                       │  ├ {guid}.db                            │
│                       │  └ {guid}.salt                          │
│                       └──────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

## 1.2 Componentoverzicht

Lumio bestaat uit drie hoofdcomponenten die samen één USB-portabele applicatie vormen:

### 1.2.1 Backend — ASP.NET Core API

**Locatie:** `src/Lumio.Api/`

De backend is een zelfstandige ASP.NET Core Web API die draait op `http://127.0.0.1:5123` (standaardpoort). Hij fungeert als:

- **REST API** — Alle business logic en data-operaties via HTTP endpoints
- **Statische fileserver** — Serveert de gebouwde Next.js frontend als statische bestanden
- **SPA fallback** — Stuurt niet-API routes door naar `index.html` voor client-side routing

De backend is self-contained gepubliceerd: alle .NET-afhankelijkheden zitten in de distributie, er hoeft geen .NET runtime geïnstalleerd te zijn.

### 1.2.2 Frontend — Next.js SPA

**Locatie:** `src/lumio-web/`

De frontend is een Next.js 16 applicatie die als **statische export** (`output: "export"`) wordt gebouwd. Dit levert een verzameling HTML-, CSS- en JavaScript-bestanden op die door de backend worden geserveerd.

Kenmerken:
- Geen server-side rendering — volledig client-side
- Communiceert met de backend via `fetch()` naar dezelfde origin
- Tailwind CSS v4 voor styling
- Zustand voor globale state (authenticatie)
- React Hook Form + Zod voor formuliervalidatie

### 1.2.3 Desktop Shell — Electron

**Locatie:** `src/lumio-desktop/`

De Electron shell fungeert als een dunne wrapper die:

1. **De backend opstart** als sidecar-proces (child process)
2. **Een BrowserWindow opent** die de frontend laadt via HTTP (niet via `file://`)
3. **USB-portabiliteit** garandeert door relatieve paden te gebruiken
4. **Automatische backups** plant en uitvoert via IPC

De Electron-app bevat geen eigen business logic — die zit volledig in de backend.

## 1.3 Communicatiepatroon

```
Gebruiker ──► Electron BrowserWindow
                    │
                    │  loadURL("http://127.0.0.1:5123")
                    ▼
              Next.js SPA (in browsercontext)
                    │
                    │  fetch("/api/...")
                    ▼
              ASP.NET Core API (localhost)
                    │
                    │  EF Core + SQLCipher
                    ▼
              Versleutelde SQLite database
```

Alle communicatie verloopt via HTTP op `127.0.0.1` (localhost). Er is geen netwerkverkeer naar externe servers.

### Same-origin patroon

De frontend en backend draaien op dezelfde origin (`http://127.0.0.1:{port}`). De backend serveert de statische frontend-bestanden en handelt API-calls af op `/api/`-routes. Dit elimineert CORS-problemen en vereenvoudigt de deployment.

## 1.4 Dataflow

### Schrijven (voorbeeld: erfgenaam toevoegen)

```
1. Gebruiker vult formulier in op /erfgenamen pagina
2. React Hook Form valideert met Zod-schema
3. fetch POST /api/erfgenamen met JSON body
4. ExceptionHandlingMiddleware vangt fouten op
5. DatabaseUnlockMiddleware controleert:
   - Is er een profiel geselecteerd?
   - Is de database ontgrendeld?
   - Is het geen alleen-lezen modus? (voor POST)
6. FluentValidation valideert de DTO
7. Controller maakt Erfgenaam entity via Mapster
8. LumioDbContext slaat op via EF Core:
   - UpdateTimestamps() zet GewijzigdOp
   - TrackAuditLog() logt de aanmaak
9. SQLCipher schrijft versleuteld naar {profiel}.db
10. Controller retourneert 201 Created met response DTO
11. Frontend toont de nieuwe erfgenaam in de lijst
```

### Lezen (voorbeeld: dashboard laden)

```
1. Gebruiker navigeert naar /dashboard
2. React component doet fetch GET /api/status/volledigheid
3. Middleware controleert ontgrendeling
4. StatusController berekent voortgang per sectie
5. Response bevat completeness percentages
6. VoortgangGranulair component toont voortgangsbalken
```

## 1.5 Mappenstructuur

```
Lumio/
├── README.md                   # Projectoverzicht (NL + EN)
├── lumio.slnx                  # .NET solution file
├── start-dev.ps1               # Ontwikkelscript (build + start)
│
├── data/                       # Runtime data (versleutelde databases)
│   ├── profiles.json           # Profielmanifest (onversleuteld)
│   ├── {guid}.db               # Versleutelde SQLite databases
│   └── {guid}.salt             # Salt-bestanden voor veldversleuteling
│
├── docs/
│   ├── technical-manual/       # Dit handboek
│   └── user-manual/            # Gebruikershandleiding
│
├── src/
│   ├── Lumio.Api/              # Backend (ASP.NET Core)
│   │   ├── Controllers/        # API endpoints
│   │   ├── Data/               # DbContext
│   │   ├── Domain/             # Entiteiten (domeinmodel)
│   │   ├── Dtos/               # Data Transfer Objects
│   │   ├── Middleware/         # HTTP middleware pipeline
│   │   ├── Rules/              # Business Rules Engine
│   │   │   ├── Configuration/  # IOptions<T> klassen, DI extensies
│   │   │   ├── Engine/         # Microsoft RulesEngine wrapper
│   │   │   ├── Facts/          # Input-modellen voor regelservices
│   │   │   ├── Results/        # Output-modellen (PolicyResult<T>)
│   │   │   └── Services/       # Domain services (Facts-in → Results-out)
│   │   ├── rules/              # Externe JSON-configuratie
│   │   │   ├── lumio-rules.json         # Configureerbare constanten
│   │   │   ├── lumio-rules.schema.json  # JSON Schema
│   │   │   └── lumio-workflows.json     # RulesEngine workflows
│   │   ├── Services/           # Business logic & security
│   │   ├── Validators/         # FluentValidation validators
│   │   └── Program.cs          # Applicatie bootstrap
│   │
│   ├── lumio-web/              # Frontend (Next.js)
│   │   ├── src/
│   │   │   ├── app/            # Pagina's (App Router)
│   │   │   ├── components/     # React componenten
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utilities en API client
│   │   │   └── stores/         # Zustand stores
│   │   └── public/             # Statische assets
│   │
│   └── lumio-desktop/          # Desktop shell (Electron)
│       └── src/
│           ├── main/           # Main process (sidecar, window)
│           └── preload/        # Preload script (IPC bridge)
│
├── tools/
│   └── build.ps1               # Master build script
│
└── Analyse/                    # Analyse & ontwerpdocumenten
    ├── features/               # Feature-analyse (MoSCoW)
    ├── integration/            # Integratieanalyse en bugfixes
    └── ...                     # Persona's, UI-analyse, etc.
```

## 1.6 Ontwerpbeslissingen

### Waarom geen cloud?

Lumio beheert extreem gevoelige informatie (BSN-nummers, wachtwoorden, testamentaire wensen, financiële gegevens). Door alles lokaal te houden:
- Is er geen risico op datalekken via servers
- Heeft de gebruiker volledige controle over zijn data
- Is de applicatie bruikbaar zonder internet
- Kan de data op een USB-stick worden meegenomen

### Waarom SQLCipher in plaats van een reguliere database?

SQLCipher biedt transparante AES-256 versleuteling op database-niveau. De database is onleesbaar zonder het wachtwoord, zelfs als het bestand wordt gekopieerd. Dit is essentieel voor USB-portabiliteit waar het bestand fysiek toegankelijk is.

### Waarom Electron?

Electron biedt een consistente desktopervaring op Windows, macOS en Linux. Alternatieven als Tauri vereisen Rust-kennis en bieden minder controle over het sidecar-patroon dat nodig is voor de .NET backend.

### Waarom statische export (geen SSR)?

Server-side rendering is niet nodig omdat:
- SEO irrelevant is (offline desktop-app)
- Alle data via API-calls wordt opgehaald
- Statische bestanden eenvoudig door de backend kunnen worden geserveerd
- Het de architectuur vereenvoudigt (geen Node.js server nodig)

### Waarom aparte backend in plaats van Electron IPC?

- .NET biedt robuuste ORM (EF Core), validatie (FluentValidation) en PDF-generatie (QuestPDF)
- De backend is ook bruikbaar zonder Electron (via browser op `localhost`)
- Het sidecar-patroon houdt de componenten ontkoppeld
- De frontend kan onafhankelijk worden ontwikkeld en getest

## 1.7 Poorten en URL's

| Omgeving | URL | Beschrijving |
|----------|-----|-------------|
| Productie (Electron) | `http://127.0.0.1:{dynamisch}` | Dynamische poort via `get-port` (5123-5127) |
| Ontwikkeling | `http://127.0.0.1:5123` | Vaste poort via `start-dev.ps1` |
| Swagger UI | `http://127.0.0.1:{port}/swagger` | API-documentatie |

De applicatie luistert uitsluitend op `127.0.0.1` (localhost), niet op `0.0.0.0`. Dit voorkomt dat de API bereikbaar is vanuit het netwerk.
