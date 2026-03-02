# Analyse – Techniek & Code Kwaliteit (Senior Developer) – 2026-03-02
> Senior Developer | Agent 06 | Fase 2

## Metadata
- Agent: Senior Developer (06)
- Fase: 2
- Input ontvangen van: Software Architect (05) — `docs/fase-2/05-software-architect-analyse.md`
- Datum: 2026-03-02
- Software onder analyse: Lumio v1.0.0

---

## Code Sampling Strategie

| Categorie | % geanalyseerd | Aanpak |
|-----------|----------------|--------|
| Entry points (Program.cs, main/index.ts, app/layout.tsx) | 100% | Volledig gelezen |
| Core business logic (Services, Domain) | ~60% | Security-services volledig; PDF/Export steekproef |
| Configuratiebestanden | 100% | package.json, .env.example, vitest.config.ts, eslint.config.mjs (gesignaleerd), CI-workflows |
| API routes / controllers | ~30% | AuthController, ErfgenamenController volledig; 32 overige controllers steekproef op patroon |
| Overige (stores, lib, tests) | ~70% | authStore, api-client, api-error volledig; testinfrastructuur steekproef |

**Analyse-dekking:** ~55% van totale codebase. Kernpaden (entry points, security, data, auth) >80% gedekt.

---

## 1. Current State

### 1.1 SOLID Analyse

#### Single Responsibility Principle (SRP)
- **Bevinding (backend):** Controllers bevatten HTTP-afhandeling, data-access-logica en business-regels tegelijk. `ErfgenamenController.Create` voert validatie, cascade-logica en audit-logging uit in één methode.
  - **Bron:** `src/Lumio.Api/Controllers/ErfgenamenController.cs:49-59`
  - **Impact:** Midden — vergroot methode-complexiteit bij doorontwikkeling; single controller wordt verantwoordelijk voor te veel gedrag.
- **Bevinding (frontend):** `authStore.ts` houdt uitsluitend auth-state bij — goede SRP-toepassing.
  - **Bron:** `src/lumio-web/src/stores/authStore.ts`

#### Open/Closed Principle (OCP)
- **Bevinding:** RulesEngine (`lumio-rules.json`) maakt het toevoegen van business-regels mogelijk zonder codewijziging — OCP-conform toegepast voor bedrijfsregels.
  - **Bron:** `src/Lumio.Api/Rules/lumio-rules.json`; `src/Lumio.Api/Rules/Configuration/`
- **Zwakte:** PDF-generatoren (`TestamentGenerator`, `EuthanasieGenerator` etc.) zijn 14 afzonderlijke scoped services; een nieuw documenttype vereist een nieuwe class + DI-registratie in `Program.cs:88-108` — beperkt OCP-conform.
  - **Bron:** `src/Lumio.Api/Program.cs:87-108`

#### Liskov Substitution Principle (LSP)
- **Bevinding:** Geen aantoonbare LSP-schendingen gevonden in geanalyseerde code. Interfaces voor security-services (`IMasterPasswordService`, `IShamirService`, etc.) zijn clean en substitueerbaar (aantoonbaar via Fake-implementaties in tests).
  - **Bron:** `src/Lumio.Api.Tests/FakeMasterPasswordService.cs`; `src/Lumio.Api/Services/Security/`

#### Interface Segregation Principle (ISP)
- **Bevinding (goed):** Security-services hebben smalle, gefocuste interfaces met 3-6 methoden elk.
  - **Bron:** `src/Lumio.Api/Services/Security/IMasterPasswordService.cs`, `IBruteForceProtectionService.cs`, `IShamirService.cs`
- **Bevinding (aandachtspunt):** `IAuditService` heeft slechts 1 methode — correct. `IProfileService` heeft meerdere get-properties — functioneel maar eerder een service-interface dan een port/adapter-abstractie.
  - **Bron:** `src/Lumio.Api/Services/Security/IProfileService.cs`

#### Dependency Inversion Principle (DIP)
- **Schending (Hoog):** Controllers injecteren `LumioDbContext` (concrete klasse) direct in de constructor — geen repository-interface of abstractielaag.
  - **Bron:** `src/Lumio.Api/Controllers/ErfgenamenController.cs:17-18`; idem voor AuthController en alle 32 overige controllers (patroon bevestigd via steekproef).
  - **Impact:** Hoog — unit-testen van business logic is alleen mogelijk met EF Core in-memory database, niet met mocks; verhoogde coupling.

### 1.2 Design Pattern Analyse

**Aanwezig en correct:**
- **Strategy pattern:** PDF-generatoren injiceren als afzonderlijke strategieën, aangeroepen door `ILumioPdfService` — correct gebruik.
- **Factory/Service Locator:** `TestDbFactory.cs` in testproject — correct voor test-isolation.
- **Fail-safe / Resilience:** `AuditService.LogAsync` vangt elke exception op en logt een warning zonder verre-werpen — correcte resilience voor non-critical dienst.
  - **Bron:** `src/Lumio.Api/Services/AuditService.cs:32-43`
- **Observer (via Zustand):** Frontend stores gebruiken Zustand's subscription model correct — reactief zonder boilerplate.

**Anti-patronen:**
- **Fat Controller:** Meerdere controllers gaan voorbij hun HTTP-transportverantwoordelijkheid door direct data-access en business-logica in hetzelfde object uit te voeren.
  - **Bron:** `src/Lumio.Api/Controllers/ErfgenamenController.cs:49-80`; patroon zichtbaar in alle geanalyseerde controllers.
- **Design-token bypass (frontend):** 224 van 234 ESLint-fouten zijn `design-system/no-raw-colors` overtredingen — ontwikkelaars van pagina-componenten gebruiken raw Tailwind-kleuren in plaats van semantische tokens.
  - **Bron:** `src/lumio-web/eslint-output.txt` — aantoonbaar voor `audit-log/page.tsx:26`, `boedel/page.tsx:336`, `dashboard/page.tsx:55` en tientallen andere bestanden.

### 1.3 Test Coverage Analyse

**Frontend:**
- Test-runner: Vitest 4 — twee projecten: `unit` (Node, snel) en `storybook` (Playwright/Chromium, browser)
- Coverage scope: `src/lib/**` en `src/stores/**` exclusief (bewust — geen UI-component-coverage)
- Coverage gate: ≥70% statements/branches/functions/lines — afdwongen in CI
- Testbestanden: 12 unit-testbestanden (stores + lib/utilities)
- Test-dekking UI-componenten: **niet gemeten** — afhankelijk van Storybook-tests
- **Bron:** `src/lumio-web/vitest.config.ts:29-37`

**Backend:**
- Test-runner: .NET xUnit (aangenomen op basis van `.runsettings`-bestanden; `UNCERTAIN: exact framework niet geverifieerd`)
- Testinfrastructuur: `TestDbFactory.cs`, Fakes voor alle stateful services (FakeAuditService, FakeMasterPasswordService, FakeProfileService, FakeVideoStorageService)
- Testbestanden: 31 `.cs` bestanden in `src/Lumio.Api.Tests/`
- Testreikwijdte: Controllers, Services, Validators, Rules, Middleware
- Controller-coverage: 4 controllers getest (`AuthControllerTests`, `ExportCsvControllerTests`, `ProfileControllerTests`, `VideoboodschappenControllerTests`) van de 34 beschikbare controllers = **~12% controller-testdekking**
  - **Bron:** `src/Lumio.Api.Tests/Controllers/` — 4 bestanden

**Kritieke code zonder tests:**
- 30 van 34 controllers hebben geen expliciete testbestanden
- Business-rules-engine (lumio-rules.json): UNCERTAIN — `src/Lumio.Api.Tests/Rules/` aanwezig maar niet volledig geverifieerd

### 1.4 Maintainability Analyse

**Positief:**
- Consistente naamgeving in NL (domeinlaag) en EN (infrastructuurlaag) — bewust patroon.
- Mapster correct gebruikt (performanter dan AutoMapper; geen reflectie bij runtime).
- API-client (`api-client.ts`) goed gestructureerd: centraal timeout (30s), locale-header, ApiError-abstractie, 429/423 specifieke behandeling.
  - **Bron:** `src/lumio-web/src/lib/api-client.ts:27-60`
- ReleaseYear comments netjes gedocumenteerd als grens voor veilige verwijdering (bv. MigratieDbHelper ADR-001).

**Aandachtspunten:**
- **ESLint-violations:** 234 errors + 234 warnings in `eslint-output.txt`. Aanget: 224 `design-system/no-raw-colors` overtredingen in page-componenten. Status onduidelijk: het CI-`lint` script faalt bij `npm run lint` als ESLint errors aanwezig zijn, maar het bestand `eslint-output.txt` is gecommit — vermoedelijk een tracked-output-bestand.
  - `UNCERTAIN: CI lint-status` — vereist verificatie of CI `npm run lint` streng faalt of alleen rapporteert.
- **React Hook exhaustive-deps warning:** `audit-log/page.tsx:72` — `loadEntries` ontbreekt als dependency van `useEffect`.
  - **Bron:** `src/lumio-web/eslint-output.txt:15`

### 1.5 Dependency Analyse (Code Niveau)

**Backend:**
- Alle dependencies op moderne versies (.NET 10, EF Core 10, Serilog 9).
- `Dynamic.Core` zombie-dependency verwijderd in SP-8 (bron: git-history `2a9b17d`).
- `SecretSharingDotNet 0.14.0` — crypto-essentieel pakket; versie recent.
- NuGet vulnerability scan aanwezig in CI (SP-8 geïmplementeerd).

**Frontend:**
- `next: ^16.1.6` — cutting-edge; let op dat Next.js 16 pre-release is (prod-gebruik van RC-versies draagt risico).
  - `SECURITY_FLAG: next@16.1.6 — verifieer of dit stabiele release is of RC/beta. Release-kandidaten in productie zijn niet aanbevolen.`
- `react: ^19.2.4` — React 19 stabiel uitgebracht dec. 2024; aanvaardbaar.
- `posthog-js: 1.356.1` → gefinixeerde versie (geen caret) — bewuste keuze voor stabiele analytics.
- `dompurify: ^3.3.1` — aanwezig voor HTML-sanitatie; correct.

---

## 2. Gaps

### GAP-DEV-001 — Controller-testdekking kritiek laag (~12%)
- **Beschrijving:** 30 van 34 controllers hebben geen dedicated testbestand. Controllers bevatten vanwege directe DbContext-koppeling ook business-logica die momenteel niet getest wordt.
- **Bron:** `src/Lumio.Api.Tests/Controllers/` — 4 van 34 controllers
- **Risico als niet opgelost:** Regressies in core business-flows (testament, erfgenamen, export) worden pas ontdekt via handmatige tests of klachten.
- **Prioriteit:** Hoog

### GAP-DEV-002 — 224 ESLint design-system/no-raw-colors overtredingen
- **Beschrijving:** Page-componenten gebruiken raw Tailwind CSS kleuren (`text-green-800`, `bg-blue-50`, etc.) in plaats van semantische design-system tokens. Een custom ESLint-rule (`design-system/no-raw-colors`) signaleert dit correct, maar de violations zijn nog niet opgelost.
- **Bron:** `src/lumio-web/eslint-output.txt` — 224 instances
- **Risico als niet opgelost:** Inconsistent visueel gedrag; design-systeem-updates breken de kleuren in page-componenten; onderhoud van dark mode / theming wordt complex.
- **Prioriteit:** Midden (functioneel geen impact; stijgt naar Hoog bij dark-mode implementatie)

### GAP-DEV-003 — next@16 pre-release risicocheck ontbreekt
- **Beschrijving:** `package.json` vermeldt `"next": "^16.1.6"`. Next.js 16 moet worden geverifieerd als stabiele release versus RC/beta.
- **Bron:** `src/lumio-web/package.json`
- **Risico als niet opgelost:** Als dit een release-kandidaat is, zijn breaking changes mogelijk bij patch-updates.
- **Prioriteit:** Midden

---

## 3. Risks

### RISK-DEV-001 — Gebrek aan controller-tests verhoogt regressierisico
- **Kans:** Hoog — elk nieuwe sprint voegt functionality toe aan controllers zonder testdekking
- **Impact:** Hoog — regressies in legacy-gegevens (testament, erfgenamen, export) zijn hoog-impact voor eindgebruiker
- **Risicoscore:** Hoog
- **Mitigatie:** Verhoog controller-testdekking gefaseerd; begin bij hoogste-risico-endpoints (auth, export, shamir)
- **Bron:** `src/Lumio.Api.Tests/Controllers/`

### RISK-DEV-002 — Design-system bypass creëert technische schuld in UI
- **Kans:** Hoog — 224 bestaande overtredingen gecombineerd met actieve development
- **Impact:** Midden — visuele inconsistentie en extra onderhoudslast
- **Risicoscore:** Midden
- **Mitigatie:** Maak `design-system/no-raw-colors` een CI-blocker (als dat nog niet het geval is); los backlog van violations op
- **Bron:** `src/lumio-web/eslint-output.txt`

---

## 4. KPI Baseline

| KPI | Huidige waarde | Bron | Meetmethode |
|-----|----------------|------|-------------|
| Frontend coverage (lib + stores) | ≥70% (gate afdwongen) | `vitest.config.ts:29-37`; CI | Vitest coverage report |
| Backend controller-testdekking | ~12% (4/34 controllers) | `src/Lumio.Api.Tests/Controllers/` | Directory count |
| ESLint errors (design-system) | 224 | `eslint-output.txt` | npm run lint |
| ESLint errors (overige) | 10 | `eslint-output.txt` | npm run lint |
| react-hooks/exhaustive-deps warnings | ≥1 (audit-log/page.tsx) | `eslint-output.txt:15` | npm run lint |

---

## 5. UNCERTAIN Items
- `UNCERTAIN: CI lint-status` — Reden: eslint-output.txt bevat 234 errors maar status van CI bij `npm run lint` is niet geverifieerd — Escalatie: controleer of `npm run lint` CI-step streng faalt of alleen rapporteert.
- `UNCERTAIN: next@16.1.6 release-type` — Reden: Next.js 16 bestond op 2026-03-02 als pre-release — Escalatie: DevOps Engineer verifieert npm registry status.
- `UNCERTAIN: .NET test framework` — Reden: xUnit aangenomen op basis van `.runsettings`-bestanden — Escalatie: DevOps Engineer verifieert bij uitvoering CI-stap.

## 6. INSUFFICIENT_DATA Items
- `INSUFFICIENT_DATA: Backend coverage-rapport` — Ontbrekend: kwantitatieve coverage voor .NET tests — Gevolg: backend testdekking ingeschat op basis van aantal testbestanden.

---

## SECURITY_FLAGS (voorwaarts naar Security Architect)
- `SECURITY_FLAG: next@16.1.6` — verifeer of pre-release; RC-gebruik in productie
- `SECURITY_FLAG: GAP-DEV-001` — 30 controllers zonder tests maakt regressie in auth/export flows moeilijk te detecteren

## HANDOFF CHECKLIST — Senior Developer
- [x] Alle secties (1-4) volledig ingevuld
- [x] SOLID-analyse per principe met bronvermelding
- [x] Design Pattern bevindingen met bron
- [x] Test coverage met concrete cijfers
- [x] Dependency-analyse uitgevoerd
- [x] UNCERTAIN items gedocumenteerd
- [x] INSUFFICIENT_DATA items gedocumenteerd
- [x] SECURITY_FLAGS doorgegeven
- [x] Status: READY voor DevOps Engineer (Agent 07)
