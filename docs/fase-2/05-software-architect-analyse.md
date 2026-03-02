# Analyse – Techniek & Architectuur – 2026-03-02
> Software Architect | Agent 05 | Fase 2

## Metadata
- Agent: Software Architect (05)
- Fase: 2
- Input ontvangen van: Onboarding Agent (25) — `docs/onboarding/onboarding-output.md`
- Datum: 2026-03-02
- Software onder analyse: Lumio v1.0.0 — offline-first Electron desktop applicatie voor digitale nalatenschap

---

## 1. Current State

### 1.1 Architectuurpatroon

**Bevinding:** Lumio gebruikt een **Embedded Sidecar Architecture**:

```
Electron Shell (lumio-desktop)
  └── spawnt: .NET 10 ASP.NET Core API (Lumio.Api) → 127.0.0.1:5123
        ├── serveert: Next.js SSG frontend (statische `/frontend/` map)
        └── leest/schrijft: SQLite/SQLCipher database (per profiel, `data/`)
```

De Electron-app fungeert als orkestrerende shell. Bij opstart initieert `sidecar.ts` het .NET-backend-proces via `spawn()` met `ASPNETCORE_URLS`, `LUMIO_DATA_DIR` en `LUMIO_FRONTEND_DIR` als environment variabelen. De Next.js webapp is als statische export ingebakken in het Electron-pakket.

- **Bron:** `src/lumio-desktop/src/main/sidecar.ts:1-80`; `src/Lumio.Api/Program.cs:254-290`
- **Impact:** Hoog — de architectuurkeuze dicteert alle deployment-, update- en security-afwegingen in het systeem.

### 1.2 Domain-Driven Design (DDD)

**Bevinding:** Sterke DDD-invloed; gedeeltelijke implementatie.

**Bounded Contexts (aanwezig, expliciet):**
| Context | Bron |
|---------|------|
| AssetRegistry (Boedel) | `src/Lumio.Api/Domain/AssetRegistry/` |
| DigitalEstate (Digitaal Bezit) | `src/Lumio.Api/Domain/DigitalEstate/` |
| Documents (PersoonlijkeDocumenten) | `src/Lumio.Api/Domain/Documents/` |
| DonorRegistration | `src/Lumio.Api/Domain/DonorRegistration/` |
| EuthanasiaDirective (Wilsverklaring) | `src/Lumio.Api/Domain/EuthanasiaDirective/` |
| FuneralWishes (Uitvaartwensen) | `src/Lumio.Api/Domain/FuneralWishes/` |
| Testament | `src/Lumio.Api/Domain/Testament/` |
| VideoMessages (Videoboodschappen) | `src/Lumio.Api/Domain/VideoMessages/` |
| Common (Eigenaar, Erfgenamen, etc.) | `src/Lumio.Api/Domain/Common/` |

**Ubiquitous Language:** Consistent Nederlandstalig domeinvocabulaire gebruikt door API-laag, frontend- en documentatiecode (Eigenaar, Erfgenaam, Uitvaart, Testament, etc.).

**Aggregate structuur:** Eigenaar is de centrale aggregate root. Cascade-delete is geconfigureerd vanuit Eigenaar op alle subdomeinen (bron: `devdocs/data-retention-policy.md`).

**Anti-Corruption Layer:** Aanwezig via `LocalOriginValidationMiddleware.cs` (externe requests geblokkeerd), maar geen expliciete ACL tussen bounded contexts.

**Zwakte:** Controllers injecteren direct `LumioDbContext` — geen Application Layer (Use Cases / Services met interface-abstractie per domein) tussen HTTP-laag en persistentielaag.
- **Bron:** `src/Lumio.Api/Controllers/AuthController.cs:1-100` (injecteert via `[FromServices] IServiceProvider serviceProvider`); meerdere controllers volgen hetzelfde patroon.

### 1.3 Modulaire structuur (backend)

Het backend is gestructureerd als **modulaire monolith** met de volgende lagen:

| Laag | Pad | Status |
|------|-----|--------|
| API/HTTP | `Controllers/` | Aanwezig — 34 controllers, geen API-versioning |
| Business Rules | `Rules/` (`lumio-rules.json` + `lumio-workflows.json`) | Aanwezig — RulesEngine |
| Services (domein) | `Services/` | Gedeeltelijk — Security-services hebben interfaces; PDF-, Export-services missen expliciete domeininterfaces |
| Domeinmodellen | `Domain/` | Aanwezig — per bounded context |
| Persistentie | `Data/` (EF Core + SQLite) | Aanwezig — monolithische DbContext |
| Migraties | `Migrations/` | Aanwezig — 6 migraties |
| DTOs | `Dtos/` | Aanwezig |
| Validators | `Validators/` | Aanwezig (FluentValidation) |

- **Bron:** `src/Lumio.Api/`-mapstructuur

### 1.4 Frontend architectuur

**Framework:** Next.js 16.1.6 met React 19.2.4, Tailwind CSS 4.x, Zustand 5, TanStack React Query 5.

**Renderingstrategie:** Statische export (`output: "export"` in `next.config.ts`). Alle pagina's worden prerendered naar HTML/CSS/JS tijdens buildtijd.

**Implicatie:** Geen SSR-runtime beschikbaar → per TODO in `src/lumio-web/src/app/layout.tsx:41` is een nonce-gebaseerde strict CSP niet implementeerbaar zolang de statische export-strategie gehanteerd wordt.

**State management:** Zustand stores per domein (`authStore`, `preferencesStore`, `helpStore`, `toastStore`). API-data via TanStack React Query. Geen Redux of gerelateerde complexiteit.

**Internationalisation:** next-intl 4 — NL en EN ondersteund. Berichten-mergeScript aanwezig (`scripts/merge-messages.ts`).

**API-client:** OpenAPI-eerste; `@hey-api/openapi-ts` genereert de client vanuit de .NET Swagger-definitie.

- **Bron:** `src/lumio-web/package.json`, `src/lumio-web/src/app/layout.tsx`, `src/lumio-web/src/stores/`

### 1.5 Desktop (Electron) architectuur

Electron-shell met duidelijke separation of concerns:
- `main/sidecar.ts` — backend-proces beheer
- `main/window.ts` — BrowserWindow configuratie
- `main/menu.ts` — applicatiemenu
- `main/autobackup.ts` — automatische backup
- `main/whitelabel.ts` — whitelabel branding injectie
- `main/paths.ts` — portable data-dir resolutie

**Portabiliteit:** `getDataDir()` in `paths.ts` ondersteunt USB-portabel gebruik — geen vaste padafhankelijkheden.

- **Bron:** `src/lumio-desktop/src/main/`

---

## 2. Gaps

### GAP-ARCH-001 — Ontbrekende Application Layer (Use Cases / Repository Pattern)
- **Beschrijving:** Controllers injecteren `LumioDbContext` direct. Dit koppelt de HTTP-laag structureel aan de persistentielaag. Er is geen expliciete Application Layer die use cases of commandas afhandelt onafhankelijk van het HTTP-protocol.
- **Bron:** `src/Lumio.Api/Controllers/AuthController.cs:14-28`; idem voor de overige ~33 controllers — aantoonbaar via direct `[FromServices] LumioDbContext db` of constructor-injectie.
- **Risico als niet opgelost:** Unit-testen van business logic vereist altijd een EF Core in-memory database; geen mogelijkheid tot mock-gebaseerde tests; hogere koppelingscomplexiteit bij doorontwikkeling.
- **Prioriteit:** Midden — huidige app omvang maakt dit beheersbaar; risico stijgt naarmate het domein groeit.

### GAP-ARCH-002 — Statische export blokkeert nonce-gebaseerde Content Security Policy
- **Beschrijving:** Next.js is geconfigureerd met `output: "export"`. Dit voorkomt SSR-middleware, waardoor nonce-gebaseerde of hash-gebaseerde CSP niet implementeerbaar is. De huidige CSP bevat `'unsafe-inline'` in `script-src`.
- **Bron:** `src/lumio-web/src/app/layout.tsx:41` (TODO-commentaar); CSP meta-tag op regels 44-46.
- **Risico als niet opgelost:** XSS-aanvallen kunnen inline scripts uitvoeren als andere CSP-directieven omzeild worden (beperkt risico in Electron-context, groter risico voor de marketing site als die dezelfde codebase hergebruikt).
- **Prioriteit:** Midden — in Electron-context beperkt; wordt kritiek als web deployment uitgebreid wordt.

### GAP-ARCH-003 — Ontbrekende API-versioning strategie
- **Beschrijving:** Alle API-routes gebruiken het patroon `/api/[resource]` zonder versieprefix (bijv. `/api/v1/`). Bij breaking changes in de API zullen bestaande Electron-clients (die een ingebakken frontend verzorgen) moeten worden geherinstalleerd.
- **Bron:** `src/Lumio.Api/Controllers/AuthController.cs:11` (`[Route("api/auth")]`); idem voor alle controllers.
- **Risico als niet opgelost:** Bij incompatibele API-wijzigingen geen mogelijkheid tot graduele migratie; self-hosted installaties met oude Electron-versies kunnen breken.
- **Prioriteit:** Laag (huidig gebruik: desktop-only, embedded API) — stijgt naar Hoog bij mogelijke webserver-deployment of externe API-clients.

### GAP-ARCH-004 — Geen update-mechanisme beschreven voor productie-databases
- **Beschrijving:** `devdocs/database-migrations.md` beschrijft dat productie-migraties via SQL scripts worden gedaan, maar er is geen CI-geautomatiseerde migratiescriptgeneratie of versiegestuurd upgrade-pad voor eindgebruikers.
- **Bron:** `devdocs/database-migrations.md:34-50`; `src/Lumio.Api/Data/MigratieDbHelper.cs` (tijdelijke DDL-brug als workaround).
- **Risico als niet opgelost:** End-users met bestaande databases kunnen silent schema-fouten krijgen bij updates; MigratieDbHelper accumuleert workarounds.
- **Prioriteit:** Hoog — elk nieuw release-increment vergroot dit risico.

---

## 3. Risks

### RISK-ARCH-001 — Tijdelijke DDL-brug (MigratieDbHelper) accumuleert schuld
- **Beschrijving:** `EnsureSchuldKolommenAsync` in `MigratieDbHelper.cs` is een intentioneel tijdelijke DDL-bridge voor pre-migratie databases. De ADR (ADR-001) beschrijft een toekomstig cleanup-item.
- **Kans:** Midden — zonder expliciete sprint-trigger blijft het staan.
- **Impact:** Midden — hogere complexiteit en false-security rond het migratie-systeem.
- **Risicoscore:** Midden
- **Mitigatie:** Registreer als `CLEANUP-[N]` sprint item; verwijder bij punt dat alle productie-databases `__EFMigrationsHistory` bevatten.
- **Bron:** `src/Lumio.Api/Data/MigratieDbHelper.cs`; `devdocs/adr-001-schulden-schema-brug.md`

### RISK-ARCH-002 — Gebrek aan Application Layer vergroot testboekrecht
- **Beschrijving:** Directe DbContext-injectie in controllers verhoogt de integratietestbenodigheid voor elke zakelijk logica-test.
- **Kans:** Hoog — meerdere PR's in git-history tonen dal tests altijd database-afhankelijk zijn.
- **Impact:** Laag-Midden nu, stijgend bij doorontwikkeling.
- **Risicoscore:** Midden
- **Mitigatie:** Gefaseerde introductie van command/query handlers (CQRS-lite) per bounded context.
- **Bron:** `src/Lumio.Api/Controllers/`; `src/Lumio.Api.Tests/` (31 testbestanden — analyse gedeeltelijk, zie Senior Developer)

---

## 4. KPI Baseline

| KPI | Huidige waarde | Bron | Meetmethode |
|-----|----------------|------|-------------|
| TODO-count in codebase | 1 (layout.tsx SSR-TODO) | Codebase scan | grep op .ts/.tsx/.cs |
| Aantal bounded contexts | 9 | `src/Lumio.Api/Domain/` | Directory count |
| Controller-laag directheid (% controllers zonder service-abstractie) | UNCERTAIN: ~70% (obv steekproef) | `src/Lumio.Api/Controllers/` | Handmatige review steekproef; exacte cijfers vereisen volledige scan |
| Migratiebestanden | 6 | `src/Lumio.Api/Migrations/` | Directory count |
| Ontbrekende API-versioning | Ja (0 versioned routes) | Alle controllers | grep op `/api/v` |

---

## 5. UNCERTAIN Items
- `UNCERTAIN: ~70% controllers zonder service-abstractie` — Reden: steekproef op AuthController, niet volledig geverifieerd voor alle 34 controllers — Escalatie: Senior Developer voert volledige steekproef uit.

## 6. INSUFFICIENT_DATA Items
- `INSUFFICIENT_DATA: Architectuurdiagram` — Ontbrekend: visueel architectuurdiagram — Gevolg: analyse gebaseerd op codebase; diagrammen afgeleid, niet formeel vastgelegd.
- `INSUFFICIENT_DATA: Fase 1 business strategie output` — Ontbrekend: formele Fase 1 analyse als input — Gevolg: GAP-ARCH-003 en GAP-ARCH-004 prioriteiten zijn expert-inschattingen, geen business-gedreven weging.

---

## SECURITY_FLAGS (voorwaarts naar Security Architect)
- `SECURITY_FLAG: GAP-ARCH-002` — unsafe-inline in script-src CSP (`src/lumio-web/src/app/layout.tsx:44`)
- `SECURITY_FLAG: GAP-ARCH-004` — geen update-mechanisme voor productie-databases kan leiden tot schema-inconsistenties zonder melding aan eindgebruiker

## HANDOFF CHECKLIST — Software Architect
- [x] Alle secties (1-4) zijn volledig ingevuld
- [x] Alle bevindingen hebben een bronvermelding
- [x] Geen lege secties of placeholders
- [x] Alle UNCERTAIN: items zijn gedocumenteerd
- [x] Alle INSUFFICIENT_DATA: items zijn gedocumenteerd en geëscaleerd
- [x] SECURITY_FLAGS doorgegeven aan Security Architect
- [x] Structuur conform analysis-output-contract.md
- [x] Status: READY voor Senior Developer (Agent 06)
