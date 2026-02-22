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
}
