using System.Text.Json;
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
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/testament")]
public class TestamentController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly ErfbelastingOptions _erfbelasting;
    private readonly ILegitimairePortieService _legitiemairePortieService;
    private readonly IAuditService _audit;

    public TestamentController(
        LumioDbContext db,
        IOptions<ErfbelastingOptions> erfbelasting,
        ILegitimairePortieService legitiemairePortieService,
        IAuditService audit)
    {
        _db = db;
        _erfbelasting = erfbelasting.Value;
        _legitiemairePortieService = legitiemairePortieService;
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
}
