# 2. Backend API

## 2.1 Overzicht

De Lumio backend is een ASP.NET Core Web API (.NET 10.0) die draait als een zelfstandig proces op `http://127.0.0.1:{port}`. De API verwerkt alle business logic, dataopslag, PDF-generatie en beveiligingsoperaties.

**Projectlocatie:** `src/Lumio.Api/`

### NuGet-afhankelijkheden

| Package | Versie | Doel |
|---------|--------|------|
| `Microsoft.EntityFrameworkCore.Sqlite.Core` | 10.0.3 | ORM met SQLite-ondersteuning |
| `SQLitePCLRaw.bundle_e_sqlcipher` | 2.1.11 | SQLCipher versleutelde SQLite |
| `FluentValidation.AspNetCore` | 11.3.1 | Automatische modelvalidatie |
| `Mapster` | 7.4.0 | Object-naar-object mapping |
| `QuestPDF` | 2026.2.1 | PDF-generatie |
| `SecretSharingDotNet` | 0.14.0 | Shamir's Secret Sharing |
| `Swashbuckle.AspNetCore` | 10.1.4 | Swagger/OpenAPI documentatie |
| `Microsoft.AspNetCore.OpenApi` | 10.0.3 | OpenAPI-ondersteuning |
| `Microsoft.EntityFrameworkCore.Design` | 10.0.3 | EF Core design-time tooling |
| `RulesEngine` | 5.0.3 | Microsoft Rules Engine (JSON-workflow evaluatie) |
| `System.Linq.Dynamic.Core` | 1.7.1 | Dynamische LINQ-expressies (voor RulesEngine) |

## 2.2 Applicatie Bootstrap (Program.cs)

De applicatie wordt geconfigureerd in `Program.cs` met de volgende stappen:

### 2.2.1 Initialisatie

```csharp
// SQLCipher provider activeren (vóór enig databasegebruik)
SQLitePCL.Batteries_V2.Init();

// QuestPDF community licentie
QuestPDF.Settings.License = LicenseType.Community;
```

### 2.2.2 Data-directory

```csharp
var dataDir = Environment.GetEnvironmentVariable("LUMIO_DATA_DIR")
    ?? Path.Combine(AppContext.BaseDirectory, "..", "data");
```

De data-directory wordt bepaald door:
1. Omgevingsvariabele `LUMIO_DATA_DIR` (indien ingesteld)
2. Fallback: `../data` relatief ten opzichte van de executable

Dit garandeert USB-portabiliteit: de data staat naast de applicatie.

### 2.2.3 Dependency Injection

| Service | Scope | Beschrijving |
|---------|-------|-------------|
| `IProfileService` → `ProfileService` | Singleton | Beheert profielmanifest (profiles.json) |
| `IMasterPasswordService` → `MasterPasswordService` | Singleton | Houdt unlock-status en wachtwoord in geheugen |
| `IShamirService` → `ShamirService` | Singleton | Shamir's Secret Sharing operaties |
| `IEncryptionService` → `EncryptionService` | Scoped | AES-256-GCM veldversleuteling |
| `ILumioPdfService` → `LumioPdfService` | Scoped | PDF-documenten genereren |
| `IAuditService` → `AuditService` | Singleton | Asynchrone audit logging |
| `LumioDbContext` | Scoped | EF Core databasecontext |
| `IWorkflowLoader` → `WorkflowLoader` | Singleton | Laadt en cached `lumio-workflows.json` |
| `IRuleEngineService` → `RuleEngineService` | Singleton | Wrapper rond Microsoft RulesEngine |
| `IErfbelastingService` → `ErfbelastingService` | Scoped | Erfbelastingberekening |
| `INalatenschapService` → `NalatenschapService` | Scoped | Nalatenschapsverdeling |
| `ICompleetheidsService` → `CompleetheidsService` | Scoped | Compleetheidsberekening per sectie |
| `ILegitimairePortieService` → `LegitimairePortieService` | Scoped | Legitieme portie berekening |
| `IMeldingService` → `MeldingService` | Scoped | Meldingen (engine-first + fallback) |
| `ISuggestieService` → `SuggestieService` | Scoped | Suggesties (hybride engine + code) |

**Let op:** `IMasterPasswordService` en `IProfileService` zijn singletons omdat ze in-memory state bijhouden (wachtwoord, actief profiel) die gedeeld wordt tussen requests. De `IWorkflowLoader` en `IRuleEngineService` zijn singletons omdat workflow-definities eenmalig worden geladen bij startup.

### 2.2.4 Database-configuratie

```csharp
builder.Services.AddDbContext<LumioDbContext>((serviceProvider, options) =>
{
    var passwordService = serviceProvider.GetRequiredService<IMasterPasswordService>();
    if (passwordService.IsUnlocked && passwordService.ActiveDbPath is { } activeDbPath)
    {
        var connStr = new SqliteConnectionStringBuilder
        {
            DataSource = activeDbPath,
            Mode = SqliteOpenMode.ReadWriteCreate,
            Password = passwordService.CurrentPassword
        }.ToString();
        options.UseSqlite(connStr);
    }
    else
    {
        // Dummy in-memory connectie als de database vergrendeld is
        options.UseSqlite("Data Source=:memory:");
    }
});
```

Het DB-pad en wachtwoord worden dynamisch bepaald op basis van het actieve profiel en de unlock-status. Als de database vergrendeld is, wordt een dummy in-memory connectie gebruikt — de middleware blokkeert requests voordat ze controllers bereiken.

### 2.2.5 Middleware pipeline

```csharp
app.UseCors();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<DatabaseUnlockMiddleware>();
app.MapControllers();

// Statische frontend (Next.js export)
app.UseDefaultFiles(...);
app.UseStaticFiles(...);
app.MapFallback(...); // SPA fallback naar index.html
```

### 2.2.6 Frontend-serving

De backend serveert de Next.js statische export als static files:

```csharp
var frontendDir = Environment.GetEnvironmentVariable("LUMIO_FRONTEND_DIR")
    ?? Path.Combine(AppContext.BaseDirectory, "..", "frontend");
```

De `RscRewriteMiddleware` herschrijft Next.js RSC-paden (dot-separated) naar subdirectory-paden om 404's te voorkomen.

## 2.3 Middleware

### 2.3.1 ExceptionHandlingMiddleware

**Bestand:** `Middleware/ExceptionHandlingMiddleware.cs`

Globale exception handler die alle onafgevangen fouten omzet naar gestructureerde JSON-responses:

| Exception | HTTP Status | Response |
|-----------|------------|----------|
| `InvalidOperationException` | 400 Bad Request | `{ error: "<message>" }` |
| `KeyNotFoundException` | 404 Not Found | `{ error: "<message>" }` |
| Overige exceptions | 500 Internal Server Error | `{ error: "Er is een onverwachte fout opgetreden." }` |

### 2.3.2 DatabaseUnlockMiddleware

**Bestand:** `Middleware/DatabaseUnlockMiddleware.cs`

Controleert of de database ontgrendeld is voordat API-verzoeken worden verwerkt.

**Altijd toegestane routes (zonder unlock):**
- `/api/auth/*`
- `/api/profielen`
- `/api/status`
- `/api/backup/restore`
- `/swagger`

**Controles:**
1. Niet-`/api/` routes worden doorgelaten (frontend static files)
2. Controleer of een profiel is geselecteerd → 423 Locked indien niet
3. Controleer of de database is ontgrendeld → 423 Locked indien niet
4. In alleen-lezen modus: blokkeer muterende requests (POST/PUT/PATCH/DELETE) tenzij op de allow-list

**Alleen-lezen modus (erfgenaam-toegang):**

Toegestane routes in read-only modus:
- `/api/auth/*`
- `/api/export/*`
- `/api/status`
- `/api/afhandeling`
- `/api/profielen`
- `/api/backup/restore`
- `/swagger`

Alle schrijfoperaties naar andere endpoints retourneren 403 Forbidden.

### 2.3.3 RscRewriteMiddleware

**Bestand:** `Middleware/RscRewriteMiddleware.cs`

Herschrijft Next.js React Server Component (RSC) request-paden:

```
/__next.ABC.eigenaar.txt → /__next.ABC/eigenaar.txt
/__next.ABC.eigenaar.__PAGE__.txt → /__next.ABC/eigenaar/__PAGE__.txt
```

Dit is nodig omdat Next.js in statische export-modus dot-separated paden genereert voor route groups, die niet correct worden geresolved als bestandspaden.

## 2.4 Controllers

De API bevat **21 controllers** met in totaal **131 endpoints**.

### 2.4.1 AuthController — `/api/auth`

Authenticatie en sessiebeheer.

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| `GET` | `/status` | Huidige authenticatiestatus (ontgrendeld, eerste keer, alleen-lezen, actief profiel) |
| `POST` | `/selecteer-profiel` | Selecteer een profiel als actief |
| `POST` | `/setup` | Eerste keer: stel wachtwoord in en maak database aan |
| `POST` | `/ontgrendel` | Ontgrendel database met wachtwoord |
| `POST` | `/vergrendel` | Vergrendel database (wist wachtwoord uit geheugen) |
| `POST` | `/wachtwoord` | Wijzig wachtwoord (vereist huidig wachtwoord) |
| `DELETE` | `/account` | Verwijder account en database (vereist wachtwoord) |
| `POST` | `/ontgrendel-erfgenaam` | Ontgrendel met Shamir-shares (alleen-lezen modus) |

### 2.4.2 ProfileController — `/api/profielen`

Profielbeheer (multi-user ondersteuning).

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| `GET` | `/` | Lijst van alle profielen |
| `POST` | `/` | Nieuw profiel aanmaken (max. 5) |
| `DELETE` | `/{id}` | Profiel verwijderen (incl. database en salt) |

### 2.4.3 EigenaarController — `/api/eigenaar`

Persoonsgegevens van de eigenaar.

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| `GET` | `/` | Haal eigenaar op |
| `POST` | `/` | Maak eigenaar aan (eerste keer) |
| `PUT` | `/` | Werk eigenaar bij |
| `GET` | `/foto` | Download profielfoto |
| `POST` | `/foto` | Upload profielfoto |
| `DELETE` | `/foto` | Verwijder profielfoto |

### 2.4.4 ErfgenamenController — `/api/erfgenamen`

Erfgenamen beheer.

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| `GET` | `/` | Alle erfgenamen |
| `GET` | `/{id}` | Specifieke erfgenaam |
| `POST` | `/` | Erfgenaam toevoegen |
| `PUT` | `/{id}` | Erfgenaam bijwerken |
| `DELETE` | `/{id}` | Erfgenaam verwijderen |
| `GET` | `/erfbelasting` | Erfbelasting berekening |

### 2.4.5 NoodcontactenController — `/api/noodcontacten`

Noodcontacten en gedeelde contacten.

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| `GET` | `/` | Alle noodcontacten |
| `GET` | `/{id}` | Specifiek noodcontact |
| `POST` | `/` | Noodcontact toevoegen |
| `PUT` | `/{id}` | Noodcontact bijwerken |
| `DELETE` | `/{id}` | Noodcontact verwijderen |
| `GET` | `/gedeeld/export` | Exporteer gedeelde contacten als JSON |
| `POST` | `/gedeeld/import` | Importeer gedeelde contacten (met duplicaatdetectie) |

### 2.4.6 TestamentController — `/api/testament`

Testamentaire wensen, begunstigden, executeurs en snapshots.

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| `GET` | `/` | Testament gegevens |
| `PUT` | `/` | Testament aanmaken/bijwerken |
| `GET` | `/legitimaire-portie-check` | Controle legitimaire porties |
| `GET/POST/PUT/DELETE` | `/begunstigden[/{id}]` | CRUD begunstigden |
| `GET/POST/PUT/DELETE` | `/executeurs[/{id}]` | CRUD executeurs |
| `GET/POST/DELETE` | `/snapshots[/{id}]` | Versiegeschiedenis van testament |
| `GET` | `/snapshots/vergelijk` | Vergelijk twee snapshots |
| `GET` | `/juridische-check` | Juridische terminologie- en consistentiecontrole |

### 2.4.7 BoedelController — `/api/boedel`

Vermogensbeheer: bezittingen, bankrekeningen, verzekeringen, schulden.

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| `GET` | `/samenvatting` | Vermogenssamenvatting (totalen) |
| `GET/POST/PUT/DELETE` | `/bezittingen[/{id}]` | CRUD fysieke bezittingen |
| `GET/POST/PUT/DELETE` | `/bankrekeningen[/{id}]` | CRUD bankrekeningen |
| `GET/POST/PUT/DELETE` | `/verzekeringen[/{id}]` | CRUD verzekeringen |
| `GET/POST/PUT/DELETE` | `/schulden[/{id}]` | CRUD schulden |

### 2.4.8 DigitaalBezitController — `/api/digitaal-bezit`

Digitale accounts, wachtwoorden (versleuteld) en crypto-wallets.

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| `GET/POST/PUT/DELETE` | `/accounts[/{id}]` | CRUD digitale accounts |
| `GET/POST/PUT/DELETE` | `/wachtwoorden[/{id}]` | CRUD wachtwoorden (versleuteld opgeslagen) |
| `GET` | `/wachtwoorden/{id}/ontsluitel` | Ontsleutel specifiek wachtwoord |
| `POST` | `/wachtwoorden/importeren` | Importeer wachtwoorden uit CSV |
| `GET/POST/PUT/DELETE` | `/crypto[/{id}]` | CRUD crypto-wallets |

### 2.4.9 UitvaartController — `/api/uitvaart`

Uitvaartwensen, ceremoniedetails en genodigden.

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| `GET` | `/` | Uitvaartwensen ophalen |
| `PUT` | `/` | Uitvaartwensen aanmaken/bijwerken |
| `GET/POST/PUT/DELETE` | `/details[/{id}]` | CRUD ceremoniedetails |
| `GET/POST/PUT/DELETE` | `/genodigden[/{id}]` | CRUD genodigden |

### 2.4.10 EuthanasieController — `/api/euthanasie`

Wilsverklaring euthanasie en voorwaarden.

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| `GET` | `/` | Wilsverklaring ophalen |
| `PUT` | `/` | Wilsverklaring aanmaken/bijwerken |
| `GET/POST/PUT/DELETE` | `/voorwaarden[/{id}]` | CRUD voorwaarden |

### 2.4.11 DonorController — `/api/donor`

Donorregistratie en orgaankeuzes.

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| `GET` | `/` | Donorregistratie ophalen |
| `PUT` | `/` | Donorregistratie aanmaken/bijwerken |
| `GET/POST/PUT/DELETE` | `/orgaankeuzes[/{id}]` | CRUD orgaankeuzes |

### 2.4.12 DocumentenController — `/api/documenten`

Documenten met versleutelde opslag en versiebeheer.

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| `GET` | `/` | Alle documenten |
| `GET` | `/{id}` | Specifiek document |
| `GET` | `/{id}/versies` | Versiegeschiedenis |
| `POST` | `/uploaden` | Document uploaden (versleuteld) |
| `GET` | `/{id}/download` | Document downloaden (ontsleuteld) |
| `PATCH` | `/{id}` | Metadata bijwerken |
| `DELETE` | `/{id}` | Nieuwste versie verwijderen |
| `DELETE` | `/{id}/alle-versies` | Alle versies verwijderen |

### 2.4.13 ExportController — `/api/export`

Export in diverse formaten (PDF, HTML, ZIP, JSON, XML, CSV, NUV).

| Categorie | Routes | Formaat |
|-----------|--------|--------|
| Sectie-PDFs | `/testament`, `/euthanasie`, `/donor`, `/digitaal-bezit`, `/boedel`, `/uitvaart`, `/documenten` | PDF |
| Speciale PDFs | `/noodkaart`, `/testament-concept`, `/wilsverklaring`, `/noodprocedure`, `/boedelbeschrijving`, `/executeur-rapport`, `/notaris` | PDF |
| Complete export | `/compleet` (PDF), `/alles` (ZIP) | PDF / ZIP |
| Per erfgenaam | `/erfgenaam/{id}` (PDF), `/delen/{id}` (HTML) | PDF / HTML |
| Data-export | `/json`, `/xml`, `/nuv` (NUV-standaard) | JSON / XML |
| CSV-exports | `/csv/erfgenamen`, `/csv/bezittingen`, `/csv/bankrekeningen`, `/csv/verzekeringen`, `/csv/schulden`, `/csv/noodcontacten` | CSV |

### 2.4.14 ShamirController — `/api/shamir`

Shamir's Secret Sharing voor erfgenaam-toegang.

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| `POST` | `/genereer` | Genereer shares van het wachtwoord |
| `POST` | `/reconstrueer` | Reconstrueer wachtwoord uit shares |
| `POST` | `/reconstrueer-en-ontgrendel` | Reconstrueer en ontgrendel (alleen-lezen modus) |

### 2.4.15 StatusController — `/api/status`

Systeemstatus, voortgang en meldingen.

| Methode | Route | Beschrijving |
|---------|-------|-------------|
| `GET` | `/` | Systeemstatus |
| `GET` | `/compleetheid` | Voortgangsoverzicht per sectie |
| `GET` | `/compleetheid/granulair` | Gedetailleerde voortgang per veld |
| `GET` | `/meldingen` | Actieve meldingen/waarschuwingen |
| `GET` | `/actualisatie` | Actualisatiestatus per domein |
| `POST` | `/actualisatie/{domein}` | Bevestig actualisatie voor domein |
| `POST` | `/actualisatie/alles` | Bevestig alle actualisaties |
| `GET` | `/statistieken` | Gedetailleerde statistieken |
| `GET` | `/snapshot` | SHA-256 data-integriteits-hash |
| `GET` | `/suggesties` | Profielsuggesties (ontbrekende gegevens) |

### 2.4.16 Overige controllers

| Controller | Route | Beschrijving |
|-----------|-------|-------------|
| `BackupController` | `/api/backup` | Backup downloaden (ZIP) en herstellen |
| `ToewijzingenController` | `/api/toewijzingen` | Bezittingen toewijzen aan erfgenamen |
| `NotitiesController` | `/api/notities` | Notities per sectie (CRUD) |
| `AfhandelingController` | `/api/afhandeling` | Nabestaanden-afhandelingstracker |
| `AuditLogController` | `/api/audit-log` | Audit log opvragen en handmatig loggen |
| `ZoekenController` | `/api/zoeken` | Full-text zoeken over alle domeinen |

## 2.5 Services

### 2.5.1 ProfileService

**Bestand:** `Services/Security/ProfileService.cs`

Beheert het profielmanifest (`profiles.json`) in de data-directory.

Functionaliteit:
- **Profielen laden/opslaan** — Thread-safe via `lock` object
- **Profiel aanmaken** — Max 5 profielen; eerste profiel wordt automatisch "Primair"
- **Profiel verwijderen** — Verwijdert ook `.db` en `.salt` bestanden
- **Migratie** — Legacy `lumio.db` zonder profielsysteem wordt automatisch gemigreerd
- **Actief profiel** — In-memory tracking van het geselecteerde profiel

### 2.5.2 MasterPasswordService

**Bestand:** `Services/Security/MasterPasswordService.cs`

Beheert de unlock-status en het wachtwoord in geheugen.

Functionaliteit:
- **Unlock** — Probeert de database te openen met het opgegeven wachtwoord
- **Setup** — Slaat het wachtwoord op voor initiële database-aanmaak
- **Lock** — Wist het wachtwoord uit geheugen en reset read-only modus
- **ChangePassword** — Gebruikt SQLCipher `PRAGMA rekey` om het wachtwoord te wijzigen
- **Read-only modus** — Activeerbaar voor erfgenaam-toegang via Shamir

### 2.5.3 EncryptionService

**Bestand:** `Services/Security/EncryptionService.cs`

AES-256-GCM veldversleuteling voor extra-gevoelige gegevens. Zie [Hoofdstuk 4: Beveiliging](04-beveiliging.md) voor details.

### 2.5.4 ShamirService

**Bestand:** `Services/Security/ShamirService.cs`

Implementeert Shamir's Secret Sharing via de `SecretSharingDotNet` library. Zie [Hoofdstuk 4: Beveiliging](04-beveiliging.md) voor details.

### 2.5.5 AuditService

**Bestand:** `Services/AuditService.cs`

Asynchrone audit logging die silentief faalt als de database niet beschikbaar is. Logt acties via een eigen `IServiceProvider.CreateScope()` om conflicten met de huidige scope te voorkomen.

### 2.5.6 LumioPdfService

**Bestand:** `Services/Pdf/LumioPdfService.cs`

Genereert PDF-documenten met QuestPDF. Ondersteunde documenten:

| Document | Methode | Beschrijving |
|----------|---------|-------------|
| Sectie-PDFs | `GenerateTestamentPdf()`, etc. | Per sectie (testament, euthanasie, ...) |
| Noodkaart | `GenerateNoodkaartPdf()` | Compacte kaart met noodcontacten |
| Compleet | `GenerateCompleetPdf()` | Alles in één document |
| Testament concept | `GenerateTestamentConceptPdf()` | Juridisch concepttestament |
| Wilsverklaring | `GenerateWilsverklaringPdf()` | Formele wilsverklaring euthanasie |
| Noodprocedure | `GenerateNoodprocedurePdf()` | Stappen bij overlijden |
| Boedelbeschrijving | `GenerateBoedelbeschrijvingPdf()` | Formele vermogensinventarisatie |
| Executeur-rapport | `GenerateExecuteurRapportPdf()` | Rapport voor de executeur |
| Notaris | `GenerateNotarisPdf()` | Document voor notaris |
| Per erfgenaam | `GenerateErfgenaamPdf()` | Persoonsgebonden export |

## 2.6 Validators

FluentValidation validators worden automatisch gedetecteerd en toegepast via `AddFluentValidationAutoValidation()` en `AddValidatorsFromAssemblyContaining<Program>()`.

**Bestanden:** `Validators/`

| Validator | Beschrijving | Configuratiebron |
|-----------|-------------|-----------------|
| `AssetValidators.cs` | Validatie voor bezittingen, bankrekeningen, verzekeringen, schulden | `IOptions<ValidatieOptions>` (IBAN regex) |
| `AuthValidators.cs` | Wachtwoord-eisen, setup en profiel validatie | `IOptions<LimietenOptions>` (wachtwoordMinLengte) |
| `DigitalEstateValidators.cs` | Validatie voor digitale accounts, wachtwoorden, crypto-wallets | — |
| `EigenaarValidator.cs` | Validatie voor eigenaargegevens | `IOptions<VeldLengtesOptions>` (naam, tussenvoegsel, postcode) |
| `ErfgenaamValidator.cs` | Validatie voor erfgenaamgegevens | `IOptions<VeldLengtesOptions>` (naam) |

Alle configureerbare waarden (veldlengtes, regex-patronen, wachtwoordlimieten) worden gelezen uit `IOptions<T>`, waardoor ze aanpasbaar zijn via `rules/lumio-rules.json` zonder hercompilatie.

## 2.7 Business Rules Layer

### Architectuur

Alle business rules zijn geëxternaliseerd in een gelaagde architectuur:

```
Controllers
    │
    ▼
Rules/Services/           ← Domain services (Facts → Results)
    │           │
    ▼           ▼
Rules/Engine/         Rules/Configuration/
(RulesEngine)         (IOptions<T> + JSON)
    │                     │
    ▼                     ▼
rules/lumio-workflows.json    rules/lumio-rules.json
```

### Configuratiebestanden

| Bestand | Doel |
|---------|------|
| `rules/lumio-rules.json` | Configureerbare constanten: tarieven, limieten, veldlengtes, regex, encryptie, export, compleetheid |
| `rules/lumio-rules.schema.json` | JSON Schema voor IDE-validatie en documentatie |
| `rules/lumio-workflows.json` | Microsoft RulesEngine workflow-definities voor meldingen en suggesties |

### IOptions<T> bindings

| Options-klasse | JSON-sectie | Beschrijving |
|---------------|------------|-------------|
| `LumioRulesOptions` | `lumioRules` | Versienummer en datum van de regelconfiguratie |
| `ErfbelastingOptions` | `erfbelasting` | Tarieven, vrijstellingen, schijfgrenzen per relatietype |
| `LimietenOptions` | `limieten` | Applicatielimieten (wachtwoord, backup, shamir, bestanden) |
| `VeldLengtesOptions` | `veldLengtes` | Maximale veldlengtes voor FluentValidation |
| `ValidatieOptions` | `validatie` | Regex-patronen voor IBAN, postcode, telefoon |
| `EncryptieOptions` | `encryptie` | PBKDF2-iteraties, salt/nonce/tag/key-lengtes |
| `ExportOptions` | `export` | PDF-formaat, marges, toegestane bestandstypes |
| `CompleetheidsOptions` | `compleetheid` | Caps en veldaantallen voor compleetheidsberekening |

### Domain Services (Facts-in → Results-out)

| Service | Input (Facts) | Output (Results) | Patroon |
|---------|--------------|-------------------|---------|
| `ErfbelastingService` | `ErfbelastingFacts` | `ErfbelastingResultaat` | Puur configuratie |
| `NalatenschapService` | `NalatenschapFacts` | `NalatenschapResultaat` | Puur configuratie |
| `CompleetheidsService` | `CompleteheidsFacts` | `CompleetheidsResultaat` | Puur configuratie |
| `LegitimairePortieService` | `LegitimairePortieFacts` | `LegitimairePortieResultaat` | Puur configuratie |
| `MeldingService` | `MeldingFacts` | `PolicyResult<MeldingResultaat>` | Engine-first + fallback |
| `SuggestieService` | `SuggestieFacts` | `PolicyResult<SuggestieResultaat>` | Hybride (engine + code) |

### RulesEngine integratie

De `MeldingService` en `SuggestieService` gebruiken Microsoft RulesEngine met een robuust fallback-mechanisme:

1. **Engine-first (MeldingService):** Probeert alle regels via `lumio-workflows.json` te evalueren; bij falen wordt teruggevallen op de hardcoded domeinlogica
2. **Hybride (SuggestieService):** Eenvoudige boolean-regels via de engine, iteratieregels (foreach-matching) via code; bij engine-falen volledig via code

Workflows bevatten 19 regels verdeeld over 2 workflows:
- `MeldingenWorkflow` — 15 regels (profiel, testament, wilsverklaring, donor, uitvaart, erfgenamen, noodcontacten, documenten, backup, shamir, verlopen docs, actualisatie)
- `SuggestiesWorkflow` — 4 regels (notaris inconsistentie, notaris noodcontact, uitvaartondernemer noodcontact, huisarts)

## 2.8 Omgevingsvariabelen

| Variabele | Standaard | Beschrijving |
|-----------|-----------|-------------|
| `ASPNETCORE_URLS` | `http://127.0.0.1:5123` | Luisteradres en poort |
| `ASPNETCORE_ENVIRONMENT` | `Production` | Omgeving (Development/Production) |
| `LUMIO_DATA_DIR` | `../data` (relatief aan exe) | Pad naar data-directory |
| `LUMIO_FRONTEND_DIR` | `../frontend` (relatief aan exe) | Pad naar Next.js export |

## 2.9 Configuratiebestanden

### appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### appsettings.Development.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### launchSettings.json

Bevat ontwikkelprofielen voor `http` en `https` launch configurations.

## 2.10 Foutafhandeling

Alle API-responses volgen een consistent patroon:

| Scenario | HTTP Status | Body |
|----------|------------|------|
| Succesvol (data) | 200 OK | JSON payload |
| Aangemaakt | 201 Created | JSON payload |
| Succesvol (geen data) | 204 No Content | Leeg |
| Validatiefout | 400 Bad Request | `{ error: "..." }` |
| Niet bevoegd | 401 Unauthorized | `{ error: "..." }` |
| Alleen-lezen blokkade | 403 Forbidden | `{ error: "..." }` |
| Niet gevonden | 404 Not Found | `{ error: "..." }` |
| Database vergrendeld | 423 Locked | `{ error: "..." }` |
| Server-fout | 500 Internal Server Error | `{ error: "Er is een onverwachte fout opgetreden." }` |
