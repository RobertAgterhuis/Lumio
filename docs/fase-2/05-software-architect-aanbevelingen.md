# Aanbevelingen – Techniek & Architectuur (Software Architect) – 2026-03-02
> Software Architect | Agent 05 | Fase 2

## Metadata
- Agent: Software Architect (05)
- Fase: 2
- Gebaseerd op analyse: `docs/fase-2/05-software-architect-analyse.md`
- Datum: 2026-03-02

---

## Aanbeveling REC-ARCH-001

### Probleem
Controllers injecteren `LumioDbContext` direct, zonder tussenliggende service- of use-case-abstractie per bounded context. Dit koppelt de HTTP-laag structureel aan de persistentielaag en beperkt unit-testbaarheid.  
**Analyse referentie:** GAP-ARCH-001

### Oplossing
Introduceer een **gefaseerde Application Layer** per bounded context: begin bij de hoogste-risicobounded contexts (Testament, Security). Implementeer command/query interfaces (`IListErfgenamenQuery`, `IUpsertTestamentCommand`) die door controllers worden aangeroepen en door services geïmplementeerd. Bestaande service-interfaces in `Services/Security/` tonen het patroon.

**Implementatie-aanpak:**
1. Kies de 3 meest complexe bounded contexts als piloot (aanbeveling: Testament, AssetRegistry, Eigenaar/Auth).
2. Definieer een `IQueryService<T>` en `ICommandService<TIn, TOut>` interface per context in een nieuw `Application/` mapje.
3. Verplaats business logic uit controllers naar geconcrete implementaties; controllers worden thin HTTP-adapters.
4. Schrijf unit-tests per service met mock-dependencies (geen EF database nodig).
5. Rol gefaseerd uit — niet "big bang" rewrite.

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | INSUFFICIENT_DATA: | Indirect via kortere feature-doorlooptijd |
| Risk Reductie | Hoog — testbaarheid verbeterd, coupling verminderd | Directe koppeling controllers→DB verwijderd |
| Cost | Negatief initieel (~20-40 uur investering), daarna positief (snellere tests in CI) | Schatting gebaseerd op 34 controllers, ~3 contexten als piloot |
| UX | Geen directe UX-impact | — |

### Rationale
Het Repository Pattern en Application Layer zijn bewezen patronen (Microsoft architectuurgids, Clean Architecture) voor het scheiden van HTTP-transport van domeinlogica. De bestaande Security-services (`IMasterPasswordService`, `IShamirService`, etc.) tonen dat de codebase reeds de benodigde interface-kennis in-house heeft.

### Afhankelijkheden
- Vereist: niet geblokkeerd door andere aanbeveling
- Afhankelijk van: Senior Developer (volledige controller-steekproef) om prioriteit te verfijnen

### Risico's van niet uitvoeren
Bij doorontwikkeling (meer controllers per context) worden alle business-logic-tests integratietests; CI-tijd stijgt; bug-isolatie wordt lastiger. Bij >50 controllers is refactoring significant duurder dan nu.

### Meetcriterium
- KPI: % controllers met expliciete service-interface-injectie (geen directe DbContext in constructor)
- Baseline: UNCERTAIN: ~30% (obv steekproef)
- Target: ≥80% binnen 6 sprints na start
- Meetmethode: grep op `LumioDbContext` in constructors van controllers
- Tijdshorizon: Sprint 3–8 gefaseerd

---

## Aanbeveling REC-ARCH-002

### Probleem
`MigratieDbHelper.EnsureSchuldKolommenAsync` is een tijdelijke DDL-bridge (ADR-001) zonder sprint-gekoppeld cleanup item. Accumuleert als onbeheerste technische schuld.  
**Analyse referentie:** RISK-ARCH-001, GAP-ARCH-004

### Oplossing
Registreer als geformaliseerd cleanup sprint-item en koppel een automatische detectie-check in CI die signaleert wanneer de bridge veilig verwijderd kan worden (alle `__EFMigrationsHistory`-rijen bevatten `20260224151055_AddSchuldBezitLink`).

**Implementatie-aanpak:**
1. Voeg in CI (`.github/workflows/ci.yml`) een stap toe die via SQL de `__EFMigrationsHistory` tabel van alle test-databases controleert op aanwezigheid van de betreffende migratienaam.
2. Als CI 3 opeenvolgende sprints groen is zonder MigratieDbHelper te hoeven aanroepen: verwijder `EnsureSchuldKolommenAsync` en de aanroep in `EnsureMigratedAsync`.
3. Documenteer als `BESLOTEN` in `docs/decisions.md` met sprint-ID.

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | INSUFFICIENT_DATA: | Geen directe revenue impact |
| Risk Reductie | Midden — verwijdert silent-schema-fail risico | ADR-001 documenteert edge-case SQLite FK-falen |
| Cost | Positief — minder onderhoudsoppervlak | ~4-8 uur verwijdering + tests |
| UX | Geen directe UX-impact | — |

### Afhankelijkheden
- Vereist: verificatie dat alle productie-installaties de migratiehistorie bevatten

### Risico's van niet uitvoeren
Toekomstige developers introduceren vergelijkbare DDL-bridges zonder ADR-kader; technische schuld in migratie-laag neemt toe.

### Meetcriterium
- KPI: Aanwezigheid van `EnsureSchuldKolommenAsync` in codebase
- Baseline: Aanwezig (2026-03-02)
- Target: Verwijderd
- Meetmethode: grep op codebase
- Tijdshorizon: SP-11 of SP-12 (na verificatie)

---

## Aanbeveling REC-ARCH-003

### Probleem
Geen API-versioning strategie. Bij breaking changes in de backend API breken bestaande geïnstalleerde Electron-versies.  
**Analyse referentie:** GAP-ARCH-003

### Oplossing
Voeg een `/api/v1/` prefix toe aan alle bestaande routes. Implementeer een eenvoudig versioning-beleid (geen versie = v1 fallback; breakers alleen bij v2 introductie).

**Implementatie-aanpak:**
1. Voeg route-prefix toe via `RouteAttribute` of via API-versioning middleware (Microsoft.AspNetCore.Mvc.Versioning).
2. Documenteer in `devdocs/` het versioning-beleid.
3. Update het OpenAPI-schema en de gegenereerde client (`openapi-ts`).

**Impact:**

| Dimensie | Verwacht effect | Rationale |
|----------|----------------|-----------|
| Revenue | INSUFFICIENT_DATA: | Indirect via gebruiker-retentie bij updates |
| Risk Reductie | Hoog — voorkomt silent breaking changes | Elk gebruikerssysteem met een oude Electron-versie is beschermd |
| Cost | Laag (~8-12 uur) | Standaard ASP.NET Core patroon |
| UX | Geen directe UX-impact | — |

### Risico's van niet uitvoeren
Graduele versie-divergentie tussen Electron-installers en API; silent failures bij updates.

### Meetcriterium
- KPI: Alle API-routes hebben versie-prefix
- Baseline: 0% versioned routes (2026-03-02)
- Target: 100%
- Meetmethode: grep op `/api/v` in controllers
- Tijdshorizon: SP-11

---

## PRIORITEITENMATRIX

| Aanbeveling ID | Impact | Effort | Prioriteit | Sprint |
|----------------|--------|--------|------------|--------|
| REC-ARCH-001 (Application Layer) | Midden | Hoog | P2 | SP-12–SP-14 (gefaseerd) |
| REC-ARCH-002 (MigratieDbHelper cleanup) | Midden | Laag | P1 | SP-11 |
| REC-ARCH-003 (API versioning) | Hoog | Midden | P1 | SP-11 |

---

## HANDOFF CHECKLIST — Aanbevelingen Software Architect
- [x] Alle aanbevelingen verwijzen naar een analyse-bevinding (GAP/RISK ID)
- [x] Alle impacts hebben rationale
- [x] Alle INSUFFICIENT_DATA: items zijn gedocumenteerd
- [x] Meetcriteria zijn SMART geformuleerd
- [x] Prioriteitenmatrix is volledig ingevuld
- [x] Afhankelijkheden zijn gedocumenteerd
- [x] Status: READY voor Senior Developer
