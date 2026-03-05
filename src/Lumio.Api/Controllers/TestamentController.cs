using System.Text.Json;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.Testament;
using Lumio.Api.Dtos.Testament;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Services;
using Lumio.Api.Repositories;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/testament")]
public class TestamentController : ControllerBase
{
    private readonly ITestamentRepository _testament;
    private readonly ITestamentSnapshotRepository _snapshots;
    private readonly ITestamentJuridischeCheckRepository _checkRepo;
    private readonly ErfbelastingOptions _erfbelasting;
    private readonly ILegitimairePortieService _legitiemairePortieService;
    private readonly IAuditService _audit;

    public TestamentController(
        ITestamentRepository testament,
        ITestamentSnapshotRepository snapshots,
        ITestamentJuridischeCheckRepository checkRepo,
        IOptions<ErfbelastingOptions> erfbelasting,
        ILegitimairePortieService legitiemairePortieService,
        IAuditService audit)
    {
        _testament = testament;
        _snapshots = snapshots;
        _checkRepo = checkRepo;
        _erfbelasting = erfbelasting.Value;
        _legitiemairePortieService = legitiemairePortieService;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<TestamentInfoResponse>> Get()
    {
        var item = await _testament.FindAsync();
        if (item is null) return NotFound();
        return Ok(item.Adapt<TestamentInfoResponse>());
    }

    [HttpPut]
    public async Task<ActionResult<TestamentInfoResponse>> Upsert([FromBody] TestamentInfoUpsertRequest request)
    {
        var check = await _checkRepo.GetCheckDataAsync();
        var eigenaar = check.Eigenaar;
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        // S7-04: cross-field check — datum testament mag niet voor geboortedatum eigenaar liggen
        if (request.DatumTestament.HasValue && request.DatumTestament.Value < eigenaar.Geboortedatum)
            return BadRequest(new { error = "Datum testament mag niet voor de geboortedatum van de eigenaar liggen." });

        var item = await _testament.FindAsync();
        bool isNieuw = item is null;

        // Capture previous values to detect critical changes
        string? vorigeType = item?.TestamentType;
        string? vorigeNotaris = item?.NotarisContact?.Naam;

        if (isNieuw)
        {
            item = request.Adapt<TestamentInfo>();
            item!.EigenaarId = eigenaar.Id;
            await _testament.AddAsync(item);
        }
        else
        {
            request.Adapt(item);
        }

        await _testament.CommitAsync();
        await _audit.LogAsync("Opgeslagen", "Testament", item!.Id);

        // Auto-snapshot on critical field changes
        if (!isNieuw)
        {
            bool typeGewijzigd = !string.Equals(vorigeType, item.TestamentType, StringComparison.OrdinalIgnoreCase);
            bool notarisGewijzigd = !string.Equals(vorigeNotaris, item.NotarisContact?.Naam, StringComparison.OrdinalIgnoreCase);

            if (typeGewijzigd || notarisGewijzigd)
            {
                var snapshotData = new
                {
                    testament = item.Adapt<TestamentInfoResponse>(),
                    begunstigden = check.Begunstigden.Adapt<List<BegunstigdeResponse>>(),
                    executeurs = check.Executeurs.Adapt<List<ExecuteurResponse>>(),
                };

                var maxVersie = await _snapshots.GetMaxVersieAsync(item.Id);

                var veranderingen = new List<string>();
                if (typeGewijzigd) veranderingen.Add($"Testament type gewijzigd van '{vorigeType}' naar '{item.TestamentType}'");
                if (notarisGewijzigd) veranderingen.Add($"Notaris gewijzigd van '{vorigeNotaris}' naar '{item.NotarisContact?.Naam}'");

                var autoSnapshot = new TestamentSnapshot
                {
                    TestamentInfoId = item.Id,
                    Versie = maxVersie + 1,
                    Notitie = $"Automatisch snapshot: {string.Join("; ", veranderingen)}",
                    SnapshotJson = JsonSerializer.Serialize(snapshotData,
                        new JsonSerializerOptions { WriteIndented = false }),
                };
                await _snapshots.AddAsync(autoSnapshot);
                await _snapshots.CommitAsync();
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
        var check = await _checkRepo.GetCheckDataAsync();
        var eigenaar = check.Eigenaar;
        var testament = check.Testament;
        var erfgenamen = check.Erfgenamen;
        var begunstigden = check.Begunstigden;

        string[] kindRelaties = _erfbelasting.KindRelatiesLegitimairePortie;
        var kinderen = erfgenamen
            .Where(e => kindRelaties.Any(r => e.Relatie.Contains(r, StringComparison.OrdinalIgnoreCase)))
            .ToList();

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
