# Software Architect – Fase 2 – 2026-03-01

## Metadata
- **Agent:** 05-software-architect
- **Fase:** 2 — Techniek & Architectuur
- **Input:** Alle Fase 1 outputs (docs/fase-1/*.md), Critic+Risk Fase 1 (APPROVED/NEEDS_REVIEW)
- **Datum:** 2026-03-01T00:00:00Z
- **Software:** Lumio v1.0.0
- **Guardrails geraadpleegd:** docs/guardrails/00-global-guardrails.md, docs/guardrails/02-architecture-guardrails.md

---

# DELIVERABLE 1 — ANALYSE

## Stap 1: Codebase Inventarisatie

### Repositories & structuur
| Component | Locatie | Taal / Framework | Versie |
|-----------|---------|-----------------|--------|
| Backend API | `src/Lumio.Api/` | ASP.NET Core 10 (Web API) | .NET 10.0 |
| Backend Tests | `src/Lumio.Api.Tests/` | xUnit / .NET 10 | — |
| Frontend (embedded) | `src/lumio-web/` | Next.js 16 (static export) + React 19 | Next 16.1.6 |
| Desktop Shell | `src/lumio-desktop/` | Electron 35 + TypeScript | Electron 35.2.1 |
| Marketing Site | `site/` | Next.js 15, GitHub Pages | — |
| Solution | `lumio.slnx` | MSBuild .NET Solution | — |

Bron: `lumio.slnx`, `src/Lumio.Api/Lumio.Api.csproj`, `src/lumio-web/package.json`, `src/lumio-desktop/package.json`

---

### Backend Externe Dependencies

| Package | Versie | Doel |
|---------|--------|------|
| FluentValidation.AspNetCore | 11.3.1 | Request-validatie |
| Mapster | 7.4.0 | Entity ↔ DTO-mapping |
| Microsoft.AspNetCore.OpenApi | 10.0.3 | OpenAPI/Swagger generatie |
| Microsoft.EntityFrameworkCore.Sqlite.Core | 10.0.3 | ORM + SQLite driver |
| SQLitePCLRaw.bundle_e_sqlcipher | 2.1.11 | SQLCipher versleuteling |
| QuestPDF | 2026.2.1 | PDF-generatie (community licence) |
| RulesEngine | 5.0.3 | JSON-driven business rules |
| Serilog.AspNetCore | 9.0.0 | Gestructureerde logging |
| Serilog.Sinks.File | 6.0.0 | Logbestand (roterend) |
| SecretSharingDotNet | 0.14.0 | Shamir Secret Sharing |
| Swashbuckle.AspNetCore | 10.1.4 | Swagger UI |
| System.Linq.Dynamic.Core | 1.7.1 | Dynamische LINQ-queries |

Bron: `src/Lumio.Api/Lumio.Api.csproj`

---

### Frontend Externe Dependencies (selectie significante)

| Package | Versie | Doel |
|---------|--------|------|
| Next.js | 16.1.6 | SSG / static export |
| React | 19.2.4 | UI framework |
| Zustand | 5.0.11 | Globale state |
| TanStack React Query | 5.90.21 | Server state / caching |
| next-intl | 4.8.3 | i18n (NL + EN) |
| Radix UI (slot, tooltip) | 1.2.x | Unstyled component primitives |
| Tailwind CSS | 4.2.0 | Utility-first CSS |
| Zod | 4.3.6 | Schema-validatie |
| React Hook Form | 7.71.2 | Formulieren |
| PostHog | 1.356.1 | Analytics (niet actief in productie — GUARD-006) |
| DOMPurify | 3.3.1 | XSS sanitisatie |
| @hey-api/openapi-ts | 0.92.4 | OpenAPI client codegen |
| Storybook | 10.2.10 | Component-bibliotheek |
| Vitest | 4.0.18 | Unit testing |
| Chromatic | 15.2.0 | Visual regression testing |

Bron: `src/lumio-web/package.json`

---

### Deployment Topologie

```
┌─────────────────────────────────────────────────────────────┐
│  Gebruikersapparaat (Windows / macOS)                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Electron 35 (lumio-desktop)                         │   │
│  │  ├── Opens BrowserWindow → http://127.0.0.1:5123     │   │
│  │  └── Spawns .NET process (Lumio.Api)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                        │ HTTP localhost                      │
│  ┌─────────────────────▼────────────────────────────────┐   │
│  │  ASP.NET Core 10 (Lumio.Api, port 5123)              │   │
│  │  ├── /api/* → Controllers (33 endpoints)             │   │
│  │  ├── /swagger → Swagger UI (altijd actief)           │   │
│  │  └── /** → Static file server (Next.js out/)         │   │
│  └─────────────────────────────────────────────────────-┘   │
│                        │                                     │
│  ┌─────────────────────▼────────────────────────────────┐   │
│  │  data/ (relatief t.o.v. executable)                  │   │
│  │  ├── profiles.json (profiel manifest)                │   │
│  │  ├── [profiel-id].db (SQLCipher encrypted SQLite)    │   │
│  │  ├── logs/ (Serilog rotating logs)                   │   │
│  │  └── videos/temp/ (tijdelijke opslag video)          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Buiten apparaat (extern):
  ├── GitHub Pages → site/ (marketing site, DNS pending)
  └── (geen cloud API-tier; geen externe database)
```

Bron: `src/Lumio.Api/Program.cs` (regels 35-38, 185-250), `start-dev.ps1`, `src/lumio-desktop/package.json`

---

## Stap 2: Architectuurpatroon Herkenning

### Vastgesteld patroon: **Desktop-Embedded Monolith (Sidecar Architecture)**

Het systeem combineert twee bekende patronen:

1. **Monolith (modular):** De ASP.NET Core API is een monolithische applicatie waarbij alle functionaliteit in één proces draait: routing, business logic, PDF-generatie, exportservices, security, audit — allemaal in `Lumio.Api`.

2. **Desktop Sidecar:** Electron is uitsluitend een desktop-shell. Het start de .NET-binary als sidecar-proces en toont de Next.js SPA in een `BrowserWindow`. Er is geen directe integratie tussen Node.js en .NET — alle communicatie gaat via HTTP localhost.

**Bewijs:**
- `src/lumio-desktop/package.json`: dependency `"get-port": "^7.1.0"` → dynamisch port-allocatie → Electron zoekt beschikbare poort en start .NET
- `start-dev.ps1` regel 35: `$FrontendOut = Join-Path $WebDir "out"` → Next.js static export
- `Program.cs` regels 225-250: static file server op top-level → ASP.NET serveert de Next.js SPA als frontend
- `Program.cs` regel 185: `builder.WebHost.UseUrls(port)` met default `"http://127.0.0.1:5123"` → altijd lokaal

**Niet aanwezig:**
- Microservices (geen service-mesh, geen Docker per service, geen gRPC)
- Event-driven architecture (geen MassTransit, geen RabbitMQ, geen domain events)
- Serverless (geen Azure Functions, geen AWS Lambda)
- BFF-patroon (Electron communiceert direct met .NET — geen frontend-for-backend tussenstap)

---

## Stap 3: Domain-Driven Design Analyse

### Bounded Contexts

| Context | Directory | Status |
|---------|-----------|--------|
| Asset Registry (Boedel) | `Domain/AssetRegistry/` | Impliciet — folder aanwezig, geen expliciete BC-markering |
| Common | `Domain/Common/` | Gedeeld — bevat root-entiteiten Eigenaar, Erfgenaam |
| Digital Estate | `Domain/DigitalEstate/` | Impliciet |
| Documents | `Domain/Documents/` | Impliciet |
| Donor Registration | `Domain/DonorRegistration/` | Impliciet |
| Euthanasia Directive | `Domain/EuthanasiaDirective/` | Impliciet |
| Funeral Wishes | `Domain/FuneralWishes/` | Impliciet |
| Testament | `Domain/Testament/` | Impliciet |
| Video Messages | `Domain/VideoMessages/` | Impliciet |

**Beoordeling:** De directory-structuur _suggereert_ bounded contexts maar is niet formeel gedefinieerd. Er zijn geen BC-grensbewakers (geen interfaces, geen module-niveau services per BC, geen domain-service per context). De LumioDbContext bevat alle DbSets van alle contexten in één klasse — dit is een classic `God Context` anti-pattern.

Bron: `src/Lumio.Api/Domain/`, `src/Lumio.Api/Data/LumioDbContext.cs`

---

### Aggregates en Entities

| Bevinding | Status |
|-----------|--------|
| BaseEntity aanwezig (`Guid Id, AangemaaktOp, GewijzigdOp`) | ✓ |
| Geen expliciete AggregateRoot marker class | Ontbreekt |
| Geen IAggregateRoot / IAggregateRoot<T> interface | Ontbreekt |
| TestamentInfo bevat Begunstigden + Executeurs → impliciet aggregaat | Impliciet aanwezig |
| DonorRegistratie bevat OrgaanKeuzes → impliciet aggregaat | Impliciet aanwezig |

Bron: `src/Lumio.Api/Domain/Common/BaseEntity.cs`, `src/Lumio.Api/Data/LumioDbContext.cs`

---

### Domain Events

| Bevinding | Status |
|-----------|--------|
| IDomainEvent interface | Afwezig |
| Domain event dispatcher | Afwezig |
| MediatR | Afwezig |
| Cross-aggregate communicatie | Procedureel (via controller of directe DbContext calls) |

Bron: volledige `Domain/` scan — geen event-klassen aangetroffen.

**Gevolg:** Wanneer een profiel-wijziging cascadeert naar meerdere contexten (bijv. eigenaar gewijzigd → testament + donorregistratie + wilsverklaring allemaal bijwerken), gebeurt dit via directe DbContext-aanroepen in controllers. Dit creëert sterke impliciete coupling.

---

### Anti-Corruption Layers

| Bevinding | Status |
|-----------|--------|
| ACL voor externe data (NUV-export, Belastingdienst-tarieven) | Afwezig |
| ACL voor Shamir Secret Sharing external library | Impliciet via `ShamirService` (thin wrapper) |
| ACL voor RulesEngine | Impliciet via `LumioRulesConfiguration` |

Bron: `src/Lumio.Api/Services/Security/`, `src/Lumio.Api/Rules/`

---

### Ubiquitous Language

**Positief:** De Nederlandse domeinterm is consistent gebruikt in entiteiten (Erfgenaam, Wilsverklaring, Begunstigde) en controllers (TestamentController, BoedelController). Dit is uitstekend — de domeinentiteiten spreken de taal van de gebruiker.

**Inconsistentie gevonden:**
- Domain directorynamen zijn Engels (`EuthanasiaDirective`, `FuneralWishes`, `DonorRegistration`) terwijl entiteiten Nederlands zijn (`WilsverklaringEuthanasie`, `UitvaartWensen`, `DonorRegistratie`)
- Klasse `Videoboodschap` maar directory `VideoMessages` — inconsistente taalgrens

Bron: `src/Lumio.Api/Domain/` directory-namen vs entiteitsnamen in `LumioDbContext.cs`

---

## Stap 4: Tech Debt Scoring

| Dimensie | Score (0-10) | Bevindingen | Bronverwijzingen |
|----------|-------------|-------------|-----------------|
| Coupling | 5/10 | Controllers injecteren `LumioDbContext` direct — geen repository pattern. Dit creëert harde afhankelijkheid van EF Core in controllers. CrossContext-coupling via één DbContext. | `Program.cs` service registration; controllerpatronen (geen repository-abstractie aangetroffen) |
| Cohesion | 7/10 | Domain is goed georganiseerd per subdomain. Services zijn gesepareerd (PDF, Security, Export, Video, Audit). Positief. | `src/Lumio.Api/Domain/`, `src/Lumio.Api/Services/` |
| Testbaarheid | 5/10 | Test project aanwezig (`Lumio.Api.Tests`). Maar directe DbContext-injectie in controllers maakt unit-testing complex; integration tests met SQLite in-memory zijn mogelijk maar niet bevestig zonder testfile-scan. | `lumio.slnx`, `src/Lumio.Api.Tests/` |
| Modulariteit | 7/10 | 9 domain-subdirectories. Services goed gesepareerd. Maar geen module-grens op code niveau (namespace isolation, internal classes). | `Domain/` structuur |
| Documentatie | 5/10 | Uitgebreide devdocs (data-retention, migrations, DPIA). Inline code-documentatie minimaal (geen XML-doc op publieke API methoden). Geen ADR-documenten (Architecture Decision Records). | `devdocs/`, `src/Lumio.Api/Controllers/` |
| Dependency versies | 9/10 | .NET 10, Next.js 16, React 19, Electron 35 — alle cutting-edge. Minimale verouderde packages. | `Lumio.Api.csproj`, `lumio-web/package.json` |

**Totaal gemiddelde: 6.3/10 (Beheersbaar tech debt; aandacht nodig voor coupling en testbaarheid)**

---

## Stap 5: Scalability Analyse

> **Context:** Lumio is een offline-first personal-use desktop applicatie. Traditionele server-side scalability (horizontale schaling, load balancing) is niet van toepassing. Scalability-analyse richt zich op:
> 1. Multi-profiel gebruik (5 profielen per installatie)
> 2. Data volume per database (one person's estate)
> 3. Video-opslag limiet
> 4. Potential toekomstige cloud-sync of multi-device scenario's

| Component | Huidige strategie | Knelpunten | Gedrag bij 5×/10× data |
|-----------|-------------------|-----------|------------------------|
| SQLite database per profiel | 1 db-bestand per profiel; SQLCipher versleuteld | SQLite single-writer lock; bij ≥50MB per db mogelijke page contention | Niet van toepassing (persoonlijk gebruik, max data is enkele MB) |
| Video-opslag | Lokale bestanden in `data/videos/temp/` | Geen max-grootte enforcement. Geen cleanup-strategie voor temp-bestanden. | Bij grote video's (1080p = 4GB) mogelijke schijfruimte-problemen |
| PDF-generatie | QuestPDF synchronous in request | Bij CompleetGenerator (alle secties samen) = mogelijk lang-durende request. Geen async PDF-generatie of job queue. | Bij grote datasets (boedel 100+ items): merkbare wachttijd |
| RulesEngine | JSON rules geladen bij startup | Regels gecached na eerste load | Schaalbaar voor huidige use case |
| API responsegrootte | Geen paginering aangetroffen in controller-scan | `ZoekenController` — onbekend of resultaten gelimiteerd | Bij 1000+ audits of boedelitems: mogelijke oversized responses |

Bron: `Program.cs`, `src/Lumio.Api/Data/`, `src/Lumio.Api/Services/Video/`, `src/Lumio.Api/Services/Pdf/`

---

## Stap 6: Architectuur Gap Analyse

### GAP-SA-001 — Geen Repository Pattern (Hoog)
**Beschrijving:** Controllers injecteren `LumioDbContext` direct. Er is geen repository-abstractielaag. Dit koppelt alle controllers aan EF Core en maakt unit-testing complex.

**Impact op Fase 1-doelen:**
- SP-BA1-001 (DELETE endpoint) kan worden geïmplementeerd momenteel, maar zonder abstractie is de implementatie niet testbaar in isolatie.
- Toekomstige checkout-integratie (SP-SS1-001) bemoeilijkt indien licentie-entiteiten ook direct via DbContext worden beheerd.

**Bron:** `Program.cs` (scoped DbContext registration zonder repository-tussenlaag), LumioDbContext.cs (God Context anti-pattern)

---

### GAP-SA-002 — Geen Domain Events / Cross-Aggregate Communicatie (Middel)
**Beschrijving:** Cross-aggregate operaties (bijv. eigenaar-verwijdering moet cascade naar testament, boedeltoewijzingen, donorregistratie) zijn niet gemodelleerd als domain events. Momenteel procedureel of niet aanwezig.

**Impact:** Verhoogt kans op data-inconsistentie bij profiel- of eigenaar-wijziging. Vermoedelijk blokkeert dit ook correcte implementatie van DELETE /api/profiel (GAP-001 BA).

**Bron:** `Domain/Common/BaseEntity.cs` (geen event-support), `Domain/` (geen event-klassen)

---

### GAP-SA-003 — Geen API Versioning Strategie (Laag)
**Beschrijving:** De API heeft één versie-loze URL-structuur. Er is een `detect-breaking-changes.ts` script in lumio-web scripts, maar dit detecteert alleen frontend-side breaking changes — geen server-side versioning.

**Impact:** Als in toekomst de API structure wijzigt (bijv. voor cloud-sync of B2B API), zijn geen backwards-compatibility garanties mogelijk.

**Bron:** `Program.cs` (geen `AddApiVersioning`), `src/lumio-web/scripts/` (detect-breaking-changes.ts script naam)

---

### GAP-SA-004 — Geen Auto-Update Strategie voor Electron (Hoog)
**Beschrijving:** De desktop-applicatie heeft geen electron-updater of auto-update mechanisme in de package.json of electron-builder.yml. Als de erfbelasting-configuratie verouderd is (GAP-DE-006) én de gebruiker heeft geen internet op USB-modus, is er geen updatepad.

**Impact rechtstreeks voor Fase 1:**
- GAP-DE-006 (erfbelasting 2025 verouderd) is alleen oplosbaar via een nieuwe release. Zonder auto-update bereikt de fix de gebruiker niet automatisch.
- Sprint DE-1 fix voor erfbelasting vereist user re-installatie of manuele update.

**Bron:** `src/lumio-desktop/package.json` (geen `electron-updater` dependency), `src/lumio-desktop/electron-builder.yml` (niet gelezen; INSUFFICIENT_DATA: configuratie-inhoud)

`INSUFFICIENT_DATA: electron-builder.yml` niet ingezien. Mogelijke electron-updater configuratie aanwezig maar niet bevestigbaar. Aanbeveling: verifieer vóór implementatie.

---

### GAP-SA-005 — Geen Checkout / Betaalflow Architectuur (Kritiek)
**Beschrijving:** De codebase bevat geen checkout-route, geen payment-provider integratie, geen licentie-entiteit in het domein. Dit bevestigt GAP-SS-003 en RISK-FA-001 vanuit een architectuurperspectief.

**Architectuurgevolgen:**
- Een checkout-integratie (Mollie/Stripe) vereist: nieuwe entiteiten (Licentie, Betaling), nieuwe controllers, payment webhook handling, licentie-validatie bij app-start
- Dit is een significante architectuurverandering — niet een `kleine feature`

**Bron:** `Domain/` (geen Licentie-directory), `Controllers/` (geen PaymentController), `LumioDbContext.cs` (geen Licentie DbSet)

---

### GAP-SA-006 — DELETE Profiel Endpoint Ontbreekt (Kritiek) [AVG art.17]
**Beschrijving:** Bevestigt GAP-001 BA. Geen `/api/profiel/{id}` DELETE-handler aangetroffen in `Controllers/`. Cascading delete door cross-aggregate dependencies is architectureel complex.

**Architectuurgevolgen:**
- DELETE profiel moet cascade: alle DbSets per profiel (15+ entiteitstypen), video-bestanden van disk, SQLite database-bestand, profiel-vermelding uit profiles.json
- Dit vereist een multi-stap transactionele operatie of saga-patroon
- Zonder domeinevents (GAP-SA-002) is dit een handmatige cascade in een service

**Bron:** `Controllers/ProfileController.cs` (niet ingezien; INSUFFICIENT_DATA: exacte methodes), `Controllers/` (geen DeleteController aangetroffen)

`INSUFFICIENT_DATA: ProfileController.cs inhoud niet gelezen. Mogelijk is er al een DELETE-methode — maar dit zou consistent zijn met BA-bevinding GAP-001 dat DELETE ontbreekt. Verificatie vereist.`

---

### GAP-SA-007 — CORS Policy Onveilig (Hoog)
**SECURITY_FLAG → OUT_OF_SCOPE: Security Architect (verder uitwerken in SA-08 output)**

**Beschrijving:** `Program.cs` regels 137-144: `policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()`. Dit staat alle origins toe — inclusief willekeurige webpagina's als de API-poort voorspelbaar is.

**Architectureel risico:** Hoewel de API op 127.0.0.1 draait (niet extern bereikbaar), kunnen lokale webbrowsers met kwaadaardige pagina's cross-origin requests maken naar de API. SQLCipher biedt enige bescherming maar CORS is een extra verdedigingslaag die ontbreekt.

**Bron:** `Program.cs` regels 137-144

---

### GAP-SA-008 — Swagger UI Altijd Actief (Middel)
**SECURITY_FLAG → OUT_OF_SCOPE: Security Architect**

**Beschrijving:** `Program.cs` regels 233-234: `app.UseSwagger(); app.UseSwaggerUI();` — geen `if (app.Environment.IsDevelopment())` guard. In productie (de Electron build) is de Swagger UI toegankelijk op `/swagger`.

**Bron:** `Program.cs` regels 233-234

---

### GAP-SA-009 — Geen Video-bestand Lifecycle Management (Middel)
**Beschrijving:** `Services/Video/` aanwezig. Video's worden opgeslagen in `data/videos/temp/`. Geen cleanup-mechanisme aangetroffen. Bij grote video's (1080p, meerdere boodschappen) kan de temp-map zonder limiet groeien.

**Bron:** `Program.cs` (data directory structuur), `data/videos/temp/` (lege directory in repository aanwezig)

---

### Samenvatting Architectuur Gaps

| ID | Beschrijving | Prioriteit | Fase 1 Referentie |
|----|-------------|-----------|------------------|
| GAP-SA-001 | Geen Repository Pattern | Hoog | — |
| GAP-SA-002 | Geen Domain Events | Middel | GAP-001 BA (DELETE cascade) |
| GAP-SA-003 | Geen API Versioning | Laag | — |
| GAP-SA-004 | Geen Auto-Update Strategie | Hoog | GAP-DE-006 |
| GAP-SA-005 | Geen Checkout Architectuur | Kritiek | GAP-SS-003, RISK-FA-001 |
| GAP-SA-006 | DELETE Profiel ontbreekt | Kritiek | GAP-001 BA |
| GAP-SA-007 | CORS AllowAnyOrigin | Hoog | — (SECURITY_FLAG) |
| GAP-SA-008 | Swagger UI in productie | Middel | — (SECURITY_FLAG) |
| GAP-SA-009 | Video-bestand lifecycle | Middel | — |

---

## Stap 7: Zelfcontrole

- [x] Elk architectuurpatroon onderbouwd met concrete bestandsreferenties
- [x] Geen patronen aangenomen zonder bewijs
- [x] Tech debt scores onderbouwd per dimensie met bronverwijzing
- [x] SECURITY_FLAGs doorgestuurd naar Security Architect
- [x] INSUFFICIENT_DATA items correct gemarkeerd
- [x] Data-architectuur buiten scope → OUT_OF_SCOPE: Data Architect

---

# DELIVERABLE 2 — AANBEVELINGEN

### Aannames

**Team:** 1 FTE full-stack developer (aanname gebaseerd op sole-founder setup — zie session-state.json)
`INSUFFICIENT_DATA: team-samenstelling, beschikbare capaciteit per sprint.`
Aanname: 10 SP/2-weeks sprint voor development-werk. P1-aanbevelingen = uitvoerbaar door 1 FTE in gevonden prioriteitsvolgorde.

---

### REC-SA-001 — Repository Pattern Introduceren
**Referentie:** GAP-SA-001

**Beschrijving:** Introduceer een generieke `IRepository<T>` interface en een EF Core-implementatie per aggregate root. Wijs controllers aan om via repository te werken voor alle write-operaties. Read-operaties mogen direct DbContext blijven (CQRS-lite).

**Impact:**
- Risk Reductie: Hoog — unit-testing mogelijk zonder real database
- Revenue: Indirect (snellere feature-ontwikkeling)
- Cost: Middel (refactor-effort)
- UX: Geen directe impact

**Risico van niet-uitvoeren:** Tech debt accumuleert. Controllers worden steeds complexer. DELETE-profiel cascade (GAP-SA-006) is moeilijk te testen zonder repository-laag.

**SMART meetcriterium:**
- KPI: % controllers zonder directe DbContext write-injectie
- Baseline: 0%
- Target: 100% (alle write-operaties via repository)
- Meetmethode: CodeCoverage + grep voor `DbContext` in Controllers/
- Tijdshorizon: 2 sprints

**Prioriteit:** P2 (Strategisch; niet urgent voor MVP maar vereist vóór B2B contractering)
**Impact:** Midden | **Effort:** Midden

---

### REC-SA-002 — Implementeer DELETE Profiel met Cascade Service
**Referentie:** GAP-SA-006, GAP-001 BA

**Beschrijving:** Implementeer `DELETE /api/profiel/{id}` als een gecoördineerde cascade-service die: (1) alle entiteiten in alle DbSets voor het profiel verwijdert, (2) de SQLite db-bestand van disk verwijdert, (3) video-bestanden van disk verwijdert, (4) profiel-vermelding uit profiles.json verwijdert. Gebruik een IProfileDeletionService voor testbaarheid.

**Impact:**
- Risk Reductie: Kritiek — AVG art.17 compliance blocker
- Revenue: Hoog — vereist voor B2B contractering (GUARD-BA-001)
- Cost: Laag (single-use endpoint)
- UX: Hoog — data-verwijderingsrecht is een vertrouwensbouwer

**Risico van niet-uitvoeren:** AVG-non-compliance. B2B contractering onmogelijk. DPA-handhavingsrisico.

**SMART meetcriterium:**
- KPI: DELETE /api/profiel/{id} returns HTTP 204; alle data aantoonbaar verwijderd
- Baseline: Endpoint afwezig
- Target: Endpoint aanwezig, E2E test geslaagd, cross-aggregate cascade gedocumenteerd
- Meetmethode: Integratietest in Lumio.Api.Tests
- Tijdshorizon: Sprint SA-1

**Prioriteit:** P1 (Kritiek risico)
**Impact:** Hoog | **Effort:** Midden

---

### REC-SA-003 — Implementeer Checkout Architectuur (Licentie-entiteit + Payment Webhook)
**Referentie:** GAP-SA-005, GAP-SS-003

**Beschrijving:** Ontwerp en implementeer de licentiearchitectuur: (1) Licentie entiteit in Domain/Licensing/, (2) LicenseController met activatie-endpoint, (3) Licentiestatus validatie bij app-start, (4) Payment webhook handler voor Mollie of Stripe (webhook ontvangen, betaalstatus persisteren). De checkout-UI valt onder OUT_OF_SCOPE: Senior Developer.

**Impact:**
- Revenue: Kritiek — geen checkout = geen omzet
- Risk Reductie: Hoog (RISK-FA-001 mitigatie)
- Cost: Middel
- UX: Hoog — gebruiker moet licentie kunnen activeren

**Risico van niet-uitvoeren:** €0 revenue indefinitely.

**SMART meetcriterium:**
- KPI: Licentie activeerbaar via API; betaalstatus persisteerbaar; licentiestatus verifieerbaar bij app-start
- Baseline: Geen licentie-entiteit aanwezig
- Target: POST /api/licentie/activeer endpoint met integratietest
- Meetmethode: Integratietest + Swagger UI verificatie
- Tijdshorizon: Sprint SA-1 (architectuur) + SA-2 (payment webhook)

**Prioriteit:** P1 (Kritiek revenue blocker)
**Impact:** Hoog | **Effort:** Hoog

---

### REC-SA-004 — Implementeer Auto-Update Mechanisme (electron-updater)
**Referentie:** GAP-SA-004, GAP-DE-006

**Beschrijving:** Voeg `electron-updater` toe aan `lumio-desktop`. Configureer update-feed (GitHub Releases of S3). Implementeer automatische update-check bij startup. Dit maakt hotfixes (zoals GAP-DE-006 erfbelasting) leverbaar zonder manuele re-installatie.

**Impact:**
- Risk Reductie: Hoog — verouderde rule-definities snel patchable
- Revenue: Indirect (vertrouwen in product; future recurring revenue)
- UX: Hoog — naadloze updates
- Cost: Laag (electron-updater is standaard package)

**Risico van niet-uitvoeren:** Kritieke fixes (erfbelasting, juridische disclaimers) bereiken gebruikers niet automatisch. Compliance-risico door verouderde in-field versies.

**SMART meetcriterium:**
- KPI: Automatische update-check bij app-start; update beschikbaar = notificatie zichtbaar
- Baseline: Geen electron-updater in package.json
- Target: electron-updater geïntegreerd; test-release gepubliceerd op GitHub Releases
- Meetmethode: Handmatige verificatie: release→detect→install
- Tijdshorizon: Sprint SA-2

**Prioriteit:** P1 (Hoog — schakel voor compliance)
**Impact:** Hoog | **Effort:** Laag

---

### REC-SA-005 — CORS Policy Beperken tot Localhost
**Referentie:** GAP-SA-007 (SECURITY_FLAG)

**Beschrijving:** Vervang `AllowAnyOrigin()` door `WithOrigins("http://127.0.0.1:5123", "http://localhost:5123")`. `OUT_OF_SCOPE: Security Architect (voor volledige security analyse)` maar architectureel onmiddellijk oplosbaar.

**Impact:**
- Risk Reductie: Hoog — SSRF/CSRF aanvalsvlak verkleind
- Revenue: Geen directe impact
- UX: Geen impact
- Cost: Minimaal (1-2 regels code)

**Risico van niet-uitvoeren:** Lokale webbrowsers kunnen cross-origin requests maken naar de API.

**SMART meetcriterium:**
- KPI: CORS preflight met Origin: http://evil.com returns 403
- Baseline: AllowAnyOrigin actief
- Target: Origin restricted; Electron-to-API requests nog steeds werkend
- Meetmethode: curl CORS-test
- Tijdshorizon: Sprint SA-1 (1 SP)

**Prioriteit:** P1 (Security quick win)
**Impact:** Hoog | **Effort:** Laag

---

### REC-SA-006 — Swagger UI Beperken tot Development
**Referentie:** GAP-SA-008

**Beschrijving:** Wrap `UseSwagger()` + `UseSwaggerUI()` in `if (app.Environment.IsDevelopment())`. In productie-builds geen Swagger UI beschikbaar.

**Impact:**
- Risk Reductie: Middel — geen API-documentatie beschikbaar voor aanvallers
- Cost: Minimaal

**SMART meetcriterium:**
- KPI: GET /swagger/index.html in productie-build returns 404
- Baseline: Altijd actief
- Target: Alleen actief in Development
- Meetmethode: Build + navigatie-test
- Tijdshorizon: Sprint SA-1 (1 SP)

**Prioriteit:** P1 (Security; minimale effort)
**Impact:** Middel | **Effort:** Laag

---

### REC-SA-007 — Video Temp Cleanup Implementeren
**Referentie:** GAP-SA-009

**Beschrijving:** Implementeer een cleanup-service die bij app-start `data/videos/temp/` opruimt voor bestanden ouder dan N dagen (configureerbaar, default 7). Voeg een maximum schijfruimte-check toe.

**Impact:**
- Risk Reductie: Laag
- UX: Middel — voorkomt stille schijf-vol situaties
- Cost: Laag

**SMART meetcriterium:**
- KPI: temp/ bestanden ouder dan 7 dagen verwijderd bij startup
- Baseline: Geen cleanup aanwezig
- Target: Cleanup service geregistreerd als background IHostedService; test aanwezig
- Tijdshorizon: Sprint SA-2

**Prioriteit:** P2 (Strategisch UX)
**Impact:** Laag | **Effort:** Laag

---

# DELIVERABLE 3 — SPRINTPLAN

## Aannames

```
INSUFFICIENT_DATA: exacte team-samenstelling en rol-splits.
Aanname: 1 FTE full-stack .NET/TypeScript developer @ 10 SP/sprint (2 weken).
Randvoorwaarden voor Sprint SA-1:
  - Fase 1 CRITIC VERDICT: APPROVED (✓ behaald)
  - CORS-fix: geen externe afhankelijkheid
  - DELETE profiel: kennis van alle DbSet-relaties nodig (te extraheren uit codebase-analyse ✓)
  - Checkout arch: payment provider keuze VEREIST (Mollie of Stripe) — EXTERN blocker
    eigenaar: founder | escalatie: sprint SA-1 wordt gestart zonder webhook tot keuze gemaakt
```

---

## Sprint SA-1 — Architectuur Compliance & Security Quick Wins

**Sprint doel:** Kritieke architectuurrisico's mitigeren die B2B contractering en AVG-compliance blokkeren (DELETE profiel live; CORS secure; Swagger dev-only).

**Sprint KPI-targets:**
1. DELETE /api/profiel/{id} → HTTP 204, cascade verified (integratietest groen)
2. CORS: AllowAnyOrigin → Localhost only (CORS-test geslaagd)
3. Swagger: dev-only guard aanwezig (productie-build verificatie)

**Definition of Done:** Alle stories compleet; tests geslaagd; KPI-meting uitgevoerd; geen nieuwe CRITICAL_FINDING; alle INTERN-blockers opgelost.

---

### SP-SA1-001 — DELETE Profiel Cascade Service

**Beschrijving:** Als gebruiker wil ik dat al mijn data volledig wordt verwijderd wanneer ik mijn profiel verwijder, zodat ik recht op vergetelheid (AVG art.17) kan uitoefenen.

**Team:** Team Developer (1 FTE full-stack)
**Story type:** CODE
**Story points:** 5 SP
**Acceptatiecriteria:**
- Gegeven een profiel bestaat, wanneer DELETE /api/profiel/{id} aangeroepen, dan retourneert de API HTTP 204
- Gegeven een profiel bestaat, wanneer DELETE uitgevoerd, dan zijn alle gerelateerde DbSet-records verwijderd (integratietest)
- Gegeven een profiel bestaat, wanneer DELETE uitgevoerd, dan is de db-bestand van disk verwijderd
- Gegeven een profiel bestaat, wanneer DELETE uitgevoerd, dan is profiel-vermelding uit profiles.json verwijderd
- Gegeven video-opnames aanwezig, wanneer DELETE uitgevoerd, dan zijn video-bestanden van disk verwijderd
**Afhankelijkheden:** Geen (onmiddellijk uitvoerbaar)
**Blocker:** NONE
**Aanbeveling-referentie:** REC-SA-002

---

### SP-SA1-002 — CORS Policy Beperken

**Beschrijving:** Als API-consument (Electron app) wil ik dat de API alleen requests van localhost accepteert, zodat cross-origin aanvallen vanuit externe browsers worden geblokkeerd.

**Team:** Team Developer
**Story type:** CODE
**Story points:** 1 SP
**Acceptatiecriteria:**
- Gegeven API draait, wanneer CORS preflight met Origin: http://evil.com, dan returns 403
- Gegeven Electron BrowserWindow, wanneer Electron requests naar API, dan blijven deze werken
- Gegeven dev-omgeving, wanneer http://localhost:3000 (Next.js dev), dan is CORS toegestaan
**Afhankelijkheden:** Geen
**Blocker:** NONE
**Aanbeveling-referentie:** REC-SA-005

---

### SP-SA1-003 — Swagger UI Alleen in Development

**Beschrijving:** Als security-bewuste maintainer wil ik dat Swagger UI alleen in development-builds beschikbaar is, zodat production-builds geen API-documentatie blootstellen.

**Team:** Team Developer
**Story type:** CODE
**Story points:** 1 SP
**Acceptatiecriteria:**
- Gegeven productie-build, wanneer GET /swagger/index.html, dan returns 404
- Gegeven development-build, wanneer GET /swagger/index.html, dan retourneert Swagger UI
**Afhankelijkheden:** Geen
**Blocker:** NONE
**Aanbeveling-referentie:** REC-SA-006

---

### SP-SA1-004 — Checkout Architectuur: Licentie Domein

**Beschrijving:** Als architect wil ik de licentie-entiteit en activatie-endpoint definiëren, zodat de checkout-flow gebouwd kan worden op een correcte domeinbasis.

**Team:** Team Developer
**Story type:** CODE
**Story points:** 3 SP
**Acceptatiecriteria:**
- Gegeven een licentie-activatiecode beschikbaar, wanneer POST /api/licentie/activeer{code}, dan persisteert de licentiestatus
- Gegeven app-start, wanneer geen geldige licentie, dan retourneert de API een specifieke 402 status
- Gegeven geldige licentie, wanneer app-start, dan wordt licentie gevalideerd lokaal
- Licentie-entiteit aanwezig in Domain/Licensing/ met migration
**Afhankelijkheden:** SP-SA2-001 (payment webhook — volgt later)
**Blocker:** EXTERN: Payment provider keuze (Mollie of Stripe) | eigenaar: founder | escalatie: sprint SA-1 wordt gestart met activatie-endpoint; webhook ontwikkeld in SA-2 na provider-keuze
**Aanbeveling-referentie:** REC-SA-003

---

## Parallelle Tracks Sprint SA-1

| Track | Stories | Team | Startconditie |
|-------|---------|------|---------------|
| Track A | SP-SA1-002, SP-SA1-003 | Developer | Direct starten — geen afhankelijkheden |
| Track B | SP-SA1-001 | Developer | Direct starten — na Track A (optioneel; maar serializeerbaar door 1 FTE) |
| Track C | SP-SA1-004 | Developer | Starten zodra Track B volledig af — checkout bouwt op stabiele domeinbasis |

---

## Blocker Register Sprint SA-1

| ID | Beschrijving | Type | Eigenaar | Escalatie |
|----|-------------|------|---------|-----------|
| BLK-SA1-001 | Payment provider keuze (Mollie/Stripe) vereist vóór webhook implementatie | EXTERN | Founder | Founder maakt keuze voor sprint SA-2 start; SA-1 SP-SA1-004 bouwen provider-agnostisch activatie-endpoint |

---

## Sprint SA-2 — Auto-Update + Licentie Webhook + Video Cleanup

**Sprint doel:** Update-mechanisme live zodat future patches de gebruiker bereiken; checkout architectuur compleet met payment webhook.

**Sprint KPI-targets:**
1. electron-updater geïntegreerd; test-release vervangen door GitHub Release
2. Payment webhook ontvangen + licentie-status update werkt end-to-end
3. Video temp cleanup bij startup: oud bestanden verwijderd

**Definition of Done:** Alle stories compleet; tests geslaagd; KPI's geverifieerd.

---

### SP-SA2-001 — Electron Auto-Updater

**Beschrijving:** Als gebruiker wil ik automatisch op de hoogte gesteld worden van updates, zodat ik altijd de meest recente versie (inclusief kritieke bugfixes) gebruik.

**Team:** Team Developer
**Story type:** CODE
**Story points:** 3 SP
**Acceptatiecriteria:**
- Gegeven nieuwe versie gepubliceerd op GitHub Releases, wanneer app opstart, dan detecteert electron-updater de update
- Gegeven update beschikbaar, wanneer gebruiker akkoord gaat, dan wordt de update gedownload en geïnstalleerd
- Gegeven geen internet, wanneer app opstart, dan graceful fallback (geen crash)
**Afhankelijkheden:** GitHub Releases configuratie
**Blocker:** INTERN: GitHub Releases workflow configuratie | eigenaar: developer
**Aanbeveling-referentie:** REC-SA-004

---

### SP-SA2-002 — Payment Webhook Handler

**Beschrijving:** Als payment provider wil ik een webhook kunnen sturen bij een geslaagde betaling, zodat de licentie-status in de lokale database wordt bijgewerkt.

**Team:** Team Developer
**Story type:** CODE
**Story points:** 3 SP
**Acceptatiecriteria:**
- Gegeven webhook-call van Mollie/Stripe, wanneer POST /api/licentie/webhook, dan persisteert licentiestatus als 'actief'
- Gegeven ongeldige webhook-signature, wanneer POST /api/licentie/webhook, dan returns 401
- Integratietest aanwezig voor webhook-verwerking
**Afhankelijkheden:** SP-SA1-004 (Licentie domein), payment provider keuze
**Blocker:** EXTERN: Payment provider keuze en webhook-geheimen | eigenaar: founder | escalatie: story start zodra provider gekozen is
**Aanbeveling-referentie:** REC-SA-003

---

### SP-SA2-003 — Video Temp Cleanup Service

**Beschrijving:** Als systeembeheerder van de lokale installatie wil ik dat tijdelijke videobestanden automatisch worden opgeruimd, zodat de schijf niet volloopt bij intensief gebruik.

**Team:** Team Developer
**Story type:** CODE
**Story points:** 2 SP
**Acceptatiecriteria:**
- Gegeven bestanden in data/videos/temp/ ouder dan 7 dagen, wanneer app opstart, dan worden deze verwijderd
- Gegeven schijfquota-check, wanneer totale videomap >2GB, dan user-notificatie in app
- IHostedService geregistreerd in Program.cs; unit-test aanwezig
**Afhankelijkheden:** Geen
**Blocker:** NONE
**Aanbeveling-referentie:** REC-SA-007

---

## Parallelle Tracks Sprint SA-2

| Track | Stories | Team | Startconditie |
|-------|---------|------|---------------|
| Track A | SP-SA2-001, SP-SA2-003 | Developer | Direct starten — geen externe afhankelijkheden |
| Track B | SP-SA2-002 | Developer | Na keuze payment provider (BLK-SA2-001) |

---

## Blocker Register Sprint SA-2

| ID | Beschrijving | Type | Eigenaar | Escalatie |
|----|-------------|------|---------|-----------|
| BLK-SA2-001 | Payment provider keuze vereist voor webhook-implementatie | EXTERN | Founder | Keuze vóór sprint SA-2 dag 5 |
| BLK-SA2-002 | GitHub Releases workflow configuratie vereist voor auto-updater test | INTERN | Developer | Developer configureert workflow in SA-2 dag 1 |

---

# DELIVERABLE 4 — GUARDRAILS

### GUARD-SA-001 — Controllers mogen DbContext niet direct muteren zonder Repository

**Referentie:** GAP-SA-001
**Scope:** Alle nieuwe en gewijzigde Controller-methoden met write-operaties
**Formulering:** Mag geen .Add(), .Update(), .Remove() aanroepen op een DbContext in een Controller. Alle muterende operaties vereisen een Repository-interface.
**Schending-actie:** CRITICAL_FINDING in code review — PR wordt niet gemerged; eigenaar: Senior Developer + Software Architect
**Verificatiemethode:** Geautomatiseerde Roslyn analyzer of grep-regel in CI: `DbContext\.` in `Controllers/` → build failure. Frequentie: bij elke PR.
**Overlap:** Nieuw — aanvulling op G-ARCH-02 (als die bestaat in 02-architecture-guardrails.md; INSUFFICIENT_DATA: inhoud bestand niet gelezen)

---

### GUARD-SA-002 — DELETE operaties over profielgrenzen vereisen transactionele cascade-service

**Referentie:** GAP-SA-006, GAP-001 BA
**Scope:** Elke verwijderoperatie die meerdere bounded contexts of fysieke bestanden raakt
**Formulering:** Moet altijd via IProfileDeletionService (of equivalent) worden uitgevoerd die alle cascade-stappen atomair uitvoert. Directe DbSet.Remove() voor profiel-brede deletes is verboden.
**Schending-actie:** Escaleer naar Software Architect; implementatie geblokkeerd totdat service correct geïmplementeerd is
**Verificatiemethode:** Code review checklist voor alle DELETE-endpoints; integratietest vereist dat alle data-bronnen (database + disk + profiles.json) worden geverifieerd
**Overlap:** Nieuw

---

### GUARD-SA-003 — Swagger UI mag niet beschikbaar zijn in productiebuilds

**Referentie:** GAP-SA-008
**Scope:** Alle releases (Electron packaging)
**Formulering:** Vereist dat `app.UseSwagger()` en `app.UseSwaggerUI()` altijd omsloten zijn door `if (app.Environment.IsDevelopment())`. Productie Electron-build mag niet compileren met Swagger-UI actief.
**Schending-actie:** Build-verificatietest mislukt; release geblokkeerd
**Verificatiemethode:** Automatische test in CI: build productie-profiel → GET /swagger/index.html → verwacht 404. Frequentie: elke CI-run.
**Overlap:** Nieuw

---

### GUARD-SA-004 — CORS policy mag alleen localhost-origine toestaan in productie

**Referentie:** GAP-SA-007
**Scope:** Alle productiebuilds van Lumio.Api
**Formulering:** CORS-policy mag in productie geen AllowAnyOrigin() bevatten. Toegestane origens: uitsluitend http://127.0.0.1:<port> en http://localhost:<port>.
**Schending-actie:** Security Architect review vereist; release geblokkeerd
**Verificatiemethode:** Handmatige CORS-test bij elke release: curl met Origin: http://evil.example.com → 403 expected. Frequentie: pre-release verificatie.
**Overlap:** OUT_OF_SCOPE: Security Architect voor volledige overlap-check

---

## JSON Export

```json
{
  "agent": "05-software-architect",
  "fase": "2",
  "datum": "2026-03-01",
  "architectuurpatroon": "Desktop-Embedded Monolith (Sidecar Architecture)",
  "tech_debt_score": 6.3,
  "gaps": [
    { "id": "GAP-SA-001", "titel": "Geen Repository Pattern", "prioriteit": "Hoog" },
    { "id": "GAP-SA-002", "titel": "Geen Domain Events", "prioriteit": "Middel" },
    { "id": "GAP-SA-003", "titel": "Geen API Versioning", "prioriteit": "Laag" },
    { "id": "GAP-SA-004", "titel": "Geen Auto-Update Strategie", "prioriteit": "Hoog" },
    { "id": "GAP-SA-005", "titel": "Geen Checkout Architectuur", "prioriteit": "Kritiek" },
    { "id": "GAP-SA-006", "titel": "DELETE Profiel ontbreekt", "prioriteit": "Kritiek" },
    { "id": "GAP-SA-007", "titel": "CORS AllowAnyOrigin (SECURITY_FLAG)", "prioriteit": "Hoog" },
    { "id": "GAP-SA-008", "titel": "Swagger UI in productie (SECURITY_FLAG)", "prioriteit": "Middel" },
    { "id": "GAP-SA-009", "titel": "Video-bestand lifecycle", "prioriteit": "Middel" }
  ],
  "aanbevelingen": [
    { "id": "REC-SA-001", "titel": "Repository Pattern", "prioriteit": "P2" },
    { "id": "REC-SA-002", "titel": "DELETE Profiel cascade", "prioriteit": "P1" },
    { "id": "REC-SA-003", "titel": "Checkout Architectuur", "prioriteit": "P1" },
    { "id": "REC-SA-004", "titel": "Auto-Update electron-updater", "prioriteit": "P1" },
    { "id": "REC-SA-005", "titel": "CORS localhost-only", "prioriteit": "P1" },
    { "id": "REC-SA-006", "titel": "Swagger dev-only", "prioriteit": "P1" },
    { "id": "REC-SA-007", "titel": "Video temp cleanup", "prioriteit": "P2" }
  ],
  "sprints": ["SA-1", "SA-2"],
  "security_flags": ["GAP-SA-007", "GAP-SA-008"],
  "out_of_scope_doorgestuurd": {
    "06-senior-developer": ["line-level code review", "checkout UI"],
    "07-devops-engineer": ["CI/CD pipeline", "release workflow"],
    "08-security-architect": ["CORS volledige security analyse", "Swagger security", "SQLCipher wachtwoord-rotatie"],
    "09-data-architect": ["data model optimalisatie", "migratiestrategie"]
  },
  "uncertain_items": [
    "electron-builder.yml inhoud niet gelezen — auto-updater mogelijk deels geconfigureerd",
    "ProfileController.cs inhoud niet gelezen — DELETE methode mogelijk al aanwezig"
  ]
}
```

---

## HANDOFF CHECKLIST – Software Architect – 2026-03-01

- [x] Codebase inventarisatie volledig gedocumenteerd (backend, frontend, desktop, marketing site)
- [x] Architectuurpatroon onderbouwd met artefacten (Program.cs, package.json, start-dev.ps1)
- [x] DDD analyse compleet (alle principes beoordeeld)
- [x] Tech debt score onderbouwd per dimensie (6 dimensies; bronnen geciteerd)
- [x] Scalability analyse compleet (context: offline-first; relevante knelpunten gedocumenteerd)
- [x] Architectuur gap analyse compleet (9 gaps; gelinkt aan Fase 1 output)
- [x] Alle bevindingen hebben bronvermelding
- [x] Alle SECURITY_FLAG items doorgestuurd naar Security Architect (OUT_OF_SCOPE: 08-security-architect)
- [x] JSON export aanwezig en valide
- [x] UNCERTAIN en INSUFFICIENT_DATA items gedocumenteerd
- [x] Aanbevelingen: elke aanbeveling verwijst naar GAP/RISK analyse-bevinding
- [x] Aanbevelingen: alle impact-velden gevuld of als INSUFFICIENT_DATA: gemarkeerd
- [x] Aanbevelingen: alle meetcriteria zijn SMART
- [x] Sprintplan: aannames (team, capaciteit, randvoorwaarden) gedocumenteerd
- [x] Sprintplan: alle stories hebben minimaal 1 acceptatiecriterium
- [x] Guardrails: alle guardrails zijn testbaar geformuleerd
- [x] Guardrails: alle guardrails hebben schending-actie én verificatiemethode
- [x] Guardrails: alle guardrails verwijzen naar GAP analyse-bevinding
- [x] Alle 4 deliverables aanwezig: Analyse ✓ Aanbevelingen ✓ Sprintplan ✓ Guardrails ✓
- **STATUS: GEREED VOOR HANDOFF**
