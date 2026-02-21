# Lumio — Gecombineerd Implementatieplan

> **Samenvoeging van Analyse 2 en 3.** Alle 20 issues in implementatievolgorde geordend op dependency en prioriteit.  
> Analyse 1 (3 issues) is reeds geïmplementeerd ✅ en niet opgenomen.

---

## Overzicht

| Fase | Issues | Ernst | Thema |
|------|--------|-------|-------|
| **Fase 1** | #1 | KRITIEK | Database creatie (blokkerend voor alles) |
| **Fase 2** | #2 | HOOG | Sessie-persistentie bij page refresh |
| **Fase 3** | #3, #4 | HOOG | Data-integriteit (relaties & cascade) |
| **Fase 4** | #5 | HOOG | Beveiliging (SQL injection) |
| **Fase 5** | #6, #7 | HOOG | Data-verlies preventie (wizards) |
| **Fase 6** | #8 | HOOG | Ontbrekende crypto seed phrase UI |
| **Fase 7** | #9, #10, #11 | MIDDEL | Ontbrekende frontend features |
| **Fase 8** | #12, #13, #14 | MIDDEL | Frontend robuustheid |
| **Fase 9** | #15 | MIDDEL | Input-validatie |
| **Fase 10** | #16, #17 | MIDDEL | Shamir beveiliging |
| **Fase 11** | #18, #19, #20 | LAAG | Hardening & code-kwaliteit |

---

## Inhoudsopgave

1. [FASE 1 — Database creatie](#fase-1--database-creatie)
   - [#1 KRITIEK: DbContext DI timing — tabellen in geheugen](#1-kritiek-dbcontext-di-timing--tabellen-in-geheugen)
2. [FASE 2 — Sessie-persistentie](#fase-2--sessie-persistentie)
   - [#2 HOOG: Authenticated layout verliest sessie bij F5](#2-hoog-authenticated-layout-verliest-sessie-bij-f5)
3. [FASE 3 — Data-integriteit](#fase-3--data-integriteit)
   - [#3 HOOG: Erfgenaam wordt niet gekoppeld aan Eigenaar](#3-hoog-erfgenaam-wordt-niet-gekoppeld-aan-eigenaar)
   - [#4 HOOG: Ontbrekende EF cascade delete configuratie](#4-hoog-ontbrekende-ef-cascade-delete-configuratie)
4. [FASE 4 — Beveiliging](#fase-4--beveiliging)
   - [#5 HOOG: SQL injection in ChangePasswordAsync](#5-hoog-sql-injection-in-changepasswordasync)
5. [FASE 5 — Data-verlies preventie](#fase-5--data-verlies-preventie)
   - [#6 HOOG: Wizards laden geen bestaande data](#6-hoog-wizards-laden-geen-bestaande-data)
   - [#7 HOOG: Donor wizard maakt duplicate orgaankeuzes](#7-hoog-donor-wizard-maakt-duplicate-orgaankeuzes)
6. [FASE 6 — Crypto seed phrase](#fase-6--crypto-seed-phrase)
   - [#8 HOOG: Crypto wallet frontend mist SeedPhrase invoerveld](#8-hoog-crypto-wallet-frontend-mist-seedphrase-invoerveld)
7. [FASE 7 — Ontbrekende frontend features](#fase-7--ontbrekende-frontend-features)
   - [#9 MIDDEL: Geen wachtwoord ontsluitel-knop in UI](#9-middel-geen-wachtwoord-ontsluitel-knop-in-ui)
   - [#10 MIDDEL: Geen executeurs-UI op testament pagina](#10-middel-geen-executeurs-ui-op-testament-pagina)
   - [#11 MIDDEL: Geen ceremonie-details CRUD op uitvaart pagina](#11-middel-geen-ceremonie-details-crud-op-uitvaart-pagina)
8. [FASE 8 — Frontend robuustheid](#fase-8--frontend-robuustheid)
   - [#12 MIDDEL: RSC 404-fouten door Next.js 16 route groups](#12-middel-rsc-404-fouten-door-nextjs-16-route-groups)
   - [#13 MIDDEL: Documenten download foutafhandeling](#13-middel-documenten-download-foutafhandeling)
   - [#14 MIDDEL: Export pagina gebruikt raw fetch zonder api-client](#14-middel-export-pagina-gebruikt-raw-fetch-zonder-api-client)
9. [FASE 9 — Input-validatie](#fase-9--input-validatie)
   - [#15 MIDDEL: FluentValidation pakket zonder validators](#15-middel-fluentvalidation-pakket-zonder-validators)
10. [FASE 10 — Shamir beveiliging](#fase-10--shamir-beveiliging)
    - [#16 MIDDEL: Shamir share-toewijzing op alfabetische volgorde is fragiel](#16-middel-shamir-share-toewijzing-op-alfabetische-volgorde-is-fragiel)
    - [#17 MIDDEL: Shamir reconstruct retourneert wachtwoord als plaintext](#17-middel-shamir-reconstruct-retourneert-wachtwoord-als-plaintext)
11. [FASE 11 — Hardening & code-kwaliteit](#fase-11--hardening--code-kwaliteit)
    - [#18 LAAG: EncryptionService gebruikt vaste salt](#18-laag-encryptionservice-gebruikt-vaste-salt)
    - [#19 LAAG: DocumentenController EncryptedContent veldnaam misleidend](#19-laag-documentencontroller-encryptedcontent-veldnaam-misleidend)
    - [#20 LAAG: PDF service queries zonder EigenaarId filtering](#20-laag-pdf-service-queries-zonder-eigenaarid-filtering)
12. [Kleinere verbeteringen (optioneel)](#kleinere-verbeteringen-optioneel)

---

## FASE 1 — Database creatie

### #1 KRITIEK: DbContext DI timing — tabellen in geheugen

**Bron:** Analyse 2, BUG 1  
**Bestanden:** `AuthController.cs`, `Program.cs`  
**Impact:** ❌ BLOKKEREND — niets werkt zolang dit niet is opgelost

#### Symptoom

Na `POST /api/auth/setup` faalt elke volgende API-call met:
```
Microsoft.Data.Sqlite.SqliteException: SQLite Error 1: 'no such table: Eigenaren'
```

#### Oorzaak

DI-timing bug in `AuthController.Setup`: de `LumioDbContext` wordt opgelost **vóórdat** het wachtwoord is gezet (`IsUnlocked = false`), dus de connectie-string wijst naar `:memory:`. `EnsureCreatedAsync()` maakt tabellen aan in het geheugen, niet op schijf.

```csharp
[HttpPost("setup")]
public async Task<IActionResult> Setup(
    [FromBody] SetupRequest request,
    [FromServices] LumioDbContext db)            // ← opgelost als :memory:
{
    await _passwordService.SetupAsync(request.Wachtwoord);  // ← IsUnlocked = true
    await db.Database.EnsureCreatedAsync();                  // ← tabellen in geheugen!
}
```

| Stap | Actie | `IsUnlocked` | DbContext verbinding |
|------|-------|:------------:|----------------------|
| A | DI lost DbContext op | `false` | `:memory:` |
| B | `SetupAsync(password)` | `true` | — |
| C | `EnsureCreatedAsync()` | `true` | Nog steeds `:memory:` |
| D | Volgende request | `true` | Echte SQLCipher file → **leeg!** |

#### Fix

Na het zetten van het wachtwoord een **nieuwe** DbContext aanmaken via een nieuwe scope:

```csharp
[HttpPost("setup")]
public async Task<IActionResult> Setup(
    [FromBody] SetupRequest request,
    [FromServices] IServiceProvider serviceProvider)
{
    if (!_passwordService.IsFirstRun)
        return BadRequest(new { error = "Database bestaat al. Gebruik ontgrendel." });

    if (string.IsNullOrWhiteSpace(request.Wachtwoord) || request.Wachtwoord.Length < 8)
        return BadRequest(new { error = "Wachtwoord moet minimaal 8 tekens bevatten." });

    // (1) Stel het wachtwoord in — nu is IsUnlocked = true
    await _passwordService.SetupAsync(request.Wachtwoord);

    // (2) Maak een NIEUWE scope aan zodat DbContext de juiste connectie-string krijgt
    using var scope = serviceProvider.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<LumioDbContext>();

    // (3) Nu wijst de connectie-string naar de echte SQLCipher database
    await db.Database.EnsureCreatedAsync();

    return Ok(new { bericht = "Database aangemaakt en ontgrendeld." });
}
```

**Alternatief:** `IDbContextFactory<LumioDbContext>` registreren en gebruiken.

#### Verificatie

Na de fix: verwijder `lumio.db`, start de app, voer setup uit, en controleer:
- `POST /api/eigenaar` retourneert 200 (niet "no such table")
- `GET /api/status` retourneert `isOntgrendeld: true`

---

## FASE 2 — Sessie-persistentie

### #2 HOOG: Authenticated layout verliest sessie bij F5

**Bron:** Analyse 3, BUG 7  
**Bestanden:** `src/lumio-web/src/app/(authenticated)/layout.tsx`

#### Symptoom

Bij F5 op een beveiligde pagina wordt de gebruiker teruggestuurd naar login, ook al is de database nog ontgrendeld.

#### Oorzaak

Zustand store reset `isUnlocked` naar `false` bij refresh. De authenticated layout controleert alleen Zustand, niet de backend.

```tsx
// Huidig — alleen Zustand check
const { isUnlocked } = useAuthStore();
useEffect(() => {
  if (!isUnlocked) router.replace("/");
}, [isUnlocked, router]);
```

#### Fix

Voeg een API status-check toe bij mount:

```tsx
const { isUnlocked, setIsUnlocked } = useAuthStore();
const [checking, setChecking] = useState(true);

useEffect(() => {
  api
    .get<{ isOntgrendeld: boolean }>("/api/status")
    .then((data) => {
      setIsUnlocked(data.isOntgrendeld);
      if (!data.isOntgrendeld) router.replace("/");
    })
    .catch(() => router.replace("/"))
    .finally(() => setChecking(false));
}, []);

if (checking) {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Sessie controleren...</p>
    </div>
  );
}
```

---

## FASE 3 — Data-integriteit

### #3 HOOG: Erfgenaam wordt niet gekoppeld aan Eigenaar

**Bron:** Analyse 3, BUG 1  
**Bestanden:** `Domain/Common/Erfgenaam.cs`, `Controllers/ErfgenamenController.cs`, `Data/LumioDbContext.cs`

#### Symptoom

Erfgenamen worden aangemaakt zonder `EigenaarId` — in tegenstelling tot alle andere entities.

#### Oorzaak

Het `Erfgenaam` domain model bevat geen `EigenaarId` property, en de controller stelt het niet in.

```csharp
// ErfgenamenController.cs — Create (huidig)
var item = request.Adapt<Erfgenaam>();     // ← Geen EigenaarId!
_db.Erfgenamen.Add(item);
```

Vergelijk met BoedelController (correct):
```csharp
var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
if (eigenaar is null) return BadRequest(...);
item.EigenaarId = eigenaar.Id;    // ← WEL gekoppeld
```

#### Fix

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

**Stap 4** — Database opnieuw aanmaken na deze wijziging (nieuwe kolom).

---

### #4 HOOG: Ontbrekende EF cascade delete configuratie

**Bron:** Analyse 3, BUG 2  
**Bestanden:** `Data/LumioDbContext.cs`

#### Symptoom

Bij verwijdering van een Eigenaar blijven child-entities als verweesde records achter.

#### Oorzaak

`OnModelCreating()` configureert relaties voor Testament, Euthanasie, Donor en Uitvaart sub-entities, maar **niet** voor:

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

#### Fix

Voeg toe aan `LumioDbContext.OnModelCreating()`:

```csharp
// Boedel / Asset Registry
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

// Digital Estate
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

## FASE 4 — Beveiliging

### #5 HOOG: SQL injection in ChangePasswordAsync

**Bron:** Analyse 2, BUG 7  
**Bestanden:** `Services/Security/MasterPasswordService.cs`

#### Symptoom

Wachtwoord wijzigen gebruikt string-interpolatie in SQL:

```csharp
cmd.CommandText = $"PRAGMA rekey = '{newPassword.Replace("'", "''")}'";
```

Hoewel `Replace("'", "''")` basis-escaping doet, is dit patroon onveilig.

#### Fix

Gebruik parameterisatie via `SELECT quote()`:

```csharp
public async Task ChangePasswordAsync(string currentPassword, string newPassword)
{
    if (!IsUnlocked)
        throw new InvalidOperationException("Database is niet ontgrendeld.");

    var connStr = new SqliteConnectionStringBuilder
    {
        DataSource = _dbPath,
        Mode = SqliteOpenMode.ReadWrite,
        Password = currentPassword
    }.ToString();

    using var conn = new SqliteConnection(connStr);
    await conn.OpenAsync();

    using var quoteCmd = conn.CreateCommand();
    quoteCmd.CommandText = "SELECT quote($pw)";
    quoteCmd.Parameters.AddWithValue("$pw", newPassword);
    var quoted = (string?)await quoteCmd.ExecuteScalarAsync();

    using var rekeyCmd = conn.CreateCommand();
    rekeyCmd.CommandText = $"PRAGMA rekey = {quoted}";
    await rekeyCmd.ExecuteNonQueryAsync();

    _currentPassword = newPassword;
}
```

---

## FASE 5 — Data-verlies preventie

### #6 HOOG: Wizards laden geen bestaande data

**Bron:** Analyse 2, BUG 3  
**Bestanden:** `testament/wizard/page.tsx`, `euthanasie/wizard/page.tsx`, `uitvaart/wizard/page.tsx`, `donor/formulier/page.tsx`

#### Symptoom

Alle vier de wizards initialiseren met **lege state**. Bij opnieuw openen overschrijft de gebruiker bestaande data met lege velden.

| Wizard | API endpoint | Laadt data? |
|--------|-------------|:-----------:|
| Testament | `GET /api/testament` | ❌ |
| Euthanasie | `GET /api/euthanasie` | ❌ |
| Uitvaart | `GET /api/uitvaart` | ❌ |
| Donor | `GET /api/donor` + `GET /api/donor/orgaankeuzes` | ❌ |

#### Fix

Voeg een `useEffect` toe aan elke wizard die bestaande data laadt. Voorbeeld voor testament:

```tsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  api.get("/api/testament")
    .then((data) => {
      if (data) {
        setForm({
          testamentType: data.testamentType ?? "",
          notarisNaam: data.notarisNaam ?? "",
          notarisKantoor: data.notarisKantoor ?? "",
          datumTestament: data.datumTestament ?? "",
          ctr_Nummer: data.ctr_Nummer ?? "",
          testamentLocatie: data.testamentLocatie ?? "",
          algemeneWensen: data.algemeneWensen ?? "",
          bijzondereBepalingen: data.bijzondereBepalingen ?? "",
        });
      }
    })
    .catch(() => {}) // 404 = nog geen data, laat leeg
    .finally(() => setLoading(false));
}, []);

if (loading) return <p className="text-muted-foreground">Laden...</p>;
```

**Herhaal voor alle 4 wizards** met de bijbehorende API endpoints en form-velden.

---

### #7 HOOG: Donor wizard maakt duplicate orgaankeuzes

**Bron:** Analyse 2, BUG 2  
**Bestanden:** `donor/formulier/page.tsx`, eventueel `DonorController.cs`

#### Symptoom

Elke keer dat de donor wizard wordt afgerond, worden **nieuwe** orgaankeuzes aangemaakt bovenop de bestaande. Na 3× invullen: 3× "Hart", 3× "Nieren", etc.

```tsx
// Huidig — altijd POST, nooit check bestaande
for (const [orgaan, welDoneren] of orgaanEntries) {
  await api.post("/api/donor/orgaankeuzes", { orgaan, welDoneren });
}
```

#### Fix — Optie A (frontend, simpelst)

Verwijder bestaande orgaankeuzes vóór het aanmaken van nieuwe:

```tsx
const handleComplete = async () => {
  await api.put("/api/donor", { ... });

  // Verwijder bestaande
  const bestaande = await api.get<{ id: string }[]>("/api/donor/orgaankeuzes");
  for (const item of bestaande ?? []) {
    await api.delete(`/api/donor/orgaankeuzes/${item.id}`);
  }

  // Maak nieuwe aan
  for (const [orgaan, welDoneren] of orgaanEntries) {
    await api.post("/api/donor/orgaankeuzes", { orgaan, welDoneren });
  }
  router.push("/donor");
};
```

#### Fix — Optie B (backend, robuuster)

Voeg een batch-endpoint toe:

```csharp
// DonorController.cs
[HttpPut("orgaankeuzes/batch")]
public async Task<ActionResult<List<OrgaanKeuzeResponse>>> UpsertOrgaanKeuzes(
    [FromBody] List<OrgaanKeuzeUpsertRequest> requests)
{
    var donor = await _db.DonorRegistraties.FirstOrDefaultAsync();
    if (donor is null) return BadRequest(new { error = "Maak eerst donor registratie aan." });

    var bestaande = await _db.OrgaanKeuzes
        .Where(o => o.DonorRegistratieId == donor.Id).ToListAsync();
    _db.OrgaanKeuzes.RemoveRange(bestaande);

    var items = requests.Select(r => {
        var item = r.Adapt<OrgaanKeuze>();
        item.DonorRegistratieId = donor.Id;
        return item;
    }).ToList();
    _db.OrgaanKeuzes.AddRange(items);

    await _db.SaveChangesAsync();
    return Ok(items.Adapt<List<OrgaanKeuzeResponse>>());
}
```

---

## FASE 6 — Crypto seed phrase

### #8 HOOG: Crypto wallet frontend mist SeedPhrase invoerveld

**Bron:** Analyse 3, BUG 3  
**Bestanden:** `src/lumio-web/src/app/(authenticated)/digitaal-bezit/page.tsx`

#### Symptoom

Backend versleutelt seed phrases via `IEncryptionService`, maar de frontend crypto-dialog heeft **geen invoerveld** voor seed phrases. De functionaliteit is onbruikbaar.

```csharp
// Backend verwacht het:
EncryptedSeedPhrase = request.SeedPhrase is not null
    ? encryption.Encrypt(request.SeedPhrase) : null,
```

#### Fix

Voeg `seedPhrase` toe aan de initiële `cryptoForm` state en een veld aan de dialog:

```tsx
{/* Na exchange veld, vóór notities */}
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

---

## FASE 7 — Ontbrekende frontend features

### #9 MIDDEL: Geen wachtwoord ontsluitel-knop in UI

**Bron:** Analyse 3, BUG 4  
**Bestanden:** `src/lumio-web/src/app/(authenticated)/digitaal-bezit/page.tsx`

#### Symptoom

Wachtwoorden worden versleuteld opgeslagen, maar de gebruiker kan ze nooit terugzien. Het backend endpoint `GET /api/digitaal-bezit/wachtwoorden/{id}/ontsluitel` bestaat maar wordt niet aangeroepen.

#### Fix

Voeg een Eye/EyeOff toggle-knop toe per wachtwoord met een auto-hide timer:

```tsx
const handleOntsluitel = async (id: string) => {
  try {
    const result = await api.get<{ id: string; wachtwoord: string }>(
      `/api/digitaal-bezit/wachtwoorden/${id}/ontsluitel`
    );
    setOntsleuteld((prev) => ({ ...prev, [id]: result.wachtwoord }));
    setTimeout(() => {
      setOntsleuteld((prev) => { const next = { ...prev }; delete next[id]; return next; });
    }, 10_000);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Ontsluiten mislukt.");
  }
};
```

---

### #10 MIDDEL: Geen executeurs-UI op testament pagina

**Bron:** Analyse 3, BUG 5  
**Bestanden:** `src/lumio-web/src/app/(authenticated)/testament/page.tsx`

#### Symptoom

Backend biedt volledige CRUD voor executeurs (`POST/PUT/DELETE /api/testament/executeurs`), maar de frontend toont alleen begunstigden.

#### Fix

Voeg een executeurs-sectie toe aan `testament/page.tsx`:
1. Toon tabel/lijst van executeurs uit de API response
2. "Executeur toevoegen" dialog met velden: `naam`, `relatie`, `telefoon`, `email`, `notariëleAkte`
3. Edit en delete knoppen per executeur
4. CRUD via `api.post("/api/testament/executeurs", ...)`, `api.put(...)`, `api.delete(...)`

---

### #11 MIDDEL: Geen ceremonie-details CRUD op uitvaart pagina

**Bron:** Analyse 3, BUG 6  
**Bestanden:** `src/lumio-web/src/app/(authenticated)/uitvaart/page.tsx` of `uitvaart/wizard/page.tsx`

#### Symptoom

Backend biedt volledige CRUD voor `CeremonieDetail` (`POST/PUT/DELETE /api/uitvaart/details`), maar de frontend heeft geen UI hiervoor.

#### Fix

**Optie A** — Sectie op `uitvaart/page.tsx`:
- Gesorteerde lijst (op `volgorde`) met add/edit/delete dialog
- Velden: `type`, `titel`, `beschrijving`, `duur`

**Optie B** — Extra wizard-stap "Ceremonieverloop" in `uitvaart/wizard/page.tsx`

---

## FASE 8 — Frontend robuustheid

### #12 MIDDEL: RSC 404-fouten door Next.js 16 route groups

**Bron:** Analyse 2, BUG 4  
**Bestanden:** `Program.cs`, nieuw: `Middleware/RscRewriteMiddleware.cs`

#### Symptoom

Next.js RSC bestanden liggen in subdirectories (`__next.!KGF1dGhlbnRpY2F0ZWQp/eigenaar.txt`) maar de browser vraagt ze aan als plat pad met punten (`__next.!KGF1dGhlbnRpY2F0ZWQp.eigenaar.txt`). ASP.NET retourneert 404.

#### Fix

Voeg een URL-rewrite middleware toe:

```csharp
// Middleware/RscRewriteMiddleware.cs
public class RscRewriteMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly Regex RscPattern = new(
        @"/__next\.([^/]+)\.([^/]+\.txt)$", RegexOptions.Compiled);

    public RscRewriteMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value;
        if (path != null)
        {
            var match = RscPattern.Match(path);
            if (match.Success)
            {
                var newPath = path[..match.Index]
                    + "/__next." + match.Groups[1].Value
                    + "/" + match.Groups[2].Value;
                context.Request.Path = newPath;
            }
        }
        await _next(context);
    }
}
```

Registreer vóór `UseStaticFiles` in `Program.cs`:
```csharp
app.UseMiddleware<RscRewriteMiddleware>();
```

---

### #13 MIDDEL: Documenten download foutafhandeling

**Bron:** Analyse 2, BUG 5  
**Bestanden:** `src/lumio-web/src/app/(authenticated)/documenten/page.tsx`

#### Symptoom

Download gebruikt raw `fetch()` zonder `ok` check en zonder foutmelding aan gebruiker.

#### Fix

```tsx
const handleDownload = async (id: string, bestandsNaam: string) => {
  try {
    const response = await fetch(`/api/documenten/${id}/download`);
    if (!response.ok) throw new Error(`Download mislukt (${response.status})`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = bestandsNaam;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Download mislukt.");
  }
};
```

---

### #14 MIDDEL: Export pagina gebruikt raw fetch zonder api-client

**Bron:** Analyse 2, BUG 6  
**Bestanden:** `src/lumio-web/src/app/(authenticated)/export/page.tsx`

#### Symptoom

Export-calls omzeilen de `api`-client, waardoor 423 LOCKED niet wordt afgehandeld.

#### Fix

Voeg status-handling toe:

```tsx
const handleExport = async (key: string, endpoint: string) => {
  setDownloading(key);
  setError(null);
  try {
    const response = await fetch(endpoint, { method: "POST" });
    if (response.status === 423) { window.location.href = "/"; return; }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || `Export mislukt (${response.status})`);
    }
    const blob = await response.blob();
    // ... download logica ...
  } catch (err) {
    setError(err instanceof Error ? err.message : "Export mislukt.");
  } finally {
    setDownloading(null);
  }
};
```

---

## FASE 9 — Input-validatie

### #15 MIDDEL: FluentValidation pakket zonder validators

**Bron:** Analyse 3, BUG 8  
**Bestanden:** `Program.cs`, nieuw: `Validators/*.cs`

#### Symptoom

`FluentValidation.AspNetCore` staat in `csproj` maar er zijn nul validators en geen registratie.

#### Fix

**Stap 1** — Registreer in `Program.cs`:

```csharp
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
```

**Stap 2** — Maak minimaal validators voor:

| DTO | Regels |
|-----|--------|
| `EigenaarUpsertRequest` | Voornaam/Achternaam required, max 100, email format |
| `ErfgenaamUpsertRequest` | Voornaam/Achternaam required, relatie required |
| `SetupRequest` / `OntgrendelRequest` | Wachtwoord min 8 tekens |
| `WachtwoordEntryUpsertRequest` | Naam/GebruikersNaam required |
| `BankrekeningUpsertRequest` | IBAN-formaat, positief saldo |
| Financiële DTOs | Positieve bedragen |

Voorbeeld:
```csharp
public class EigenaarUpsertRequestValidator
    : AbstractValidator<EigenaarUpsertRequest>
{
    public EigenaarUpsertRequestValidator()
    {
        RuleFor(x => x.Voornaam).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Achternaam).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email));
    }
}
```

---

## FASE 10 — Shamir beveiliging

### #16 MIDDEL: Shamir share-toewijzing op alfabetische volgorde is fragiel

**Bron:** Analyse 3, BUG 9  
**Bestanden:** `Controllers/ShamirController.cs`

#### Symptoom

Shares worden toegewezen op `OrderBy(e => e.Achternaam)`. Bij toevoegen/verwijderen/hernoemen van erfgenamen verschuift de mapping.

#### Fix

Voeg een `ShamirShareMapping` tabel toe die `ShareIndex` → `ErfgenaamId` vastlegt op moment van genereren, of sla de mapping op als JSON in een metadata-veld.

---

### #17 MIDDEL: Shamir reconstruct retourneert wachtwoord als plaintext

**Bron:** Analyse 3, VERBETERING 2  
**Bestanden:** `Controllers/ShamirController.cs`, frontend `HeirUnlockForm`

#### Symptoom

`POST /api/shamir/reconstrueer` retourneert `{ wachtwoord: "..." }` als plaintext. De frontend maakt daarna een tweede call om te ontgrendelen — het wachtwoord is zichtbaar in dev tools.

#### Fix

Combineer in één backend-call:

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

## FASE 11 — Hardening & code-kwaliteit

### #18 LAAG: EncryptionService gebruikt vaste salt

**Bron:** Analyse 3, BUG 10  
**Bestanden:** `Services/Security/EncryptionService.cs`

Hardcoded salt `"Lumio.FieldEncryption.v1"` — identiek voor elke installatie. Genereer een random salt per database en sla op in een metadata-tabel.

---

### #19 LAAG: DocumentenController EncryptedContent veldnaam misleidend

**Bron:** Analyse 3, VERBETERING 1  
**Bestanden:** `Domain/Documents/PersoonlijkDocument.cs`, `Controllers/DocumentenController.cs`

Veld heet `EncryptedContent` maar bevat raw bytes (SQLCipher doet hele-DB encryptie). Hernoem naar `Content` of `BestandsInhoud`, óf voeg daadwerkelijk veld-level encryptie toe.

---

### #20 LAAG: PDF service queries zonder EigenaarId filtering

**Bron:** Analyse 3, VERBETERING 3  
**Bestanden:** `Services/Pdf/LumioPdfService.cs`

Alle queries gebruiken `ToListAsync()` zonder filter. Filter op parent entity ID voor toekomstbestendigheid.

---

## Kleinere verbeteringen (optioneel)

Deze items uit Analyse 2 zijn nice-to-haves en kunnen op elk moment worden opgepakt:

| Item | Beschrijving | Bestanden |
|------|-------------|-----------|
| Dashboard profiel-check | Graceful omgaan met "no such table" fouten | `dashboard/page.tsx`, `EigenaarController.cs` |
| Consistente foutafhandeling | `catch(() => {})` onderscheidt 404 niet van 500 | Alle pagina's, `api-client.ts` |
| Delete bevestiging | Geen confirmatie-dialog bij verwijderacties | Alle CRUD-pagina's |

---

## Checklist voor de implementerende LLM/Agent

```
FASE 1 — Database creatie
  [ ] #1  Fix AuthController.Setup DbContext DI timing
  [ ] Test: verwijder lumio.db, run setup, POST /api/eigenaar → 200

FASE 2 — Sessie
  [ ] #2  Authenticated layout: API status-check bij mount
  [ ] Test: ontgrendel, navigeer naar /dashboard, druk F5 → blijft op /dashboard

FASE 3 — Data-integriteit
  [ ] #3  Erfgenaam: EigenaarId property + relatie + controller update
  [ ] #4  LumioDbContext: cascade delete voor 8 entity-types
  [ ] Test: maak erfgenaam, check EigenaarId in DB

FASE 4 — Beveiliging
  [ ] #5  MasterPasswordService: parameterisatie bij PRAGMA rekey
  [ ] Test: wijzig wachtwoord met speciale tekens (apostrof, backslash)

FASE 5 — Data-verlies preventie
  [ ] #6  Alle 4 wizards: useEffect laden bestaande data
  [ ] #7  Donor wizard: verwijder bestaande orgaankeuzes vóór aanmaken (of batch endpoint)
  [ ] Test: vul wizard in, sla op, open wizard opnieuw → data zichtbaar

FASE 6 — Crypto
  [ ] #8  Crypto dialog: seed phrase invoerveld toevoegen
  [ ] Test: maak crypto wallet met seed phrase, check EncryptedSeedPhrase in response

FASE 7 — Frontend features
  [ ] #9  Wachtwoorden: ontsluitel-knop met Eye icoon + auto-hide
  [ ] #10 Testament: executeurs sectie met CRUD
  [ ] #11 Uitvaart: ceremonie-details sectie/wizard-stap met CRUD

FASE 8 — Frontend robuustheid
  [ ] #12 RscRewriteMiddleware toevoegen + registreren
  [ ] #13 Documenten download: ok-check + foutmelding
  [ ] #14 Export: 423-handling + foutmelding

FASE 9 — Validatie
  [ ] #15 FluentValidation registreren + minimaal 6 validators aanmaken

FASE 10 — Shamir
  [ ] #16 Share-toewijzing: stabiele mapping i.p.v. alphabetisch
  [ ] #17 Reconstrueer-en-ontgrendel: gecombineerd endpoint

FASE 11 — Hardening
  [ ] #18 EncryptionService: random salt per database
  [ ] #19 EncryptedContent hernoemen of daadwerkelijk versleutelen
  [ ] #20 PDF service: filter queries op parent entity

Optioneel
  [ ] Dashboard profiel-check robuuster
  [ ] Consistente foutafhandeling (404 vs 500)
  [ ] Delete bevestigingsdialoog
```
