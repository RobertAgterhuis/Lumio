# Lumio — Derde Integratie-analyse

## Status

De eerste twee analyses identificeerden in totaal **10 issues** (7 bugs + 3 verbeteringen).
Dit document beschrijft **13 additionele issues** die nog niet eerder zijn gedocumenteerd.

### Eerder gedocumenteerd (niet herhaald)

| # | Analyse | Issue |
|---|---------|-------|
| 1 | Analyse 1 | Ontbrekende Eigenaar pagina ✅ |
| 2 | Analyse 1 | Silent error swallowing ✅ |
| 3 | Analyse 1 | Geen onboarding flow ✅ |
| 4 | Analyse 2 | DbContext DI timing bug (KRITIEK) |
| 5 | Analyse 2 | Donor wizard duplicate orgaankeuzes |
| 6 | Analyse 2 | Wizards laden geen bestaande data |
| 7 | Analyse 2 | RSC 404-fouten Next.js 16 |
| 8 | Analyse 2 | Documenten download verkeerd base-pad |
| 9 | Analyse 2 | Export pagina raw fetch |
| 10 | Analyse 2 | SQL injection in ChangePasswordAsync |

---

## Inhoudsopgave

1. [BUG 1 — Erfgenaam wordt niet gekoppeld aan Eigenaar](#1-bug-1--erfgenaam-wordt-niet-gekoppeld-aan-eigenaar)
2. [BUG 2 — Ontbrekende EF cascade delete configuratie](#2-bug-2--ontbrekende-ef-cascade-delete-configuratie)
3. [BUG 3 — Crypto wallet frontend mist SeedPhrase invoerveld](#3-bug-3--crypto-wallet-frontend-mist-seedphrase-invoerveld)
4. [BUG 4 — Geen wachtwoord ontsluitel-knop in UI](#4-bug-4--geen-wachtwoord-ontsluitel-knop-in-ui)
5. [BUG 5 — Geen executeurs-UI op testament pagina](#5-bug-5--geen-executeurs-ui-op-testament-pagina)
6. [BUG 6 — Geen ceremonie-details CRUD op uitvaart pagina](#6-bug-6--geen-ceremonie-details-crud-op-uitvaart-pagina)
7. [BUG 7 — Authenticated layout verliest sessie bij pagina-refresh](#7-bug-7--authenticated-layout-verliest-sessie-bij-pagina-refresh)
8. [BUG 8 — FluentValidation pakket geïnstalleerd maar nul validators](#8-bug-8--fluentvalidation-pakket-geïnstalleerd-maar-nul-validators)
9. [BUG 9 — Shamir share-toewijzing op alfabetische volgorde is fragiel](#9-bug-9--shamir-share-toewijzing-op-alfabetische-volgorde-is-fragiel)
10. [BUG 10 — EncryptionService gebruikt vaste salt voor alle databases](#10-bug-10--encryptionservice-gebruikt-vaste-salt-voor-alle-databases)
11. [VERBETERING 1 — DocumentenController EncryptedContent veldnaam is misleidend](#11-verbetering-1--documentencontroller-encryptedcontent-veldnaam-is-misleidend)
12. [VERBETERING 2 — Shamir reconstruct retourneert wachtwoord als plaintext in HTTP response](#12-verbetering-2--shamir-reconstruct-retourneert-wachtwoord-als-plaintext-in-http-response)
13. [VERBETERING 3 — PDF service queries zonder EigenaarId filtering](#13-verbetering-3--pdf-service-queries-zonder-eigenaarid-filtering)
14. [Samenvatting prioriteiten](#14-samenvatting-prioriteiten)

---

## 1. BUG 1 — Erfgenaam wordt niet gekoppeld aan Eigenaar

### Ernst: HOOG

### Symptoom

Erfgenamen worden aangemaakt zonder relatie met de eigenaar. Als de applicatie ooit meerdere profielen of multi-tenancy ondersteunt, zijn erfgenamen niet te herleiden tot een eigenaar.

### Oorzaak

`ErfgenamenController.Create()` gebruikt Mapster om het request direct naar een `Erfgenaam` entity te mappen, maar stelt **geen `EigenaarId` in** — in tegenstelling tot alle andere entity-controllers (BoedelController, DigitaalBezitController, etc.) die expliciet `eigenaar.Id` ophalen en toewijzen.

```csharp
// ErfgenamenController.cs — Create
[HttpPost]
public async Task<ActionResult<ErfgenaamResponse>> Create(
    [FromBody] ErfgenaamUpsertRequest request)
{
    var item = request.Adapt<Erfgenaam>();     // ← Geen EigenaarId!
    _db.Erfgenamen.Add(item);
    await _db.SaveChangesAsync();
    return CreatedAtAction(nameof(GetById), new { id = item.Id },
        item.Adapt<ErfgenaamResponse>());
}
```

Het `Erfgenaam` domain model bevat bovendien **geen `EigenaarId` property**:

```csharp
// Domain/Common/Erfgenaam.cs
public class Erfgenaam : BaseEntity
{
    public string Voornaam { get; set; } = string.Empty;
    public string Achternaam { get; set; } = string.Empty;
    public string? Tussenvoegsel { get; set; }
    public string Relatie { get; set; } = string.Empty;
    public string? Telefoon { get; set; }
    public string? Email { get; set; }
    public int? ShareIndex { get; set; }
    public bool HeeftShareOntvangen { get; set; }
    public DateTime? ShareUitgegevenOp { get; set; }
    // ← EigenaarId en navigatie-property ontbreken
}
```

### Vergelijk met andere controllers

```csharp
// BoedelController.cs — Create voor bezittingen (correct)
var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
if (eigenaar is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

var item = request.Adapt<FysiekBezit>();
item.EigenaarId = eigenaar.Id;    // ← WEL gekoppeld
```

### Fix

**Stap 1** — Voeg `EigenaarId` toe aan `Erfgenaam.cs`:

```csharp
public class Erfgenaam : BaseEntity
{
    public Guid EigenaarId { get; set; }
    public Eigenaar Eigenaar { get; set; } = null!;

    // ... bestaande properties
}
```

**Stap 2** — Voeg relatie toe aan `LumioDbContext.OnModelCreating()`:

```csharp
modelBuilder.Entity<Erfgenaam>()
    .HasOne(e => e.Eigenaar)
    .WithMany()
    .HasForeignKey(e => e.EigenaarId);
```

**Stap 3** — Update `ErfgenamenController.Create()`:

```csharp
[HttpPost]
public async Task<ActionResult<ErfgenaamResponse>> Create(
    [FromBody] ErfgenaamUpsertRequest request)
{
    var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
    if (eigenaar is null)
        return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

    var item = request.Adapt<Erfgenaam>();
    item.EigenaarId = eigenaar.Id;
    _db.Erfgenamen.Add(item);
    await _db.SaveChangesAsync();
    return CreatedAtAction(nameof(GetById), new { id = item.Id },
        item.Adapt<ErfgenaamResponse>());
}
```

**Stap 4** — Na deze wijziging moet de database opnieuw worden aangemaakt (of een migratie worden toegevoegd) omdat er een nieuwe kolom komt.

---

## 2. BUG 2 — Ontbrekende EF cascade delete configuratie

### Ernst: HOOG

### Symptoom

Als een eigenaar wordt verwijderd, blijven child-entities (bezittingen, bankrekeningen, verzekeringen, schulden, digitale accounts, wachtwoorden, crypto wallets, persoonlijke documenten) als verweesde records in de database achter.

### Oorzaak

`LumioDbContext.OnModelCreating()` configureert alleen relaties voor:
- `TestamentInfo` → `Begunstigden` / `Executeurs`
- `WilsverklaringEuthanasie` → `Voorwaarden`
- `DonorRegistratie` → `OrgaanKeuzes`
- `UitvaartWensen` → `CeremonieDetails`

De volgende entities hebben een `EigenaarId` foreign key maar **geen expliciete relatie-configuratie**:

| Entity | Heeft EigenaarId | EF Relatie geconfigureerd |
|--------|:----------------:|:-------------------------:|
| FysiekBezit | ✅ | ❌ |
| Bankrekening | ✅ | ❌ |
| Verzekering | ✅ | ❌ |
| Schuld | ✅ | ❌ |
| DigitaalAccount | ✅ | ❌ |
| WachtwoordEntry | ✅ | ❌ |
| CryptoWallet | ✅ | ❌ |
| PersoonlijkDocument | ✅ | ❌ |
| Erfgenaam | ❌ (BUG 1) | ❌ |

EF Core kan door conventie een relatie herkennen, maar configureert standaard `DeleteBehavior.ClientSetNull` of `Cascade` afhankelijk van of de FK nullable is. Zonder expliciete configuratie is het gedrag platform-afhankelijk en niet gegarandeerd correct, vooral bij SQLite/SQLCipher.

### Fix

Voeg expliciete relaties toe aan `LumioDbContext.OnModelCreating()`:

```csharp
// Boedel / Asset Registry relationships
modelBuilder.Entity<FysiekBezit>()
    .HasOne<Eigenaar>().WithMany()
    .HasForeignKey(f => f.EigenaarId)
    .OnDelete(DeleteBehavior.Cascade);

modelBuilder.Entity<Bankrekening>()
    .HasOne<Eigenaar>().WithMany()
    .HasForeignKey(b => b.EigenaarId)
    .OnDelete(DeleteBehavior.Cascade);

modelBuilder.Entity<Verzekering>()
    .HasOne<Eigenaar>().WithMany()
    .HasForeignKey(v => v.EigenaarId)
    .OnDelete(DeleteBehavior.Cascade);

modelBuilder.Entity<Schuld>()
    .HasOne<Eigenaar>().WithMany()
    .HasForeignKey(s => s.EigenaarId)
    .OnDelete(DeleteBehavior.Cascade);

// Digital Estate relationships
modelBuilder.Entity<DigitaalAccount>()
    .HasOne<Eigenaar>().WithMany()
    .HasForeignKey(d => d.EigenaarId)
    .OnDelete(DeleteBehavior.Cascade);

modelBuilder.Entity<WachtwoordEntry>()
    .HasOne<Eigenaar>().WithMany()
    .HasForeignKey(w => w.EigenaarId)
    .OnDelete(DeleteBehavior.Cascade);

modelBuilder.Entity<CryptoWallet>()
    .HasOne<Eigenaar>().WithMany()
    .HasForeignKey(c => c.EigenaarId)
    .OnDelete(DeleteBehavior.Cascade);

// Documents
modelBuilder.Entity<PersoonlijkDocument>()
    .HasOne<Eigenaar>().WithMany()
    .HasForeignKey(p => p.EigenaarId)
    .OnDelete(DeleteBehavior.Cascade);
```

---

## 3. BUG 3 — Crypto wallet frontend mist SeedPhrase invoerveld

### Ernst: HOOG

### Symptoom

De backend ondersteunt het **versleuteld opslaan van seed phrases** voor crypto wallets (via `IEncryptionService`), maar de frontend crypto-dialog heeft **geen invoerveld voor seed phrases**. De functionaliteit is daardoor volledig onbruikbaar.

### Oorzaak

In `digitaal-bezit/page.tsx` bevat de crypto wallet dialog velden voor `walletNaam`, `cryptoType`, `walletAdres`, `exchange` en `notities`, maar **geen `seedPhrase` veld**.

De backend verwacht en verwerkt het wel:

```csharp
// DigitaalBezitController.cs — CreateCryptoWallet
var item = new CryptoWallet
{
    // ...
    EncryptedSeedPhrase = request.SeedPhrase is not null
        ? encryption.Encrypt(request.SeedPhrase) : null,  // ← verwacht SeedPhrase
    // ...
};
```

```csharp
// CryptoWalletUpsertRequest DTO
public string? SeedPhrase { get; set; }    // ← veld bestaat in DTO
```

### Fix

Voeg een `seedPhrase` veld toe aan de crypto wallet dialog in `digitaal-bezit/page.tsx`:

```tsx
{/* Na het exchange invoerveld, vóór notities */}
<div className="space-y-2">
  <Label>Seed Phrase (optioneel)</Label>
  <Textarea
    value={cryptoForm.seedPhrase ?? ""}
    onChange={(e) =>
      setCryptoForm({ ...cryptoForm, seedPhrase: e.target.value })
    }
    placeholder="Uw seed phrase wordt versleuteld opgeslagen"
    rows={3}
  />
  <p className="text-xs text-muted-foreground">
    De seed phrase wordt versleuteld opgeslagen met AES-256-GCM.
  </p>
</div>
```

Voeg `seedPhrase: ""` toe aan de initiële `cryptoForm` state.

---

## 4. BUG 4 — Geen wachtwoord ontsluitel-knop in UI

### Ernst: MIDDEL

### Symptoom

Wachtwoorden worden versleuteld opgeslagen via `IEncryptionService`, maar de gebruiker kan **nooit** het oorspronkelijke wachtwoord terugzien. De backend heeft een ontsleutel-endpoint, maar de frontend roept het niet aan.

### Oorzaak

De backend biedt:

```csharp
// DigitaalBezitController.cs
[HttpGet("wachtwoorden/{id:guid}/ontsluitel")]
public async Task<ActionResult<WachtwoordOntsleuteldResponse>> OntsleuitelWachtwoord(
    Guid id, [FromServices] IEncryptionService encryption)
{
    var item = await _db.WachtwoordEntries.FindAsync(id);
    if (item is null) return NotFound();
    return Ok(new WachtwoordOntsleuteldResponse
    {
        Id = item.Id,
        Wachtwoord = encryption.Decrypt(item.EncryptedWachtwoord)
    });
}
```

Maar in `digitaal-bezit/page.tsx` is er **geen knop** die dit endpoint aanroept. Wachtwoorden worden in de lijst weergegeven als `••••••••` zonder mogelijkheid om ze te bekijken.

### Fix

Voeg een "ontsluitel" knop toe per wachtwoord-rij in de wachtwoorden-tab:

```tsx
const handleOntsluitel = async (id: string) => {
  try {
    const result = await api.get<{ id: string; wachtwoord: string }>(
      `/api/digitaal-bezit/wachtwoorden/${id}/ontsluitel`
    );
    // Toon het wachtwoord tijdelijk in de UI (bijv. alert, of inline toggle)
    setOntsleuteld((prev) => ({ ...prev, [id]: result.wachtwoord }));
    // Auto-hide na 10 seconden
    setTimeout(() => {
      setOntsleuteld((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 10_000);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Ontsluiten mislukt.");
  }
};
```

Voeg een `Eye` / `EyeOff` icoon-knop toe naast elk wachtwoord in de lijst.

---

## 5. BUG 5 — Geen executeurs-UI op testament pagina

### Ernst: MIDDEL

### Symptoom

De backend biedt volledige CRUD voor testament-executeurs:

```
POST   /api/testament/executeurs
PUT    /api/testament/executeurs/{id}
DELETE /api/testament/executeurs/{id}
```

Maar de frontend **testament pagina** (`testament/page.tsx`) toont alleen begunstigden. Er is **geen lijst, geen formulier, geen dialog** voor executeurs.

### Oorzaak

In `testament/page.tsx` wordt alleen `begunstigden` uit de API response uitgelezen en in een tabel weergegeven. Het `executeurs` veld van de API response wordt genegeerd.

### Fix

Voeg een tweede sectie toe aan `testament/page.tsx` voor executeurs, vergelijkbaar met de begunstigden-sectie:

1. Toon een tabel/lijst van executeurs uit de API response
2. Voeg een "Executeur toevoegen" dialog toe met velden: `naam`, `relatie`, `telefoon`, `email`, `notariëleAkte`
3. Voeg edit en delete knoppen toe per executeur
4. Gebruik `api.post("/api/testament/executeurs", ...)`, `api.put(...)`, `api.delete(...)` 

---

## 6. BUG 6 — Geen ceremonie-details CRUD op uitvaart pagina

### Ernst: MIDDEL

### Symptoom

De backend biedt volledige CRUD voor ceremonie-details gekoppeld aan uitvaartwensen:

```
POST   /api/uitvaart/details
PUT    /api/uitvaart/details/{id}
DELETE /api/uitvaart/details/{id}
```

De `CeremonieDetail` entity heeft velden voor `Volgorde`, `Type`, `Titel`, `Beschrijving` en `Duur`.

Maar de frontend **uitvaart pagina** toont de ceremonie-details niet, en de **uitvaart wizard** bevat geen stap om ceremonie-details toe te voegen.

### Fix

**Optie A** — Voeg een ceremonie-details sectie toe aan `uitvaart/page.tsx`:
- Toon een gesorteerde lijst (op `volgorde`) van ceremonie-details
- Dialog met velden: `type` (Toespraak, Muziek, Stilte, etc.), `titel`, `beschrijving`, `duur`
- CRUD via de bestaande API endpoints

**Optie B** — Voeg een extra wizard-stap toe aan `uitvaart/wizard/page.tsx`:
- Stap "Ceremonieverloop" waar gebruiker detail-items kan toevoegen in volgorde

---

## 7. BUG 7 — Authenticated layout verliest sessie bij pagina-refresh

### Ernst: HOOG

### Symptoom

Als de gebruiker op F5 drukt (pagina-refresh) terwijl hij op een beveiligde pagina is (bijv. `/dashboard`, `/testament`), wordt hij **altijd teruggestuurd naar de login-pagina**, ook al is de database nog ontgrendeld op de backend.

### Oorzaak

De authenticated layout (`(authenticated)/layout.tsx`) leest `isUnlocked` uit de Zustand store:

```tsx
// (authenticated)/layout.tsx
const { isUnlocked } = useAuthStore();

useEffect(() => {
  if (!isUnlocked) {
    router.replace("/");
  }
}, [isUnlocked, router]);
```

Zustand stores worden in-memory gehouden. Bij een pagina-refresh wordt de store opnieuw geïnitialiseerd met `isUnlocked: false`. De layout controleert **niet** de daadwerkelijke backend-status via `GET /api/status`.

De root `page.tsx` doet wél een status-check:

```tsx
// page.tsx (root)
const data = await api.get<StatusResponse>("/api/status");
setIsFirstRun(data.isEersteKeer);
setIsUnlocked(data.isOntgrendeld);
```

Maar deze code draait alleen op de root pagina, niet in de authenticated layout.

### Fix

Voeg een status-check toe aan de authenticated layout:

```tsx
// (authenticated)/layout.tsx
const { isUnlocked, setIsUnlocked } = useAuthStore();
const [checking, setChecking] = useState(true);

useEffect(() => {
  api
    .get<{ isOntgrendeld: boolean }>("/api/status")
    .then((data) => {
      setIsUnlocked(data.isOntgrendeld);
      if (!data.isOntgrendeld) {
        router.replace("/");
      }
    })
    .catch(() => {
      router.replace("/");
    })
    .finally(() => setChecking(false));
}, []);

if (checking) {
  return <div className="flex items-center justify-center h-screen">
    <p className="text-muted-foreground">Sessie controleren...</p>
  </div>;
}
```

---

## 8. BUG 8 — FluentValidation pakket geïnstalleerd maar nul validators

### Ernst: MIDDEL

### Symptoom

Er is **geen enkele input-validatie** op request DTOs. Gebruikers kunnen lege strings, ongeldig e-mail, negatieve bedragen, etc. opslaan.

### Oorzaak

`Lumio.Api.csproj` bevat het FluentValidation pakket:

```xml
<PackageReference Include="FluentValidation.AspNetCore" Version="11.3.1" />
```

Maar er zijn **nul validator-klassen** in het hele project. Er is ook geen `AddFluentValidation()` of `AddValidatorsFromAssembly()` call in `Program.cs`.

### Fix

**Stap 1** — Registreer FluentValidation in `Program.cs`:

```csharp
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
```

**Stap 2** — Maak validators aan voor kritieke DTOs, bijvoorbeeld:

```csharp
// Validators/EigenaarUpsertRequestValidator.cs
public class EigenaarUpsertRequestValidator
    : AbstractValidator<EigenaarUpsertRequest>
{
    public EigenaarUpsertRequestValidator()
    {
        RuleFor(x => x.Voornaam).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Achternaam).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email));
        RuleFor(x => x.Geboortedatum).LessThan(DateTime.Now)
            .When(x => x.Geboortedatum.HasValue);
    }
}
```

**Minimaal validators nodig voor:**
- `EigenaarUpsertRequest` (profiel)
- `ErfgenaamUpsertRequest` (erfgenamen)
- `SetupRequest` / `OntgrendelRequest` (wachtwoord — minimale lengte)
- `WachtwoordEntryUpsertRequest` (wachtwoorden — verplichte velden)
- `BankrekeningUpsertRequest` (IBAN-formaat)
- Alle financiële DTOs (positieve bedragen)

---

## 9. BUG 9 — Shamir share-toewijzing op alfabetische volgorde is fragiel

### Ernst: MIDDEL

### Symptoom

Shamir shares worden aan erfgenamen toegewezen op basis van **alfabetische volgorde van achternaam**. Als een erfgenaam wordt toegevoegd, verwijderd of hernoemd nadat shares zijn gegenereerd, klopt de toewijzing niet meer.

### Oorzaak

```csharp
// ShamirController.cs — Genereer
var erfgenamen = await _db.Erfgenamen
    .OrderBy(e => e.Achternaam)      // ← alfabetische volgorde
    .ToListAsync();

// Later:
for (int i = 0; i < erfgenamen.Count; i++)
{
    erfgenamen[i].ShareIndex = i + 1;
    erfgenamen[i].HeeftShareOntvangen = false;
    erfgenamen[i].ShareUitgegevenOp = null;
}
```

**Scenario:** Drie erfgenamen: Bakker, De Vries, Jansen. Shares 1, 2, 3 worden in die volgorde toegewezen. Later wordt "Appelman" toegevoegd. Bij opnieuw genereren verschuift alles:
- Appelman krijgt share 1 (was Bakker)
- Bakker krijgt share 2 (was De Vries)
- Etc.

### Fix

Sla de share-to-erfgenaam mapping op met een **stabiele identifier** (bijv. `ErfgenaamId`) in plaats van te vertrouwen op sorteer-volgorde:

```csharp
// Optie 1: Gebruik Erfgenaam.Id als stabiele key
for (int i = 0; i < erfgenamen.Count; i++)
{
    erfgenamen[i].ShareIndex = i + 1;
    // Sla ook de mapping op in een apart model of als JSON
}
```

Of beter: voeg een `ShamirShareMapping` tabel toe die `ShareIndex` → `ErfgenaamId` vastlegt op het moment van genereren.

---

## 10. BUG 10 — EncryptionService gebruikt vaste salt voor alle databases

### Ernst: LAAG (single-user app, maar defense-in-depth)

### Symptoom

Alle veldversleuteling (wachtwoorden, seed phrases) gebruikt dezelfde hardcoded salt, ongeacht de database.

### Oorzaak

```csharp
// Services/Security/EncryptionService.cs
private static readonly byte[] Salt =
    Encoding.UTF8.GetBytes("Lumio.FieldEncryption.v1");

private byte[] DeriveKey(string password)
{
    using var pbkdf2 = new Rfc2898DeriveBytes(
        password, Salt, 100_000, HashAlgorithmName.SHA256);
    return pbkdf2.GetBytes(32);
}
```

De salt is statisch en identiek voor elke Lumio-installatie. Als een aanvaller het masterwachtwoord kent, kan hij alle velden in elke Lumio-database ontsleutelen.

### Fix

Genereer een random salt per database en sla deze op als eerste record of in een metadata-tabel:

```csharp
private byte[] GetOrCreateSalt()
{
    // Lees salt uit database metadata tabel
    // Als niet aanwezig: genereer RandomNumberGenerator.GetBytes(16) en sla op
}
```

---

## 11. VERBETERING 1 — DocumentenController EncryptedContent veldnaam is misleidend

### Ernst: LAAG

### Probleem

Het `PersoonlijkDocument` model heeft een property `EncryptedContent`, maar de inhoud wordt **niet** veld-level versleuteld:

```csharp
// DocumentenController.cs — Uploaden
using var ms = new MemoryStream();
await bestand.CopyToAsync(ms);
var doc = new PersoonlijkDocument
{
    // ...
    EncryptedContent = ms.ToArray(),  // ← raw bytes, NIET versleuteld
};
```

De documentatie in de controller bevestigt dit:
```csharp
// Already in SQLCipher-encrypted DB; blob stored as-is
```

De naam `EncryptedContent` suggereert veld-level encryptie die er niet is.

### Fix

Hernoem de property naar `Content` of `BestandsInhoud`:

```csharp
public byte[] Content { get; set; } = [];
```

Of voeg daadwerkelijk veld-level encryptie toe met `IEncryptionService` voor defense-in-depth (dan klopt de naam).

---

## 12. VERBETERING 2 — Shamir reconstruct retourneert wachtwoord als plaintext in HTTP response

### Ernst: MIDDEL

### Probleem

Het `POST /api/shamir/reconstrueer` endpoint retourneert het gereconstrueerde masterwachtwoord als plaintext JSON:

```csharp
// ShamirController.cs — Reconstrueer
var wachtwoord = _shamir.ReconstructSecret(shares);
return Ok(new { wachtwoord });    // ← plaintext in HTTP response body
```

De frontend `HeirUnlockForm` maakt twee sequentiële calls:

1. `POST /api/shamir/reconstrueer` → `{ wachtwoord: "het_geheime_wachtwoord" }`
2. `POST /api/auth/ontgrendel-erfgenaam` met dat wachtwoord

Het wachtwoord is zichtbaar in:
- Browser developer tools (Network tab)
- Console logs (als er logging is)
- Eventuele proxy/middleware logs

### Fix

Combineer de reconstruct + unlock in één backend-call die het wachtwoord nooit aan de client blootstelt:

```csharp
[HttpPost("reconstrueer-en-ontgrendel")]
public async Task<IActionResult> ReconstrueerEnOntgrendel(
    [FromBody] ReconstrueerRequest request)
{
    var wachtwoord = _shamir.ReconstructSecret(request.Shares);
    await _masterPassword.UnlockAsync(wachtwoord);
    return Ok(new { succes = true });
    // Wachtwoord verlaat de server nooit
}
```

---

## 13. VERBETERING 3 — PDF service queries zonder EigenaarId filtering

### Ernst: LAAG (single-user, maar architectureel fout)

### Probleem

`LumioPdfService` haalt alle records op zonder te filteren op eigenaar:

```csharp
// Services/Pdf/LumioPdfService.cs
var begunstigden = await _db.Begunstigden.ToListAsync();     // ALLE
var orgaanKeuzes = await _db.OrgaanKeuzes.ToListAsync();     // ALLE
var details = await _db.CeremonieDetails.ToListAsync();       // ALLE
```

Dit werkt nu omdat er maar één eigenaar is, maar:
- Bij toekomstige multi-tenancy lekt data van andere eigenaren
- Het is inconsistent met de rest van de codebase waar wél gefilterd wordt

### Fix

Filter op parent entity:

```csharp
var testament = await _db.TestamentInfo.FirstOrDefaultAsync();
var begunstigden = testament is not null
    ? await _db.Begunstigden
        .Where(b => b.TestamentInfoId == testament.Id)
        .ToListAsync()
    : new List<Begunstigde>();
```

---

## 14. Samenvatting prioriteiten

### HOOG (functioneel stuk / data-integriteit)

| # | Bug | Impact |
|---|-----|--------|
| 1 | Erfgenaam niet gekoppeld aan Eigenaar | Data-integriteit, geen relatie met profiel |
| 2 | Ontbrekende cascade delete | Verweesde records bij verwijdering |
| 3 | Crypto seed phrase invoer ontbreekt | Beveiligingsfunctie onbruikbaar |
| 7 | Sessie verloren bij F5 | Gebruiker moet elke keer opnieuw ontgrendelen |

### MIDDEL (ontbrekende functionaliteit / beveiliging)

| # | Bug | Impact |
|---|-----|--------|
| 4 | Geen wachtwoord ontsluitel-knop | Opgeslagen wachtwoorden niet in te zien |
| 5 | Geen executeurs-UI | Backend feature niet toegankelijk |
| 6 | Geen ceremonie-details UI | Backend feature niet toegankelijk |
| 8 | Geen input-validatie | Ongeldige data kan worden opgeslagen |
| 9 | Fragiele share-toewijzing | Share mapping breekt bij wijzigingen |
| 12 | Plaintext wachtwoord in response | Beveiligingsrisico |

### LAAG (code-kwaliteit / toekomstbestendigheid)

| # | Type | Impact |
|---|------|--------|
| 10 | Vaste salt | Verminderde encryptie-sterkte |
| 11 | Misleidende veldnaam | Verwarring bij ontwikkelaars |
| 13 | Geen EigenaarId filtering in PDF | Architectureel risico |

---

## Aanbevolen aanpak

1. **Los eerst Analyse 2 BUG 1 op** (DbContext DI timing) — zonder werkende database-tabellen zijn alle andere fixes zinloos
2. **Dan BUG 7** (sessie-refresh) — dit is de meest frustrerende UX-bug
3. **Dan BUG 1 + 2** (Erfgenaam EigenaarId + cascade deletes) — data-integriteit
4. **Dan BUG 3 + 4** (seed phrase + wachtwoord ontsluitel) — versleutelingsfuncties werkend maken
5. **Dan BUG 5 + 6** (executeurs + ceremonie-details UI) — ontbrekende frontend features
6. **Dan BUG 8** (validators) — input-validatie toevoegen
7. **Dan de rest** (BUG 9, 10, verbeteringen) — hardening en code-kwaliteit
