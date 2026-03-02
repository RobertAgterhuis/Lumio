using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Repositories;
using Lumio.Api.Rules;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Services;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/erfgenamen")]
public class ErfgenamenController : ControllerBase
{
    private readonly IErfgenaamRepository _erfgenaamRepo;
    private readonly IEigenaarRepository _eigenaarRepo;
    private readonly LumioDbContext _db;  // retained for complex aggregate queries (BerekenErfbelasting)
    private readonly IErfbelastingService _erfbelastingService;
    private readonly IAuditService _audit;

    public ErfgenamenController(
        IErfgenaamRepository erfgenaamRepo,
        IEigenaarRepository eigenaarRepo,
        LumioDbContext db,
        IErfbelastingService erfbelastingService,
        IAuditService audit)
    {
        _erfgenaamRepo = erfgenaamRepo;
        _eigenaarRepo = eigenaarRepo;
        _db = db;
        _erfbelastingService = erfbelastingService;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<List<ErfgenaamResponse>>> GetAll()
    {
        var items = await _erfgenaamRepo.GetAllByNameAsync();
        return Ok(items.Adapt<List<ErfgenaamResponse>>());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ErfgenaamResponse>> GetById(Guid id)
    {
        var item = await _erfgenaamRepo.FindAsync(id);
        if (item is null) return NotFound();
        return Ok(item.Adapt<ErfgenaamResponse>());
    }

    [HttpPost]
    public async Task<ActionResult<ErfgenaamResponse>> Create([FromBody] ErfgenaamUpsertRequest request)
    {
        var eigenaar = await _eigenaarRepo.FindAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<Erfgenaam>();
        item.EigenaarId = eigenaar.Id;
        await _erfgenaamRepo.AddAsync(item);
        await _erfgenaamRepo.CommitAsync();
        await _audit.LogAsync("Aangemaakt", "Erfgenaam", item.Id);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item.Adapt<ErfgenaamResponse>());
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ErfgenaamResponse>> Update(Guid id, [FromBody] ErfgenaamUpsertRequest request)
    {
        var item = await _erfgenaamRepo.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _erfgenaamRepo.CommitAsync();
        await _audit.LogAsync("Gewijzigd", "Erfgenaam", id);
        return Ok(item.Adapt<ErfgenaamResponse>());
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _erfgenaamRepo.FindAsync(id);
        if (item is null) return NotFound();

        // S3-34: cascade-delete gekoppelde toewijzingen — encapsulated in RemoveAsync
        await _erfgenaamRepo.RemoveAsync(item);
        await _erfgenaamRepo.CommitAsync();
        await _audit.LogAsync("Verwijderd", "Erfgenaam", id);
        return NoContent();
    }

    /// <summary>
    /// Indicatieve erfbelasting-berekening per erfgenaam (tarieven 2025).
    /// Let op: dit is een schatting — geen juridisch advies.
    /// </summary>
    [HttpGet("erfbelasting")]
    public async Task<IActionResult> BerekenErfbelasting()
    {
        var erfgenamen = await _db.Erfgenamen.ToListAsync();
        if (erfgenamen.Count == 0)
        {
            var leegResult = _erfbelastingService.Bereken(new ErfbelastingFacts(0, []));
            return Ok(new { resultaten = Array.Empty<object>(), nettoNalatenschap = 0m, disclaimer = leegResult.Resultaat.Disclaimer });
        }

        // Bereken netto nalatenschap (S5-14: verzekeringen met begunstigde tellen niet mee)
        var totaalBezittingen = await _db.FysiekeBezittingen.SumAsync(f => f.GeschatteWaarde ?? 0m);
        var totaalSaldi = await _db.Bankrekeningen.SumAsync(b => b.Saldo ?? 0m);
        var totaalVerzekeringen = await _db.Verzekeringen.SumAsync(v => v.VerzekerdBedrag ?? 0m);
        var totaalVerzekeringenMetBegunstigde = await _db.Verzekeringen
            .Where(v => !string.IsNullOrEmpty(v.Begunstigde))
            .SumAsync(v => v.VerzekerdBedrag ?? 0m);
        var totaalSchulden = await _db.Schulden.SumAsync(s => s.Bedrag);
        var (_, nettoNalatenschap) = NalatenschapHelper.Bereken(
            totaalBezittingen, totaalSaldi, totaalVerzekeringen, totaalSchulden, totaalVerzekeringenMetBegunstigde);

        // Bouw facts
        // S5-22: Laad testamentaire percentages (Begunstigde.Percentage)
        var testament = await _db.Testamenten.Include(t => t.Begunstigden).FirstOrDefaultAsync();
        var portiePerNaam = (testament?.Begunstigden ?? [])
            .Where(b => b.Percentage.HasValue && b.Percentage.Value > 0)
            .ToDictionary(
                b => b.Naam.Trim().ToLowerInvariant(),
                b => b.Percentage!.Value);

        var facts = new ErfbelastingFacts(
            nettoNalatenschap,
            erfgenamen.Select(e =>
            {
                var volledigenaam = string.IsNullOrEmpty(e.Tussenvoegsel)
                    ? $"{e.Voornaam} {e.Achternaam}"
                    : $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}";
                portiePerNaam.TryGetValue(volledigenaam.Trim().ToLowerInvariant(), out var portie);
                return new ErfgenaamFact(e.Id, volledigenaam, e.Relatie, portie > 0 ? portie : null);
            }).ToList());

        // Delegeer naar service
        var result = _erfbelastingService.Bereken(facts);

        return Ok(new
        {
            resultaten = result.Resultaat.Resultaten,
            nettoNalatenschap = result.Resultaat.NettoNalatenschap,
            aantalErfgenamen = result.Resultaat.AantalErfgenamen,
            disclaimer = result.Resultaat.Disclaimer,
        });
    }
}
