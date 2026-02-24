# Lumio — Technisch Handboek

> Versie: februari 2026 — .NET 10 · Next.js 16 · Electron 35

## Doel

Dit handboek beschrijft de volledige technische architectuur van Lumio: een offline-first desktop-applicatie voor het vastleggen van uw digitale nalatenschap. Het document is bedoeld voor ontwikkelaars die de applicatie willen begrijpen, onderhouden of uitbreiden.

## Inhoudsopgave

| # | Hoofdstuk | Onderwerp |
|---|-----------|-----------|
| 1 | [Architectuur](01-architectuur.md) | Systeemoverzicht, lagenmodel, technologiekeuzes |
| 2 | [Backend API](02-backend-api.md) | Controllers, middleware, services, routes |
| 3 | [Domeinmodel & Database](03-domeinmodel-database.md) | Entiteiten, relaties, SQLCipher, migraties |
| 4 | [Beveiliging](04-beveiliging.md) | Encryptie, Shamir's Secret Sharing, authenticatie |
| 5 | [Frontend](05-frontend.md) | Next.js, pagina's, componenten, stores, hooks |
| 6 | [Design System](06-design-system.md) | Tokens, kleuren, typografie, componenten, a11y |
| 7 | [Desktop Shell](07-desktop-shell.md) | Electron, sidecar, portable distributie |
| 8 | [Internationalisering](08-internationalisering.md) | next-intl, .resx, taalbestanden |
| 9 | [Build & Deployment](09-build-deployment.md) | Scripts, CI, USB-distributie |
| 10 | [Ontwikkelomgeving](10-ontwikkelomgeving.md) | Setup, tooling, Storybook, testen |
| 11 | [Business Rules](11-business-rules.md) | Rule engine, validatie, configuratie |
| 12 | [Contentstijlgids](12-contentstijlgids.md) | Toon, terminologie, i18n-patronen, a11y |

## Snelstart

```powershell
# Ontwikkelomgeving starten (bouwt alles, start backend + Storybook)
.\start-dev.ps1

# Productiebuild naar USB-klare map
.\tools\build.ps1
```

## Architectuur in één oogopslag

```
┌───────────────────────────────────────────────┐
│                  Electron 35                   │
│  ┌──────────────┐  ┌───────────────────────┐  │
│  │ Main Process  │  │   BrowserWindow       │  │
│  │ (sidecar)     │  │   (Next.js static)    │  │
│  └──────┬────────┘  └──────────┬────────────┘  │
│         │ start/stop           │ HTTP           │
│  ┌──────▼──────────────────────▼────────────┐  │
│  │          .NET 10 API (Kestrel)           │  │
│  │  ┌───────────┐  ┌──────────────────┐     │  │
│  │  │Controllers│  │ Business Rules   │     │  │
│  │  │Middleware │  │ Engine           │     │  │
│  │  └──────┬────┘  └───────┬─────────┘     │  │
│  │         │               │                │  │
│  │  ┌──────▼───────────────▼───────────┐    │  │
│  │  │  EF Core + SQLCipher (AES-256)   │    │  │
│  │  └──────────────────────────────────┘    │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```
