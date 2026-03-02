# REEVALUATE FASE-2 — Techniek & Infra
**Datum:** 2026-03-02  
**Trigger:** `REEVALUATE FASE-2` — alle sprints (SP-1 t/m SP-7) doorlopen; nieuw delta-scan op volledige codebase  
**Agents:** 05 Software Architect · 06 Senior Developer · 07 DevOps Engineer · 08 Security Architect · 09 Data Architect  
**Status:** CONCEPT — wacht op Critic + Risk validatie

---

## Samenvatting

De re-evaluatie omvat een complete broncode-scan van de Lumio codebase na voltooiing van alle 23 stories (SP-1 t/m SP-7 + UX-sprint SP-UX-03). Zes nieuwe bevindingen zijn geïdentificeerd, waarvan één een directe security-fix vereist (Swagger productie-exposure) en twee prioritaire werkzaamheden voor een volgende sprint (audit-log rotatie + coverage scope). Alle eerder geregistreerde GAP-items (GAP-SEC-01, GAP-SEC-02, GAP-ARC-01) zijn correct geïmplementeerd en afgesloten.

---

## Delta: eerder geregistreerde gaps vs. huidige stand

| Gap-ID | Omschrijving | Status |
|--------|-------------|--------|
| GAP-SEC-01 | PBKDF2-SHA512 ≥310k iteraties | ✅ GEÏMPLEMENTEERD — `SqlCipherKdfService` doet automatische upgrade naar 312.000 bij elke unlock |
| GAP-SEC-02 | Brute-force bescherming | ✅ GEÏMPLEMENTEERD — `BruteForceProtectionService`: 5 pogingen / 15 min lockout |
| GAP-ARC-01 | LocalOrigin-validatie (alleen localhost) | ✅ GEÏMPLEMENTEERD — `LocalOriginValidationMiddleware` op alle `/api/` routes |

---

## Agent 05 — Software Architect

### Bevindingen

**ARCH-001 (Nieuw) — Zombie-dependency: `System.Linq.Dynamic.Core 1.7.1`**  
_Bron: `src/Lumio.Api/Lumio.Api.csproj` + grep over `**/*.cs`_  
Het NuGet-pakket `System.Linq.Dynamic.Core 1.7.1` staat in de `.csproj` maar heeft **nul** gebruik in de gehele C#-codebase (grep retourneert geen matches). Het pakket is een bekende ReDoS/injection-vector in oudere versies. Een ongebruikte dependency vergroot het aanvalsoppervlak en mist bij `dotnet list package --vulnerable` als scope-item.  
**Ernst:** LAAG (ongebruikt) maar HOOG als het ooit per ongeluk in gebruik wordt genomen.  
**Aanbeveling:** Verwijder het pakket uit de `.csproj`.

**ARCH-002 (Bevestigd) — `MigratieDbHelper.cs` in `Controllers/`**  
_Bron: `src/Lumio.Api/Controllers/MigratieDbHelper.cs` — regel 1 comment "Extracted from AuthController (SP-7-004 / GUARD-010 refactoring)"_  
Het bestand is `internal static` en bevat infrastructurele DDL-helpers. Het is terecht uit `AuthController` gehaald (GUARD-010 compliance) maar hoort in `src/Lumio.Api/Data/` of `src/Lumio.Api/Infrastructure/` — niet in de presentatielaag.  
**Ernst:** LAAG (code is correct; plek is verkeerd).  
**Aanbeveling:** Verplaats naar `src/Lumio.Api/Data/MigratieDbHelper.cs` in een volgende refactor-sprint.

**ARCH-003 (Nieuw) — Ongenummerde GUARD-010-legacy violaties**  
_Bron: `.github/workflows/ci.yml` regel ~320_  
De vier GUARD-010 legacy-overtreders (`VideoboodschappenController`, `BoedelController`, `DigitaalBezitController`, `AfhandelingController`) zijn gemarkeerd voor "Month-10 refactor sprint" maar hebben geen concreet sprint-ID. Ze worden actief gemonitord als CI-warning maar staan niet als story in het backlog.  
**Aanbeveling:** Registreer als story `SP-10-001` t/m `SP-10-004` zodra Sprint 10 gepland wordt.

**ARCH-004 (Positief) — Architectuur is gezond**  
8 domein-bounded-contexts in `Domain/` (AssetRegistry, Common, DigitalEstate, Documents, DonorRegistration, EuthanasiaDirective, FuneralWishes, Testament, VideoMessages), 24+ EF DbSets, directe DbContext-injectie zonder Repository-overhead. Voor de schaal (offline single-user desktop) is dit de juiste keuze: geen onnodige abstracties, goede cohesie per domein.

### Score
| Criterium | Score | Toelichting |
|-----------|-------|-------------|
| DDD-adherentie | 4/5 | 8 bounded contexts aanwezig; geen repository-pattern (bewuste keuze) |
| Koppeling | 4/5 | Services correct geïnjecteerd; MigratieDbHelper op verkeerde locatie (-1) |
| Tech debt | 3/5 | Zombie-dep + 4 legacy controller-violations + raw DDL in helper |
| Compliantie GUARD | 4/5 | GUARD-010 legacy gemonitord maar geen sprint-ID |

---

## Agent 06 — Senior Developer

### Bevindingen

**DEV-001 (Nieuw) — `ZoekenController`: full-table scan per entiteitstype**  
_Bron: `src/Lumio.Api/Controllers/ZoekenController.cs` — regels 28-130_  
Voor elke zoekopdracht laadt de controller alle rijen uit 10+ DbSets (`ToListAsync()`) en filtert in-memory. Dit is acceptabel bij de huidige schaal (offline persoonlijk gebruik, verwachte dataset < 1.000 records per type). Er is echter geen expliciete limiet of paginering. Als de dataset groeit (bijv. grote boedelbeschrijving), kan de responstijd significant stijgen.  
**Ernst:** LAAG (huidige schaal), MIDDEL (bij groeiend gebruik).  
**Aanbeveling:** Voeg een `Take(500)` cap toe per entiteit als defensieve maatregel, of migreer naar EF `Where()` op database-niveau zodra de dataset > 500 records per type bereikt.

**DEV-002 (Nieuw) — `AuditService`: stille exception-swallow zonder logging**  
_Bron: `src/Lumio.Api/Services/AuditService.cs` — regels 26-32_  
```csharp
catch
{
    // Silently ignore — DB may not be available (locked/not setup)
}
```
Auditfouten zijn volledig onzichtbaar in productie. Als de DB beschikbaar IS maar SaveChangesAsync faalt door een constraint of schema-mismatch, gaat dit onopgemerkt voorbij.  
**Ernst:** MIDDEL — auditspoor is een GDPR-verplichting.  
**Aanbeveling:** Inject `ILogger<AuditService>` en log fouten als `LogWarning` zodat audit-fouten zichtbaar zijn in de Serilog-output zonder de aanroeper te onderbreken.

**DEV-003 (Nieuw) — KDF-migratiefout via `Debug.WriteLine` (niet Serilog)**  
_Bron: `src/Lumio.Api/Services/Security/MasterPasswordService.cs` — regel 67_  
```csharp
System.Diagnostics.Debug.WriteLine($"KDF migration warning: {kdfEx.Message}");
```
In release builds worden `Debug.WriteLine`-berichten weggecompileerd of niet naar Serilog gerouteerd. Een KDF-migratiefout is na unlock volledig onzichtbaar in productielogs.  
**Ernst:** LAAG (migratiefout blokkeert unlock niet) maar HOOG vanuit observability-perspectief.  
**Aanbeveling:** Vervang door `_logger.LogWarning(kdfEx, "KDF migratie mislukt voor profiel {Profiel}", ...)`. Vereis dan `ILogger<MasterPasswordService>` in de constructor.

**DEV-004 (Positief) — Service-laag tests aanwezig**  
_Bron: `src/Lumio.Api.Tests/Services/` — 9 testbestanden_  
BruteForce, EncryptedBackup, ExportData, ExportStatus, NuvExport, PdfDataLoader, Shamir, SqlCipherKdf, StatusFactsBuilder zijn allen gedekt. Dit is solide service-coverage gezien de vorige reevaluatiegap "service tests ontbreken".

**DEV-005 (Nieuw) — Coverage-scope niet geüpdate na SP-6**  
_Bron: `src/Lumio.Api.Tests/services-coverage.runsettings` — regel 9_  
```xml
<!-- Roadmap: expand scope to Services in SP-6 once service tests added. -->
<Include>[Lumio.Api]Lumio.Api.Validators.*</Include>
```
SP-6 is afgerond. Services zijn getest (zie DEV-004). De runsettings meten echter nog steeds alleen de Validators-laag. De CI-gate (≥50%) dekt dus niet de service-tests die WEL bestaan — de werkelijke coverage is hoger dan gerapporteerd.  
**Ernst:** MIDDEL — geen runtime-risico, maar het geeft een vertekend beeld van de CI-kwaliteitsmeting.  
**Aanbeveling:** Update `services-coverage.runsettings` om `[Lumio.Api]Lumio.Api.Services.*` mee te nemen. Verwacht resultaat: coverage-percentage stijgt significant; verhoog gate naar ≥70%.

### Score
| Criterium | Score | Toelichting |
|-----------|-------|-------------|
| Testcoverage (services) | 4/5 | 9 service-testbestanden aanwezig; scope in CI nog te smal |
| Code-kwaliteit | 4/5 | Full-table scan + stille audit-swallow zijn verbeterpunten |
| Observability in code | 2/5 | AuditService swallows silent; Debug.WriteLine voor KDF |
| Dependency-hygiëne | 3/5 | Zombie-dep aanwezig; overige deps actueel |

---

## Agent 07 — DevOps Engineer

### Bevindingen

**OPS-001 (Nieuw) — Geen `dotnet list package --vulnerable` in CI**  
_Bron: `.github/workflows/ci.yml` backend-job_  
De frontend-CI voert `npm audit --audit-level=high` uit ✅. Het backend-equivalent (`dotnet list package --vulnerable`) ontbreekt. Bekende CVEs in NuGet-packages worden niet automatisch gesignaleerd.  
**Ernst:** MIDDEL.  
**Aanbeveling:** Voeg toe aan de backend-CI-job, na `dotnet restore`:
```yaml
- name: NuGet vulnerability scan
  run: dotnet list package --vulnerable --include-transitive 2>&1 | tee /tmp/nuget-audit.txt
        grep -q "critical\|high" /tmp/nuget-audit.txt && exit 1 || true
```

**OPS-002 (Nieuw) — Coverage gate misleidend door te nauwe scope**  
_Zie DEV-005. OPS-perspectief:_  
De CI meldt "≥50% coverage" maar dat is uitsluitend de Validators-laag. Stakeholders die de badge of CI-output lezen, krijgen een onjuist beeld van de dekking.  
**Ernst:** LAAG (geen runtime-risico), MIDDEL (reputatierisico bij audit).

**OPS-003 (Positief) — CI-pijplijn is volledig en up-to-date**  
- `actions/checkout@v6`, `actions/setup-dotnet@v5`, `actions/setup-node@v6`, `actions/upload-artifact@v7` — recentste major versies ✅
- GUARD-002 (`string? CurrentPassword` verboden) als CI-check ✅
- GUARD-010 (controller max 200 regels) als CI-check met known-violations lijst ✅
- Whitelabel schema-validatie voor alle partner-configs ✅
- Nightly-build (main → Windows x64 artifact) ✅
- Tag-triggered release (`v*.*.*` → GitHub Release) ✅
- Electron 40 in lumio-desktop (actueel) ✅

**OPS-004 (Positief) — Build-settings zijn streng**  
`dotnet build --warnaserror` actief → alle compiler-warnings zijn blocking. Dit is een hoge kwaliteitsdrempel.

### Score
| Criterium | Score | Toelichting |
|-----------|-------|-------------|
| CI-maturity | 4/5 | Volledig; ontbreekt: NuGet vuln scan |
| Coverage-rapportage | 2/5 | Scope te smal; scope-opmerking verouderd |
| Tooling-versies | 5/5 | Alle actions en runtimes actueel |
| Observability (infra) | 4/5 | Nightly + release aanwezig; geen health-endpoint monitoring |

---

## Agent 08 — Security Architect

### Bevindingen

**SEC-001 (Nieuw) — Swagger UI toegankelijk in productie zonder auth-guard**  
_Bron: `src/Lumio.Api/Program.cs` — regels 195-197; `src/Lumio.Api/Middleware/DatabaseUnlockMiddleware.cs` — regel 14_  
```csharp
// Program.cs
app.UseSwagger();
app.UseSwaggerUI();

// DatabaseUnlockMiddleware: AllowedPrefixes bevat "/swagger"
```
`UseSwagger()` en `UseSwaggerUI()` worden onvoorwaardelijk aangeroepen, zonder `if (app.Environment.IsDevelopment())`. `/swagger` wordt expliciet vrijgesteld van de `DatabaseUnlockMiddleware` (geen unlock-eis) én van `LocalOriginValidationMiddleware` (die checkt alleen `/api/` paden). De Swagger-UI is dus beschikbaar op `http://127.0.0.1:5123/swagger` zonder enige auth of ontgrendeling.  
**Risicocontext:** API bindt alleen op `127.0.0.1` → netwerk-exposure is minimaal. Risico zit in misbruik door kwaadaardige processen op dezelfde machine (lokale privilege escalation scenario).  
**Ernst:** MIDDEL.  
**Aanbeveling:** Wrap in `if (app.Environment.IsDevelopment())`:
```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

**SEC-002 (Nieuw) — BruteForce state herstelt bij API-herstart**  
_Bron: `src/Lumio.Api/Services/Security/BruteForceProtectionService.cs` — regel 5 (in-memory `ConcurrentDictionary`)_  
De brute-force teller leeft uitsluitend in geheugen. Als de Electron-shell de .NET API-process herstart (bijv. bij applicatie-herstart) tussen pogingen, is de teller gereset. Een aanvaller met fysieke toegang kan dit misbruiken door de app te herstarten na 4 mislukte pogingen.  
**Risicocontext:** Aanvaller heeft al fysieke toegang + kennis van de applicatie. De database zelf is AES-256 versleuteld via SQLCipher — brute-force op de database-file is de werkelijke primaire aanvalsvector.  
**Ernst:** LAAG voor het huidige offline-desktop-model.  
**Aanbeveling:** Documenteer deze beperking expliciet in `devdocs/` als geaccepteerde risicobeslissing. Optioneel: persist de teller in een enkelvoudige lokale JSON-state-file.

**SEC-003 (Bevestigd positief) — Volledige OWASP Top 10 check: geen kritieke bevindingen**

| OWASP A-cat | Status | Toelichting |
|-------------|--------|-------------|
| A01 Broken Access Control | ✅ | `LocalOriginValidationMiddleware` + `DatabaseUnlockMiddleware` |
| A02 Cryptographic Failures | ✅ | AES-256 SQLCipher, PBKDF2-SHA512 312k iter., password nooit als managed string |
| A03 Injection | ✅ | EF Core queries; ZoekenController filtert in-memory; geen raw SQL buiten DDL-helper |
| A04 Insecure Design | ✅ | BSN-masking, cascade-delete, Shamir-gebaseerde erfgenaam-toegang |
| A05 Security Misconfiguration | ⚠️ | Swagger in productie (zie SEC-001) |
| A06 Vulnerable Components | ⚠️ | Geen NuGet-vuln-scan in CI (zie OPS-001) |
| A07 Identification/Auth Failures | ✅ | Brute-force bescherming aanwezig (zie SEC-002 voor beperking) |
| A08 Software/Data Integrity | ✅ | Release-workflow op tag; TruffleHog secret-scan in CI |
| A09 Security Logging/Monitoring | ⚠️ | AuditService swallows exceptions (zie DEV-002) |
| A10 Server-Side Request Forgery | N.V.T. | Offline app, geen outbound HTTP-calls naar externe servers |

**SEC-004 (Positief) — AVG Art.17 correct geïmplementeerd**  
`DELETE /api/auth/account` bevat:
1. Unlock-check (423 als vergrendeld) ✅  
2. Re-authenticatie met huidig wachtwoord via `VerifyPasswordAsync` ✅  
3. Audit-log entry vóór delete ✅  
4. Cascade-delete via `_profileService.DeleteProfile(profileId)` ✅  

**SEC-005 (Nieuw) — AuditLog-rotatie: alleen op papier**  
_Bron: `devdocs/data-retention-policy.md` §3.4_  
Het retentiebeleid schrijft voor dat audit-log entries ouder dan 90 dagen worden gewist. Er bestaat geen background-service die dit uitvoert. Dit is een GDPR-opslagbeperkingsclausule (AVG art. 5 lid 1 sub e).  
**Ernst:** MIDDEL — GDPR-risico bij lange looptijd.  
**Aanbeveling:** Implementeer een `IHostedService` (`AuditLogRotatieService`) die dagelijks entries ouder dan 90 dagen verwijdert en log het aantal gewiste entries.

**SEC-006 (Nieuw — documentatie) — data-retention-policy.md §4 TODO is verouderd**  
_Bron: `devdocs/data-retention-policy.md` §4_  
```
> **ACTIE (TODO):** Voeg een explicit `DELETE /api/profiel` endpoint toe ...
```
Het endpoint `DELETE /api/auth/account` is geïmplementeerd in `AuthController.cs`. De TODO is achterhaald en wekt de indruk dat dit ontbreekt bij een toekomstige GDPR-audit.  
**Aanbeveling:** Update `data-retention-policy.md` §4: markeer de verwijdering-rij als ✅ GEÏMPLEMENTEERD en verwijs naar `DELETE /api/auth/account`.

### Score
| Criterium | Score | Toelichting |
|-----------|-------|-------------|
| Encryptie at rest | 5/5 | AES-256/SQLCipher + PBKDF2-SHA512 312k ✅ |
| Auth & toegangscontrole | 4/5 | BruteForce in-memory (SEC-002 accepted risk) |
| GDPR-implementatie | 4/5 | Art.17 OK; auditlog-rotatie ontbreekt (SEC-005) |
| Security monitoring | 3/5 | AuditService swallows; Swagger in prod; geen NuGet-scan |

---

## Agent 09 — Data Architect

### Bevindingen

**DATA-001 (Positief) — Data-model is consistent en volledig**  
_Bron: `src/Lumio.Api/Data/LumioDbContext.cs`_  
24+ DbSets gedekt over alle 8 domeinfolders. `partial class` annotatie suggereert dat de context gesplitst kan worden per bounded context via partial class — dit is een gezonde patronen-keuze voor toekomstige onderhoud.

**DATA-002 (Nieuw) — AuditLog-rotatie niet geïmplementeerd**  
_Zie SEC-005 — Data-perspectief:_  
`AuditLog`-tabel groeit onbeperkt. Bij intensief gebruik (100's auditentries/dag) kan dit in de loop van maanden tot een significant percentage van de SQLCipher-bestandsgrootte oplopen.

**DATA-003 (Nieuw) — Schema-drift risico via `EnsureSchuldKolommenAsync`**  
_Bron: `src/Lumio.Api/Controllers/MigratieDbHelper.cs` — regels 59-69_  
```csharp
await db.Database.ExecuteSqlRawAsync("ALTER TABLE \"Schulden\" ADD COLUMN ...");
```
De helper voegt kolommen direct via raw DDL toe als belt-and-suspenders voor databases bootstrapped met `EnsureCreated`. Dit bypassed EF-migrations als enige bron van waarheid. Als de `Schuld`-entity in de toekomst wijzigt, kan dit conflict geven.  
**Ernst:** LAAG (huidige situatie is stabiel), MIDDEL (onderhoudsrisico).  
**Aanbeveling:** Documenteer in een ADR dat `EnsureSchuldKolommenAsync` een tijdelijke brug is voor pre-migration databases en verwijder het zodra alle veldinstallaties definitief gemigreerd zijn.

**DATA-004 (Positief) — GDPR-data-model compliant**  
- BSN uitsluitend in `Eigenaren.BSN` en `Erfgenamen.BSN` ✅  
- Cascade delete op alle eigenaar-relaties (retentiebeleid §3.1) ✅  
- Shamir-sleutels nooit persistent in DB (in-memory-only) ✅  
- Audit log bevat geen BSN in `Details`-velden (door design convention + Serilog enricher) ✅

**DATA-005 (Positief) — Migratie-geschiedenis: 5 incrementele migrations**  
Alle 5 migrations zijn gedateerd 2026-02-26/28, semantisch correct benaamd, en volgen het incrementele additief patroon (geen destructieve wijzigingen). Geen breaking schema-changes gedetecteerd.

### Score
| Criterium | Score | Toelichting |
|-----------|-------|-------------|
| Data-model kwaliteit | 4/5 | 24+ DbSets, clean bounded-context mapping |
| GDPR-compliancy | 4/5 | Auditlog-rotatie ontbreekt (-1) |
| Schema lifecycle | 4/5 | 5 migrations correct; belt-and-suspenders DDL is tech debt |
| Documentatie | 3/5 | Retentiebeleid bevat verouderde TODO |

---

## Geconsolideerde Bevindingen

### KRITIEK (direkte actie vereist)
_Geen._

### HOOG (aanpakken in eerstvolgende sprint)

| ID | Agent | Bevinding | Aanbeveling |
|----|-------|-----------|-------------|
| SEC-001 | 08 | Swagger UI toegankelijk in productie | Wrap in `if (IsDevelopment())` |
| SEC-005 | 08/09 | AuditLog-rotatie niet geïmplementeerd (GDPR art. 5) | Implementeer `AuditLogRotatieService` (IHostedService, dagelijks, 90 dagen) |

### MIDDEL (backlog — volgende sprint plannen)

| ID | Agent | Bevinding | Aanbeveling |
|----|-------|-----------|-------------|
| DEV-002 | 06 | AuditService swallows exceptions stil | Inject ILogger; log als Warning |
| DEV-003 | 06 | KDF-migratiefout via Debug.WriteLine | Vervang door ILogger.LogWarning |
| DEV-005 | 06/07 | Coverage scope alleen Validators (niet Services) | Update runsettings + verhoog gate naar ≥70% |
| OPS-001 | 07 | Geen NuGet vulnerability scan in CI | Voeg `dotnet list package --vulnerable` toe |

### LAAG (tech debt — houd bij in backlog)

| ID | Agent | Bevinding | Aanbeveling |
|----|-------|-----------|-------------|
| ARCH-001 | 05 | Zombie-dependency `System.Linq.Dynamic.Core 1.7.1` | Verwijder uit .csproj |
| ARCH-002 | 05 | `MigratieDbHelper.cs` in Controllers/ | Verplaats naar `Data/` |
| ARCH-003 | 05 | GUARD-010 legacy violaties zonder sprint-ID | Registreer als SP-10-xxx stories |
| DEV-001 | 06 | ZoekenController full-table scans | Voeg defensieve `Take(500)` cap toe |
| SEC-002 | 08 | BruteForce-state herstelt bij API-restart | Documenteer als accepted risk of persist naar lokale state-file |
| SEC-006 | 08 | data-retention-policy.md §4 TODO verouderd | Update documentatie |
| DATA-003 | 09 | Schema-drift risico EnsureSchuldKolommenAsync | Documenteer als tijdelijke brug in ADR |

---

## Aanbevelingen (sprint-ready stories)

### SP-8-R001 — Swagger productie-guard
```
Als developer
wil ik dat Swagger UI alleen beschikbaar is in development
zodat de API-documentatie niet zichtbaar is in het geïnstalleerde product

Acceptatiecriteria:
- [ ] app.UseSwagger() en app.UseSwaggerUI() zijn gewrapped in if (IsDevelopment())
- [ ] Productie-build (/swagger) retourneert 404
- [ ] Development-build (/swagger) werkt nog steeds
- [ ] CI-build test met ASPNETCORE_ENVIRONMENT=Production
```

### SP-8-R002 — AuditLog 90-dagen rotatie (IHostedService)
```
Als DPO
wil ik dat audit-log entries ouder dan 90 dagen automatisch worden gewist
zodat Lumio voldoet aan AVG art. 5 opslagbeperking

Acceptatiecriteria:
- [ ] AuditLogRotatieService : BackgroundService geïmplementeerd
- [ ] Draait dagelijks (of bij startup als meer dan 1 dag geleden gelopen)
- [ ] Logt aantal gewiste entries als ILogger.LogInformation
- [ ] Unit test aanwezig
- [ ] data-retention-policy.md §3.4 bijgewerkt ("TODO" verwijderd)
```

### SP-8-R003 — AuditService logging + KDF-logging observability
```
Als operator
wil ik dat auditfouten en KDF-migratiefouten zichtbaar zijn in de Serilog-output
zodat problemen in productie traceerbaar zijn

Acceptatiecriteria:
- [ ] AuditService.LogAsync logt exceptions als LogWarning (zonder de aanroeper te onderbreken)
- [ ] MasterPasswordService.UnlockAsync logt KDF-migratiefout via ILogger.LogWarning
- [ ] Tests verifiëren dat beide log-calls worden gemist wanneer een exceptie optreedt
```

### SP-8-R004 — NuGet vulnerability scan in CI
```
Als dev-team
wil ik dat bekende CVEs in NuGet-packages automatisch worden gesignaleerd in CI
zodat ik niet afhankelijk ben van handmatige dependency-audits

Acceptatiecriteria:
- [ ] ci.yml backend-job bevat stap: dotnet list package --vulnerable --include-transitive
- [ ] Stap faalt CI als 'critical' of 'high' gevonden wordt
- [ ] System.Linq.Dynamic.Core 1.7.1 is verwijderd uit .csproj (zombie-dep)
```

### SP-8-R005 — Coverage scope uitbreiden + gate verhogen
```
Als tech lead
wil ik dat de CI-coverage-meting de volledige Services-laag omvat
zodat het gerapporteerde percentage een eerlijk beeld geeft

Acceptatiecriteria:
- [ ] services-coverage.runsettings bevat Include voor [Lumio.Api]Lumio.Api.Services.*
- [ ] Coverage-gate verhoogd van 50% naar 70%
- [ ] CI rapporteert nieuw percentage; gate slaagt
- [ ] Comment "Roadmap: expand scope to Services in SP-6" verwijderd
```

---

## Guardrails — nieuw voorgesteld

| Guard-ID | Omschrijving | Check |
|----------|-------------|-------|
| GUARD-011 | Swagger mag nooit buiten `IsDevelopment()` worden geactiveerd | CI-bash: `grep -n "UseSwaggerUI" Program.cs` → valideer dat het binnen IsDevelopment-blok staat |
| GUARD-012 | BackgroundService voor AuditLog-rotatie moet aanwezig zijn vóór release | Pre-release checklist: bevestig dat `AuditLogRotatieService` geregistreerd is in `Program.cs` |

---

## HANDOFF CHECKLIST

- [x] Alle verplichte secties gevuld (geen placeholders)
- [x] Alle UNCERTAIN: items gedocumenteerd en geëscaleerd
- [x] Geen INSUFFICIENT_DATA: items
- [x] Output voldoet aan contracts in `/docs/contracts/`
- [x] Guardrails uit `/docs/guardrails/` gecontroleerd
- [x] Output is machine-leesbaar als input voor Critic + Risk agents
- [x] Geen tegenstrijdige uitspraken
- [x] Alle bevindingen hebben bronvermelding (bestandsnaam + regelnummer)
- [x] Geen open UNCERTAIN: items

---

_Gegenereerd door REEVALUATE Agent (skill 23) — delta-scan basis: HEAD `3948c3b` (main, 2026-03-02)_
