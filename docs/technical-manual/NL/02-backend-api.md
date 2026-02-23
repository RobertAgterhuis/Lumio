# 2 — Backend API

## Overzicht

De backend is een .NET 10 Web API die draait op Kestrel. Self-contained publicatie — geen .NET runtime installatie nodig op de doelmachine.

**Entrypoint:** `src/Lumio.Api/Program.cs`

## Configuratie

| Variabele | Standaard | Doel |
|-----------|-----------|------|
| `ASPNETCORE_URLS` | `http://127.0.0.1:5123` | Luisteradres |
| `LUMIO_DATA_DIR` | `../data` (relatief t.o.v. exe) | Map voor databases en bestanden |
| `LUMIO_FRONTEND_DIR` | `../frontend` | Map met statische Next.js export |

### Dependency Injection

| Service | Lifetime | Doel |
|---------|----------|------|
| `IProfileService` / `ProfileService` | Singleton | Profielbeheer (manifest, selectie) |
| `IMasterPasswordService` / `MasterPasswordService` | Singleton | Wachtwoord in-memory |
| `IShamirService` / `ShamirService` | Singleton | Shamir's Secret Sharing |
| `IEncryptionService` / `EncryptionService` | Scoped | AES-256-GCM veldencryptie |
| `ILumioPdfService` / `LumioPdfService` | Scoped | PDF-generatie (QuestPDF) |
| `IAuditService` / `AuditService` | Singleton | Activiteitenlog |
| `LumioDbContext` | Scoped | EF Core met SQLCipher |
| FluentValidation | Auto | Inputvalidatie |
| Business Rules Engine | Via `AddLumioRules()` | Regelmotor |

### Middleware Pipeline (volgorde)

1. **CORS** — Alles toegestaan (nodig voor Electron + ontwikkeling)
2. **Request Localization** — `nl` (standaard), `en` ondersteund
3. **ExceptionHandlingMiddleware** — Vangt exceptions, mapt naar HTTP 400/404/500
4. **DatabaseUnlockMiddleware** — Blokkeert requests wanneer DB vergrendeld (HTTP 423)
5. **Swagger UI** — Alleen in Development
6. **MapControllers** — REST endpoints
7. **Static Files + SPA Fallback** — Serveert Next.js frontend met `RscRewriteMiddleware`

## Controllers (21)

### Authenticatie & Profielen

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `AuthController` | `api/auth` | `GET status`, `POST selecteer-profiel`, `POST setup`, `POST ontgrendel`, `POST vergrendel`, `POST wachtwoord`, `DELETE account`, `POST ontgrendel-erfgenaam` |
| `ProfileController` | `api/profielen` | `GET` (lijst), `POST` (nieuw), `DELETE {id}` |

### Persoonsgegevens

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `EigenaarController` | `api/eigenaar` | `GET`, `POST`, `PUT`, `GET/POST/DELETE foto` |

### Erfgenamen & Toewijzingen

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `ErfgenamenController` | `api/erfgenamen` | CRUD, `GET erfbelasting` |
| `ToewijzingenController` | `api/toewijzingen` | CRUD, `GET erfgenaam/{id}` |
| `ShamirController` | `api/shamir` | `POST genereer`, `POST reconstrueer`, `POST reconstrueer-en-ontgrendel` |

### Wilsverklaringen

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `TestamentController` | `api/testament` | `GET/PUT`, begunstigden CRUD, executeurs CRUD, snapshots CRUD + vergelijk, `GET legitimaire-portie-check`, `GET juridische-check` |
| `EuthanasieController` | `api/euthanasie` | `GET/PUT`, voorwaarden CRUD |
| `DonorController` | `api/donor` | `GET/PUT`, orgaankeuzes CRUD |

### Bezittingen & Financiën

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `DigitaalBezitController` | `api/digitaal-bezit` | accounts CRUD, wachtwoorden CRUD + `ontsluitel` + `importeren`, crypto CRUD |
| `BoedelController` | `api/boedel` | `GET samenvatting`, bezittingen/bankrekeningen/verzekeringen/schulden CRUD |

### Uitvaart

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `UitvaartController` | `api/uitvaart` | `GET/PUT`, details CRUD, genodigden CRUD |

### Documenten & Export

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `DocumentenController` | `api/documenten` | `GET`, `GET {id}`, `GET {id}/versies`, `POST uploaden`, `GET {id}/download`, `DELETE {id}`, `DELETE {id}/alle-versies` |
| `ExportController` | `api/export` | POST per sectie (testament, euthanasie, donor, digitaal-bezit, boedel, uitvaart, documenten, compleet, noodkaart, testament-concept, wilsverklaring, noodprocedure, boedelbeschrijving, executeur-rapport, notaris, erfgenaam/{id}), `GET delen/{id}`, `POST alles`, `GET json/xml/nuv`, CSV exports |

### Status & Monitoring

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `StatusController` | `api/status` | `GET`, `GET compleetheid`, `GET compleetheid/granulair`, `GET meldingen`, `GET actualisatie`, `POST actualisatie/{domein}`, `POST actualisatie/alles`, `GET statistieken`, `GET snapshot`, `GET suggesties` |
| `BackupController` | `api/backup` | `GET` (download), `POST restore` |
| `AuditLogController` | `api/audit-log` | `GET`, `POST` |

### Overig

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `AfhandelingController` | `api/afhandeling` | Afhandelingsitems voor nabestaanden |
| `NotitiesController` | `api/notities` | `GET`, `GET/PUT/DELETE {sectie}` |
| `ZoekenController` | `api/zoeken` | `GET` (globaal zoeken) |
| `NoodcontactenController` | `api/noodcontacten` | CRUD, `GET gedeeld/export`, `POST gedeeld/import` |

## Middleware Detail

### DatabaseUnlockMiddleware

Blokkeert API-requests wanneer de database vergrendeld is.

**Bypass-paden** (altijd toegestaan):
- `api/auth` — Authenticatie/ontgrendeling
- `api/profielen` — Profielselectie
- `api/status` — Statuscontrole
- `api/backup/restore` — Herstellen
- `swagger` — API-documentatie

**Read-only paden** (alleen GET bij vergrendelde DB):
- `api/export` — Exports
- `api/afhandeling` — Nabestaandenmodus

Geblokkeerde requests krijgen HTTP **423 Locked** of **403 Forbidden**.

### ExceptionHandlingMiddleware

Vangt onafgehandelde exceptions en retourneert gestructureerde JSON:

| Exception | HTTP Status | Voorbeeld |
|-----------|-------------|-----------|
| `ArgumentException` | 400 | Ongeldige input |
| `KeyNotFoundException` | 404 | Entiteit niet gevonden |
| `InvalidOperationException` | 400 | Bedrijfsregel geschonden |
| Overig | 500 | Onverwachte fout |

### RscRewriteMiddleware

Herschrijft Next.js React Server Component (RSC) paden zodat de statische export correct wordt geserveerd vanuit de `.NET` static file middleware.

## Validatie

FluentValidation met automatische integratie:

| Validator | Domein |
|-----------|--------|
| `EigenaarValidator` | Persoonsgegevens |
| `ErfgenaamValidator` | Erfgenaamgegevens |
| `AssetValidators` | Bezittingen, bankrekeningen, verzekeringen |
| `AuthValidators` | Wachtwoord, profielkeuze |
| `DigitalEstateValidators` | Digitale accounts, crypto |

Alle regex-patronen (IBAN, postcode, telefoon) zijn geconfigureerd in `lumio-rules.json` en niet hard-coded.
