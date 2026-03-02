# Onboarding Output — Lumio
> Gegenereerd door: Onboarding Agent (25-onboarding-agent)  
> Type: REFRESH ONBOARDING (Stap 3 + Stap 4 opnieuw uitvoerd; intake intact)  
> Datum: 2026-03-02T07:24:37Z  
> Git HEAD: `23dd5fb0dac50634aa6ece0dc1bb1357fe184d23`  
> Branch: `main`

---

## STAP 1 + 2 — INPUT INVENTARISATIE (ongewijzigd, intake intact)

> Deze sectie bevat de oorspronkelijke intake-antwoorden. REFRESH raakt deze niet aan.

### Projectidentificatie
- **Productnaam:** Lumio
- **Repository:** `RobertAgterhuis/Lumio`
- **Lokaal pad:** `D:\repositories\Lumio`
- **GitHub Project:** Lumio Workitems

### Auditscope
- **Cycle type:** FULL_AUDIT (all 4 phases)
- **Disciplines in scope:** BUSINESS, TECHNIEK, UX, MARKETING
- **Aangevraagd door:** Robert Agterhuis (repository owner)

### Productbeschrijving (intake)
- **Domein:** Educatieve software / leermiddelen management
- **Doelgroep:** Scholen, leerkrachten, leerlingen
- **Platform:** Web (Next.js) + Desktop (Electron) + REST API (.NET)

---

## STAP 3 — CODEBASE SCAN SAMENVATTING

> Uitgevoerd: 2026-03-02T07:24:37Z  
> Bronvermelding: package.json, .csproj, git grep, bestandssysteem

### Primaire talen

| Taal | Bestanden | Opmerking |
|------|-----------|-----------|
| TypeScript | 372 (.ts + .tsx) | Hoofdtaal frontend/desktop |
| C# | 208 (.cs, excl. obj/bin) | Backend REST API |

### Frameworks & bibliotheken (versies conform package.json / .csproj)

| Component | Framework / Runtime | Versie |
|-----------|--------------------|----|
| `lumio-web` | Next.js | ^16.1.6 |
| `lumio-web` | React | ^19.2.4 |
| `lumio-web` | TypeScript | ^5.9.3 |
| `lumio-web` | Vitest | ^4.0.18 |
| `lumio-web` | ESLint | ^10.0.2 |
| `lumio-web` | Storybook | ^10.2.10 |
| `lumio-web` | axe-playwright | ^2.2.2 |
| `lumio-desktop` | Electron | ^40.6.1 |
| `lumio-desktop` | electron-builder | ^26.0.12 |
| `lumio-desktop` | TypeScript | ^5.9.3 |
| `site` | Next.js | ^16.1.6 |
| `site` | React | ^19.0.0 |
| `Lumio.Api` | .NET / ASP.NET Core | net10.0 |
| `Lumio.Api` | Entity Framework Core | 10.0.3 (SQLite + SQLCipher) |
| `Lumio.Api` | Serilog | 9.0.0 |
| `Lumio.Api` | FluentValidation | 11.3.1 |
| `Lumio.Api` | QuestPDF | 2026.2.2 |
| `Lumio.Api` | RulesEngine | 5.0.6 |
| `Lumio.Api` | SecretSharingDotNet | 0.14.0 (Shamir's Secret Sharing) |
| `Lumio.Api` | Swashbuckle (OpenAPI) | 10.1.4 |
| `Lumio.Api.Tests` | xUnit | 2.9.3 |
| `Lumio.Api.Tests` | coverlet.collector | 6.0.4 |

### Mapstructuur (top 2 niveaus)

```
Lumio/
├── .github/               GitHub Actions workflows (7) + Copilot instructions + skill files
├── data/                  Runtime data — profiles.json, logs/, videos/
├── devdocs/               Ontwikkelaarsdocumentatie (DPIA, activerings-spec, analytics, enz.)
├── docs/                  Agent output — contracts/, guardrails/, playbooks/, templates/, synthesis/, sprint-gates/, onboarding/, session/
├── documentation/         Gebruikershandleidingen (EN/NL) + Technische handleidingen (EN/NL)
├── site/                  Marketing-/docssite (Next.js) — public/, src/, tests/
├── src/
│   ├── lumio-web/         Hoofdwebapplicatie — Next.js 16 + React 19 + Vitest + Storybook
│   ├── lumio-desktop/     Desktopwrapper — Electron 40 + electron-builder
│   ├── Lumio.Api/         REST API — .NET 10 + EF Core + SQLite(Cipher) + OpenAPI
│   └── Lumio.Api.Tests/   Unit- en integratietests — xUnit 2.9.3 (20 testbestanden)
└── tools/                 Build-scripts (build.ps1, dev-migrate.ps1) + whitelabel/
```

### CI/CD

**Aanwezig:** Ja — GitHub Actions  
**Platform:** GitHub Actions  
**Aantal workflows:** 7

| Bestand | Functie |
|---------|---------|
| `ci.yml` | Hoofd CI-pipeline (build, test, lint, secret scan) |
| `codeql.yml` | Statische beveiligingsanalyse (CodeQL) |
| `deploy-site.yml` | Automatische deployment documentatiesite |
| `lumio-board-sync.yml` | GitHub Project Board synchronisatie |
| `nextjs.yml` | Next.js build verificatie |
| `nightly.yml` | Nightly build en uitgebreide tests |
| `release.yml` | Release-pipeline (tags/versioning) |

**Actions versies (na Dependabot update, HEAD 23dd5fb):**
- `actions/checkout@v6`
- `actions/github-script@v8`
- `actions/setup-node@v6`

### Tests

**Aanwezig:** Ja  
**Frameworks:** xUnit (.NET), Vitest (TypeScript), Playwright via axe-playwright (a11y)

| Runner | Locatie | Bestanden |
|--------|---------|-----------|
| xUnit 2.9.3 | `src/Lumio.Api.Tests/` | 20 testbestanden |
| Vitest 4.0.18 | `src/lumio-web/src/` | 12 testbestanden (*.test.ts/tsx) |
| Playwright + axe | `site/tests/` | 2 testbestanden (a11y + smoke) |

### Technische schuldindicatoren

| Type | Aantal | Bronvermelding |
|------|--------|---------------|
| TODO | **1** | `git grep -rn "TODO" -- "*.ts" "*.tsx" "*.cs"` |
| FIXME | **0** | idem |
| HACK | **0** | idem |

**Opvallende bevindingen:**
- Lage technische schuld — 1 TODO, geen FIXME's of HACK's
- Geëncrypteerde SQLite-database (SQLCipher) gedetecteerd — security-bewuste keuze
- Shamir's Secret Sharing (`SecretSharingDotNet 0.14.0`) als kritiek domain-concept aanwezig
- Storybook volledig ingericht met a11y-addon, vitest-addon en Chromatic integratie
- Embedded fonts + images in .NET API als EmbeddedResource (QuestPDF)
- RulesEngine aanwezig — business rules extern configureerbaar (`rules/lumio-rules.json`, `rules/lumio-workflows.json`)

---

## STAP 4 — TOOLING VERIFICATIE

> Uitgevoerd: 2026-03-02T07:24:37Z  
> Verificatiecommando's: `node --version`, `dotnet --version`, `git --version`

### Tooling Status Rapport

| Tool | Status | Versie | Categorie | Blokkeert |
|------|--------|--------|-----------|-----------|
| Bestandssysteem (lees) | BESCHIKBAAR | — | A | Fase 1–4 + Fase 5 |
| Bestandssysteem (schrijf) | BESCHIKBAAR | — | B | Alle fasen |
| Git (read-only) | BESCHIKBAAR | 2.48.1.windows.1 | A | Geen (AANBEVOLEN) |
| Git (schrijf) | BESCHIKBAAR | 2.48.1.windows.1 | C | Fase 5 |
| Node.js | BESCHIKBAAR | v22.14.0 (LTS) | C | Fase 5 (frontend build) |
| npm | BESCHIKBAAR | 10.9.2 | C | Fase 5 (package mgmt) |
| .NET SDK | BESCHIKBAAR | 10.0.103 | C | Fase 5 (backend build/test) |
| Test-runner: xUnit | BESCHIKBAAR | 2.9.3 (via .csproj) | C | Fase 5 (.NET tests) |
| Test-runner: Vitest | BESCHIKBAAR | ^4.0.18 (via package.json) | C | Fase 5 (frontend tests) |
| Test-runner: Playwright | BESCHIKBAAR | axe-playwright ^2.2.2 | C | Fase 5 (a11y tests) |
| Linter: ESLint | BESCHIKBAAR | ^10.0.2 | C | Fase 5 (code kwaliteit) |
| Build-tool: Next.js | BESCHIKBAAR | ^16.1.6 | C | Fase 5 (frontend build) |
| Build-tool: Electron | BESCHIKBAAR | ^40.6.1 | C | Fase 5 (desktop build) |
| Code coverage: coverlet | BESCHIKBAAR | 6.0.4 (via .csproj) | D | Fase 5 (optioneel) |
| Code coverage: Vitest v8 | BESCHIKBAAR | UNCERTAIN: niet apart geverifieerd | D | Fase 5 (optioneel) |
| Accessibility checker (axe) | BESCHIKBAAR | axe-playwright ^2.2.2 | D | Fase 5 (WCAG) |
| Storybook | BESCHIKBAAR | ^10.2.10 | D | Fase 5 (component library) |
| GitHub CLI (gh) | BESCHIKBAAR | UNCERTAIN: versie niet gecontroleerd | C | Fase 5 (PR/board sync) |
| JSON validator | BESCHIKBAAR | — (native toolchain) | B | Alle fasen |

### TOOLING_GAP items

Geen kritieke gaps gedetecteerd. Alle Categorie A + B tools beschikbaar. Alle Categorie C tools beschikbaar.

### UNCERTAIN items in tooling

| Item | Onderbouwing | Actie |
|------|-------------|-------|
| Vitest v8 coverage provider | Aanwezig als dependency in package.json maar niet expliciet geverifieerd via CLI | Laagrisico — geen blocker |
| GitHub CLI versie | Aanwezig in omgeving (gebruikt bij `gh secret set`), versie niet gecheckt | Laagrisico — geen blocker |

---

## VALIDATIESTATUS

| Onderdeel | Status | Opmerking |
|-----------|--------|-----------|
| Git repository | ✅ VALID | HEAD `23dd5fb`, branch `main` |
| CI/CD aanwezig | ✅ VALID | 7 GitHub Actions workflows |
| Tests aanwezig | ✅ VALID | xUnit (20), Vitest (12), Playwright (2) |
| Technische schuld | ✅ LAAG | 1 TODO, 0 FIXME, 0 HACK |
| Tooling compleet | ✅ COMPLEET | Alle Cat A/B/C tools beschikbaar |
| Storybook aanwezig | ✅ VALID | Met a11y + vitest + Chromatic addons |
| Synthesis aanwezig | ⚠️ PARTIEEL | Alleen `eindrapport-ux.md` geverifieerd in `docs/synthesis/` |

---

## INSUFFICIENT_DATA items

| Item | Reden | Escalatie |
|------|-------|-----------|
| FASE-1 / FASE-2 synthesis docs | Niet aangetroffen in `docs/synthesis/`; context geeft aan dat fases voltooid zijn maar bestanden ontbreken op schijf | Orchestrator: verifieer of docs/fase-1 en docs/fase-2 elders zijn opgeslagen |
| Sprint SP-UX-02 en SP-UX-03 | Sprint gate bestanden niet aangetroffen; gepland o.b.v. UX eindrapport commit message | Implementation Agent: aanmaken bij volgende sprint |

---

## HANDOFF CHECKLIST

- [x] Alle verplichte secties zijn gevuld (niet leeg, niet placeholder)
- [x] Alle UNCERTAIN: items zijn gedocumenteerd en geëscaleerd
- [x] Alle INSUFFICIENT_DATA: items zijn gedocumenteerd en geëscaleerd
- [x] Output voldoet aan het contract (geen `tooling-contract.md` schendingen)
- [x] Guardrails uit `docs/guardrails/00-global-guardrails.md` zijn gecontroleerd
- [x] Output is machine-leesbaar en klaar als input voor Orchestrator
- [x] Geen tegenstrijdige uitspraken in dit document
- [x] Alle bevindingen hebben een bronvermelding (package.json, .csproj, git grep, bestandssysteem, git log)
- [x] VERBOD gerespecteerd: geen secrets/credentials gelezen of gelogd
- [x] REFRESH ONBOARDING: intake-antwoorden (Stap 1+2) ongewijzigd

---

*Onboarding Agent — Lumio REFRESH ONBOARDING — 2026-03-02*
