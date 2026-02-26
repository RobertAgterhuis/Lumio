# 2 — Backend API

## Overview

The backend is a .NET 10 Web API running on Kestrel. Self-contained publishing — no .NET runtime installation required on the target machine.

**Entrypoint:** `src/Lumio.Api/Program.cs`

## Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `ASPNETCORE_URLS` | `http://127.0.0.1:5123` | Listen address |
| `LUMIO_DATA_DIR` | `../data` (relative to exe) | Directory for databases and files |
| `LUMIO_FRONTEND_DIR` | `../frontend` | Directory with static Next.js export |

### Dependency Injection

| Service | Lifetime | Purpose |
|---------|----------|---------|
| `IProfileService` / `ProfileService` | Singleton | Profile management (manifest, selection) |
| `IMasterPasswordService` / `MasterPasswordService` | Singleton | Password in-memory |
| `IShamirService` / `ShamirService` | Singleton | Shamir's Secret Sharing |
| `IEncryptionService` / `EncryptionService` | Scoped | AES-256-GCM field encryption |
| `ILumioPdfService` / `LumioPdfService` | Scoped | PDF generation (QuestPDF) |
| `IAuditService` / `AuditService` | Singleton | Activity log |
| `LumioDbContext` | Scoped | EF Core with SQLCipher |
| FluentValidation | Auto | Input validation |
| Business Rules Engine | Via `AddLumioRules()` | Rule engine |

### Middleware Pipeline (order)

1. **CORS** — Everything allowed (required for Electron + development)
2. **Request Localization** — `nl` (default), `en` supported
3. **ExceptionHandlingMiddleware** — Catches exceptions, maps to HTTP 400/404/500
4. **DatabaseUnlockMiddleware** — Blocks requests when DB is locked (HTTP 423)
5. **Swagger UI** — Development only
6. **MapControllers** — REST endpoints
7. **Static Files + SPA Fallback** — Serves Next.js frontend with `RscRewriteMiddleware`

## Controllers (21)

### Authentication & Profiles

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `AuthController` | `api/auth` | `GET status`, `POST selecteer-profiel`, `POST setup`, `POST ontgrendel`, `POST vergrendel`, `POST wachtwoord`, `DELETE account`, `POST ontgrendel-erfgenaam` |
| `ProfileController` | `api/profielen` | `GET` (list), `POST` (new), `DELETE {id}` |

### Personal Data

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `EigenaarController` | `api/eigenaar` | `GET`, `POST`, `PUT`, `GET/POST/DELETE foto` |

### Heirs & Assignments

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `ErfgenamenController` | `api/erfgenamen` | CRUD, `GET erfbelasting` |
| `ToewijzingenController` | `api/toewijzingen` | CRUD, `GET erfgenaam/{id}` |
| `ShamirController` | `api/shamir` | `POST genereer`, `POST reconstrueer`, `POST reconstrueer-en-ontgrendel` |

### Advance Directives

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `TestamentController` | `api/testament` | `GET/PUT`, beneficiaries CRUD, executors CRUD, snapshots CRUD + compare, `GET legitimaire-portie-check`, `GET juridische-check` |
| `EuthanasieController` | `api/euthanasie` | `GET/PUT`, conditions CRUD |
| `DonorController` | `api/donor` | `GET/PUT`, organ choices CRUD |

### Assets & Finances

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `DigitaalBezitController` | `api/digitaal-bezit` | accounts CRUD, passwords CRUD + `ontsluitel` + `importeren`, crypto CRUD |
| `BoedelController` | `api/boedel` | `GET samenvatting`, possessions/bank accounts/insurance/debts CRUD |

### Funeral

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `UitvaartController` | `api/uitvaart` | `GET/PUT`, details CRUD, guests CRUD |

### Documents & Export

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `DocumentenController` | `api/documenten` | `GET`, `GET {id}`, `GET {id}/versies`, `POST uploaden`, `GET {id}/download`, `DELETE {id}`, `DELETE {id}/alle-versies` |
| `ExportController` | `api/export` | POST per section (testament, euthanasie, donor, digitaal-bezit, boedel, uitvaart, documenten, compleet, noodkaart, testament-concept, wilsverklaring, noodprocedure, boedelbeschrijving, executeur-rapport, notaris, erfgenaam/{id}), `GET delen/{id}`, `POST alles`, `GET json/xml/nuv`, CSV exports |

### Status & Monitoring

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `StatusController` | `api/status` | `GET`, `GET compleetheid`, `GET compleetheid/granulair`, `GET meldingen`, `GET actualisatie`, `POST actualisatie/{domein}`, `POST actualisatie/alles`, `GET statistieken`, `GET snapshot`, `GET suggesties`, `POST tijdlijn-bekeken` |
| `BackupController` | `api/backup` | `GET` (download), `POST restore` |
| `AuditLogController` | `api/audit-log` | `GET`, `POST` |

### Other

| Controller | Route | Endpoints |
|------------|-------|-----------|
| `AfhandelingController` | `api/afhandeling` | Settlement items for heirs |
| `NotitiesController` | `api/notities` | `GET`, `GET/PUT/DELETE {sectie}` |
| `ZoekenController` | `api/zoeken` | `GET` (global search) |
| `NoodcontactenController` | `api/noodcontacten` | CRUD, `GET gedeeld/export`, `POST gedeeld/import` |
| `VideoboodschappenController` | `api/videoboodschappen` | `GET` (list), `POST uploaden`, `GET {id}/stream`, `PUT {id}`, `DELETE {id}`, `GET limiet` |

## Middleware Detail

### DatabaseUnlockMiddleware

Blocks API requests when the database is locked.

**Bypass paths** (always allowed):
- `api/auth` — Authentication/unlocking
- `api/profielen` — Profile selection
- `api/status` — Status check
- `api/backup/restore` — Restore
- `swagger` — API documentation

**Read-only paths** (GET only when DB is locked):
- `api/export` — Exports
- `api/afhandeling` — Heir mode

Blocked requests receive HTTP **423 Locked** or **403 Forbidden**.

### ExceptionHandlingMiddleware

Catches unhandled exceptions and returns structured JSON:

| Exception | HTTP Status | Example |
|-----------|-------------|---------|
| `ArgumentException` | 400 | Invalid input |
| `KeyNotFoundException` | 404 | Entity not found |
| `InvalidOperationException` | 400 | Business rule violated |
| Other | 500 | Unexpected error |

### RscRewriteMiddleware

Rewrites Next.js React Server Component (RSC) paths so the static export is served correctly from the .NET static file middleware.

## Validation

FluentValidation with automatic integration:

| Validator | Domain |
|-----------|--------|
| `EigenaarValidator` | Personal data |
| `ErfgenaamValidator` | Heir data |
| `AssetValidators` | Possessions, bank accounts, insurance |
| `AuthValidators` | Password, profile selection |
| `DigitalEstateValidators` | Digital accounts, crypto |

All regex patterns (IBAN, postal code, phone) are configured in `lumio-rules.json` and not hard-coded.
