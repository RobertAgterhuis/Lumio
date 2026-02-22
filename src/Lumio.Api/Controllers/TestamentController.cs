using System.Text.Json;
using System.Text.Json.Nodes;
using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.Testament;
using Lumio.Api.Dtos.Testament;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/testament")]
public class TestamentController : ControllerBase
{
    private readonly LumioDbContext _db;

    public TestamentController(LumioDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<TestamentInfoResponse>> Get()
    {
        var item = await _db.Testamenten.FirstOrDefaultAsync();
        if (item is null) return NotFound();
        return Ok(item.Adapt<TestamentInfoResponse>());
    }

    [HttpPut]
    public async Task<ActionResult<TestamentInfoResponse>> Upsert([FromBody] TestamentInfoUpsertRequest request)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = await _db.Testamenten.FirstOrDefaultAsync();
        if (item is null)
        {
            item = request.Adapt<TestamentInfo>();
            item.EigenaarId = eigenaar.Id;
            _db.Testamenten.Add(item);
        }
        else
        {
            request.Adapt(item);
        }

        await _db.SaveChangesAsync();
        return Ok(item.Adapt<TestamentInfoResponse>());
    }

    // --- Legitimaire portie check ---

    /// <summary>
    /// Controleert of de verdeling in het testament de legitimaire portie
    /// van kinderen mogelijk schendt (BW Boek 4, art. 4:63-4:69).
    /// Legitimaire portie = 50% van het intestaat erfdeel per kind.
    /// </summary>
    [HttpGet("legitimaire-portie-check")]
    public async Task<ActionResult<LegitimairePortieCheckResult>> LegitimairePortieCheck()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return Ok(new LegitimairePortieCheckResult(false, 0, false, 0, []));

        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        if (testament is null)
            return Ok(new LegitimairePortieCheckResult(false, 0, false, 0, []));

        // Tel kinderen in de erfgenamenlijst
        var erfgenamen = await _db.Erfgenamen
            .Where(e => e.EigenaarId == eigenaar.Id)
            .ToListAsync();

        string[] kindRelaties = ["kind", "zoon", "dochter", "stiefkind", "stiefzoon", "stiefdochter"];
        var kinderen = erfgenamen
            .Where(e => kindRelaties.Any(r => e.Relatie.Contains(r, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        int aantalKinderen = kinderen.Count;
        if (aantalKinderen == 0)
            return Ok(new LegitimairePortieCheckResult(false, 0, false, 0, []));

        // Bepaal of er een partner is
        bool heeftPartner = eigenaar.BurgerlijkeStaat is BurgerlijkeStaat.Gehuwd
            or BurgerlijkeStaat.GeregistreerdPartnerschap;

        // Intestaat erfdeel per kind: partner telt als 1 extra erfgenaam
        int aantalErfgenamen = aantalKinderen + (heeftPartner ? 1 : 0);
        decimal intestaatPerKind = 100m / aantalErfgenamen;

        // Legitimaire portie = 50% van het intestaat erfdeel
        decimal minimumPerKind = Math.Round(intestaatPerKind / 2m, 2);

        // Controleer begunstigden met relatie "kind" etc.
        var begunstigden = await _db.Begunstigden
            .Where(b => b.TestamentInfoId == testament.Id)
            .ToListAsync();

        var waarschuwingen = new List<LegitimairePortieWaarschuwing>();

        // Controleer elk kind-erfgenaam of ze als begunstigde voorkomen
        foreach (var kind in kinderen)
        {
            string volledigeNaam = string.IsNullOrEmpty(kind.Tussenvoegsel)
                ? $"{kind.Voornaam} {kind.Achternaam}"
                : $"{kind.Voornaam} {kind.Tussenvoegsel} {kind.Achternaam}";

            // Zoek matchende begunstigde (op naam)
            var begunstigde = begunstigden.FirstOrDefault(b =>
                b.Naam.Contains(kind.Voornaam, StringComparison.OrdinalIgnoreCase) &&
                b.Naam.Contains(kind.Achternaam, StringComparison.OrdinalIgnoreCase));

            if (begunstigde is null)
            {
                // Kind is niet als begunstigde opgenomen → waarschuwing
                waarschuwingen.Add(new LegitimairePortieWaarschuwing(
                    volledigeNaam, null, minimumPerKind));
            }
            else if (begunstigde.Percentage.HasValue && begunstigde.Percentage.Value < minimumPerKind)
            {
                // Lager dan legitimaire portie → waarschuwing
                waarschuwingen.Add(new LegitimairePortieWaarschuwing(
                    volledigeNaam, begunstigde.Percentage.Value, minimumPerKind));
            }
        }

        return Ok(new LegitimairePortieCheckResult(
            waarschuwingen.Count > 0,
            aantalKinderen,
            heeftPartner,
            minimumPerKind,
            waarschuwingen));
    }

    // --- Begunstigden ---

    [HttpGet("begunstigden")]
    public async Task<ActionResult<List<BegunstigdeResponse>>> GetBegunstigden()
    {
        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        if (testament is null) return Ok(new List<BegunstigdeResponse>());

        var items = await _db.Begunstigden
            .Where(b => b.TestamentInfoId == testament.Id)
            .ToListAsync();
        return Ok(items.Adapt<List<BegunstigdeResponse>>());
    }

    [HttpPost("begunstigden")]
    public async Task<ActionResult<BegunstigdeResponse>> CreateBegunstigde([FromBody] BegunstigdeUpsertRequest request)
    {
        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        if (testament is null) return BadRequest(new { error = "Maak eerst testament informatie aan." });

        var item = request.Adapt<Begunstigde>();
        item.TestamentInfoId = testament.Id;
        _db.Begunstigden.Add(item);
        await _db.SaveChangesAsync();
        return Created($"/api/testament/begunstigden/{item.Id}", item.Adapt<BegunstigdeResponse>());
    }

    [HttpPut("begunstigden/{id:guid}")]
    public async Task<ActionResult<BegunstigdeResponse>> UpdateBegunstigde(Guid id, [FromBody] BegunstigdeUpsertRequest request)
    {
        var item = await _db.Begunstigden.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        return Ok(item.Adapt<BegunstigdeResponse>());
    }

    [HttpDelete("begunstigden/{id:guid}")]
    public async Task<IActionResult> DeleteBegunstigde(Guid id)
    {
        var item = await _db.Begunstigden.FindAsync(id);
        if (item is null) return NotFound();

        _db.Begunstigden.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // --- Executeurs ---

    [HttpGet("executeurs")]
    public async Task<ActionResult<List<ExecuteurResponse>>> GetExecuteurs()
    {
        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        if (testament is null) return Ok(new List<ExecuteurResponse>());

        var items = await _db.Executeurs
            .Where(e => e.TestamentInfoId == testament.Id)
            .ToListAsync();
        return Ok(items.Adapt<List<ExecuteurResponse>>());
    }

    [HttpPost("executeurs")]
    public async Task<ActionResult<ExecuteurResponse>> CreateExecuteur([FromBody] ExecuteurUpsertRequest request)
    {
        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        if (testament is null) return BadRequest(new { error = "Maak eerst testament informatie aan." });

        var item = request.Adapt<Executeur>();
        item.TestamentInfoId = testament.Id;
        _db.Executeurs.Add(item);
        await _db.SaveChangesAsync();
        return Created($"/api/testament/executeurs/{item.Id}", item.Adapt<ExecuteurResponse>());
    }

    [HttpPut("executeurs/{id:guid}")]
    public async Task<ActionResult<ExecuteurResponse>> UpdateExecuteur(Guid id, [FromBody] ExecuteurUpsertRequest request)
    {
        var item = await _db.Executeurs.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        return Ok(item.Adapt<ExecuteurResponse>());
    }

    [HttpDelete("executeurs/{id:guid}")]
    public async Task<IActionResult> DeleteExecuteur(Guid id)
    {
        var item = await _db.Executeurs.FindAsync(id);
        if (item is null) return NotFound();

        _db.Executeurs.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // --- Snapshots (concept-vergelijking) ---

    [HttpGet("snapshots")]
    public async Task<ActionResult<List<TestamentSnapshotResponse>>> GetSnapshots()
    {
        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        if (testament is null) return Ok(new List<TestamentSnapshotResponse>());

        var items = await _db.TestamentSnapshots
            .Where(s => s.TestamentInfoId == testament.Id)
            .OrderByDescending(s => s.Versie)
            .ToListAsync();
        return Ok(items.Adapt<List<TestamentSnapshotResponse>>());
    }

    [HttpPost("snapshots")]
    public async Task<ActionResult<TestamentSnapshotResponse>> CreateSnapshot([FromBody] TestamentSnapshotCreateRequest request)
    {
        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        if (testament is null) return BadRequest(new { error = "Maak eerst testament informatie aan." });

        var begunstigden = await _db.Begunstigden
            .Where(b => b.TestamentInfoId == testament.Id)
            .ToListAsync();

        var executeurs = await _db.Executeurs
            .Where(e => e.TestamentInfoId == testament.Id)
            .ToListAsync();

        // Serialize current state
        var snapshotData = new
        {
            testament = testament.Adapt<TestamentInfoResponse>(),
            begunstigden = begunstigden.Adapt<List<BegunstigdeResponse>>(),
            executeurs = executeurs.Adapt<List<ExecuteurResponse>>(),
        };

        var maxVersie = await _db.TestamentSnapshots
            .Where(s => s.TestamentInfoId == testament.Id)
            .MaxAsync(s => (int?)s.Versie) ?? 0;

        var snapshot = new TestamentSnapshot
        {
            TestamentInfoId = testament.Id,
            Versie = maxVersie + 1,
            Notitie = request.Notitie,
            SnapshotJson = JsonSerializer.Serialize(snapshotData, new JsonSerializerOptions { WriteIndented = false }),
        };

        _db.TestamentSnapshots.Add(snapshot);
        await _db.SaveChangesAsync();
        return Created($"/api/testament/snapshots/{snapshot.Id}", snapshot.Adapt<TestamentSnapshotResponse>());
    }

    [HttpGet("snapshots/{id:guid}")]
    public async Task<ActionResult<TestamentSnapshotDetailResponse>> GetSnapshot(Guid id)
    {
        var item = await _db.TestamentSnapshots.FindAsync(id);
        if (item is null) return NotFound();
        return Ok(item.Adapt<TestamentSnapshotDetailResponse>());
    }

    [HttpGet("snapshots/vergelijk")]
    public async Task<ActionResult<TestamentVergelijkingResponse>> VergelijkSnapshots(
        [FromQuery] Guid versie1Id, [FromQuery] Guid versie2Id)
    {
        var snap1 = await _db.TestamentSnapshots.FindAsync(versie1Id);
        var snap2 = await _db.TestamentSnapshots.FindAsync(versie2Id);
        if (snap1 is null || snap2 is null) return NotFound();

        var json1 = JsonNode.Parse(snap1.SnapshotJson);
        var json2 = JsonNode.Parse(snap2.SnapshotJson);

        var verschillen = new List<TestamentVerschil>();

        if (json1?["testament"] is JsonObject t1 && json2?["testament"] is JsonObject t2)
        {
            var allKeys = new HashSet<string>(t1.Select(p => p.Key).Concat(t2.Select(p => p.Key)));
            foreach (var key in allKeys.OrderBy(k => k))
            {
                var v1 = t1[key]?.ToString();
                var v2 = t2[key]?.ToString();
                if (v1 != v2)
                {
                    verschillen.Add(new TestamentVerschil(key, v1, v2));
                }
            }
        }

        // Compare begunstigden counts/names
        var b1 = json1?["begunstigden"]?.AsArray();
        var b2 = json2?["begunstigden"]?.AsArray();
        var bCount1 = b1?.Count ?? 0;
        var bCount2 = b2?.Count ?? 0;
        if (bCount1 != bCount2)
        {
            verschillen.Add(new TestamentVerschil("Aantal begunstigden", bCount1.ToString(), bCount2.ToString()));
        }

        // Detail per begunstigde: compare by position
        var maxB = Math.Max(bCount1, bCount2);
        for (int i = 0; i < maxB; i++)
        {
            var name1 = b1?.ElementAtOrDefault(i)?["naam"]?.ToString() ?? "(geen)";
            var name2 = b2?.ElementAtOrDefault(i)?["naam"]?.ToString() ?? "(geen)";
            var pct1 = b1?.ElementAtOrDefault(i)?["percentage"]?.ToString() ?? "—";
            var pct2 = b2?.ElementAtOrDefault(i)?["percentage"]?.ToString() ?? "—";
            if (name1 != name2 || pct1 != pct2)
            {
                verschillen.Add(new TestamentVerschil(
                    $"Begunstigde {i + 1}",
                    $"{name1} ({pct1}%)",
                    $"{name2} ({pct2}%)"));
            }
        }

        return Ok(new TestamentVergelijkingResponse(
            snap1.Adapt<TestamentSnapshotDetailResponse>(),
            snap2.Adapt<TestamentSnapshotDetailResponse>(),
            verschillen));
    }

    [HttpDelete("snapshots/{id:guid}")]
    public async Task<IActionResult> DeleteSnapshot(Guid id)
    {
        var item = await _db.TestamentSnapshots.FindAsync(id);
        if (item is null) return NotFound();

        _db.TestamentSnapshots.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Juridische terminologie-check ──

    [HttpGet("juridische-check")]
    public async Task<IActionResult> JuridischeCheck()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        var begunstigden = testament != null
            ? await _db.Begunstigden.Where(b => b.TestamentInfoId == testament.Id).ToListAsync()
            : new List<Begunstigde>();
        var erfgenamen = eigenaar != null
            ? await _db.Erfgenamen.Where(e => e.EigenaarId == eigenaar.Id).ToListAsync()
            : new List<Erfgenaam>();
        var boedelBezittingen = eigenaar != null
            ? await _db.FysiekeBezittingen.Where(b => b.EigenaarId == eigenaar.Id).ToListAsync()
            : new List<Domain.AssetRegistry.FysiekBezit>();

        var waarschuwingen = new List<object>();

        if (testament != null)
        {
            var type = testament.TestamentType?.ToLowerInvariant() ?? "";
            var heeftOnroerendGoed = boedelBezittingen.Any(b =>
                (b.Categorie ?? "").ToLowerInvariant().Contains("woning") ||
                (b.Categorie ?? "").ToLowerInvariant().Contains("huis") ||
                (b.Categorie ?? "").ToLowerInvariant().Contains("appartement") ||
                (b.Categorie ?? "").ToLowerInvariant().Contains("grond") ||
                (b.Categorie ?? "").ToLowerInvariant().Contains("onroerend") ||
                (b.Categorie ?? "").ToLowerInvariant().Contains("pand") ||
                (b.KadastraalNummer != null && b.KadastraalNummer.Length > 0));

            // Codicil + onroerend goed → vereist notarieel testament
            if (type.Contains("codicil") && heeftOnroerendGoed)
            {
                waarschuwingen.Add(new
                {
                    ernst = "hoog",
                    categorie = "Testament type",
                    melding = "U kiest voor een codicil, maar u heeft onroerend goed. " +
                        "Verdeling van onroerend goed is alleen rechtsgeldig via een notarieel testament (art. 4:97 BW).",
                    suggestie = "Overweeg een notarieel testament op te laten stellen."
                });
            }

            // Handgeschreven testament + executeur → risico
            if ((type.Contains("handgeschreven") || type.Contains("eigen") || type.Contains("olografisch")) &&
                await _db.Executeurs.AnyAsync(e => e.TestamentInfoId == testament.Id))
            {
                waarschuwingen.Add(new
                {
                    ernst = "middel",
                    categorie = "Executeur",
                    melding = "U heeft een executeur aangewezen in een handgeschreven testament. " +
                        "Een executeur kan alleen 'drie-sterren-bevoegdheden' (beheer, verdeling, te-gelde-making) " +
                        "krijgen via een notarieel testament.",
                    suggestie = "Laat de executeurbenoeming opnemen in een notarieel testament."
                });
            }

            // Geen uitsluitingsclausule maar wel kinderen
            var heeftKinderen = erfgenamen.Any(e =>
                (e.Relatie ?? "").ToLowerInvariant().Contains("kind") ||
                (e.Relatie ?? "").ToLowerInvariant().Contains("zoon") ||
                (e.Relatie ?? "").ToLowerInvariant().Contains("dochter"));
            if (!testament.UitsluitingsClausule && heeftKinderen)
            {
                waarschuwingen.Add(new
                {
                    ernst = "info",
                    categorie = "Uitsluitingsclausule",
                    melding = "U heeft kinderen maar geen uitsluitingsclausule. " +
                        "Zonder uitsluitingsclausule kan de erfenis van uw kinderen bij een scheiding " +
                        "in de gemeenschap van goederen vallen.",
                    suggestie = "Overweeg een uitsluitingsclausule toe te voegen."
                });
            }

            // Begunstigden percentages tellen niet op tot 100%
            var totPct = begunstigden.Where(b => b.Percentage.HasValue).Sum(b => b.Percentage!.Value);
            if (begunstigden.Count > 0 && totPct > 0 && totPct != 100)
            {
                waarschuwingen.Add(new
                {
                    ernst = "middel",
                    categorie = "Verdeling",
                    melding = $"De percentages van de begunstigden tellen op tot {totPct}% (verwacht: 100%). " +
                        "Dit kan leiden tot onduidelijkheid over de verdeling.",
                    suggestie = "Controleer de verdeling en zorg dat de percentages optellen tot 100%."
                });
            }

            // Geen notaris ingevuld
            if (string.IsNullOrWhiteSpace(testament.NotarisNaam))
            {
                waarschuwingen.Add(new
                {
                    ernst = "info",
                    categorie = "Notaris",
                    melding = "Er is geen notaris ingevuld bij het testament. " +
                        "Voor een geldig notarieel testament is een notaris vereist.",
                    suggestie = "Vul de gegevens van uw notaris in."
                });
            }
        }

        // Erfgenamen zonder contactgegevens
        var zonderContact = erfgenamen.Where(e =>
            string.IsNullOrWhiteSpace(e.Telefoon) && string.IsNullOrWhiteSpace(e.Email)).ToList();
        if (zonderContact.Count > 0)
        {
            waarschuwingen.Add(new
            {
                ernst = "info",
                categorie = "Contactgegevens",
                melding = $"{zonderContact.Count} erfgena{(zonderContact.Count == 1 ? "am" : "men")} " +
                    $"zonder telefoon of e-mail: {string.Join(", ", zonderContact.Select(e => string.IsNullOrWhiteSpace(e.Tussenvoegsel) ? $"{e.Voornaam} {e.Achternaam}" : $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}"))}.",
                suggestie = "Vul contactgegevens in zodat erfgenamen bereikbaar zijn."
            });
        }

        return Ok(new { aantalWaarschuwingen = waarschuwingen.Count, waarschuwingen });
    }
}
