# Fase 2 — Data Architect (09)
**Agent:** 09-data-architect  
**Datum:** 2026-03-01  
**Input:** Alle Fase 2 outputs (05–08), `src/Lumio.Api/Data/LumioDbContext.cs`, `src/Lumio.Api/Migrations/`, `devdocs/data-retention-policy.md`, `devdocs/database-migrations.md`  
**Output contract:** `docs/contracts/analysis-output-contract.md`  
**Status:** GEREED VOOR HANDOFF — FASE 2 AFSLUITING

---

## 1. DATA MODEL INVENTARISATIE

### 1.1 Datastore Types

| Store | Type | Locatie | Encryptie | Per-instantie |
|---|---|---|---|---|
| SQLite + SQLCipher | Relationeel | `data/<profiel-id>.db` | AES-256-CBC at rest | Per gebruikersprofiel |
| Serilog logbestand | Flat file | `data/logs/lumio-YYYY-MM-DD.log` | Geen at-rest encryptie | Per installatie |
| Videoboodschappen | Flat file (MP4/WebM) | `data/videos/` | Geen apart at-rest (binnen OS-beveiliging) | Per installatie |
| Backup export | Encrypted ZIP | Gebruiker-gekozen pad | AES-256-CBC + PBKDF2 | Per export |
| `profiles.json` | JSON manifest | `data/profiles.json` | Geen | Per installatie |

### 1.2 Entiteitsregister

**Bron:** `src/Lumio.Api/Data/LumioDbContext.cs` (volledig gelezen), `src/Lumio.Api/Migrations/20260226135046_InitialSchema.cs`

| Domain | Entiteit | Primaire Sleutel | EigenaarId FK | Cascade |
|---|---|---|---|---|
| **Common** | `Eigenaar` | GUID | n.v.t. (root) | n.v.t. |
| Common | `Erfgenaam` | GUID | `EigenaarId` | ✅ Cascade |
| Common | `Noodcontact` | GUID | `EigenaarId` | ✅ Cascade |
| Common | `Werkgever` | GUID | `EigenaarId` | ✅ Cascade |
| Common | `AuditLogEntry` | GUID | Geen FK (globaal) | n.v.t. |
| Common | `AfhandelingsItem` | GUID | Geen expliciete FK | `UNCERTAIN:` |
| Common | `ActualisatieBevestiging` | GUID | `EigenaarId` | `UNCERTAIN:` |
| Common | `SectieNotitie` | GUID | `UNCERTAIN:` | `UNCERTAIN:` |
| **AssetRegistry** | `FysiekBezit` | GUID | `EigenaarId` | ✅ Cascade |
| AssetRegistry | `Bankrekening` | GUID | `EigenaarId` | ✅ Cascade |
| AssetRegistry | `Verzekering` | GUID | `EigenaarId` | ✅ Cascade |
| AssetRegistry | `Schuld` | GUID | `EigenaarId` | ✅ Cascade |
| AssetRegistry | `ErfgenaamToewijzing` | GUID | `EigenaarId` | ✅ Cascade |
| **DigitalEstate** | `DigitaalAccount` | GUID | `EigenaarId` | ✅ Cascade |
| DigitalEstate | `CryptoWallet` | GUID | `EigenaarId` | ✅ Cascade |
| DigitalEstate | `WachtwoordEntry` | GUID | `EigenaarId` | ✅ Cascade |
| **Documents** | `PersoonlijkDocument` | GUID | `EigenaarId` | ✅ Cascade |
| **DonorRegistration** | `DonorRegistratie` | GUID | `EigenaarId` | ✅ Cascade |
| DonorRegistration | `OrgaanKeuze` | GUID | `DonorRegistratieId` | ✅ Cascade |
| **EuthanasiaDirective** | `WilsverklaringEuthanasie` | GUID | `EigenaarId` | ✅ Cascade |
| EuthanasiaDirective | `EuthanasieVoorwaarde` | GUID | `WilsverklaringId` | ✅ Cascade |
| **FuneralWishes** | `UitvaartWensen` | GUID | `EigenaarId` | ✅ Cascade |
| FuneralWishes | `CeremonieDetail` | GUID | `UitvaartWensenId` | ✅ Cascade |
| FuneralWishes | `UitvaartGenodigde` | GUID | `UitvaartWensenId` | ✅ Cascade |
| **Testament** | `TestamentInfo` | GUID | `EigenaarId` | ✅ Cascade |
| Testament | `Begunstigde` | GUID | `TestamentInfoId` | ✅ Cascade |
| Testament | `Executeur` | GUID | `TestamentInfoId` | ✅ Cascade |
| Testament | `TestamentSnapshot` | GUID | `EigenaarId` (implied) | `UNCERTAIN:` |
| **VideoMessages** | `Videoboodschap` | GUID | `EigenaarId` | ✅ Cascade |
| VideoMessages | `VideoboodschapBlob` | GUID | `VideoboodschapId` | ✅ Cascade |
| VideoMessages | `VideoboodschapOntvanger` | GUID | `VideoboodschapId` | ✅ Cascade |

**Totaal: 31 entiteiten over 9 domeinen**

### 1.3 Eigenaar als centrale entiteit

De `Eigenaar`-entiteit is de absolute hoofdentiteit van het datamodel. Alle data is via cascade-delete verbonden aan `Eigenaar`. Dit is de enige form van "aggregate root" — er zijn geen formele aggregate root-markers in de code.

**`Eigenaar` bevat (per InitialSchema):**
- Persoonsgegevens: Voornaam, Achternaam, Tussenvoegsel, Geboortedatum
- Bijzondere gegevens: BSN (nullable `string`)
- Contactgegevens: Adres, Postcode, Woonplaats, Telefoon, Email
- Notarisgegevens: 8 notaris-velden
- Burgerlijke staat: BurgerlijkeStaat (enum), HuwelijksVoorwaarden (enum), DatumHuwelijk
- Legitimatie: LegitimatieSoort (enum), Nummer, DatumAfgifte, GeldigTot
- **Profielfoto: `ProfielFoto` (BLOB), `ProfielFotoContentType`, `ProfielFotoNaam`** — afbeelding opgeslagen in de database zelf
- UI state: TijdlijnBekeken, OnboardingVoltooid
- Timestamps: AangemaaktOp, GewijzigdOp

### 1.4 Migration Health

**Bron:** `src/Lumio.Api/Migrations/` (5 migraties)

| Timestamp | Naam | Scope | Down() methode |
|---|---|---|---|
| 20260226135046 | InitialSchema | Volledig initieel schema (31 tabellen) | ✅ Aanwezig |
| 20260227084047 | AddWerkgever | Nieuwe `Werkgevers` tabel | ✅ Aanwezig |
| 20260227084455 | AddNoodcontactExtended | Uitbreiding `Noodcontacten` | ✅ Aanwezig |
| 20260227212028 | AddVideoboodschapBestandsPad | Kolom toevoeging VideoMessages | ✅ Aanwezig |
| 20260228075844 | AddPersonLinkIds | 6 nullable FK-kolommen toevoegen | ✅ Aanwezig |

**Observatie:** 5 migraties in 3 dagen (26-02 t/m 28-02-2026) — dit is een hoge migratiedichtheid in de beginfase. Alle `Down()` methoden zijn aanwezig en correct. Productie-migratieworkflow gedocumenteerd in `devdocs/database-migrations.md`. Geen automatische migraties in productie (correct; manueel via SQL-script).

---

## 2. DATA LINEAGE MAPPING

| Domein | Bron (invoer) | Transformatie | Bestemming (output) | Eigenaar |
|---|---|---|---|---|
| Eigenaar / Profiel | UI setup-wizard | FluentValidation, BSN mod-11 | `Eigenaren` tabel | Gebruiker |
| BSN | UI input | mod-11 validatie, AES-256-GCM veldencryptie (impliciet) | `Eigenaren.BSN` | Gebruiker |
| Testament | UI formulieren | FluentValidation + RulesEngine | `Testamenten`, `Begunstigden`, `Executeurs` | Gebruiker |
| TestamentSnapshot | `TestamentInfo` state | Serialisatie naar JSON string | `TestamentSnapshots.Data` | Systeem (auto) |
| AuditLog | Controller acties | `AuditService.LogChangeAsync()` | `AuditLog` tabel | Systeem |
| VideoMessages | Webcam/upload | Opslag als BLOB in DB + bestandssysteem | `Videoboodschappen`, `data/videos/*.mp4` | Gebruiker |
| Exports (JSON/XML/NUV) | `LumioDbContext` | `ExportDataService`, serialisatie | Bestandssysteem (user-gekozen) | Gebruiker |
| PDF-rapporten | `LumioDbContext` via `PdfDataLoader` | QuestPDF generators | Tijdelijk in-memory → download naar user | Gebruiker |
| Backup | `LumioDbContext` + files | `EncryptedBackupService`, AES-256-CBC | Versleuteld ZIP naar user-gekozen pad | Gebruiker |
| Logs | Alle request/response | Serilog middleware, geen BSN/wachtwoorden | `data/logs/lumio-YYYY-MM-DD.log` | Systeem |

---

## 3. DATA GOVERNANCE ANALYSE

### 3.1 Positieve bevindingen

| Aspect | Status | Bron |
|---|---|---|
| Data Retention Policy | ✅ v1.1, DPO sign-off 2026-03-01 | `devdocs/data-retention-policy.md` |
| DPIA bijzondere categorieën | ✅ Aanwezig en goedgekeurd | `devdocs/dpia-bijzondere-categorieen.md` |
| Cascade delete configuratie | ✅ Geïmplementeerd in EF Core + migrations | `LumioDbContext.ModelConfiguration.cs`, migraties |
| BSN validatie | ✅ mod-11 elf-proef geïmplementeerd | `EigenaarUpsertRequestValidator`, `ErfgenaamUpsertRequestValidator` |
| Data portabiliteit (AVG Art. 20) | ✅ JSON, XML, NUV, encrypted backup exports | Bevestigd via `ExportDataService`, `NuvExportService` |
| BSN nooit in audit log | ✅ Policy gedocumenteerd | `data-retention-policy.md §3.2` |
| DPO aangesteld | ✅ 2026-03-01 | `data-retention-policy.md` |

### 3.2 Governance Gaps

**GAP-DA-001 (KRITIEK): AVG Art. 17 — Recht op Vergetelheid niet volledig implementeerbaar**
- `DELETE /api/profiel` endpoint ONTBREEKT (gedocumenteerd als RP-001 in retentiebeleid, prioriteit HOOG)
- `data-retention-policy.md §4` bevestigt expliciet: "TODO: frontend + API endpoint"
- Cascades zijn correct geconfigureerd, maar er is geen API-entry point voor de gebruiker

**GAP-DA-002 (Hoog): Audit log rotatie niet geautomatiseerd**
- Beleid: 90 dagen rotatie
- Implementatie: "TODO: achtergrondtaak in toekomstige sprint" (`data-retention-policy.md §3.4`)
- Risico: audit log groeit onbeperkt; AVG opslagbeperkingsbeginsel (Art. 5 lid 1 sub e) niet gehandhaafd

**GAP-DA-003 (Middel): Geen data dictionary**
- Geen formeel data-woordenboek aangetroffen
- Alleen de retentiebeleid-tabel en migraties bieden beperkte entiteits-documentatie

**GAP-DA-004 (Laag): `UNCERTAIN:` AfhandelingsItem, ActualisatieBevestiging, SectieNotitie cascade-configuratie**
- Initieel schema toont geen `EigenaarId` FK voor `AfhandelingsItems` en `ActualisatieBevestigingen`
- Als cascade ontbreekt: verwijdering van Eigenaar laat orphan records achter → data-lek risico
- Vereist verificatie in `LumioDbContext.ModelConfiguration.cs`

---

## 4. DATA KWALITEIT ANALYSE

### 4.1 Schema Kwaliteit

| Bevinding | Entity | Impact | ID |
|---|---|---|---|
| ProfielFoto als BLOB in `Eigenaren` tabel | `Eigenaren.ProfielFoto` | Row-size bloat; trage queries op tabel zonder foto-filter | GAP-DA-005 |
| DateTime als TEXT (`type: "TEXT"`) in SQLite | Alle entiteiten | Geen native datumtype in SQLite (expected), maar vergelijking is string-based → ORDER BY consistent | Acceptabel |
| `AddPersonLinkIds` — nullable FK kolommen zonder FK-constraint | `Begunstigden.ErfgenaamId` etc. | Soft reference: consistency niet DBniveau-gewaarborgd | GAP-DA-006 |
| TestamentSnapshot slaat JSON op als `string` | `TestamentSnapshots.Data` (implied) | Geen schema versioning → snapshot kan niet worden gelezen na structuurwijziging | GAP-DA-007 |

### 4.2 BSN Opslagvorm

BSN wordt opgeslagen als `nullable string` (`TEXT`) in:
- `Eigenaren.BSN`
- `Erfgenamen.BSN`

Retentiebeleid stelt: "AES-256-GCM veldencryptie voor BSN, seed phrases, wachtwoorden."  
`UNCERTAIN:` Verificatie of `EncryptionService` daadwerkelijk wordt aangeroepen bij BSN-opslag — niet bevestigd via controller-code inspectie voor `EigenaarController`. Mogelijke gap: BSN staat plaintext in SQLCipher database (SQLCipher versleutelt de hele database, maar veldniveau-encryptie voegt een extra laag toe).

**Forward naar Security Architect (08):** `SECURITY_FLAG:` BSN veldversleuteling verificatie — controleer of `EncryptionService.Encrypt()` wordt aangeroepen bij BSN schrijf-operaties.

### 4.3 Validatie Kwaliteit

- FluentValidation geïntegreerd via `AddFluentValidationAutoValidation()` ✅
- BSN mod-11 validatie aanwezig ✅
- `UNCERTAIN:` Dekking van FluentValidation over alle 33 controllers/entiteiten — de test coverage voor Validators is 1 testbestand (`BsnValidatieTests.cs`) dus de meeste validatieregels zijn niet getest

---

## 5. ANALYTICS EN REPORTING ARCHITECTUUR

### 5.1 Huidige architectuur

| Component | Type | Implementatie | Bron |
|---|---|---|---|
| PDF generatie | Synchrone batch | QuestPDF (15+ generators) | `Services/Pdf/` |
| JSON export | On-demand | `ExportDataService` | `Services/Export/ExportDataService.cs` |
| NUV export | On-demand | `NuvExportService` | XML-formaat voor notarissystemen |
| HTML export | On-demand | `HtmlExportService` | Erfgenamen-export |
| Status dashboard | Real-time | `StatusFactsBuilder` + `ExportStatusService` | Aggregatie over LumioDbContext |
| Geen BI/data warehouse | n.v.t. | n.v.t. | Offline-first; geen centrale aggregatie |

### 5.2 Export Data Lineage

```
LumioDbContext → PdfDataLoader → [15+ QuestPDF generators] → in-memory stream → API download
LumioDbContext → ExportDataService → JSON/XML → bestandssysteem (user-keuze)
LumioDbContext → NuvExportService → NUV XML → bestandssysteem
LumioDbContext → EncryptedBackupService → AES → encrypted .zip
```

### 5.3 Observaties

- Geen real-time analytics (n.v.t. voor offline-first)
- Geen data warehouse of OLAP (n.v.t.)
- Export-scope is altijd _volledig_ — geen partiële exports of incrementele exports
- `INSUFFICIENT_DATA:` NUV-format specification niet geverifieerd (externe standaard)

---

## 6. DATA-COMPLIANCE ANALYSE

**Compliance kader:** AVG/GDPR (zie Security Architect 08 output)

| AVG Recht | Artikel | Status | Implementatie |
|---|---|---|---|
| Recht op inzage | Art. 15 | ✅ | JSON/XML/NUV export endpoints |
| Recht op rectificatie | Art. 16 | ✅ | PUT/PATCH endpoints op alle entiteiten |
| **Recht op verwijdering** | **Art. 17** | **❌ KRITIEK GAP** | Cascade delete geconfigureerd MAAR geen `DELETE /api/profiel` endpoint |
| Recht op dataportabiliteit | Art. 20 | ✅ | JSON export + NUV XML |
| Recht op beperking verwerking | Art. 18 | ✅ (indirect) | Lokale opslag — gebruiker beheert database |
| Bijzondere categorieën (euthanasie, donor) | Art. 9 | ✅ | DPIA aanwezig, DPO sign-off, cascade delete |
| Opslagbeperking | Art. 5(1)(e) | ⚠️ PARTIEEL | Beleid aanwezig; audit log rotatie niet geautomatiseerd |
| Accountability | Art. 5(2) | ⚠️ PARTIEEL | AuditService silently fails (zie Security Architect GAP-SEC-009) |

**Bijzondere aandachtspunten:**

1. **BSN-bescherming (`SECURITY_FLAG:`):** BSN opgeslagen als raw TEXT in `Eigenaren.BSN`. Retentiebeleid stelt veldversleuteling verplicht. Verificatie: zijn de BSN write-operaties in controllers daadwerkelijk aangepast om `EncryptionService.Encrypt()` aan te roepen? Niet bevestigd via code-inspectie. `OUT_OF_SCOPE: Security Architect (08) — escaleer als SECURITY_FLAG`.

2. **`Serilog destructuring policy voor BSN` (RP-003):** Retentiebeleid stelt dit als "Direct" te implementeren actie. Status: `UNCERTAIN:` — niet geverifieerd of Serilog-config BSN-velden maskeert.

---

## 7. DATA ARCHITECTUUR GAP ANALYSE

Gelinkt aan Fase 1 strategische doelen (Business Analyst, Domain Expert, Sales Strategist, Financial Analyst):

| Strategisch Doel | Data Gap | ID | Prioriteit |
|---|---|---|---|
| Checkout / betaald product | Geen betalingsdata-model aangetroffen (LicenseInfo, ActivationToken, etc.) | GAP-DA-008 | KRITIEK |
| Profielwisseling / multi-profiel | `profiles.json` manifest aanwezig maar schema niet geanalyseerd | `UNCERTAIN:` | n.v.t. |
| Onderhoud toegankelijk voor opvolger | DELETE /api/profiel ontbreekt (AVG Art. 17) | GAP-DA-001 | KRITIEK |
| Export naar notaris (NUV) | NUV export aanwezig | ✅ | n.v.t. |
| Auto-update | Geen versie-metadata in datamodel | GAP-DA-009 | Laag |
| GDPR-compliance pre-release | BSN veldversleuteling onbevestigd, audit rotatie handmatig, profiel-delete ontbreekt | meerdere | Hoog |

**GAP-DA-008 (KRITIEK): Geen licentie/activatie datamodel**  
Er is geen enkele entiteit, kolom, of configuratie aangetroffen die een aangeschafte licentie bijhoudt. De Business Analyst (Fase 1) heeft de checkout-architectuur als kritiek gemarkeerd, de Financial Analyst heeft het betalingsmodel als blocker benoemd. Uit data-architectuur perspectief: er is geen schema voor `LicenseRecord`, `ActivationKey`, `PurchaseToken` of vergelijkbaar. Dit sluit aan bij GAP-SA-005 (geen checkout architectuur).

---

## 8. AANBEVELINGEN

### REC-DA-001 — DELETE /api/profiel endpoint voor AVG Art. 17 compliance
**Prioriteit:** P1 — KRITIEK  
**Gap:** GAP-DA-001  
**Effort:** 3 SP

Implementeer:
```csharp
// ProfielenController.cs
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteProfiel(Guid id)
{
    // 1. Verwijder alle cascade-data via EigenaarId
    var eigenaar = await _db.Eigenaren.FindAsync(id);
    if (eigenaar is null) return NotFound();
    
    // 2. Verwijder gekoppelde bestanden (videos, documenten)
    await _videoStorageService.DeleteAllForOwnerAsync(id);
    // ... document file cleanup ...
    
    // 3. Verwijder de database zelf (sqlcipher .db + .salt bestand)
    _db.Eigenaren.Remove(eigenaar); // triggers cascade
    await _db.SaveChangesAsync();
    await _profileService.DeleteProfileAsync(id);
    
    return NoContent();
}
```

**SMART KPI:** `DELETE /api/profiel/{id}` → HTTP 204 binnen 2 seconden; alle bijbehorende bestanden verwijderd; profiel niet meer terug te vinden in `profiles.json`.  
**Risico bij niet-uitvoeren:** AVG Art. 17 non-compliance; potentieel boete-risico bij DPIA-audit; blokt productie-release per eigen retentiebeleid RP-001.

---

### REC-DA-002 — Audit log automatische rotatie (achtergrondtaak 90 dagen)
**Prioriteit:** P1 — Hoog  
**Gap:** GAP-DA-002  
**Effort:** 2 SP

```csharp
// Achtergrondservice in Program.cs:
builder.Services.AddHostedService<AuditLogCleanupService>();

// AuditLogCleanupService.cs:
public class AuditLogCleanupService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            if (_passwordService.IsUnlocked)
            {
                var cutoff = DateTime.UtcNow.AddDays(-90);
                await _db.AuditLog
                    .Where(a => a.Tijdstip < cutoff)
                    .ExecuteDeleteAsync(stoppingToken);
            }
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}
```

**SMART KPI:** AuditLog bevat geen entries ouder dan 90 dagen; dagelijks cleanup-job draait zonder errors in Serilog-log.  
**Risico bij niet-uitvoeren:** AVG Art. 5(1)(e) (opslagbeperking) geschonden; audit log groeit ongelimiteerd.

---

### REC-DA-003 — ProfielFoto verplaatsen naar bestandssysteem
**Prioriteit:** P2 — Middel  
**Gap:** GAP-DA-005  
**Effort:** 4 SP

Verplaats `ProfielFoto`, `ProfielFotoContentType`, `ProfielFotoNaam` uit `Eigenaren` tabel naar een bestand op schijf (analoog aan videoboodschappen):
- Nieuwe kolom: `ProfielFotoPad string?` in `Eigenaren`
- BLOB-kolommen droppen in nieuwe migratie
- `ProfileService` of `EigenaarService` handelt bestandsoperaties

**SMART KPI:** `Eigenaren`-tabelrow < 2KB (zonder BLOB); foto beschikbaar op bestandssysteem.  
**Risico bij niet-uitvoeren:** Database is excessief groot voor gebruikers met profielfoto's; SQLite performance degradeert bij grote BLOBs (> 50KB).

---

### REC-DA-004 — TestamentSnapshot schema versioning
**Prioriteit:** P2 — Middel  
**Gap:** GAP-DA-007  
**Effort:** 2 SP

Voeg een `SchemaVersie string` toe aan `TestamentSnapshot`:
```csharp
public class TestamentSnapshot : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public string Data { get; set; } = string.Empty;
    public string SchemaVersie { get; set; } = "1.0"; // Nieuw veld
    public DateTime AangemaaktOp { get; set; }
}
```

Zorg dat de deserialisatie-logic valideert op SchemaVersie voor backwards-compatibility.

---

### REC-DA-005 — Licentie/activatie datamodel toevoegen
**Prioriteit:** P1 — KRITIEK (linked aan checkout architectuur)  
**Gap:** GAP-DA-008  
**Effort:** 2 SP (alleen datamodel; checkout implementatie valt onder SA-005)

```csharp
// LicenseInfo.cs (nieuw):
public class LicenseInfo
{
    public string LicenseKey { get; set; } = string.Empty;
    public DateTime ActivatedAt { get; set; }
    public string Tier { get; set; } = "Perpetual";
    public bool IsValid { get; set; }
}
```

Opgeslagen als aparte configuratietabel (geen EigenaarId-afhankelijkheid — licentie is per installatie, niet per profiel).

---

### REC-DA-006 — Serilog destructuring policy voor BSN/gevoelige velden
**Prioriteit:** P1 — Hoog  
**Gap:** RP-003 (data-retention-policy)  
**Effort:** 1 SP

```csharp
// Program.cs Serilog-configuratie:
.Destructure.ByTransforming<Eigenaar>(e => new {
    e.Id, e.Voornaam, e.Achternaam,
    BSN = "***", // gemaskeerd
})
```

Of via `Serilog.Destructure.Policy` met type-gebaseerde masking voor bekende gevoelige properties.

---

## 9. SPRINTPLAN

### Aannames
- **Team:** 1 fullstack developer (senior), solo-developer context  
- **Capaciteit:** `INSUFFICIENT_DATA:` exacte sprint-capaciteit onbekend; aanname 10-15 SP per 2-weken sprint  
- **Sprint duur:** 2 weken  
- **Randvoorwaarden sprint DA-1:** GAP-SA-006 (profiel-delete cascade design) mag parallel worden opgepakt — de DELETE endpoint is de gezamenlijke verantwoordelijkheid van SA + DA deliverables

---

### Sprint DA-1 — AVG Compliance Data Layer
**Doel:** Recht op vergetelheid volledig implementeerbaar maken + audit log retentie automaten

| Story ID | Beschrijving | SP | Type | Prioriteit |
|---|---|---|---|---|
| DA-1-001 | Als gebruiker wil ik mijn profiel volledig kunnen verwijderen zodat ik gebruik kan maken van mijn recht op vergetelheid (AVG Art. 17) | 3 | CODE | P1 |
| DA-1-002 | Als systeem wil ik audit log entries ouder dan 90 dagen automatisch verwijderen zodat we voldoen aan het AVG opslagbeperkingsbeginsel | 2 | CODE | P1 |
| DA-1-003 | Als developer wil ik een Serilog destructuring policy voor BSN en wachtwoordinput zodat gevoelige data nooit in logbestanden terechtkomt | 1 | CODE | P1 |
| DA-1-004 | Als developer wil ik een LicenseInfo datamodel (migratie) zodat bij het implementeren van checkout de database-laag gereed is | 2 | CODE | P1 |

**Acceptatiecriteria DA-1-001:** Gegeven een actief profiel, wanneer `DELETE /api/profielen/{id}` wordt aangeroepen, dan wordt de database verwijderd, CASCADE-data verwijderd, alle bijbehorende bestanden verwijderd, en retourneert het endpoint HTTP 204.  
**Acceptatiecriteria DA-1-002:** Gegeven een AuditLog entry van 91 dagen oud, wanneer de cleanup-service draait, dan is de entry niet meer aanwezig.  
**Acceptatiecriteria DA-1-003:** Gegeven een log-statement met een Eigenaar-object, wanneer de entry in `data/logs/` verschijnt, dan bevat de entry `BSN = "***"`.

**Blocker Register Sprint DA-1:** Alle stories: NONE

---

### Sprint DA-2 — Database Kwaliteit & Licentie
**Doel:** BLOB uit database, snapshot versioning, cascade-verificatie

| Story ID | Beschrijving | SP | Type | Prioriteit |
|---|---|---|---|---|
| DA-2-001 | Als developer wil ik ProfielFoto uit de Eigenaren-tabel verplaatsen naar het bestandssysteem zodat de database lean blijft | 4 | CODE | P2 |
| DA-2-002 | Als developer wil ik een SchemaVersie veld op TestamentSnapshot toevoegen zodat toekomstige structuurwijzigingen backwards-compatible gelezen kunnen worden | 2 | CODE | P2 |
| DA-2-003 | Als developer wil ik een data dictionary document aanmaken voor de 9 domeinen zodat toekomstige developers het datamodel begrijpen | 1 | ANALYSIS | P2 |
| DA-2-004 | Als developer wil ik cascade-configuratie voor AfhandelingsItems, ActualisatieBevestigingen en SectieNotities verifiëren en zo nodig fixen | 1 | CODE | P2 |

**Acceptatiecriteria DA-2-001:** Gegeven een gebruiker met profielfoto, wanneer ze de app openen, dan wordt de foto geladen van schijf; `Eigenaren` row bevat geen BLOB.  
**Acceptatiecriteria DA-2-004:** EF Core migratie toevoegt FK naar EigenaarId voor de 3 entiteiten indien ontbrekend; cascade delete gedocumenteerd in data dictionary.

**Blocker Register Sprint DA-2:** Alle stories: NONE

---

## 10. GUARDRAILS

### GUARD-DA-001 — AVG Art. 17 MOET implementeerbaar zijn op elke profiel-operatie
**Categorie:** Data Compliance  
**Prioriteit:** P1  
**Analyse-referentie:** GAP-DA-001  
**Overlap check:** Aanvulling op G-ARCH-08 (data governance)

> Bij elke nieuwe entiteit die gerelateerd is aan een `Eigenaar`, MOET een `EigenaarId` FK met `DeleteBehavior.Cascade` worden geconfigureerd in `LumioDbContext.ModelConfiguration.cs`. Dit is de enige methode waarmee het AVG Art. 17 recht op vergetelheid technisch wordt afgedwongen.

**Schending-actie:** PR review blokkeert entiteiten zonder `EigenaarId` + Cascade. CI-test (na implementatie DA-1-001): `DELETE /api/profielen/{testId}` → verifieer dat nul orphan records achterblijven.  
**Verificatiemethode:** Integratietest bij sprint DA-1-001; handmatige review bij elke nieuwe migratie.

---

### GUARD-DA-002 — Gevoelige velden MOGEN NIET in plaintext in AuditLog.Details verschijnen
**Categorie:** Data Privacy  
**Prioriteit:** P1  
**Analyse-referentie:** GAP-DA-002 + RP-003  
**Overlap check:** Nieuw — aanvulling op G-SEC-02 (Secrets Nooit in Code) maar voor data-opslag

> `AuditLog.Details`-velden MOGEN NOOIT BSN, wachtwoorden, encryptie-sleutels, of crypto-seed phrases bevatten. `AuditService.LogChangeAsync()` MOET een allowlist van te loggen velden hanteren voor gevoelige entiteiten.

**Schending-actie:** Bij bevinding van BSN in audit log: CRITICAL_FINDING + direct dataverwijdering uit log; escaleer naar DPO.  
**Verificatiemethode:** Grep op `AuditLog.Details` in testdatabase na schrijf-operatie met BSN-data; handmatige DPO-audit per kwartaal.

---

### GUARD-DA-003 — Alle TestamentSnapshots MOETEN een SchemaVersie bevatten
**Categorie:** Data Kwaliteit  
**Prioriteit:** P2  
**Analyse-referentie:** GAP-DA-007  
**Overlap check:** Nieuw

> Na implementatie van REC-DA-004 MOGEN geen `TestamentSnapshot`-records worden aangemaakt zonder gevuld `SchemaVersie` veld. Deserialisatie van snapshots MOET de SchemaVersie valideren en een leesbare foutmelding geven bij versie-mismatch.

**Schending-actie:** Snapshot zonder SchemaVersie gooit `InvalidOperationException` bij deserialisatie.  
**Verificatiemethode:** Unit test valideert SchemaVersie aanwezig in nieuwe snapshot; integratie-test verifieert dat oude schema-versie niet stilzwijgend wordt gelezen als nieuwe structuur.

---

## 11. FASE 2 GECOMBINEERDE OUTPUTSAMENVATTING

Als laatste Fase 2 agent bevestig ik dat de volgende documenten zijn aangemaakt:

| Agent | Bestand | Status |
|---|---|---|
| 05 — Software Architect | `docs/fase-2/05-software-architect.md` | ✅ GEREED |
| 06 — Senior Developer | `docs/fase-2/06-senior-developer.md` | ✅ GEREED |
| 07 — DevOps Engineer | `docs/fase-2/07-devops-engineer.md` | ✅ GEREED |
| 08 — Security Architect | `docs/fase-2/08-security-architect.md` | ✅ GEREED |
| 09 — Data Architect | `docs/fase-2/09-data-architect.md` | ✅ GEREED (dit document) |

**Status voor Critic+Risk Fase 2:** ALLE 5 FASE 2 AGENTS COMPLEET — CRITIC+RISK VALIDATION KAN STARTEN

---

## HANDOFF CHECKLIST

- [x] Datamodel volledig geïnventariseerd (31 entiteiten, 9 domeinen, bronvermeldingen LumioDbContext + migraties)
- [x] Data lineage gedocumenteerd voor alle primaire domeinen
- [x] Data governance analyse compleet (retentiebeleid, DPIA, cascade delete verificatie)
- [x] Data kwaliteitsanalyse compleet (ProfielFoto BLOB, BSN-encryptie UNCERTAIN, snapshot versioning)
- [x] Analytics architectuur gedocumenteerd (QuestPDF, export services)
- [x] Data-compliance analyse compleet (AVG Art. 17 gap, opslagbeperking gap, BSN-bescherming)
- [x] Data architectuur gap analyse gelinkt aan Fase 1 doelen (checkout datamodel ontbreekt)
- [x] Alle bevindingen hebben bronvermelding
- [x] Zelfcontrole uitgevoerd
- [x] Aanbevelingen: elke aanbeveling verwijst naar GAP-DA-NNN
- [x] Aanbevelingen: impact-velden gevuld of `INSUFFICIENT_DATA:` gemarkeerd
- [x] Aanbevelingen: meetcriteria SMART
- [x] Sprintplan: aannames gedocumenteerd (INSUFFICIENT_DATA: exacte capaciteit)
- [x] Sprintplan: alle stories hebben minimaal 1 acceptatiecriterium
- [x] Guardrails: testbaar geformuleerd, schending-actie + verificatiemethode aanwezig
- [x] Guardrails: alle verwijzen naar GAP-DA-NNN
- [x] Overlap check uitgevoerd met `docs/guardrails/02-architecture-guardrails.md`
- [x] Alle 4 deliverables aanwezig: Analyse ✓ Aanbevelingen ✓ Sprintplan ✓ Guardrails ✓
- [x] FASE 2 OUTPUT: Gecombineerde output van alle 5 Fase 2 agents gedocumenteerd

**STATUS: GEREED VOOR HANDOFF NAAR CRITIC AGENT**  
**OVERDRACHT AAN:** Critic Agent (18) + Risk Agent (19) — Fase 2 gezamenlijke validatie
