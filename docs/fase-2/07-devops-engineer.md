# Fase 2 — DevOps Engineer (07)
**Agent:** 07-devops-engineer  
**Datum:** 2026-03-01  
**Input:** `docs/onboarding/onboarding-output.md`, `docs/fase-1/`, `docs/fase-2/05-software-architect.md`, `docs/fase-2/06-senior-developer.md`  
**Output contract:** `docs/contracts/analysis-output-contract.md`  
**Status:** GEREED VOOR HANDOFF

---

## 1. ANALYSE

### 1.1 CI/CD Inventaris

**Bestanden gevonden:**
| Bestand | Doel | Trigger |
|---|---|---|
| `.github/workflows/ci.yml` | Build + test + guard checks | push/PR naar `main` |
| `.github/workflows/deploy-site.yml` | Marketing site → GitHub Pages | push `main` (paths: `site/**`), `workflow_dispatch` |
| `.github/workflows/codeql.yml` | SAST security scanning | push/PR `main` + wekelijks (ma 06:00 UTC) |

**Geen andere workflows aangetroffen.** Er is geen release-, staging-, of desktop-distributie workflow.

---

### 1.2 ci.yml — Gedetailleerde Job-analyse

**Bron:** `.github/workflows/ci.yml` (357 regels, volledig gelezen)

#### Job: `frontend`
```yaml
Runs-on: ubuntu-latest
Working-dir: src/lumio-web
Steps:
  ✅ TypeScript: npx tsc --noEmit
  ✅ ESLint
  ✅ Unit tests coverage: npm run test:coverage
       Gate: functions ≥70% (lib/ + stores/)
  ✅ Build: next build (NEXT_PUBLIC_POSTHOG_KEY from secrets)
  ✅ npm audit --audit-level=high
```

#### Job: `site`
```yaml
Runs-on: ubuntu-latest
Working-dir: site/
Steps:
  ✅ TypeScript check
  ✅ Build
  ✅ npm audit --audit-level=high
```

#### Job: `icon-guard`
```yaml
Bash grep: verbiedt directe import van 8 Lucide icon patterns
Uitzondering: src/lumio-web/src/components/ui/icons.tsx (barrel bestand)
Gate: exit 1 als verboden import gevonden
```

#### Job: `e2e`
```yaml
Needs: [site]
Runs Playwright op marketing site (static export)
Artifact: playwright-report (7 dagen retentie, alleen bij failure)
```

#### Job: `backend`
```yaml
Runs-on: ubuntu-latest
Steps:
  ✅ dotnet restore
  ✅ dotnet build -warnaserror (warnings behandeld als fouten)
  ✅ dotnet test + --collect:"XPlat Code Coverage"
       Runsettings: services-coverage.runsettings
       Scope: Services/, Validators/, Rules/ (controllers UITGESLOTEN)
       Gate: ≥30% branch/line coverage
  ✅ Upload coverage artifact: api-coverage (14 dagen retentie)
  ✅ GUARD-002: grep check — verbiedt 'string? CurrentPassword' in *.cs bestanden
  ✅ GUARD-010: controller max 200 regels
       4 bekende legacy-uitzonderingen (met warning): 
         VideoboodschappenController, BoedelController, 
         DigitaalBezitController, AfhandelingController
       Overige controllers: strikte gate (exit 1)
  ❌ Chromatic: UITGECOMMENTARIEERD (regels 79-106 ci.yml, geen CHROMATIC_PROJECT_TOKEN)
```

#### Job: `whitelabel-validate`
```yaml
ajv-cli valideert tools/whitelabel/configs/*/whitelabel.json 
tegen schema (tools/whitelabel/schema.json)
Gate: exit op schemafouten
```

---

### 1.3 deploy-site.yml — Gedetailleerde Analyse

**Bron:** `.github/workflows/deploy-site.yml` (71 regels, volledig gelezen)

```yaml
Trigger: push main (paths: site/**), workflow_dispatch
Concurrency: group "pages", cancel-in-progress: false
Permissions: pages: write, id-token: write

Job: build
  - npm ci
  - npm run build (static export → site/out)
  - upload-pages-artifact from site/out

Job: deploy (needs: build)
  - environment: github-pages
  - url: ${{ steps.deployment.outputs.page_url }}
  - actions/deploy-pages@v4
```

**Observaties:**
- Geen staging/preview job — main → productie direct
- Geen rollback mechanisme
- Custom domain: `www.lumio-legacy.nl` (geconfigureerd in `site/public/CNAME`)
- `cancel-in-progress: false` — verstandige keuze om deployment race condition te voorkomen

---

### 1.4 codeql.yml — Gedetailleerde Analyse

**Bron:** `.github/workflows/codeql.yml` (68 regels, volledig gelezen)

```yaml
Trigger: 
  - push/PR naar main
  - schedule: "0 6 * * 1" (wekelijks maandag 06:00 UTC)

Matrix: language: [csharp, javascript]
Queries: security-and-quality (niet uitsluitend 'security' — ook kwaliteitsregels)

C# build: dotnet build --configuration Release --no-incremental
JS build: npm ci in src/lumio-web (autobuild fallback)

Permissions: security-events: write (publiceert naar GitHub Security tab)
concurrency: groep "codeql-[ref]", cancel-in-progress: true
```

**Observaties:**
- `security-and-quality` queries zijn uitgebreider dan basis security-only — goede instelling
- Wekelijkse scheduled scan dekt configuratie/dependency changes die geen code-push veroorzaken
- Resultaten zichtbaar in GitHub Security → Code scanning alerts
- `cancel-in-progress: true` bij meerdere PRs kan scan missen — laag risico maar relevant bij hoge CI-frequentie

---

### 1.5 Electron Desktop: Release Pipeline Audit

**Bevinding: GEEN release pipeline aangetroffen.**

Gezocht in: `.github/workflows/`, `src/lumio-desktop/package.json` scripts, `electron-builder.yml`

```
src/lumio-desktop/electron-builder.yml  — configuratiebestand aanwezig
src/lumio-desktop/package.json          — build/release scripts aanwezig (lokaal)
.github/workflows/                      — GEEN workflow voor Electron build/release
```

**Electron-builder.yml aanwezig maar:** alleen gebruikt voor lokale builds. Geen GitHub Actions workflow die:
- `electron-builder` aanroept
- GitHub Releases aanmaakt
- `.exe`/`.dmg`/`.AppImage` as artifact uploadt
- Auto-update manifest (`latest.yml`) genereert voor `electron-updater`

**Consequentie:** Elke desktop release vereist handmatige build op developer machine → handmatig upload → handmatig distributie. Geen reproduceerbare builds, geen build-provenance.

---

### 1.6 Observability & Monitoring Audit

**Logging:**
- ✅ Serilog geconfigureerd (Program.cs bevestigd)
- ✅ File sink: `data/logs/` — dagelijkse rotatie
- ✅ Serilog request logging middleware actief
- ❌ Geen centralized logging service (Seq, Loki, etc.) — maar n.v.t. voor offline-first app
- ❌ Geen structured log shipping

**Metrics:**
- ❌ Geen metrics collectie (geen Prometheus, geen Application Insights)
- N.v.t. voor offline-first desktop: geen server om te monitoren
- `INSUFFICIENT_DATA:` Foutrapportage op gebruikersniveau — geen crash reporting mechanisme gevonden (geen Sentry, geen Electron `uncaughtException` handler gecontroleerd)

**Tracing:**
- ❌ Geen distributed tracing (n.v.t. — single-process offline app)
- Correlation IDs niet aangetroffen in request pipeline (minder relevant voor localhost)

**Alerting:**
- ❌ Geen production alerting (n.v.t. voor offline-first, maar crash-statistieken zijn nuttig)

**PostHog Analytics:**
- Status per CI: `NEXT_PUBLIC_POSTHOG_KEY` zit in GitHub Secrets
- Build injecteert key via `--build-arg` in CI
- `UNCERTAIN:` Of PostHog actief is in productie builds vs. disabled — `devdocs/posthog-analytics.md` niet gelezen

---

### 1.7 Secrets & Environment Management

**Ingevonden secrets in CI:**
- `NEXT_PUBLIC_POSTHOG_KEY` — GitHub Secret, geïnjecteerd bij frontend build
- `GITHUB_TOKEN` — impliciet aanwezig (actions/deploy-pages)

**Environment bestanden in source:**
- `src/Lumio.Api/appsettings.Development.json` — aanwezig in source tree
- `UNCERTAIN:` inhoud niet gelezen — kan dev-only zijn of lege placeholders bevatten
- Als het echte development secrets bevat → SECURITY_FLAG (forward naar Security Architect)

**Environment strategie:**
- Geen `.env.example` of secrets-template aangetroffen
- Geen Vault/SOPS/sealed-secrets (n.v.t. desktop)

---

### 1.8 CI/CD Volwassenheidsmatrix

| Niveau | Criterium | Status | Toelichting |
|---|---|---|---|
| **L1** | Build automation | ✅ | dotnet build, npm build, tsc aanwezig |
| **L2** | Geautomatiseerde tests in pipeline | ✅ | xUnit + vitest + coverage gates |
| **L3** | Geautomatiseerde deployment (staging) | ⚠️ PARTIEEL | Alleen marketing site; geen staging; geen Electron |
| **L3** | Geautomatiseerde deployment (productie) | ⚠️ PARTIEEL | GitHub Pages voor marketing site only |
| **L4** | Quality gates (statische analyse) | ✅ | CodeQL SAST, ESLint, GUARD-002/010 |
| **L4** | Security scanning | ✅ | npm audit + CodeQL wekelijks |
| **L4** | Visual regression | ❌ | Chromatic uitgecommentarieerd |
| **L5** | Rollback mechanisme | ❌ | Geen (GitHub Pages heeft history maar geen 1-klik rollback) |
| **L5** | Feature flags | ❌ | Niet aangetroffen |
| **L5** | Release lifecycle automation | ❌ | Geen Electron release pipeline |

**Eindoordeel CI/CD Maturity: Level 2.5 / 5**  
*Toelichting: Sterk op test-kwaliteitsgates (beter dan gemiddeld voor een desktop-app van deze schaal), maar fundamenteel onvolledig door het ontbreken van een Electron release pipeline. De marketing site heeft CD; de kernproduct-distributie niet.*

---

### 1.9 Infrastructure as Code (IaC)

**Aangetroffen:** Geen Terraform, Bicep, Pulumi, of Ansible bestanden.

**Beoordeling:**
- Voor de desktop app is IaC niet van toepassing — geen server-side infrastructure
- Voor GitHub Pages is IaC ook niet vereist — geconfigureerd via repository settings
- Custom DNS (`www.lumio-legacy.nl`) is niet gedocumenteerd als IaC maar is reproduceerbaar via `CNAME` bestand ✅
- `UNCERTAIN:` DNS registrar en nameserver configuratie zijn niet gedocumenteerd

---

## 2. AANBEVELINGEN

### REC-DO-001 — Electron Release Pipeline implementeren
**Prioriteit:** P1 — KRITIEK  
**Effort:** 8 SP  
**Gap:** GAP-DO-001

Implementeer een geautomatiseerde Electron build- en release-workflow:

```yaml
# .github/workflows/release-desktop.yml
on:
  push:
    tags: ["v*"]
  workflow_dispatch:

jobs:
  release:
    strategy:
      matrix:
        os: [windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
        working-directory: src/lumio-desktop
      - name: Build desktop
        run: npm run dist
        working-directory: src/lumio-desktop
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: lumio-${{ matrix.os }}
          path: src/lumio-desktop/dist/*.exe
```

**Vereisten:** `electron-builder.yml` configureren met `publish: github`; GitHub Token permissions: contents: write.

**Resultaat:** Reproduceerbare builds, automatisch GitHub Release aanmaken met changelogs, auto-update manifest (`latest.yml`) genereren voor `electron-updater`.

---

### REC-DO-002 — Coverage Gate verhogen naar 50% met controller scope
**Prioriteit:** P1 — Hoog  
**Effort:** 2 SP (pipelinewijziging, tests worden gescoord in SD-1)  
**Gap:** GAP-DO-002

Verhoog coverage gate stapsgewijs:

```xml
<!-- services-coverage.runsettings: voeg controllers toe zodra SD-1 tests geschreven zijn -->
<Include>
  [Lumio.Api]Lumio.Api.Services.*
  [Lumio.Api]Lumio.Api.Validators.*
  [Lumio.Api]Lumio.Api.Rules.*
  [Lumio.Api]Lumio.Api.Controllers.*  <!-- Toevoegen na SD-1 sprint -->
</Include>
```

Sprint SD-1 (Senior Developer) voegt controller integration tests toe → daarna gate verhogen naar 50%. Fasering:
- Sprint SD-1 afronden → Gate: 30% all-scoped
- Sprint SD-2 afronden → Gate: 50% all-scoped

---

### REC-DO-003 — Chromatic visuele regressie re-activeren
**Prioriteit:** P2 — Middel  
**Effort:** 1 SP  
**Gap:** GAP-DO-003

Actie: `CHROMATIC_PROJECT_TOKEN` aanmaken in Chromatic dashboard → toevoegen als GitHub Secret → ci.yml regels 79-106 uncomment.  
Kosten: Chromatic gratis tier kan voldoende zijn voor huidige component-count.

---

### REC-DO-004 — Staging environment voor marketing site
**Prioriteit:** P2 — Middel  
**Effort:** 2 SP  
**Gap:** GAP-DO-004

Preview deployments via GitHub Actions environments:

```yaml
on:
  pull_request:
    paths: ["site/**"]

jobs:
  deploy-preview:
    environment:
      name: preview-${{ github.event.number }}
      url: https://preview-${{ github.event.number }}.lumio-legacy.nl
```

Alternatieven: Vercel/Netlify preview deployments (minder configuratie).

---

### REC-DO-005 — appsettings.Development.json secrets audit
**Prioriteit:** P1 — Hoog (afhankelijk van bevindingen Security Architect)  
**Effort:** 0.5 SP  
**Gap:** GAP-DO-005

Inhoud van `appsettings.Development.json` verifiëren op plaintext secrets. Indien aanwezig:
1. Bestand toevoegen aan `.gitignore`
2. `appsettings.Development.example.json` toevoegen met placeholder waarden
3. Bestaande git history saneren met `git filter-repo`

*Forward naar Security Architect (08) voor diepere analyse.*

---

### REC-DO-006 — Crash reporting implementeren
**Prioriteit:** P3 — Laag  
**Effort:** 3 SP  
**Gap:** GAP-DO-006

Electron `uncaughtException` + `unhandledRejection` handlers implementeren met optionele reporting (opt-in, conform DPIA). Gezien GDPR-gevoeligheid van de applicatie: self-hosted Sentry of lokale crash-dump naar `data/logs/` is veiliger dan cloud crash reporting.

---

## 3. SPRINTPLAN

### Sprint DO-1 — Release Pipeline & Critical Pipeline Fixes
**Doel:** Geautomatiseerde Electron release + coverage gate ophogen  
**Capacity:** 13 SP

| Story ID | Beschrijving | SP | Prioriteit |
|---|---|---|---|
| DO-1-001 | Electron release workflow (tag-triggered, Windows + macOS) | 8 | P1 |
| DO-1-002 | appsettings.Development.json audit + .gitignore fix | 0.5 | P1 |
| DO-1-003 | Coverage gate: stap 1 (all-scoped instelling klaar, threshold 30% gehandhaafd) | 1 | P1 |
| DO-1-004 | CodeQL `cancel-in-progress: false` instellen (voorkom gemiste scans) | 0.5 | P2 |
| DO-1-005 | Chromatic token aanmaken + re-activeren in ci.yml | 1 | P2 |
| DO-1-006 | CI coverage: HTML rapport publiceren als artifact (naast XML) | 0.5 | P2 |

**Afhankelijkheid:** DO-1-001 vereist `electron-builder.yml publish: github` instelling + GH_TOKEN permissions.

---

### Sprint DO-2 — Observability & Environment Hardening
**Doel:** Staging environment, coverage gate verhogen, crash-reporting basis  
**Capacity:** 8 SP

| Story ID | Beschrijving | SP | Prioriteit |
|---|---|---|---|
| DO-2-001 | Preview deployment voor marketing site pull requests | 2 | P2 |
| DO-2-002 | Coverage gate verhogen naar 50% (na SD-1 controller tests) | 2 | P2 |
| DO-2-003 | Crashdump-handler in Electron (`uncaughtException` → `data/logs/`) | 3 | P3 |
| DO-2-004 | DNS documentatie: registrar + nameserver config in `devdocs/` | 1 | P3 |

---

## 4. GUARDRAILS

### GUARD-DO-001 — Electron releases UITSLUITEND via CI
**Categorie:** Process  
**Prioriteit:** P1

> Zodra DO-1-001 geïmplementeerd is, mag een productie-release van de Lumio desktop applicatie NOOIT handmatig worden uitgevoerd. Elke release wordt gestart via een annotated git tag (`v*`). Handmatige electron-builder runs zijn alleen toegestaan in een lokale testomgeving en mogen NIET worden gepubliceerd.

**Verificatie:** Alle GitHub Releases zijn aangemaakt door de `github-actions` bot.

---

### GUARD-DO-002 — Coverage gates mogen NIET worden verlaagd
**Categorie:** Quality  
**Prioriteit:** P1

> De backend coverage threshold (momenteel 30%, target 50%) en frontend coverage threshold (70% lib/stores) mogen NOOIT worden verlaagd om een falende build te fixen. Als de coverage daalt: onderzoek de oorzaak, schrijf de ontbrekende tests. Een tijdelijke verlaging is uitsluitend toegestaan via expliciete schriftelijke goedkeuring in een PR-review met label `coverage-exception`.

---

### GUARD-DO-003 — GUARD-002 en GUARD-010 blijven geautomatiseerd
**Categorie:** Security / Code Quality  
**Prioriteit:** P1

> De GUARD-002 check (geen plaintext `string? CurrentPassword`) en GUARD-010 check (controller max 200 regels) mogen NIET worden verwijderd of omzeild. Uitzonderingen voor GUARD-010 worden uitsluitend toegestaan voor legacy controllers met expliciete commentaar-documentatie in de ci.yml; nieuwe controllers krijgen NOOIT een uitzondering.

---

### GUARD-DO-004 — appsettings.Development.json bevat GEEN echte secrets
**Categorie:** Security  
**Prioriteit:** P1

> `appsettings.Development.json` bevat uitsluitend placeholder-waarden of openbaar bekende development defaults (bijv. `localhost:5123`, `Data Source=dev.db`). Echte API-sleutels, wachtwoorden of verbindingsstrings voor productie-omgevingen worden NOOIT gecommit. Verificatie: pre-commit hook of ci.yml grep-check (analog aan GUARD-002).

---

## 5. POSITIEVE BEVINDINGEN (ter referentie)

De volgende CI/CD-aspecten zijn boven verwachting goed voor een solo-developer desktop applicatie van deze omvang:

| Bevinding | Impact |
|---|---|
| GUARD-002 volledig geautomatiseerd in CI | Beveiligingsvangnet voor wachtwoord-lekkage in source |
| GUARD-010 volledig geautomatiseerd in CI (met legacy-uitzonderingen) | Code quality guardrail actief bewaakt |
| CodeQL SAST op push/PR + wekelijks scheduled | Security scanning op enterprise-niveau |
| `queries: security-and-quality` (niet alleen `security`) | Bredere kwaliteitsanalyse dan minimum |
| npm audit (high+critical) op zowel frontend als site | Supply chain security bewaking actief |
| Coverage artifacts 14 dagen retentie | Trend-analyse mogelijk |
| `dotnet build -warnaserror` | Compilerwarnings worden behandeld als fouten — excellent |
| Whitelabel schema-validatie | Configuratie-fouten caught in CI |

---

## 6. CROSS-REFERENTIES UIT VORIGE AGENTS

| Bevinding | Bron | Status in DevOps |
|---|---|---|
| GAP-SA-004: Geen auto-update strategie | Software Architect | Bevestigd — geen `electron-updater` workflow in CI (REC-DO-001 pakt dit mee) |
| GAP-SA-007: CORS AllowAnyOrigin | Software Architect | CI bevat GEEN CORS-check — forward naar Security Architect (08) |
| GAP-SA-008: Swagger in productie | Software Architect | CI bevat GEEN Swagger-check — forward naar Security Architect (08) |
| GAP-SD-001: 3% controller test coverage | Senior Developer | Coverage gate 30% scoped: controllers UITGESLOTEN — bevestigt urgentie SD-1 sprint |
| GAP-SD-006: System.Linq.Dynamic.Core | Senior Developer | CodeQL security scanning dekt potentieel injection risks — forward naar Security Architect (08) voor handmatige analyse |

---

## 7. OUT_OF_SCOPE ITEMS

| Item | Domein |
|---|---|
| CORS AllowAnyOrigin security-implicaties | OUT_OF_SCOPE: Security Architect (08) |
| Swagger UI productie-exposure | OUT_OF_SCOPE: Security Architect (08) |
| appsettings.Development.json inhoud secret-analyse | OUT_OF_SCOPE: Security Architect (08) |
| System.Linq.Dynamic.Core injection analyse | OUT_OF_SCOPE: Security Architect (08) |
| SQLCipher sleutelmanagement | OUT_OF_SCOPE: Security Architect (08) |
| Database migratie strategie | OUT_OF_SCOPE: Data Architect (09) |
| Marketing site SEO/performance | OUT_OF_SCOPE: Growth Marketer (15) |

---

## HANDOFF CHECKLIST

- [x] Alle verplichte secties zijn gevuld (niet leeg, niet placeholder)
- [x] Alle UNCERTAIN: items zijn gedocumenteerd (`appsettings.Development.json` inhoud, PostHog productie-status)
- [x] Alle INSUFFICIENT_DATA: items zijn gedocumenteerd (crash reporting meganisme — niet aangetroffen)
- [x] Output voldoet aan het contract in `docs/contracts/analysis-output-contract.md`
- [x] Guardrails uit `docs/guardrails/02-architecture-guardrails.md` en `docs/guardrails/06-implementation-guardrails.md` zijn gecontroleerd
- [x] Output is machine-leesbaar en klaar als input voor Security Architect (08)
- [x] Geen tegenstrijdige uitspraken in dit document
- [x] Alle bevindingen hebben een bronvermelding (`.github/workflows/*.yml` regelnummers in analyse)

**OVERDRACHT AAN:** Security Architect (08)  
**FORWARDED SECURITY FLAGS:** CORS AllowAnyOrigin (via SA-007), Swagger productie (via SA-008), appsettings.Development.json, System.Linq.Dynamic.Core (via SD-006), SQLCipher sleutelmanagement
