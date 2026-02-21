# Lumio — Tweede Integratie-analyse

## Status

De eerste analyse (`INTEGRATION-ANALYSIS.md`) identificeerde drie root causes:
1. **Ontbrekende Eigenaar pagina** — Geïmplementeerd ✅
2. **Silent error swallowing** — Geïmplementeerd ✅
3. **Geen onboarding flow** — Geïmplementeerd ✅

Na implementatie verschijnt nu de fout: **`SQLite Error 1: 'no such table: Eigenaren'`**

Dit document beschrijft de **onderliggende oorzaak** en alle overige issues die nog moeten worden opgelost.

---

## Inhoudsopgave

1. [BUG 1 — KRITIEK: Database tabellen worden in geheugen aangemaakt, niet op schijf](#1-bug-1--kritiek-database-tabellen-worden-in-geheugen-aangemaakt-niet-op-schijf)
2. [BUG 2 — Donor wizard maakt duplicate orgaankeuzes](#2-bug-2--donor-wizard-maakt-duplicate-orgaankeuzes)
3. [BUG 3 — Wizards laden geen bestaande data](#3-bug-3--wizards-laden-geen-bestaande-data)
4. [BUG 4 — RSC 404-fouten door Next.js 16 route groups](#4-bug-4--rsc-404-fouten-door-nextjs-16-route-groups)
5. [BUG 5 — Documenten download gebruikt verkeerd base-pad](#5-bug-5--documenten-download-gebruikt-verkeerd-base-pad)
6. [BUG 6 — Export pagina gebruikt raw fetch zonder api-client](#6-bug-6--export-pagina-gebruikt-raw-fetch-zonder-api-client)
7. [BUG 7 — SQL injection risico in ChangePasswordAsync](#7-bug-7--sql-injection-risico-in-changepasswordasync)
8. [VERBETERING 1 — Dashboard "profiel mist" waarschuwing check](#8-verbetering-1--dashboard-profiel-mist-waarschuwing-check)
9. [VERBETERING 2 — Consistente foutafhandeling in data-laden](#9-verbetering-2--consistente-foutafhandeling-in-data-laden)
10. [VERBETERING 3 — Bevestigingslog bij delete acties](#10-verbetering-3--bevestigingslog-bij-delete-acties)
11. [Samenvatting prioriteiten](#11-samenvatting-prioriteiten)

---

## 1. BUG 1 — KRITIEK: Database tabellen worden in geheugen aangemaakt, niet op schijf

### Symptoom

Na `POST /api/auth/setup` (wachtwoord instellen) faalt elke volgende API-call met:
```
Microsoft.Data.Sqlite.SqliteException: SQLite Error 1: 'no such table: Eigenaren'
```

### Oorzaak

Dit is een **DI-timing bug** in `AuthController.Setup`:

```csharp
// AuthController.cs — regel 28-43
[HttpPost("setup")]
public async Task<IActionResult> Setup(
    [FromBody] SetupRequest request,
    [FromServices] LumioDbContext db)            // ← (A) DbContext wordt hier opgelost
{
    // ...
    await _passwordService.SetupAsync(request.Wachtwoord);  // ← (B) Wachtwoord wordt gezet
    await db.Database.EnsureCreatedAsync();                  // ← (C) Tabellen worden aangemaakt
    return Ok(...);
}
```

**Het probleem stap voor stap:**

| Stap | Wat er gebeurt | `IsUnlocked` |
|------|----------------|---------------|
| **(A)** Request binnenkomt → DI lost `LumioDbContext` op | DbContext factory in `Program.cs` checkt `passwordService.IsUnlocked` → **false** → maakt `Data Source=:memory:` connectie | `false` |
| **(B)** `SetupAsync(password)` wordt aangeroepen | Zet `_currentPassword = password` | `true` |
| **(C)** `db.Database.EnsureCreatedAsync()` wordt aangeroepen | Maakt alle 17+ tabellen aan... maar `db` is nog steeds de in-memory DbContext van stap (A) | `true` |
| **(D)** Volgende request (bijv. `GET /api/eigenaar`) | Nieuwe DbContext → `IsUnlocked` is `true` → verbindt met echte SQLCipher file → **file heeft geen tabellen** | `true` |

De tabellen bestaan alleen in het geheugen van de vorige request. De daadwerkelijke `.db` file is leeg (of bevat geen schema).

### Oplossing

Na het zetten van het wachtwoord moet een **nieuwe** DbContext worden aangemaakt die wél de juiste connectie-string gebruikt. Er zijn twee aanpakken:

#### Optie A: Handmatig nieuwe DbContext aanmaken (aanbevolen)

```csharp
// AuthController.cs
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

#### Optie B: IDbContextFactory gebruiken

Registreer een factory in `Program.cs`:

```csharp
// Program.cs — toevoegen na AddDbContext
builder.Services.AddDbContextFactory<LumioDbContext>();
```

Gebruik in de controller:

```csharp
[HttpPost("setup")]
public async Task<IActionResult> Setup(
    [FromBody] SetupRequest request,
    [FromServices] IDbContextFactory<LumioDbContext> dbFactory)
{
    // ... validatie ...
    await _passwordService.SetupAsync(request.Wachtwoord);

    // Factory maakt een nieuwe DbContext aan met de huidige state
    using var db = await dbFactory.CreateDbContextAsync();
    await db.Database.EnsureCreatedAsync();

    return Ok(new { bericht = "Database aangemaakt en ontgrendeld." });
}
```

### Impactanalyse

| Onderdeel | Impact |
|-----------|--------|
| Eigenaar aanmaken | ❌ Geblokkeerd |
| Erfgenamen CRUD | ❌ Geblokkeerd |
| Testament wizard | ❌ Geblokkeerd |
| Donor registratie | ❌ Geblokkeerd |
| Euthanasie wizard | ❌ Geblokkeerd |
| Uitvaart wizard | ❌ Geblokkeerd |
| Boedel CRUD | ❌ Geblokkeerd |
| Digitaal Bezit CRUD | ❌ Geblokkeerd |
| Documenten upload | ❌ Geblokkeerd |
| Exporteren | ❌ Geblokkeerd |

**Niets werkt zolang deze bug niet is opgelost.**

---

## 2. BUG 2 — Donor wizard maakt duplicate orgaankeuzes

### Probleem

In `donor/formulier/page.tsx` regel 212-234:

```tsx
const handleComplete = async () => {
  // (1) Upsert de donorregistratie — werkt goed (PUT = upsert)
  await api.put("/api/donor", { ... });

  // (2) POST orgaankeuzes — altijd POST, nooit check bestaande!
  const orgaanEntries = Object.entries(orgaanKeuzes).filter(([, v]) => v !== null);
  for (const [orgaan, welDoneren] of orgaanEntries) {
    await api.post("/api/donor/orgaankeuzes", { orgaan, welDoneren });
  }
  router.push("/donor");
};
```

Bij elke keer dat de wizard wordt afgerond, worden **nieuwe** orgaankeuzes aangemaakt bovenop de bestaande. Na 3x invullen staan er bijv. 3× "Hart", 3× "Nieren", etc. in de database.

### Oplossing

Twee opties:

**Optie A — Bestaande orgaankeuzes eerst verwijderen (simpelst):**

```tsx
const handleComplete = async () => {
  await api.put("/api/donor", { ... });

  // Verwijder bestaande orgaankeuzes
  const bestaande = await api.get<{ id: string }[]>("/api/donor/orgaankeuzes");
  for (const item of bestaande) {
    await api.delete(`/api/donor/orgaankeuzes/${item.id}`);
  }

  // Maak nieuwe aan
  for (const [orgaan, welDoneren] of orgaanEntries) {
    await api.post("/api/donor/orgaankeuzes", { orgaan, welDoneren });
  }
  router.push("/donor");
};
```

**Optie B — Backend endpoint toevoegen: `PUT /api/donor/orgaankeuzes/batch`:**

Voeg een endpoint toe dat een lijst ontvangt, bestaande verwijdert en nieuwe aanmaakt in één transactie. Dit is efficiënter en voorkomt race conditions.

```csharp
// DonorController.cs
[HttpPut("orgaankeuzes/batch")]
public async Task<ActionResult<List<OrgaanKeuzeResponse>>> UpsertOrgaanKeuzes(
    [FromBody] List<OrgaanKeuzeUpsertRequest> requests)
{
    var donor = await _db.DonorRegistraties.FirstOrDefaultAsync();
    if (donor is null)
        return BadRequest(new { error = "Maak eerst donor registratie aan." });

    // Verwijder bestaande
    var bestaande = await _db.OrgaanKeuzes
        .Where(o => o.DonorRegistratieId == donor.Id)
        .ToListAsync();
    _db.OrgaanKeuzes.RemoveRange(bestaande);

    // Voeg nieuwe toe
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

## 3. BUG 3 — Wizards laden geen bestaande data

### Probleem

Alle vier de wizard-pagina's initialiseren het formulier met **lege state** en laden nooit bestaande data van de API:

| Wizard | File | Laadt bestaande data? |
|--------|------|-----------------------|
| Testament | `testament/wizard/page.tsx` | ❌ Nee |
| Euthanasie | `euthanasie/wizard/page.tsx` | ❌ Nee |
| Uitvaart | `uitvaart/wizard/page.tsx` | ❌ Nee |
| Donor | `donor/formulier/page.tsx` | ❌ Nee |

**Gevolg:** Als een gebruiker de wizard opnieuw opent om iets te wijzigen, ziet hij een **leeg formulier** in plaats van zijn eerder ingevulde data. Bij opslaan worden alle lege velden naar de database geschreven (alle bestaande data overschreven met lege strings/nulls).

### Voorbeeld: testament/wizard/page.tsx

```tsx
// Huidig — begint altijd leeg
const [form, setForm] = useState({
  testamentType: "",
  notarisNaam: "",
  // ... etc.
});
```

### Oplossing

Voeg een `useEffect` toe die bestaande data laadt:

```tsx
const [form, setForm] = useState({
  testamentType: "",
  notarisNaam: "",
  notarisKantoor: "",
  datumTestament: "",
  ctr_Nummer: "",
  testamentLocatie: "",
  algemeneWensen: "",
  bijzondereBepalingen: "",
});
const [loading, setLoading] = useState(true);

useEffect(() => {
  api.get("/api/testament")
    .then((data) => {
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
    })
    .catch(() => {
      // 404 = nog geen data, laat formulier leeg
    })
    .finally(() => setLoading(false));
}, []);

if (loading) return <p>Laden...</p>;
```

**Dit moet voor alle vier de wizards worden geïmplementeerd:**

1. `testament/wizard/page.tsx` → `GET /api/testament`
2. `euthanasie/wizard/page.tsx` → `GET /api/euthanasie`
3. `uitvaart/wizard/page.tsx` → `GET /api/uitvaart`
4. `donor/formulier/page.tsx` → `GET /api/donor` + `GET /api/donor/orgaankeuzes`

---

## 4. BUG 4 — RSC 404-fouten door Next.js 16 route groups

### Probleem

Na het builden van de Next.js app (`output: "export"`) worden React Server Component (RSC) bestanden aangemaakt in een **subdirectory**-structuur:

```
out/eigenaar/
  __next.!KGF1dGhlbnRpY2F0ZWQp/     ← subdirectory (base64 van "(authenticated)")
    eigenaar.txt                      ← RSC payload bestand
```

Maar de **browser** vraagt deze bestanden aan als een plat pad met punten:

```
GET /eigenaar/__next.!KGF1dGhlbnRpY2F0ZWQp.eigenaar.txt
                                            ^
                                            punt i.p.v. /
```

ASP.NET's `StaticFileMiddleware` zoekt het bestand op schijf als:
```
out/eigenaar/__next.!KGF1dGhlbnRpY2F0ZWQp.eigenaar.txt  ← bestaat niet!
```

In plaats van:
```
out/eigenaar/__next.!KGF1dGhlbnRpY2F0ZWQp/eigenaar.txt  ← bestaat wél
```

### Impact

- **Client-side navigatie** (Next.js Link-clicks) kan RSC data niet laden
- **Full page loads** (F5 / direct URL) werken wél (SPA fallback serveert `index.html`)
- De browser console toont 404-fouten maar de pagina's renderen alsnog via fallback
- Dit veroorzaakt extra latency en onnodige error logs

### Oplossing

Voeg een URL-rewrite middleware toe in de ASP.NET pipeline die het punt-naar-slash mapping afhandelt:

```csharp
// Middleware/RscRewriteMiddleware.cs
using System.Text.RegularExpressions;

namespace Lumio.Api.Middleware;

public class RscRewriteMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly Regex RscPattern = new(
        @"/__next\.([^/]+)\.([^/]+\.txt)$",
        RegexOptions.Compiled
    );

    public RscRewriteMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value;
        if (path != null)
        {
            var match = RscPattern.Match(path);
            if (match.Success)
            {
                // Herschrijf: /__next.SEGMENT.file.txt → /__next.SEGMENT/file.txt
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

Registreer vóór `UseStaticFiles`:

```csharp
// Program.cs — vóór UseDefaultFiles/UseStaticFiles
app.UseMiddleware<RscRewriteMiddleware>();
app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = fileProvider });
app.UseStaticFiles(new StaticFileOptions { FileProvider = fileProvider });
```

**Alternatief**: Schakel staticExport RSC uit door `experimental.serverComponentsHmrCache` te configureren, of gebruik `trailingSlash: true` in `next.config.ts` — maar dit kan andere bijwerkingen hebben.

---

## 5. BUG 5 — Documenten download gebruikt verkeerd base-pad

### Probleem

In `documenten/page.tsx` gebruikt de download-functie `fetch()` direct zonder de `api`-client:

```tsx
const handleDownload = async (id: string, bestandsNaam: string) => {
  try {
    const response = await fetch(`/api/documenten/${id}/download`);
    const blob = await response.blob();
    // ...download logica...
  } catch {
    // Download failed — geen foutmelding
  }
};
```

Problemen:
1. **Geen error handling** — als de download faalt (bijv. document niet gevonden), krijgt de gebruiker geen feedback
2. **Geen `ok` check** — als de server een 404 of 500 retourneert, probeert het toch een blob te maken
3. **Inconsistent met api-client** — gebruikt raw `fetch` i.p.v. de gecentraliseerde `api`-client

### Oplossing

```tsx
const handleDownload = async (id: string, bestandsNaam: string) => {
  try {
    const response = await fetch(`/api/documenten/${id}/download`);
    if (!response.ok) {
      throw new Error(`Download mislukt (${response.status})`);
    }
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

## 6. BUG 6 — Export pagina gebruikt raw fetch zonder api-client

### Probleem

In `export/page.tsx` worden alle export-calls gedaan met raw `fetch()`:

```tsx
const response = await fetch(endpoint, { method: "POST" });
```

Dit omzeilt de `api`-client die:
- 423 LOCKED status afhandelt (redirect naar login)
- Consistente error parsing doet
- Type-safe responses biedt

Als de database vergrendeld raakt terwijl de gebruiker op de export-pagina zit, krijgt hij een onbegrijpelijke foutmelding i.p.v. een redirect naar het login scherm.

### Oplossing

Gebruik de `api`-client of voeg expliciete status-handling toe:

```tsx
const handleExport = async (key: string, endpoint: string) => {
  setDownloading(key);
  setError(null);
  try {
    const response = await fetch(endpoint, { method: "POST" });

    // Check locked status
    if (response.status === 423) {
      window.location.href = "/";
      return;
    }

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

## 7. BUG 7 — SQL injection risico in ChangePasswordAsync

### Probleem

In `MasterPasswordService.cs` regel 75:

```csharp
cmd.CommandText = $"PRAGMA rekey = '{newPassword.Replace("'", "''")}'";
```

Dit is string-interpolatie in een SQL statement. Hoewel `Replace("'", "''")` basis-escaping doet, is dit patroon niet veilig tegen alle aanvallen. SQLite PRAGMA statements ondersteunen geen geparametriseerde queries, maar de huidige escaping is onvolledig voor edge cases.

### Oplossing

Gebruik de Microsoft.Data.Sqlite connection method:

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

    // Gebruik de SqliteConnection.ChangePassword methode als beschikbaar
    // Of gebruik PRAGMA met proper escaping
    using var cmd = conn.CreateCommand();
    cmd.CommandText = "SELECT quote($pw)";
    cmd.Parameters.AddWithValue("$pw", newPassword);
    var quoted = (string?)await cmd.ExecuteScalarAsync();

    using var rekeyCmd = conn.CreateCommand();
    rekeyCmd.CommandText = $"PRAGMA rekey = {quoted}";
    await rekeyCmd.ExecuteNonQueryAsync();

    _currentPassword = newPassword;
}
```

**Opmerking:** Bij SQLCipher heeft `SqliteConnection` soms een `ChangePassword` methode die dit veiliger afhandelt. Controleer of `Microsoft.Data.Sqlite.SqlCipher` dit ondersteunt.

---

## 8. VERBETERING 1 — Dashboard "profiel mist" waarschuwing check

### Huidige situatie

Het dashboard checkt waarschijnlijk of een eigenaar profiel bestaat en toont een waarschuwing. Maar als de database tabellen niet bestaan (BUG 1), faalt ook deze check.

### Verbetering

Zorg dat de eigenaar-check graceful omgaat met "no such table" fouten. Vang deze fout af in de frontend:

```tsx
useEffect(() => {
  api.get("/api/eigenaar")
    .then(() => setProfileExists(true))
    .catch(() => setProfileExists(false))  // Zowel 404 als 500 = niet beschikbaar
    .finally(() => setLoading(false));
}, []);
```

En in de backend, voeg een try-catch toe rond de Eigenaar query zodat een ontbrekende tabel een nette 404 oplevert i.p.v. een 500:

```csharp
// EigenaarController.cs
[HttpGet]
public async Task<ActionResult<EigenaarResponse>> Get()
{
    try
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return NotFound();
        return Ok(eigenaar.Adapt<EigenaarResponse>());
    }
    catch (Microsoft.Data.Sqlite.SqliteException ex) when (ex.SqliteErrorCode == 1)
    {
        // Tabel bestaat niet (nog niet gecreëerd)
        return NotFound();
    }
}
```

---

## 9. VERBETERING 2 — Consistente foutafhandeling in data-laden

### Huidige situatie

Alle pagina's laden data met `.catch(() => {})`:

```tsx
// Voorbeeld uit euthanasie/page.tsx
useEffect(() => {
  api.get<Wilsverklaring>("/api/euthanasie")
    .then(setData)
    .catch(() => {})        // ← Alle fouten genegeerd
    .finally(() => setLoading(false));
}, []);
```

Dit is correct voor 404 (nog geen data), maar maskeert ook:
- 500 (server error / database corrupt)
- 423 (database vergrendeld)
- Netwerk-fouten

### Verbetering

Onderscheid 404 van echte fouten:

```tsx
useEffect(() => {
  api.get<Wilsverklaring>("/api/euthanasie")
    .then(setData)
    .catch((err) => {
      // 404 is verwacht (nog geen data) → negeren
      // Andere fouten → tonen aan gebruiker
      if (!err.message?.includes("404")) {
        setError(err.message);
      }
    })
    .finally(() => setLoading(false));
}, []);
```

Of beter: pas de `api`-client aan om 404 als `null` te retourneren:

```typescript
// api-client.ts
async get<T>(url: string): Promise<T | null> {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (res.status === 423) {
    window.location.href = "/";
    throw new Error("Vergrendeld");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}
```

---

## 10. VERBETERING 3 — Bevestigingslog bij delete acties

### Huidige situatie

Delete-acties in alle CRUD-pagina's worden direct uitgevoerd zonder bevestiging:

```tsx
// erfgenamen/page.tsx
<Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}>
  <Trash2 className="h-3 w-3 text-red-500" />
</Button>
```

Een mis-klik verwijdert permanent een erfgenaam, bankrekening, document, etc.

### Verbetering

Voeg een bevestigingsdialoog toe, of gebruik `window.confirm()` als snelle oplossing:

```tsx
const handleDelete = async (id: string) => {
  if (!window.confirm("Weet u zeker dat u dit item wilt verwijderen?")) return;
  try {
    await api.delete(`/api/erfgenamen/${id}`);
    loadData();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Verwijderen mislukt.");
  }
};
```

---

## 11. Samenvatting prioriteiten

### Blokkerend (niets werkt zonder deze fix)

| # | Bug | Ernst | Bestand(en) |
|---|-----|-------|-------------|
| 1 | DbContext DI timing — tabellen in geheugen | **KRITIEK** | `AuthController.cs`, `Program.cs` |

### Hoog (data-integriteit / functionaliteit)

| # | Bug | Ernst | Bestand(en) |
|---|-----|-------|-------------|
| 2 | Duplicate orgaankeuzes bij donor wizard | **HOOG** | `donor/formulier/page.tsx`, evt. `DonorController.cs` |
| 3 | Wizards laden geen bestaande data | **HOOG** | `testament/wizard/page.tsx`, `euthanasie/wizard/page.tsx`, `uitvaart/wizard/page.tsx`, `donor/formulier/page.tsx` |
| 7 | SQL injection risico in ChangePassword | **HOOG** | `MasterPasswordService.cs` |

### Medium (UX / robuustheid)

| # | Bug | Ernst | Bestand(en) |
|---|-----|-------|-------------|
| 4 | RSC 404-fouten | **MEDIUM** | `Program.cs`, nieuw: `RscRewriteMiddleware.cs` |
| 5 | Document download foutafhandeling | **MEDIUM** | `documenten/page.tsx` |
| 6 | Export bypass api-client | **MEDIUM** | `export/page.tsx` |

### Laag (verbeteringen)

| # | Verbetering | Ernst | Bestand(en) |
|---|-------------|-------|-------------|
| 8 | Dashboard profiel-check robuuster | **LAAG** | `dashboard/page.tsx`, `EigenaarController.cs` |
| 9 | Data-laden foutafhandeling | **LAAG** | Alle pagina's, `api-client.ts` |
| 10 | Delete bevestiging | **LAAG** | Alle CRUD-pagina's |

---

### Aanbevolen implementatievolgorde

1. **BUG 1** — Fix de DbContext DI timing. Test door de app te resetten (verwijder `lumio.db`) en opnieuw setup uit te voeren. Controleer dat `EnsureCreatedAsync` alle tabellen aanmaakt in het echte bestand.
2. **BUG 3** — Wizards bestaande data laten laden (voorkomt dataverlies bij bewerken).
3. **BUG 2** — Donor wizard orgaankeuzes fix.
4. **BUG 7** — SQL injection fix in wachtwoord wijzigen.
5. **BUG 4-6** en verbeteringen in willekeurige volgorde.

> **Na het fixen van BUG 1**: verwijder het bestaande `lumio.db` bestand uit de data directory en test de volledige flow opnieuw. De tabellen moeten zichtbaar zijn via `sqlite3 lumio.db ".tables"` (met het juiste wachtwoord).
