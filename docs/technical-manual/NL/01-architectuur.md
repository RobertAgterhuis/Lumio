# 1 — Architectuur

## Systeemoverzicht

Lumio is een **offline-first desktop-applicatie** voor het beheren van digitale nalatenschap. Alle gegevens blijven lokaal op de computer of USB-stick van de gebruiker. Er is geen cloud, geen server, geen account nodig.

De applicatie bestaat uit drie lagen:

| Laag | Technologie | Verantwoordelijkheid |
|------|-------------|---------------------|
| **Desktop Shell** | Electron 35 | Venster, sidecar-beheer, USB-portabiliteit |
| **Backend API** | .NET 10 (Kestrel) | REST API, domeinlogica, encryptie, PDF-export |
| **Frontend** | Next.js 16 (static export) | UI, formulieren, navigatie, i18n |

## Technologiekeuzes

| Onderdeel | Keuze | Motivatie |
|-----------|-------|-----------|
| Runtime | .NET 10 (self-contained) | Platformonafhankelijk, geen installatie nodig |
| Database | SQLite + SQLCipher | Enkelvoudig bestand, AES-256 volledige-schijf-encryptie |
| ORM | EF Core 10 | Code-first model, typed queries |
| Frontend framework | Next.js 16 | App Router, static export, Turbopack |
| UI-bibliotheek | React 19 | Componentmodel, hooks, Server Components |
| Styling | Tailwind CSS 4 + CVA | Utility-first, design tokens, variant systeem |
| State management | Zustand 5 | Minimaal, geen boilerplate |
| Formulieren | React Hook Form + Zod 4 | Performant, schema-gebaseerde validatie |
| i18n | next-intl 4 + .resx | Tweetalig (NL/EN), frontend + backend |
| Desktop | Electron 35 | Chromium-gebaseerd, cross-platform |
| Iconen | Lucide React | Consistente, lichte SVG-iconen |
| PDF | QuestPDF (Community) | .NET-native PDF-generatie |
| Geheimverdeling | Shamir's Secret Sharing | Noodtoegang voor erfgenamen |

## Mappenstructuur

```
lumio/
├── src/
│   ├── Lumio.Api/            # .NET 10 backend
│   │   ├── Controllers/      # 21 REST controllers
│   │   ├── Data/             # DbContext + SQLCipher
│   │   ├── Domain/           # 30 entiteiten (6 aggregaten)
│   │   ├── Dtos/             # Request/response records
│   │   ├── Middleware/       # Auth, error handling, RSC rewrite
│   │   ├── Rules/            # Business rules engine + JSON config
│   │   ├── Services/         # Encryptie, PDF, audit
│   │   ├── Validators/       # FluentValidation
│   │   └── Resources/        # .resx lokalisatiebestanden
│   │
│   ├── lumio-web/            # Next.js 16 frontend
│   │   ├── src/app/          # App Router pagina's (22 routes)
│   │   ├── src/components/   # UI-componenten (14 groepen)
│   │   ├── src/stores/       # Zustand stores (2)
│   │   ├── src/hooks/        # Custom hooks (3)
│   │   ├── src/lib/          # API client, utilities
│   │   ├── src/styles/       # Design tokens (tokens.css)
│   │   └── messages/         # i18n vertalingen (nl.json, en.json)
│   │
│   └── lumio-desktop/        # Electron 35 shell
│       └── src/main/         # Main process (sidecar, window, paths, i18n)
│
├── data/                     # Runtime databases (per profiel)
├── tools/                    # Build scripts
├── docs/                     # Documentatie
└── Analyse/                  # Ontwerp- en analysenotities
```

## Communicatiepatroon

```
Gebruiker ──► Electron BrowserWindow
                    │
                    │  HTTP (localhost:5123)
                    ▼
              .NET Kestrel ──► SQLCipher DB
                    │              (data/{profiel}.db)
                    │
                    ├── DatabaseUnlockMiddleware
                    ├── ExceptionHandlingMiddleware
                    └── RscRewriteMiddleware
```

Alle communicatie verloopt via **HTTP op localhost**. Er is geen netwerkverkeer naar externe servers. De Electron main process start de .NET API als sidecar-proces en sluit het netjes af bij afsluiten van de applicatie.

## Dataflow

1. Gebruiker opent Lumio → Electron vindt vrije poort (5123–5127)
2. Electron start .NET backend als child process
3. BrowserWindow laadt de statisch geëxporteerde Next.js frontend
4. Frontend communiceert via `fetch()` met de lokale API
5. API valideert, verwerkt en slaat op in de versleutelde SQLCipher database
6. Bij afsluiten: Electron stopt het backend-proces en ruimt op
