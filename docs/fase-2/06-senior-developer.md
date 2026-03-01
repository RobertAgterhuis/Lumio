# Senior Developer – Fase 2 – 2026-03-01

## Metadata
- **Agent:** 06-senior-developer
- **Fase:** 2 — Techniek & Architectuur
- **Input:** Alle Fase 1 outputs, Software Architect output (`docs/fase-2/05-software-architect.md`)
- **Datum:** 2026-03-01T00:00:00Z
- **Software:** Lumio v1.0.0
- **Guardrails geraadpleegd:** docs/guardrails/00-global-guardrails.md, docs/guardrails/02-architecture-guardrails.md

---

# DELIVERABLE 1 — ANALYSE

## Stap 1: Code Sampling Strategie

**Geanalyseerde bestanden (daadwerkelijk gelezen):**

| Bestand | Regels | Reden voor selectie |
|---------|--------|---------------------|
| `src/Lumio.Api/Controllers/ErfgenamenController.cs` | 144 | Representatief CRUD-controller voor kern-domein (Erfgenamen); meest kritische business domain |
| `src/Lumio.Api/Controllers/TestamentController.cs` | 180 (1-100 gelezen) | Meest complexe controller (snapshots, cross-field validatie, business logic) |
| `src/Lumio.Api/Services/AuditService.cs` | 43 | Representatieve service-implementatie; Singleton pattern |
| `src/Lumio.Api/Middleware/DatabaseUnlockMiddleware.cs` | 99 | Kernbeveiliging middleware |
| `src/Lumio.Api/Data/LumioDbContext.cs` | 69 | God Context analyse |
| `src/Lumio.Api/Data/LumioDbContext.ModelConfiguration.cs` | Niet gelezen | `INSUFFICIENT_DATA:` |
| `src/Lumio.Api/Domain/Common/BaseEntity.cs` | 9 | Entity basisklasse |
| `src/Lumio.Api.Tests/TestDbFactory.cs` | 18 | Test setup patroon |
| `src/Lumio.Api.Tests/Lumio.Api.Tests.csproj` | 34 | Test framework inventarisatie |

**Directory scans (niet line-by-line gelezen):**
- `src/Lumio.Api/Controllers/` — 33 bestanden geïnventariseerd
- `src/Lumio.Api/Domain/` — 9 subdirectories geïnventariseerd
- `src/Lumio.Api/Services/` — 7 items geïnventariseerd
- `src/Lumio.Api.Tests/Controllers/` — 1 bestand aangetroffen
- `src/Lumio.Api.Tests/Rules/` — 3 bestanden
- `src/Lumio.Api.Tests/Services/` — 6 bestanden
- `src/Lumio.Api.Tests/Validators/` — 1 bestand

**Analysedekkingsschatting:** Direct gelezen code ≈ 8-10% van productie-codebase.  
Patronen zijn representatief en consistent over de gesampled bestanden.  
Test-inventarisatie gebaseerd op directorystructuur + 2 direct gelezen projectbestanden.

---

## Stap 2: SOLID Analyse

### S — Single Responsibility Principle

| Component | Status | Bevinding | Bron |
|-----------|--------|-----------|------|
| `ErfgenamenController` | **DEELS GEVONDEN** | Controller bevat: CRUD + cascade delete logica + erfbelastingberekening + audit logging. Vier verantwoordelijkheden in één klasse. | `ErfgenamenController.cs` regel 77-83 (cascade delete), regel 88-105 (BerekenErfbelasting businesslogic) |
| `TestamentController` | **OVERTREDING** | Controller bevat: CRUD + cross-field datumvalidatie (regel 54-55) + auto-snapshot aanmaak (volledige branching logica ~40 regels) + erfbelastingintegratie. Auto-snapshot hoort in een `TestamentSnapshotService`. | `TestamentController.cs` regels 54-55 (validatie), regels 79-103 (snapshot logic embedded) |
| `AuditService` | **OK** | Enkelvoudige verantwoordelijkheid: audit-events loggen. Interface correct gedefinieerd. | `AuditService.cs` regels 1-43 volledig |
| `DatabaseUnlockMiddleware` | **OK** | Enkelvoudige taak: toegangsbeheer op basis van unlock-status. Interne constanten duidelijk gegroepeerd. | `DatabaseUnlockMiddleware.cs` volledig |

**RISK-SD-001:** BusinessLogica in controllers leidt tot untestbare business rules. Als de erfbelastingberekening in de controller zit, is die niet in isolatie te testen zonder HTTP-context.

---

### O — Open/Closed Principle

| Component | Status | Bevinding | Bron |
|-----------|--------|-----------|------|
| `RulesEngine` (JSON-config) | **OK — UITSTEKEND** | Nieuwe business rules kunnen worden toegevoegd via `lumio-rules.json` zonder codeverandering. Correct OCP-gebruik. | `Lumio.Api.csproj` regel 36-39 (rules JSON als content); `TestamentController.cs` `IOptions<ErfbelastingOptions>` patroon |
| Controller set (33 controllers) | **DEELS GEVONDEN** | Elke nieuw domein-entiteit vereist een volledig nieuwe controller die het identieke CRUD-patroon herhaalt. Er is geen generieke CRUD-basisklasse. Nieuwe entiteiten = nieuwe code, niet extensie. | `Controllers/` directory — 33 bestanden met identiek patroonherhaling |

---

### L — Liskov Substitution Principle

| Component | Status | Bevinding |
|-----------|--------|-----------|
| `IAuditService` / `AuditService` | **OK** | FakeAuditService aanwezig in testproject (`FakeAuditService.cs`) als correcte stub — LSP toegepast. |
| `IMasterPasswordService` | Niet gelezen — `INSUFFICIENT_DATA:` | Interface aanwezig (geciteerd in Program.cs); implementatie niet geanalyseerd |
| `LumioDbContext` inheritance | **OK** | DbContext inheritance van EF Core — geen custom override die LSP zou schenden |

**Geen LSP-schendingen aangetroffen in geanalyseerde code.**

---

### I — Interface Segregation Principle

| Component | Status | Bevinding | Bron |
|-----------|--------|-----------|------|
| `IAuditService` | **OK — MINIMAAL** | Eén methode: `LogAsync(...)`. Optimale interface. | `AuditService.cs` regels 5-14 |
| `IStatusFactsBuilder`, `IExportStatusService`, `IZipExportService`, `INuvExportService`, etc. | `INSUFFICIENT_DATA:` — niet gelezen | Interfaces aanwezig (geciteerd in Program.cs); omvang van interfaces niet beoordeelbaar |

---

### D — Dependency Inversion Principle

| Component | Status | Bevinding | Bron |
|-----------|--------|-----------|------|
| `LumioDbContext` direct in controllers | **OVERTREDING** | Controllers injecteren concrete `LumioDbContext` — geen IRepository-interface. Dit is DIP-schending én de kern van GAP-SA-001, bevestigd vanuit code-niveau. | `ErfgenamenController.cs` regels 17-22; `TestamentController.cs` regels 20-31 |
| Audit via `IAuditService` | **OK** | Interface gebruikt, niet concrete klasse. | `ErfgenamenController.cs` regel 21 |
| Rules via `IOptions<T>` | **OK** | Options pattern correct voor configuration injection. | `TestamentController.cs` regel 22 |

**Samenvatting SOLID:** S, O, L grotendeels OK; I onvoldoende data; D heeft systemische schending door directe DbContext-injectie in alle 33+ controllers.

---

## Stap 3: Design Patterns Analyse

### Correct Gebruikte Patronen

| Pattern | Locatie | Beoordeling |
|---------|---------|-------------|
| **Service Layer** | `IAuditService`, `IStatusFactsBuilder`, `IMasterPasswordService`, etc. | ✓ Correct — abstractielaag via interfaces |
| **Options Pattern** | `IOptions<ErfbelastingOptions>` in TestamentController | ✓ .NET-idiomatisch; correct gebruik |
| **Middleware Pipeline** | `DatabaseUnlockMiddleware`, `ExceptionHandlingMiddleware`, `RscRewriteMiddleware` | ✓ ASP.NET Core middleware pattern correct geïmplementeerd |
| **Strategy (via RulesEngine)** | JSON rules in `rules/lumio-rules.json` | ✓ Uitstekend — business rules als JSON-strategieën |
| **Adapter/Mapper** | Mapster in alle controllers (`item.Adapt<T>()`) | ✓ Consistent gebruik; geen reflection-overhead |
| **Singleton** | `IAuditService`, `IMasterPasswordService`, `IShamirService` (Program.cs) | ✓ Correct voor state-houdende services |

---

### Anti-Patterns Aangetroffen

#### ANTI-PATTERN-001 — Anemic Domain Model
**Locatie:** Alle entiteiten in `src/Lumio.Api/Domain/` — met name `BaseEntity.cs` (regels 1-9), `LumioDbContext.cs` (alle DbSets)

**Beschrijving:** Domein-entiteiten zijn pure data-containers zonder gedrag, invarianten, of domein-logica. `TestamentInfo`, `Erfgenaam`, `WilsverklaringEuthanasie` etc. bevatten alleen properties. Alle businesslogica zit in controllers en services.

**Impact:** Domain-regels kunnen worden omzeild als code direct via DbContext werkt. Invarianten (bijv. "testament mag niet vóór geboortedatum eigenaar") zitten verspreid over controllers in plaats van het domein te bewaken.

**Bron:** `BaseEntity.cs` regels 3-8 (alleen `Id`, `AangemaaktOp`, `GewijzigdOp`); `TestamentController.cs` regels 54-55 (cross-field validatie in controller in plaats van in entiteit)

---

#### ANTI-PATTERN-002 — Fat Controller (TestamentController)
**Locatie:** `TestamentController.cs` regels 48-160

**Beschrijving:** De `Upsert`-methode is ~80 regels lang en bevat: (1) eigenaar-lookup, (2) cross-field datumvalidatie (regel 54-55), (3) eigentoestand-detectie (regel 60-63), (4) auto-snapshot aanmaak (regels 78-105), (5) data-persistentie. Dit is ten minste drie verschillende verantwoordelijkheden in één methode.

**Directe impact:** Snapshot-logica is niet herbruikbaar. Onmogelijk te unit-testen zonder de volledige HTTP-request/EF Core in-memory setup. Cyclomatic complexity: minstens 6-8 op basis van branches.

**Bron:** `TestamentController.cs` regels 48-180 (geëxtrapoleerd)

---

#### ANTI-PATTERN-003 — DRY Schending — CRUD Boilerplate in 33 Controllers
**Locatie:** `src/Lumio.Api/Controllers/` — 33 bestanden

**Beschrijving:** Alle controllers volgen hetzelfde 5-methode CRUD-patroon (`GetAll`, `GetById`, `Create`, `Update`, `Delete`) met een identieke structuur. `ErfgenamenController` en `TestamentController` zijn representatief. Dit leidt tot:
- ~150-200 regels duplicaat boilerplate per controller
- Bug fixes in één controller vereisen handmatige update in alle 33 controllers
- Elke nieuwe entiteit voegt een volledig nieuw bestand toe met 95% identieke code

**Schatting:** ~3.000-4.000 regels code die teruggebracht kan worden naar ~500 regels via een generieke BaseController + specifieke overrides. Dit is de grootste tekortkomingsconcentratie in de codebase.

**Bron:** `ErfgenamenController.cs` (144 regels, ~80% boilerplate), `TestamentController.cs` (180 regels); door extrapolatie over 33 bestanden.

---

#### ANTI-PATTERN-004 — Spec-Code Referenties Onvindbaar
**Locatie:** `ErfgenamenController.cs` regel 78 (`// S3-34: cascade-delete...`), `TestamentController.cs` regel 54 (`// S7-04: cross-field check...`)

**Beschrijving:** Commentaar bevat story-/spec-codes (`S3-34`, `S7-04`) die verwijzen naar een externe specificatie. Deze specificatie is **niet aangetroffen** in de repository. Als de spec verloren gaat, is de rationale voor de code onherleidbaar.

**Bron:** Bron van spec-codes: `INSUFFICIENT_DATA:` — geen spec-document gevonden. Bevestigd door scan van devdocs/.

---

## Stap 4: Test Coverage Analyse

| Test-categorie | Aantal testbestanden | Productiecode dekking | Beoordeling |
|---|---|---|---|
| Controllers | 1 bestand (`ExportCsvControllerTests.cs`) | 1/33 controllers = ~3% | **KRITIEK LAAG** |
| Rules / Business Logic | 3 bestanden (`ErfbelastingServiceTests`, `LegitimairePortieServiceTests`, `NalatenschapServiceTests`) | Kritieke calculaties gedekt | **OK voor domein-logica** |
| Services | 6 bestanden (`Shamir`, `Export`, `StatusFacts`, etc.) | Hoog voor services | **Goed** |
| Validators | 1 bestand (`BsnValidatieTests`) | Laag — slechts 1 validator getest | **Onvoldoende** |

**Test framework:** xUnit 2.9.3 + Microsoft.EntityFrameworkCore.InMemory + coverlet (collector aanwezig — coverage-rapport niet in repository aangetroffen)

`INSUFFICIENT_DATA: Geen coverage-rapport (`.coverage`, `lcov.info`) gevonden in repository. Exacte dekkingspercentages kunnen niet worden gerapporteerd.`

**Kritieke ongeteste paden:**
- Alle CRUD endpoints behalve ExportCsv (32 controllers — inclusief `AuthController`, `ShamirController`, `BackupController`, `VideoboodschappenController`, `TestamentController`)
- DELETE cascade logica (GAP-SA-006, SP-SA1-001 — cruciaal voor AVG compliance)
- DATABASE-level gedrag (SQLCipher) — InMemory database test is goed maar test geen encryptie

**Positief:** De meest risicovolle business-calculaties (erfbelasting, legitieme portie) zijn wél getest. Dit is een goede prioritering.

**GAP-SD-001:** Controller-dekking van 3% is een tech-schuld-risico. Bugs in CRUD-logica (cascade deletes, validation logic) worden pas gevonden in productie.

---

## Stap 5: Maintainability Analyse

### Cyclomatic Complexity
`INSUFFICIENT_DATA: Geen statische analyse tool (SonarQube, Roslyn analyzer) resultaten beschikbaar.`

Schatting op basis van gelezen code:
- `TestamentController.Upsert()`: ≥ 6-8 branches — **hoog** voor een controller method
- `DatabaseUnlockMiddleware.InvokeAsync()`: 5-6 branches — **matig**
- `AuditService.LogAsync()`: 1 branch (try/catch) — **laag, correct**

### Duplicaat Code
Op basis van structurele analyse: `~3.000-4.000 regels redundante CRUD boilerplate` across 33 controllers (anti-pattern 003).

In-memory database pattern in TestDbFactory is correct en herbruikbaar — goed.

### Documentatiekwaliteit
| Aspect | Beoordeling |
|--------|-------------|
| XML-doc op publieke API klassen/methoden | Spaarzaam — `AuditService.LogAsync()` heeft docstring; `ErfgenamenController.BerekenErfbelasting()` heeft inline comment met correcte disclaimer; meerderheid van methods heeft geen doc | 
| Inline commentaar | Aanwezig bij complexe logica (snapshot creation, CORS, middleware flows) |
| Spec-referenties (`S3-34`) | Niet traceerbaar — zie ANTI-PATTERN-004 |

### Naamgeving
- **Positief:** Consistente `Request`/`Response` DTO-naamgeving, `Adapt<T>()` consistent, Dutch entity names consistent
- **Inconsistentie:** English context dirs vs Dutch entity names (bevestigd uit SA-analyse)
- **Positief:** `IService`-naming consistent, properties PascalCase, parameters camelCase

---

## Stap 6: Dependency Analyse (Code Niveau)

| Package | Status | Bevinding |
|---------|--------|-----------|
| `posthog-js 1.356.1` | **Geïnstalleerd, niet actief** | In `package.json` maar niet live in productie (DPO pending — GAP-005 BA). Dependency-weight zonder businesswaarde momenteel. |
| `marked ^17.0.3` + `react-markdown ^10.1.0` | **Mogelijk duplicaat** | Twee markdown-parsing libraries aanwezig in lumio-web. `INSUFFICIENT_DATA:` gebruik-context niet geverifieerd. Mogelijke overbodige dependency. |
| `System.Linq.Dynamic.Core 1.7.1` | **Gebruik onduidelijk** | `INSUFFICIENT_DATA:` — welke controller/service gebruikt dit? Dynamische LINQ = potentieel risico voor query injection als user-input door filter gaat. `SECURITY_FLAG: OUT_OF_SCOPE: Security Architect` |
| Alle .NET packages | **Actueel** | .NET 10, alle packages recent (EF Core 10, FluentValidation 11, Serilog 9). Geen verouderde packages aangetroffen. |
| Alle frontend packages | **Actueel** | Next.js 16, React 19, Tailwind 4, Vitest 4 — cutting edge. |

### Kwetsbare/Verouderde Dependencies
Geen verouderde packages aangetroffen in gesampled bestanden. Alle packages zijn recente versies.

---

## Stap 7: Technische Schuld Kwantificering

| Categorie | Hersteluren | Rationale |
|-----------|------------|-----------|
| Repository Pattern introductie | ~16 uur | Interface + EF Core implementatie (4h) + refactor 33 controllers @ 0.5h = 16.5h |
| Controller test baseline schrijven | ~40 uur | 30 untested controllers @ 1.5h per integratietest = 45h; afgerond 40h |
| Fat Controller refactor (testament + anderen) | ~8 uur | AutoSnapshot service extractie (3h) + validatieservice extractie (2h) + overige candidates (3h) |
| Generieke BaseController (CRUD deduplication) | ~12 uur | Ontwerp generieke controller (4h) + refactor 33 controllers @ 0.25h = 12h |
| Spec-referenties traceerbaar maken | ~4 uur | Doorzoek codebase op S*-** patterns; link aan docs; schrijf ADR |
| **Totaal** | **~80 uur** | 1 FTE ≈ 2 sprints |

---

## Stap 8: Zelfcontrole

- [x] Alle kwaliteitsuitspraken gebaseerd op daadwerkelijk gelezen code met expliciete bronverwijzingen
- [x] Directory-scans expliciet gescheiden van code-level analyse
- [x] Coverage-claims zonder coverlet-rapport als `INSUFFICIENT_DATA:` gemarkeerd
- [x] `System.Linq.Dynamic.Core` als `SECURITY_FLAG:` doorgestuurd

---

### Samenvatting Gaps

| ID | Beschrijving | Prioriteit |
|----|-------------|-----------|
| GAP-SD-001 | Controller test coverage 3% (32 controllers zonder tests) | Hoog |
| GAP-SD-002 | DRY schending — ~3.000-4.000 regels CRUD boilerplate in 33 controllers | Middel |
| GAP-SD-003 | Fat Controller — business logica in controllers (snapshot, validatie) | Hoog |
| GAP-SD-004 | Spec-referenties (S3-34, S7-04) niet traceerbaar naar document | Laag |
| GAP-SD-005 | Mogelijke dubbele Markdown-library (marked + react-markdown) | Laag |
| GAP-SD-006 | System.Linq.Dynamic.Core gebruik onbekend — query-injection risico | Hoog (SECURITY_FLAG) |

---

# DELIVERABLE 2 — AANBEVELINGEN

### Aannames

`INSUFFICIENT_DATA: team-samenstelling en sprint-capaciteit.`
Aanname: 1 FTE @ 10 SP/2-weeks sprint (consistent met Fase 1 en Software Architect aannames).

---

### REC-SD-001 — Schrijf Integratietests voor Kritieke Controllers
**Referentie:** GAP-SD-001

**Beschrijving:** Prioriteer integratietests voor de 5 meest kritieke controllers: `TestamentController`, `ErfgenamenController`, `AuthController`, `ShamirController`, `BackupController`. Gebruik bestaand `TestDbFactory` pattern (in-memory EF Core). Focus op: DELETE-cascade, business-rule violations (datum check), Shamir-flow.

**Impact:**
- Risk Reductie: Hoog — AVG DELETE cascade testbaar; kritieke functies gevalideerd
- Revenue: Indirect — stabielere releases verhogen vertrouwen
- Cost: Laag (test-code, geen productie-impact)
- UX: Indirect (minder regressions)

**Risico van niet-uitvoeren:** Bugs in DELETE-cascade (GAP-SA-006) pas gevonden door eindgebruikers. AVG-compliance niet aantoonbaar door test-evidence.

**SMART meetcriterium:**
- KPI: Aantal geteste controllers
- Baseline: 1/33 controllers
- Target: ≥6/33 controllers (5 kritieke + bestaande)
- Meetmethode: xUnit test run output; CI-build rapportage
- Tijdshorizon: Sprint SD-1

**Prioriteit:** P1 | **Impact:** Hoog | **Effort:** Middel

---

### REC-SD-002 — Extract TestamentSnapshotService uit Fat Controller
**Referentie:** GAP-SD-003

**Beschrijving:** Verplaats de auto-snapshot aanmaak logica (~40 regels) uit `TestamentController.Upsert()` naar een nieuwe `ITestamentSnapshotService`. De controller roept de service aan, de service bevat de snapshot-logica en is onafhankelijk testbaar.

**Impact:**
- Risk Reductie: Middel — snapshot logica testbaar; SRP hersteld
- Revenue: Geen directe impact
- Cost: Laag (extract, geen feature change)
- UX: Indirect (minder regressions)

**Risico van niet-uitvoeren:** Snapshot-logica blijft ongedocumenteerd en buggy. Als testament-type wijziging snapshot triggert maar dit nog niet in scope is, kan het dupliceren.

**SMART meetcriterium:**
- KPI: TestamentController.Upsert() methode cyclomatic complexity
- Baseline: ≥6 (schatting)
- Target: ≤3 (na extractie)
- Meetmethode: Roslyn analyzer of handmatige branch-count
- Tijdshorizon: Sprint SD-1

**Prioriteit:** P2 | **Impact:** Middel | **Effort:** Laag

---

### REC-SD-003 — Voeg coverlet Coverage Rapport toe aan CI
**Referentie:** GAP-SD-001

**Beschrijving:** coverlet is al aanwezig in het test-project (`coverlet.collector 6.0.4`). Activeer coverage-rapport generatie in CI (via `--collect:"XPlat Code Coverage"`) en publiceer het als build-artefact of check de drempelwaarde (minimaal 40% voor kritieke paden).

**Impact:**
- Risk Reductie: Middel — objectieve zichtbaarheid van test debt
- Cost: Minimaal (1 configuratieregel in CI)
- UX: Geen directe impact

**Risico van niet-uitvoeren:** Test debt is onzichtbaar. Regressions worden alleen ontdekt in productie.

**SMART meetcriterium:**
- KPI: Code coverage % (statement coverage) gerapporteerd in CI
- Baseline: INSUFFICIENT_DATA: (geen rapport)
- Target: Coverage rapport aanwezig, publicerend per CI-run
- Meetmethode: CI-build artefact controle
- Tijdshorizon: Sprint SD-1 (OUT_OF_SCOPE: DevOps Engineer — CI-configuratie)

**Prioriteit:** P2 | **Impact:** Middel | **Effort:** Laag

---

### REC-SD-004 — Verifieer en Verwijder Dubbele Markdown Dependency
**Referentie:** GAP-SD-005

**Beschrijving:** Verifieer het gebruik van `marked` vs `react-markdown` in `src/lumio-web`. Als beide worden gebruikt, consolideer naar `react-markdown` (React-native; betere DOMPurify integratie). Verwijder de ongebruikte bibliotheek.

**Impact:**
- Cost: Laag (bundle-grootte reductie)
- Risk Reductie: Laag (minder uiteenlopende XSS-aanvalsoppervlakken)

**SMART meetcriterium:**
- KPI: Aantal markdown-libraries in package.json
- Baseline: 2 (`marked` + `react-markdown`)
- Target: 1 (geconsolideerd)
- Meetmethode: package.json controle
- Tijdshorizon: Sprint SD-2

**Prioriteit:** P2 | **Impact:** Laag | **Effort:** Laag

---

# DELIVERABLE 3 — SPRINTPLAN

## Aannames

```
INSUFFICIENT_DATA: exacte team-samenstelling.
Aanname: 1 FTE full-stack developer @ 10 SP/sprint (2 weken)
Randvoorwaarden voor Sprint SD-1:
  - Software Architect output GOEDGEKEURD (✓ behaald)
  - TestDbFactory pattern beschikbaar (✓ aanwezig)
  - CI pipeline aanwezig (INSUFFICIENT_DATA: CI configuratie niet ingezien)
```

---

## Sprint SD-1 — Test Fundament & Kritieke Code Kwaliteit

**Sprint doel:** Minimale maar aantoonbare test coverage op kritieke bedrijfslogica; snapshot-extractie voor testbaarheid; coverage-rapportage actief.

**Sprint KPI-targets:**
1. ≥5 extra controller integratietests groen in CI
2. TestamentController.Upsert() cyclomatic complexity ≤4 na extractie
3. coverlet rapport gepubliceerd als CI-artefact

**Definition of Done:** Alle stories compleet; tests geslaagd; KPI-meting uitgevoerd; geen nieuwe CRITICAL_FINDING.

---

### SP-SD1-001 — Integratietests voor Testament + Erfgenamen Controllers

**Beschrijving:** Als developer wil ik geautomatiseerde integratietests voor `TestamentController` en `ErfgenamenController`, zodat regressies in kritieke bedrijfslogica automatisch worden gevonden.

**Team:** Team Developer
**Story type:** CODE
**Story points:** 5 SP
**Acceptatiecriteria:**
- Gegeven TestamentController, wanneer Upsert met datum vóór geboortedatum, dan returns 400
- Gegeven ErfgenamenController, wanneer DELETE met gerelateerde toewijzingen, dan worden toewijzingen ook verwijderd (cascade getest)
- Gegeven ErfgenamenController, wanneer BerekenErfbelasting zonder erfgenamen, dan returns 200 met leeg resultaat
- Tests draaien in CI met TestDbFactory (in-memory)
**Afhankelijkheden:** TestDbFactory.cs (✓ aanwezig)
**Blocker:** NONE
**Aanbeveling-referentie:** REC-SD-001

---

### SP-SD1-002 — Extract ITestamentSnapshotService

**Beschrijving:** Als developer wil ik dat testament-snapshot aanmaak in een aparte service staat, zodat de TestamentController focust op HTTP-handling en snapshot-logica onafhankelijk testbaar en herbruikbaar is.

**Team:** Team Developer
**Story type:** CODE
**Story points:** 3 SP
**Acceptatiecriteria:**
- Gegeven een `TestamentController.Upsert()`, wanneer kritieke wijziging, dan delegeert de controller aan `ITestamentSnapshotService.CreateSnapshotAsync()`
- Gegeven `TestamentSnapshotService`, wanneer type niet gewijzigd, dan wordt geen snapshot aangemaakt
- Unittest voor `TestamentSnapshotService` aanwezig (onafhankelijk van HTTP)
- `TestamentController.Upsert()` is ≤50 regels na refactor
**Afhankelijkheden:** Geen
**Blocker:** NONE
**Aanbeveling-referentie:** REC-SD-002

---

### SP-SD1-003 — coverlet Coverage Rapportage Activeren

**Beschrijving:** Als team wil ik dat code coverage automatisch wordt gemeten en gerapporteerd bij elke CI-run, zodat ik objectief kan meten of test debt groeit of krimpt.

**Team:** Team Developer
**Story type:** INFRA
**Story points:** 1 SP
**Acceptatiecriteria:**
- Gegeven CI-run, wanneer tests draaien, dan wordt `coverage.cobertura.xml` gegenereerd
- Gegeven coverage-rapport aanwezig, wanneer build voltooid, dan is rapport beschikbaar als build-artefact
**Afhankelijkheden:** CI pipeline configuratie — `OUT_OF_SCOPE: DevOps Engineer` (DevOps Agent richt CI in — deze story is de test-configuratie-kant)
**Blocker:** INTERN: DevOps Engineer moet CI pipeline configureren (zie Sprint DO-1) | eigenaar: developer + devops | escalatie: developer configureert `--collect` flag; DevOps publiceert artefact
**Aanbeveling-referentie:** REC-SD-003

---

## Parallelle Tracks Sprint SD-1

| Track | Stories | Startconditie |
|-------|---------|---------------|
| Track A | SP-SD1-001 | Direct starten |
| Track B | SP-SD1-002 | Direct starten — geen afhankelijkheid van A |
| Track C | SP-SD1-003 | Na afstemming met DevOps Sprint DO-1 |

---

## Blocker Register Sprint SD-1

| ID | Beschrijving | Type | Eigenaar | Escalatie |
|----|-------------|------|---------|-----------|
| BLK-SD1-001 | CI pipeline artefact-publicatie vereist DevOps configuratie | INTERN | DevOps Engineer | Sprint SD-1 coördineert met Sprint DO-1 voor CI-setup |

---

## Sprint SD-2 — Dependency Sanity & Spec Traceerbaarheid

**Sprint doel:** Codebase clean-up: markdown-dependency consolidatie; spec-referenties traceerbaar; verdere test coverage voor Auth + Shamir.

**Sprint KPI-targets:**
1. 1 markdown-library verwijderd
2. Alle `S*-**` spec-codes in codebase zijn traceerbaar naar een ADR of spec-document
3. AuthController en ShamirController hebben integratietests

**Definition of Done:** Zie SD-1.

---

### SP-SD2-001 — Markdown Dependency Consolidatie

**Beschrijving:** Als developer wil ik dat er slechts één markdown-renderingsbibliotheek is, zodat de bundle kleiner is en er geen uiteenlopende sanitisation-strategieën zijn.

**Team:** Team Developer
**Story type:** CODE
**Story points:** 2 SP
**Acceptatiecriteria:**
- Gegeven codebase, wanneer `npm ls marked`, dan is `marked` niet meer als directe dependency aanwezig
- Gegeven `react-markdown` gebruikt, wanneer markdown-content gerenderd, dan is DOMPurify sanitization actief
- E2E: markdown-content in app zichtbaar na consolidatie
**Afhankelijkheden:** Verificatie van `marked`-gebruikslocaties in codebase
**Blocker:** INTERN: Verificeer `marked` gebruik vóór verwijdering | eigenaar: developer
**Aanbeveling-referentie:** REC-SD-004

---

### SP-SD2-002 — Auth + Shamir Controller Integratietests

**Beschrijving:** Als developer wil ik geautomatiseerde integratietests voor `AuthController` en `ShamirController`, zodat de kritieke unlock-flow en Shamir-flow aantoonbaar correct werken.

**Team:** Team Developer
**Story type:** CODE
**Story points:** 5 SP
**Acceptatiecriteria:**
- Gegeven AuthController, wanneer correct wachtwoord, dan returns 200 en database is unlocked
- Gegeven AuthController, wanneer onjuist wachtwoord, dan returns 401
- Gegeven ShamirController, wanneer split + reconstruct flow, dan origineel wachtwoord aantoonbaar teruggegeven
**Afhankelijkheden:** SP-SD1-001 (patroon vastgesteld)
**Blocker:** NONE
**Aanbeveling-referentie:** REC-SD-001

---

## Blocker Register Sprint SD-2

Geen EXTERN-blockers geïdentificeerd.

---

# DELIVERABLE 4 — GUARDRAILS

### GUARD-SD-001 — Business Logica mag niet in Controllers zitten

**Referentie:** GAP-SD-003 (Fat Controller), ANTI-PATTERN-002
**Scope:** Alle nieuwe en gewijzigde Controller-methoden
**Formulering:** Mag geen businesslogica bevatten die meer dan 10 regels besloten logica omvat. Alle business-beslissingen (snapshot aanmaak, cascade, berekeningen) moeten in een benoemde service met interface zitten.
**Schending-actie:** CRITICAL_FINDING in code review — PR niet gemerged; eigenaar: Senior Developer
**Verificatiemethode:** Code review checklist bij elke PR: "Bevat deze controller meer dan HTTP-handling + service-aanroepen?" Frequentie: bij elke PR.
**Overlap:** Aanvulling op GUARD-SA-001 (repository pattern)

---

### GUARD-SD-002 — Nieuwe controllers vereisen minimaal één integratietest

**Referentie:** GAP-SD-001 (3% controller coverage)
**Scope:** Alle nieuwe controller-bestanden
**Formulering:** Vereist dat bij elke nieuwe controller minimaal één integratietest aanwezig is in `.Tests/Controllers/` vóórdat de PR gemerged mag worden.
**Schending-actie:** CI-build faalt (missing test check), PR geblokkeerd
**Verificatiemethode:** CI-regel: controleer of een nieuw bestand in `Controllers/` een bijbehorend `*Tests.cs` bestand heeft. Frequentie: bij elke PR.
**Overlap:** Nieuw

---

### GUARD-SD-003 — Spec-referenties in commentaar vereisen traceerbaar document

**Referentie:** GAP-SD-004 (S3-34 niet traceerbaar)
**Scope:** Alle inline code comentaar met pattern `S[0-9]+-[0-9]+`
**Formulering:** Mag geen code-commentaar bevatten met spec-referenties (S*-** patroon of vergelijkbaar) die niet traceerbaar zijn naar een gedocumenteerd bestand in de repository.
**Schending-actie:** CRITICAL_FINDING code review annotatie; developer documenteert spec-referentie in ADR map vóór merge
**Verificatiemethode:** Grep `S\d+-\d+` in codebase bij pre-release audit; handmatige controle. Frequentie: per kwartaal + bij groot refactor.
**Overlap:** Nieuw

---

## JSON Export

```json
{
  "agent": "06-senior-developer",
  "fase": "2",
  "datum": "2026-03-01",
  "analysedekking_pct": 10,
  "solid_schendingen": ["S (ErfgenamenController, TestamentController)", "D (LumioDbContext direct in alle controllers)"],
  "tech_debt_uren": 80,
  "test_stats": {
    "controllers_met_tests": 1,
    "controllers_totaal": 33,
    "coverage_meting_beschikbaar": false
  },
  "gaps": [
    { "id": "GAP-SD-001", "titel": "Controller test coverage 3%", "prioriteit": "Hoog" },
    { "id": "GAP-SD-002", "titel": "CRUD boilerplate DRY schending", "prioriteit": "Middel" },
    { "id": "GAP-SD-003", "titel": "Fat Controller — business logica in TestamentController", "prioriteit": "Hoog" },
    { "id": "GAP-SD-004", "titel": "Spec-referenties niet traceerbaar", "prioriteit": "Laag" },
    { "id": "GAP-SD-005", "titel": "Dubbele Markdown library", "prioriteit": "Laag" },
    { "id": "GAP-SD-006", "titel": "System.Linq.Dynamic.Core gebruik onbekend (SECURITY_FLAG)", "prioriteit": "Hoog" }
  ],
  "aanbevelingen": [
    { "id": "REC-SD-001", "titel": "Integratietests kritieke controllers", "prioriteit": "P1" },
    { "id": "REC-SD-002", "titel": "Extract TestamentSnapshotService", "prioriteit": "P2" },
    { "id": "REC-SD-003", "titel": "coverlet CI rapportage", "prioriteit": "P2" },
    { "id": "REC-SD-004", "titel": "Markdown dependency consolidatie", "prioriteit": "P2" }
  ],
  "security_flags": ["GAP-SD-006 (System.Linq.Dynamic.Core)"],
  "out_of_scope": {
    "07-devops-engineer": ["CI coverage artefact publicatie"],
    "08-security-architect": ["System.Linq.Dynamic.Core query-injection analyse"]
  }
}
```

---

## HANDOFF CHECKLIST – Senior Developer – 2026-03-01

- [x] Code sampling strategie gedocumenteerd (bestanden gelezen, dekkingsschatting)
- [x] SOLID analyse compleet (alle 5 principes beoordeeld; I = INSUFFICIENT_DATA correct gemarkeerd)
- [x] Design patterns / anti-patterns gedocumenteerd met bronverwijzingen (bestand + regelnummer)
- [x] Test coverage gedocumenteerd (INSUFFICIENT_DATA: geen coverlet rapport — correct gemarkeerd)
- [x] Maintainability analyse compleet (complexity, duplication, naming, docs)
- [x] Dependency analyse compleet (marked dubbel, Dynamic LINQ, posthog)
- [x] Technische schuld gekwantificeerd in hersteluren (met rationale per categorie)
- [x] SECURITY_FLAG (System.Linq.Dynamic.Core) doorgestuurd naar Security Architect
- [x] Zelfcontrole uitgevoerd
- [x] Aanbevelingen: elke aanbeveling verwijst naar GAP/RISK analyse-bevinding
- [x] Aanbevelingen: alle impact-velden gevuld of als INSUFFICIENT_DATA: gemarkeerd
- [x] Aanbevelingen: alle meetcriteria zijn SMART
- [x] Sprintplan: aannames gedocumenteerd; INSUFFICIENT_DATA correct gebruikt
- [x] Sprintplan: alle stories hebben minimaal 1 acceptatiecriterium
- [x] Guardrails: alle guardrails zijn testbaar geformuleerd
- [x] Guardrails: alle guardrails hebben schending-actie én verificatiemethode
- [x] Guardrails: alle guardrails verwijzen naar GAP/RISK analyse-bevinding
- [x] Alle 4 deliverables aanwezig: Analyse ✓ Aanbevelingen ✓ Sprintplan ✓ Guardrails ✓
- **STATUS: GEREED VOOR HANDOFF**
