# Lumio — Technisch Handboek

Dit handboek beschrijft de volledige technische architectuur, implementatie en configuratie van Lumio.

## Inhoudsopgave

| # | Hoofdstuk | Beschrijving |
|---|-----------|-------------|
| 1 | [Architectuuroverzicht](01-architectuur.md) | Systeemarchitectuur, componenten, dataflow en ontwerpkeuzes |
| 2 | [Backend API](02-backend-api.md) | ASP.NET Core API, controllers, middleware, services en endpoints |
| 3 | [Domeinmodel & Database](03-domeinmodel-database.md) | Entity Framework Core, domeinentiteiten, relaties en migratiestrategie |
| 4 | [Beveiliging](04-beveiliging.md) | SQLCipher, AES-256-GCM veldversleuteling, Shamir's Secret Sharing, authenticatie |
| 5 | [Frontend](05-frontend.md) | Next.js applicatie, pagina's, componenten, stores en API-communicatie |
| 6 | [Desktop Shell](06-desktop-shell.md) | Electron wrapper, sidecar-patroon, IPC en USB-portabiliteit |
| 7 | [Build & Deployment](07-build-deployment.md) | Build-scripts, distributie en USB-portabele uitrol |
| 8 | [Ontwikkelomgeving](08-ontwikkelomgeving.md) | Setup, tools, scripts en ontwikkelworkflow |

---

## Technologie-stack

| Laag | Technologie | Versie |
|------|------------|--------|
| Backend | ASP.NET Core | .NET 10.0 |
| Database | SQLite + SQLCipher | SQLitePCLRaw 2.1.11 |
| ORM | Entity Framework Core | 10.0.3 |
| PDF-generatie | QuestPDF | 2026.2.1 |
| Validatie | FluentValidation | 11.3.1 |
| Object-mapping | Mapster | 7.4.0 |
| Secret Sharing | SecretSharingDotNet | 0.14.0 |
| API-documentatie | Swashbuckle (Swagger) | 10.1.4 |
| Frontend | Next.js | 16.1.6 |
| UI-framework | React | 19.2.4 |
| Styling | Tailwind CSS | 4.2.0 |
| State management | Zustand | 5.0.11 |
| Formulieren | React Hook Form + Zod | 7.71.1 / 4.3.6 |
| Iconen | Lucide React | 0.575.0 |
| Desktop | Electron | 35.2.1 |
| Packaging | electron-builder | 26.0.12 |

---

## Architectuurprincipes

1. **Offline-first** — Geen internetverbinding vereist; alle data blijft lokaal
2. **Privacy by design** — Versleuteling op database- én veldniveau
3. **USB-portabel** — Volledige applicatie draait vanaf een USB-stick
4. **Zero-trust** — Geen cloud, geen telemetrie, geen externe services
5. **Multi-profiel** — Meerdere personen (partners) met elk een eigen versleutelde database
