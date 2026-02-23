using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Rules;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/erfgenamen")]
public class ErfgenamenController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly IErfbelastingService _erfbelastingService;

    public ErfgenamenController(LumioDbContext db, IErfbelastingService erfbelastingService)
    {
        _db = db;
        _erfbelastingService = erfbelastingService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ErfgenaamResponse>>> GetAll()
    {
        var items = await _db.Erfgenamen.OrderBy(e => e.Achternaam).ToListAsync();
        return Ok(items.Adapt<List<ErfgenaamResponse>>());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ErfgenaamResponse>> GetById(Guid id)
    {
        var item = await _db.Erfgenamen.FindAsync(id);
        if (item is null) return NotFound();
        return Ok(item.Adapt<ErfgenaamResponse>());
    }

    [HttpPost]
    public async Task<ActionResult<ErfgenaamResponse>> Create([FromBody] ErfgenaamUpsertRequest request)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<Erfgenaam>();
        item.EigenaarId = eigenaar.Id;
        _db.Erfgenamen.Add(item);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item.Adapt<ErfgenaamResponse>());
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ErfgenaamResponse>> Update(Guid id, [FromBody] ErfgenaamUpsertRequest request)
    {
        var item = await _db.Erfgenamen.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        return Ok(item.Adapt<ErfgenaamResponse>());
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _db.Erfgenamen.FindAsync(id);
        if (item is null) return NotFound();

        _db.Erfgenamen.Remove(item);
        await _db.SaveChangesAsync();
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

        // Bereken netto nalatenschap
        var totaalBezittingen = await _db.FysiekeBezittingen.SumAsync(f => f.GeschatteWaarde ?? 0m);
        var totaalSaldi = await _db.Bankrekeningen.SumAsync(b => b.Saldo ?? 0m);
        var totaalVerzekeringen = await _db.Verzekeringen.SumAsync(v => v.VerzekerdBedrag ?? 0m);
        var totaalSchulden = await _db.Schulden.SumAsync(s => s.Bedrag);
        var (_, nettoNalatenschap) = NalatenschapHelper.Bereken(totaalBezittingen, totaalSaldi, totaalVerzekeringen, totaalSchulden);

        // Bouw facts
        var facts = new ErfbelastingFacts(
            nettoNalatenschap,
            erfgenamen.Select(e => new ErfgenaamFact(
                e.Id,
                string.IsNullOrEmpty(e.Tussenvoegsel)
                    ? $"{e.Voornaam} {e.Achternaam}"
                    : $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}",
                e.Relatie)).ToList());

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
