# Onboarding Output — Lumio
> Agent: 25-onboarding-agent | Cyclus: FULL_AUDIT | Datum: 2026-03-01T00:00:00Z

---

## INPUT INVENTARISATIE

### Codebase

| Veld | Waarde |
|------|--------|
| **Pad** | `d:\repositories\Lumio` (lokale werkstation) |
| **Primaire talen** | C# (.NET 10), TypeScript (Next.js 15 / Electron 35) |
| **Geschatte omvang** | ≥30 controllers (API), ≥15 frontend-modules, 12 technische manuals, 15 gebruikersmanuals, meerdere testprojecten |
| **Branch / commit** | `Feature/UI` / `3049daec59dfbaa161cda3f61cf57d41188e07e3` |
| **Build-status** | UNKNOWN — buildstatus is niet direct aantoonbaar vanuit de scan; CI/CD pipeline aanwezig (GitHub Actions) |

### Documentatie

| Type | Aanwezig | Pad / Bron |
|------|----------|-----------|
| README | Ja | `README.md` (NL + EN) |
| Technische manual (NL) | Ja | `documentation/technical-manual/NL/` (12 hoofdstukken) |
| Gebruikershandleiding (NL) | Ja | `documentation/user-manual/NL/` (15 hoofdstukken) |
| Technische manual (EN) | INSUFFICIENT_DATA: Aanwezig als map `documentation/technical-manual/EN/` maar inhoud niet geverifieerd |
| Gebruikershandleiding (EN) | INSUFFICIENT_DATA: Aanwezig als map `documentation/user-manual/EN/` maar inhoud niet geverifieerd |
| API-specificatie | Ja (OpenAPI/Swagger) | `src/Lumio.Api/` — Swashbuckle.AspNetCore aanwezig; live spec op UNKNOWN endpoint |
| Testdocumentatie | Ja | `devdocs/shamir-ux-test-protocol.md`; CI-workflow in `.github/workflows/ci.yml` beschrijft test-strategie |
| Runbooks / DevDocs | Ja | `devdocs/` (data-retention, database-migrations, deployment-urls, DPIA, PostHog-analytics, Shamir-UX) |
| Architectuurdocument | Ja | `documentation/technical-manual/NL/01-architectuur.md` |
| Privacy / DPIA | Ja | `devdocs/dpia-bijzondere-categorieen.md` |
| Data Retention Policy | Ja | `devdocs/data-retention-policy.md` |
| Brand guidelines | INSUFFICIENT_DATA: Niet aangetroffen als apart document |
| KPI-definities | INSUFFICIENT_DATA: Niet aangetroffen als apart document |
| Eerdere auditresultaten | INSUFFICIENT_DATA: Git-history verwijst naar "re-evaluation-report-v2.md" en sprint-outputs (SP-7, SP-8, SP-9), maar bestanden zijn niet op het verwachte pad aangetroffen in de huidige workspace-scan |

### Stakeholder Input

| Type | Aanwezig | Bron |
|------|----------|------|
| Business requirements | Gedeeltelijk | `README.md` (productdoel, doelgroep) + devdocs |
| User research | Ja | `devdocs/shamir-ux-test-protocol.md` (Shamir UX-test protocol) |
| Eerdere auditresultaten | INSUFFICIENT_DATA: Git commits refereren aan re-evaluatierapport, maar bestand niet opgehaald |
| KPI-definities | INSUFFICIENT_DATA: Niet als apart document aangetroffen |
| Brand guidelines | INSUFFICIENT_DATA: Niet als apart document aangetroffen; whitelabel-structuur aangetroffen in `tools/whitelabel/` |

### Tooling (conform docs/contracts/tooling-contract.md)

| Tool | Beschikbaar | Versie |
|------|-------------|--------|
| Git | Ja | 2.48.1.windows.1 |
| Bestandssysteem (lees) | Ja | — |
| Bestandssysteem (schrijf) | Ja | — |
| .NET SDK | Ja | 10.0.103 |
| Node.js | Ja | v22.14.0 |
| npm | Ja | 10.9.2 |
| Vitest (frontend test-runner) | Ja (via npm) | Zie `src/lumio-web/package.json` |
| xUnit / .NET test runner | Ja (via dotnet test) | .NET 10 |
| ESLint (linter) | Ja (via npm) | Zie `src/lumio-web/eslint.config.mjs` |
| TypeScript (statische analyse) | Ja | ~5.9.3 (lumio-desktop), Next.js-managed (lumio-web) |
| electron-builder (build-tool) | Ja | ^26.0.12 |
| Playwright (e2e test-runner, site) | Ja | Zie `site/playwright.config.ts` |

---

## MINIMALE INPUT VALIDATIE

| Input | Verplicht | Status |
|-------|-----------|--------|
| Codebase toegankelijk (lees) | JA | ✓ |
| Minimaal één documentatiebron | JA | ✓ (meerdere, zie boven) |
| Doel van de audit beschreven | JA | ✓ (commando: `start` — FULL_AUDIT cyclus) |
| Git-history beschikbaar | AANBEVOLEN | ✓ |
| Stakeholder business requirements | AANBEVOLEN | ✓ (gedeeltelijk — README + devdocs) |

**Conclusie: Geen ONBOARDING_BLOCKED items. Cyclus kan starten.**

---

## CODEBASE SCAN SAMENVATTING

### Primaire talen
- **C#** (.NET 10 / ASP.NET Core) — backend API
- **TypeScript** (Next.js 15, React) — embedded frontend web-app
- **TypeScript** (Electron 35) — desktop shell
- **TypeScript** (Next.js) — marketing/landingssite (`site/`)

### Frameworks & Sleutellibraries

**Backend (`src/Lumio.Api`):**
- ASP.NET Core (net10.0)
- Entity Framework Core 10 + SQLite/SQLCipher (versleuteld lokaal database)
- FluentValidation 11
- Mapster 7 (object mapping)
- QuestPDF 2026.2.1 (PDF-export)
- RulesEngine 5 (business rules)
- SecretSharingDotNet 0.14.0 (Shamir Secret Sharing — toegang door nabestaanden)
- Serilog 9 (structured logging)
- Swashbuckle / OpenAPI 10

**Frontend (`src/lumio-web`):**
- Next.js 15 (React, App Router)
- TanStack Query 5
- React Hook Form + @hookform/resolvers
- Radix UI (headless components)
- @dnd-kit (drag-and-drop)
- Vitest (unit tests)
- Storybook + Chromatic (UI component library)
- size-limit (bundle size CI enforcement)

**Desktop (`src/lumio-desktop`):**
- Electron 35
- electron-builder 26
- TypeScript 5.9

**Site (`site/`):**
- Next.js
- Playwright (smoke tests)

### Mapstructuur (top-2 niveaus)

```
Lumio/
├── src/
│   ├── Lumio.Api/          — .NET 10 ASP.NET Core API (30+ controllers)
│   ├── Lumio.Api.Tests/    — .NET testproject (unit + integratietests)
│   ├── lumio-web/          — Next.js 15 frontend (ingebed in Electron)
│   └── lumio-desktop/      — Electron 35 shell
├── site/                   — Publieke marketingsite (Next.js + Playwright)
├── data/                   — Lokale runtime data (profiles, logs, videos)
├── devdocs/                — Interne ontwikkelaarsdocumentatie
├── docs/                   — Audit-systeem contracts, guardrails, playbooks
├── documentation/          — Eindgebruikers- en technische manuals (NL + EN)
├── tools/                  — Build-scripts, whitelabel configs
└── .github/                — CI/CD workflows, Copilot skills, Dependabot
```

### Functiedomeinen (gedetecteerd via Controllers + Frontend-routes)

| Domein | Controller(s) | Frontend-route |
|--------|---------------|----------------|
| Authenticatie / setup | `AuthController`, `AuthSetupController` | `/` (login) |
| Testament | `TestamentController`, `TestamentBegunstigdenController`, `TestamentExecuteursController`, `TestamentJuridischeCheckController`, `TestamentSnapshotsController` | `/testament` |
| Uitvaartwensen | `UitvaartController` | `/uitvaart` |
| Donorregistratie | `DonorController` | `/donor` |
| Euthanasie-wilsverklaring | `EuthanasieController` | `/euthanasie` |
| Digitaal bezit | `DigitaalBezitController` | `/digitaal-bezit` |
| Documenten / bestanden | `DocumentenController`, `DocumentenBestandenController` | `/documenten` |
| Erfgenamen | `ErfgenamenController` | `/erfgenamen` |
| Noodcontacten | `NoodcontactenController` | `/noodcontacten` |
| Boedel | `BoedelController` | `/boedel` |
| Videoboodschappen | `VideoboodschappenController` | `/videoboodschappen` |
| Export (PDF / CSV / Backup) | `ExportController`, `ExportCsvController`, `ExportBackupController`, `ExportDataController` | `/export` |
| Shamir (nalatenschap-overdracht) | `ShamirController` | INSUFFICIENT_DATA: routepad niet bevestigd |
| Profile / Eigenaar | `ProfileController`, `EigenaarController` | `/eigenaar` |
| Audit-log | `AuditLogController` | `/audit-log` |
| Status & actualisatie | `StatusController`, `StatusActualisatieController`, `StatusDataController` | `/tijdlijn` (vermoedelijk) |
| Notities | `NotitiesController` | INSUFFICIENT_DATA: frontend-route niet bevestigd |
| Zoeken | `ZoekenController` | INSUFFICIENT_DATA: frontend-route niet bevestigd |
| Werkgever | `WerkgeverController` | INSUFFICIENT_DATA: frontend-route niet bevestigd |
| Afhandeling | `AfhandelingController` | INSUFFICIENT_DATA: frontend-route niet bevestigd |
| Toewijzingen | `ToewijzingenController` | INSUFFICIENT_DATA: frontend-route niet bevestigd |

### CI/CD

- **Platform:** GitHub Actions
- **Workflows:**
  - `ci.yml` — Frontend (lint/typecheck/test/build) + Backend (.NET test) + site-build
  - `codeql.yml` — Statische beveiligingsanalyse (CodeQL)
  - `deploy-site.yml` — Deployment van de marketing-site
- **Trigger:** Push/PR naar `main`

### Tests

| Project | Framework | Type | Coverage enforcement |
|---------|-----------|------|---------------------|
| `src/lumio-web` | Vitest | Unit | ≥70% op `lib/` en `stores/` (CI enforcement) |
| `src/Lumio.Api.Tests` | .NET (xUnit vermoedelijk) | Unit + integratietests | UNCERTAIN: drempelwaarde onbekend |
| `site/tests/` | Playwright | E2E smoke tests | Nee |

### Technische schuldindicatoren

- **TODO-commentaren:** 0 (grep over `src/**/*.{ts,tsx,cs}` — geen resultaten)
- **FIXME-commentaren:** 0
- **HACK-commentaren:** 0

### Opvallende bevindingen (OUT_OF_SCOPE — doorgeven aan Fase-2 agents)

- `OUT_OF_SCOPE: Architectuur` — SQLCipher-encrypted SQLite van een desktop apps is een ongebruikelijk maar bewuste beveiligingskeuze; vereist Security Architect review.
- `OUT_OF_SCOPE: Architectuur` — Shamir Secret Sharing integratie (nalatenschap-overdracht aan nabestaanden) is een interessante UX/security-afweging.
- `OUT_OF_SCOPE: Business` — Geen expliciete prijsstrategie of commercieel model aangetroffen in de codebase. Whitelabel-corporate route is gedetecteerd maar niet verder uitgewerkt in docs.
- `OUT_OF_SCOPE: Marketing` — PostHog analytics aanwezig (`devdocs/posthog-analytics.md`); scope en consent-aanpak moet worden beoordeeld (DPIA ook aanwezig).
- `OUT_OF_SCOPE: UX` — 15-hoofdstukken gebruikershandleiding impliceert rijke feature-set, maar usability testing is INSUFFICIENT_DATA behalve Shamir-protocol.
- `OUT_OF_SCOPE: Architectuur` — Git branch is `Feature/UI`, niet `main`. Dit kan betekenen dat er actieve lopende wijzigingen zijn die de stabiliteit beïnvloeden.

---

## TOOLING STATUS RAPPORT

| Tool | Status | Versie | Categorie | Blokkeert |
|------|--------|--------|-----------|-----------|
| Bestandssysteem (lees) | BESCHIKBAAR | — | A | Fase 1–4 + Fase 5 |
| Git (read-only) | BESCHIKBAAR | 2.48.1.windows.1 | A | Geen (AANBEVOLEN) |
| Bestandssysteem (schrijf) | BESCHIKBAAR | — | B | Alle fasen |
| .NET SDK (dotnet) | BESCHIKBAAR | 10.0.103 | C | Fase 5 |
| Node.js | BESCHIKBAAR | v22.14.0 | C | Fase 5 |
| npm | BESCHIKBAAR | 10.9.2 | C | Fase 5 |
| Vitest | BESCHIKBAAR | npm-managed | C | Fase 5 |
| .NET test runner | BESCHIKBAAR | dotnet-managed | C | Fase 5 |
| ESLint | BESCHIKBAAR | npm-managed | C | Fase 5 |
| TypeScript (tsc) | BESCHIKBAAR | ~5.9.3 | C | Fase 5 |
| electron-builder | BESCHIKBAAR | ^26.0.12 | C | Fase 5 |
| Playwright | BESCHIKBAAR | npm-managed (site) | C | Fase 5 (site smoke) |
| Dependency scanner | TOOL_UNTESTED | — | D | Geen |
| Code coverage tool | BESCHIKBAAR | Vitest (ingebouwd) + dotnet coverage | D | Geen |
| Accessibility checker | TOOL_UNTESTED | — | D | Geen |

**TOOLING_GAP items:** Geen kritieke gaps gedetecteerd. Alle Categorie A, B en C tools zijn aanwezig.

---

## OPENSTAANDE INSUFFICIENT_DATA ITEMS

De volgende items ontbreken en worden meegegeven als context aan downstream Fase-agents:

| ID | Item | Impact | Aanbevolen actie |
|----|------|--------|-----------------|
| ID-001 | Eerdere auditresultaten / re-evaluatierapporten | Fase 1–4 (context) | Gebruiker gevraagd: zijn er re-evaluatierapporten (bijv. `re-evaluation-report-v2.md`) beschikbaar in het systeem of op een eerder pad? |
| ID-002 | KPI-definities | Fase 1 (Financial Analyst) | Documenteer als INSUFFICIENT_DATA in Financial Analyst output; vraag stakeholder |
| ID-003 | Brand guidelines (standalone document) | Fase 4 (Brand Strategist) | Whitelabel-configs beschikbaar als proxy; Brand Strategist kan afleiden uit de bestaande kleurpaletten en naming |
| ID-004 | EN-documentatie (technische manual + user manual) inhoud | Fase 3 + DOF Documentation Agent | Controleer of EN-mappen gevuld zijn voor NL↔EN consistentiecheck |
| ID-005 | Frontend-routes voor: Shamir, Notities, Zoeken, Werkgever, Afhandeling, Toewijzingen | Fase 3 (UX Researcher) | Nader te onderzoeken door UX Researcher en Senior Developer |
| ID-006 | Commercieel model / prijsstrategie | Fase 1 (Business Analyst, Financial Analyst) | Documenteer als INSUFFICIENT_DATA; stakeholder-input vereist |
| ID-007 | PostHog analytics consent-scope en configuratie | Fase 4 (Growth Marketer) + Security (DPIA) | `devdocs/posthog-analytics.md` aanwezig — Fase-2 Security Architect en Fase-4 Growth Marketer dienen dit te reviewen |

---

## AANBEVOLEN AANVULLENDE INPUT

De volgende aanvullende input zou de analysekwaliteit significant verbeteren:

1. **Prijsmodel en business canvas** — Geen commercieel model aangetroffen; essentieel voor Fase 1.
2. **Gebruikersonderzoek (buiten Shamir-test)** — Bredere UX-onderzoeksdata ontbreekt.
3. **KPI-dashboard of -definitielijst** — Ontbreekt; Financial Analyst heeft dit nodig.
4. **Re-evaluatierapporten** (v2.x) — Git-history suggereert dat eerder auditwerk is gedaan maar bestanden zijn niet aangetroffen in de workspace.
5. **Concurrent analyse** — Geen benchmark-data aangetroffen; relevant voor Fase 1 (Domain Expert).

---

## HANDOFF CHECKLIST — Onboarding Agent

- [x] Input Inventarisatie volledig ingevuld (geen lege rijen zonder markering)
- [x] Minimale input validatie geslaagd (alle VERPLICHT items ✓)
- [x] ONBOARDING_BLOCKED items zijn gedocumenteerd en gecommuniceerd aan gebruiker (geen BLOCKED items)
- [x] Codebase Scan Samenvatting aanwezig
- [x] Geen secrets / credentials gelezen of gelogd
- [x] Tooling verificatie uitgevoerd conform tooling-contract.md
- [x] TOOLING_GAP items gedocumenteerd (geen kritieke gaps)
- [x] Session State aangemaakt op docs/session/session-state.json
- [x] Onboarding Output Document aanwezig op docs/onboarding/onboarding-output.md
- [x] Status: ONBOARDING_COMPLETE — klaar voor Fase 1

---

**STATUS: ONBOARDING_COMPLETE**
**Volgende agent: 01-business-analyst (Fase 1)**
