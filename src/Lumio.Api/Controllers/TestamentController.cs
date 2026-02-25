using System.Text.Json;
using System.Text.Json.Nodes;
using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.Testament;
using Lumio.Api.Dtos.Testament;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Services;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/testament")]
public class TestamentController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly ErfbelastingOptions _erfbelasting;
    private readonly ILegitimairePortieService _legitiemairePortieService;
    private readonly IStringLocalizer<TestamentController> L;
    private readonly IAuditService _audit;

    public TestamentController(
        LumioDbContext db,
        IOptions<ErfbelastingOptions> erfbelasting,
        ILegitimairePortieService legitiemairePortieService,
        IStringLocalizer<TestamentController> localizer,
        IAuditService audit)
    {
        _db = db;
        _erfbelasting = erfbelasting.Value;
        _legitiemairePortieService = legitiemairePortieService;
        L = localizer;
        _audit = audit;
    }

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

        // S7-04: cross-field check — datum testament mag niet vóór geboortedatum eigenaar liggen
        if (request.DatumTestament.HasValue && request.DatumTestament.Value < eigenaar.Geboortedatum)
            return BadRequest(new { error = "Datum testament mag niet vóór de geboortedatum van de eigenaar liggen." });

        var item = await _db.Testamenten.FirstOrDefaultAsync();
        bool isNieuw = item is null;

        // Capture previous values to detect critical changes
        string? vorigeType = item?.TestamentType;
        string? vorigeNotaris = item?.NotarisNaam;

        if (isNieuw)
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
        await _audit.LogAsync("Opgeslagen", "Testament", item!.Id);

        // Auto-snapshot on critical field changes
        if (!isNieuw)
        {
            bool typeGewijzigd = !string.Equals(vorigeType, item.TestamentType, StringComparison.OrdinalIgnoreCase);
            bool notarisGewijzigd = !string.Equals(vorigeNotaris, item.NotarisNaam, StringComparison.OrdinalIgnoreCase);

            if (typeGewijzigd || notarisGewijzigd)
            {
                var begunstigden = await _db.Begunstigden
                    .Where(b => b.TestamentInfoId == item.Id).ToListAsync();
                var executeurs = await _db.Executeurs
                    .Where(e => e.TestamentInfoId == item.Id).ToListAsync();

                var snapshotData = new
                {
                    testament = item.Adapt<TestamentInfoResponse>(),
                    begunstigden = begunstigden.Adapt<List<BegunstigdeResponse>>(),
                    executeurs = executeurs.Adapt<List<ExecuteurResponse>>(),
                };

                var maxVersie = await _db.TestamentSnapshots
                    .Where(s => s.TestamentInfoId == item.Id)
                    .MaxAsync(s => (int?)s.Versie) ?? 0;

                var veranderingen = new List<string>();
                if (typeGewijzigd) veranderingen.Add($"Testament type gewijzigd van '{vorigeType}' naar '{item.TestamentType}'");
                if (notarisGewijzigd) veranderingen.Add($"Notaris gewijzigd van '{vorigeNotaris}' naar '{item.NotarisNaam}'");

                var autoSnapshot = new TestamentSnapshot
                {
                    TestamentInfoId = item.Id,
                    Versie = maxVersie + 1,
                    Notitie = $"Automatisch snapshot: {string.Join("; ", veranderingen)}",
                    SnapshotJson = JsonSerializer.Serialize(snapshotData,
                        new JsonSerializerOptions { WriteIndented = false }),
                };
                _db.TestamentSnapshots.Add(autoSnapshot);
                await _db.SaveChangesAsync();
                await _audit.LogAsync("AutoSnapshot", "TestamentSnapshot", autoSnapshot.Id);
            }
        }

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
        var testament = await _db.Testamenten.FirstOrDefaultAsync();

        // Haal erfgenamen en filter kinderen
        var erfgenamen = eigenaar is not null
            ? await _db.Erfgenamen.Where(e => e.EigenaarId == eigenaar.Id).ToListAsync()
            : [];

        string[] kindRelaties = _erfbelasting.KindRelatiesLegitimairePortie;
        var kinderen = erfgenamen
            .Where(e => kindRelaties.Any(r => e.Relatie.Contains(r, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        // Haal begunstigden
        var begunstigden = testament is not null
            ? await _db.Begunstigden.Where(b => b.TestamentInfoId == testament.Id).ToListAsync()
            : [];

        // Bouw facts
        var facts = new LegitimairePortieFacts(
            eigenaar is not null,
            testament is not null,
            eigenaar?.BurgerlijkeStaat switch
            {
                BurgerlijkeStaat.Gehuwd => BurgerlijkeStaatFact.Gehuwd,
                BurgerlijkeStaat.GeregistreerdPartnerschap => BurgerlijkeStaatFact.GeregistreerdPartnerschap,
                _ => BurgerlijkeStaatFact.Alleenstaand
            },
            kinderen.Select(k => new KindErfgenaamFact(
                k.Id,
                string.IsNullOrEmpty(k.Tussenvoegsel) ? $"{k.Voornaam} {k.Achternaam}" : $"{k.Voornaam} {k.Tussenvoegsel} {k.Achternaam}",
                k.Voornaam,
                k.Achternaam)).ToList(),
            begunstigden.Select(b => new BegunstigdeFact(b.Naam, b.Percentage)).ToList());

        // Delegeer naar service
        var result = _legitiemairePortieService.Bereken(facts);
        var r = result.Resultaat;

        return Ok(new LegitimairePortieCheckResult(
            r.HeeftWaarschuwing,
            r.AantalKinderen,
            r.HeeftPartner,
            r.MinimumPercentagePerKind,
            r.Waarschuwingen.Select(w => new LegitimairePortieWaarschuwing(w.Naam, w.ToegewezenPercentage, w.MinimumPercentage)).ToList()));
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
        await _audit.LogAsync("Aangemaakt", "Begunstigde", item.Id);
        return Created($"/api/testament/begunstigden/{item.Id}", item.Adapt<BegunstigdeResponse>());
    }

    [HttpPut("begunstigden/{id:guid}")]
    public async Task<ActionResult<BegunstigdeResponse>> UpdateBegunstigde(Guid id, [FromBody] BegunstigdeUpsertRequest request)
    {
        var item = await _db.Begunstigden.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "Begunstigde", id);
        return Ok(item.Adapt<BegunstigdeResponse>());
    }

    [HttpDelete("begunstigden/{id:guid}")]
    public async Task<IActionResult> DeleteBegunstigde(Guid id)
    {
        var item = await _db.Begunstigden.FindAsync(id);
        if (item is null) return NotFound();

        _db.Begunstigden.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "Begunstigde", id);
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
        await _audit.LogAsync("Aangemaakt", "Executeur", item.Id);
        return Created($"/api/testament/executeurs/{item.Id}", item.Adapt<ExecuteurResponse>());
    }

    [HttpPut("executeurs/{id:guid}")]
    public async Task<ActionResult<ExecuteurResponse>> UpdateExecuteur(Guid id, [FromBody] ExecuteurUpsertRequest request)
    {
        var item = await _db.Executeurs.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "Executeur", id);
        return Ok(item.Adapt<ExecuteurResponse>());
    }

    [HttpDelete("executeurs/{id:guid}")]
    public async Task<IActionResult> DeleteExecuteur(Guid id)
    {
        var item = await _db.Executeurs.FindAsync(id);
        if (item is null) return NotFound();

        _db.Executeurs.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "Executeur", id);
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
        await _audit.LogAsync("Aangemaakt", "TestamentSnapshot", snapshot.Id);
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

        // S5-02: Compare begunstigden by naam+relatie key (not by position)
        var b1 = json1?["begunstigden"]?.AsArray();
        var b2 = json2?["begunstigden"]?.AsArray();
        var bCount1 = b1?.Count ?? 0;
        var bCount2 = b2?.Count ?? 0;
        if (bCount1 != bCount2)
        {
            verschillen.Add(new TestamentVerschil(L["NumberOfBeneficiaries"].Value, bCount1.ToString(), bCount2.ToString()));
        }

        static string BegKey(JsonNode? node) =>
            $"{node?["naam"]?.ToString() ?? ""}|{node?["relatie"]?.ToString() ?? ""}";

        var dict1 = new Dictionary<string, JsonNode?>();
        if (b1 is not null)
            foreach (var n in b1) { var k = BegKey(n); dict1.TryAdd(k, n); }

        var dict2 = new Dictionary<string, JsonNode?>();
        if (b2 is not null)
            foreach (var n in b2) { var k = BegKey(n); dict2.TryAdd(k, n); }

        var alleSleutels = new HashSet<string>(dict1.Keys.Concat(dict2.Keys));
        foreach (var key in alleSleutels.OrderBy(k => k))
        {
            var inB1 = dict1.TryGetValue(key, out var node1);
            var inB2 = dict2.TryGetValue(key, out var node2);
            var naam = key.Split('|')[0] is { Length: > 0 } n ? n : L["NoneValue"].Value;

            if (!inB1)
            {
                var pct2 = node2?["percentage"]?.ToString() ?? "—";
                var rel2 = node2?["relatie"]?.ToString() ?? "";
                verschillen.Add(new TestamentVerschil(
                    L["BeneficiaryLabel", naam].Value,
                    L["NoneValue"].Value,
                    $"{naam} ({rel2}) — {pct2}%"));
            }
            else if (!inB2)
            {
                var pct1 = node1?["percentage"]?.ToString() ?? "—";
                var rel1 = node1?["relatie"]?.ToString() ?? "";
                verschillen.Add(new TestamentVerschil(
                    L["BeneficiaryLabel", naam].Value,
                    $"{naam} ({rel1}) — {pct1}%",
                    L["NoneValue"].Value));
            }
            else
            {
                var pct1 = node1?["percentage"]?.ToString() ?? "—";
                var pct2 = node2?["percentage"]?.ToString() ?? "—";
                var rel1 = node1?["relatie"]?.ToString() ?? "";
                var rel2 = node2?["relatie"]?.ToString() ?? "";
                if (pct1 != pct2 || rel1 != rel2)
                {
                    verschillen.Add(new TestamentVerschil(
                        L["BeneficiaryLabel", naam].Value,
                        $"{naam} ({rel1}) — {pct1}%",
                        $"{naam} ({rel2}) — {pct2}%"));
                }
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
        await _audit.LogAsync("Verwijderd", "TestamentSnapshot", id);
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
        var executeurs = testament != null
            ? await _db.Executeurs.Where(e => e.TestamentInfoId == testament.Id).ToListAsync()
            : new List<Executeur>();
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
                    ernst = L["SeverityHigh"].Value,
                    categorie = L["CategoryTestamentType"].Value,
                    melding = L["WarningCodicilRealEstate"].Value,
                    suggestie = L["SuggestionConsiderNotarialWill"].Value
                });
            }

            // Handgeschreven testament + executeur → risico
            if ((type.Contains("handgeschreven") || type.Contains("eigen") || type.Contains("olografisch")) &&
                executeurs.Count > 0)
            {
                waarschuwingen.Add(new
                {
                    ernst = L["SeverityMedium"].Value,
                    categorie = L["CategoryExecutor"].Value,
                    melding = L["WarningHandwrittenExecutor"].Value,
                    suggestie = L["SuggestionIncludeExecutorInNotarialWill"].Value
                });
            }

            // Geen uitsluitingsclausule maar wel kinderen
            var heeftKinderen = erfgenamen.Any(e =>
                (e.Relatie ?? "").ToLowerInvariant().Contains("kind") ||
                (e.Relatie ?? "").ToLowerInvariant().Contains("zoon") ||
                (e.Relatie ?? "").ToLowerInvariant().Contains("dochter"));
            if (testament.UitsluitingsClausule != true && heeftKinderen)
            {
                waarschuwingen.Add(new
                {
                    ernst = L["SeverityInfo"].Value,
                    categorie = L["CategoryExclusionClause"].Value,
                    melding = L["WarningNoExclusionClause"].Value,
                    suggestie = L["SuggestionAddExclusionClause"].Value
                });
            }

            // Begunstigden percentages tellen niet op tot 100%
            var totPct = begunstigden.Where(b => b.Percentage.HasValue).Sum(b => b.Percentage!.Value);
            if (begunstigden.Count > 0 && totPct > 0 && totPct != 100)
            {
                // S8-11: >100% is kritisch (bezit verdeeld over meer dan 100%), <100% is waarschuwing
                var pctErnst = totPct > 100 ? L["SeverityHigh"].Value : L["SeverityMedium"].Value;
                waarschuwingen.Add(new
                {
                    ernst = pctErnst,
                    categorie = L["CategoryDistribution"].Value,
                    melding = L["WarningPercentageMismatch", totPct].Value,
                    suggestie = L["SuggestionCheckPercentages"].Value
                });
            }

            // Geen notaris ingevuld
            if (string.IsNullOrWhiteSpace(testament.NotarisNaam))
            {
                waarschuwingen.Add(new
                {
                    ernst = L["SeverityInfo"].Value,
                    categorie = L["CategoryNotary"].Value,
                    melding = L["WarningNoNotary"].Value,
                    suggestie = L["SuggestionFillInNotary"].Value
                });
            }

            // S5-01: Executeur is ook begunstigde → conflict of interest
            var executeurNamen = executeurs.Select(e => e.Naam.ToLowerInvariant()).ToHashSet();
            var begunstigdenAlsExecuteur = begunstigden
                .Where(b => executeurNamen.Contains(b.Naam.ToLowerInvariant()))
                .ToList();
            if (begunstigdenAlsExecuteur.Count > 0)
            {
                var namen = string.Join(", ", begunstigdenAlsExecuteur.Select(b => b.Naam));
                waarschuwingen.Add(new
                {
                    ernst = L["SeverityMedium"].Value,
                    categorie = L["CategoryExecutor"].Value,
                    melding = L["WarningExecutorAlsoBeneficiary", namen].Value,
                    suggestie = L["SuggestionExecutorConflict"].Value
                });
            }

            // S5-01: Partner niet als begunstigde bij gehuwd/geregistreerd partnerschap
            if (eigenaar is not null &&
                (eigenaar.BurgerlijkeStaat == BurgerlijkeStaat.Gehuwd ||
                 eigenaar.BurgerlijkeStaat == BurgerlijkeStaat.GeregistreerdPartnerschap))
            {
                var partnerAlsBegunstigde = begunstigden.Any(b =>
                    (b.Relatie ?? "").ToLowerInvariant().Contains("partner") ||
                    (b.Relatie ?? "").ToLowerInvariant().Contains("echtgeno"));
                if (!partnerAlsBegunstigde)
                {
                    waarschuwingen.Add(new
                    {
                        ernst = L["SeverityInfo"].Value,
                        categorie = L["CategoryDistribution"].Value,
                        melding = L["WarningPartnerNotBeneficiary"].Value,
                        suggestie = L["SuggestionAddPartnerBeneficiary"].Value
                    });
                }
            }

            // S5-01: Testament aanwezig maar geen begunstigden
            if (begunstigden.Count == 0)
            {
                waarschuwingen.Add(new
                {
                    ernst = L["SeverityHigh"].Value,
                    categorie = L["CategoryDistribution"].Value,
                    melding = L["WarningNoBeneficiaries"].Value,
                    suggestie = L["SuggestionAddBeneficiaries"].Value
                });
            }
        }

        // Erfgenamen zonder contactgegevens
        var zonderContact = erfgenamen.Where(e =>
            string.IsNullOrWhiteSpace(e.Telefoon) && string.IsNullOrWhiteSpace(e.Email)).ToList();
        if (zonderContact.Count > 0)
        {
            var namen = string.Join(", ", zonderContact.Select(e =>
                string.IsNullOrWhiteSpace(e.Tussenvoegsel)
                    ? $"{e.Voornaam} {e.Achternaam}"
                    : $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}"));
            var key = zonderContact.Count == 1 ? "WarningHeirWithoutContactSingle" : "WarningHeirsWithoutContactMultiple";
            waarschuwingen.Add(new
            {
                ernst = L["SeverityInfo"].Value,
                categorie = L["CategoryContactDetails"].Value,
                melding = L[key, zonderContact.Count, namen].Value,
                suggestie = L["SuggestionFillContactDetails"].Value
            });
        }

        return Ok(new { aantalWaarschuwingen = waarschuwingen.Count, waarschuwingen });
    }
}
