using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/erfgenamen")]
public class ErfgenamenController : ControllerBase
{
    private readonly LumioDbContext _db;

    public ErfgenamenController(LumioDbContext db) => _db = db;

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
            return Ok(new { resultaten = Array.Empty<object>(), nettoNalatenschap = 0m, disclaimer = DisclaimerTekst });

        // Bereken netto nalatenschap
        var totaalBezittingen = await _db.FysiekeBezittingen.SumAsync(f => f.GeschatteWaarde ?? 0m);
        var totaalSaldi = await _db.Bankrekeningen.SumAsync(b => b.Saldo ?? 0m);
        var totaalVerzekeringen = await _db.Verzekeringen.SumAsync(v => v.VerzekerdBedrag ?? 0m);
        var totaalSchulden = await _db.Schulden.SumAsync(s => s.Bedrag);
        var nettoNalatenschap = totaalBezittingen + totaalSaldi + totaalVerzekeringen - totaalSchulden;

        // Gelijk verdelen over erfgenamen (vereenvoudigd)
        var deelPerErfgenaam = erfgenamen.Count > 0 ? nettoNalatenschap / erfgenamen.Count : 0m;

        var resultaten = erfgenamen.Select(e =>
        {
            var groep = BepaalTariefgroep(e.Relatie);
            var vrijstelling = groep.Vrijstelling;
            var belastbaar = Math.Max(0, deelPerErfgenaam - vrijstelling);
            var belasting = BerekenBelasting(belastbaar, groep.Schijf1Pct, groep.Schijf2Pct, groep.Schijf1Grens);

            return new
            {
                erfgenaamId = e.Id,
                naam = string.IsNullOrEmpty(e.Tussenvoegsel)
                    ? $"{e.Voornaam} {e.Achternaam}"
                    : $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}",
                relatie = e.Relatie,
                tariefgroep = groep.Naam,
                brutoDeel = deelPerErfgenaam,
                vrijstelling,
                belastbaar,
                erfbelasting = belasting,
                nettoDeel = deelPerErfgenaam - belasting,
            };
        }).ToList();

        return Ok(new
        {
            resultaten,
            nettoNalatenschap,
            aantalErfgenamen = erfgenamen.Count,
            disclaimer = DisclaimerTekst,
        });
    }

    private const string DisclaimerTekst =
        "Dit is een indicatieve berekening op basis van de erfbelastingtarieven 2025. " +
        "De werkelijke erfbelasting kan afwijken door testamentaire bepalingen, " +
        "huwelijkse voorwaarden, schenkingen en andere fiscale factoren. " +
        "Raadpleeg een notaris of belastingadviseur voor een exacte berekening.";

    private static (string Naam, decimal Vrijstelling, decimal Schijf1Pct, decimal Schijf2Pct, decimal Schijf1Grens) BepaalTariefgroep(string relatie)
    {
        var rel = (relatie ?? "").Trim().ToLowerInvariant();

        // Partner
        if (rel.Contains("partner") || rel.Contains("echtgen") || rel.Contains("gehuwd") || rel.Contains("samenwon"))
            return ("Partner (Tariefgroep 1)", 795_156m, 0.10m, 0.20m, 154_197m);

        // Kinderen
        if (rel.Contains("kind") || rel.Contains("zoon") || rel.Contains("dochter") || rel.Contains("stief"))
            return ("Kind (Tariefgroep 1)", 25_187m, 0.10m, 0.20m, 154_197m);

        // Kleinkinderen
        if (rel.Contains("kleinkind") || rel.Contains("kleinzoon") || rel.Contains("kleindochter"))
            return ("Kleinkind (Tariefgroep 1a)", 25_187m, 0.18m, 0.36m, 154_197m);

        // Ouders
        if (rel.Contains("ouder") || rel.Contains("vader") || rel.Contains("moeder"))
            return ("Ouder (Tariefgroep 1)", 56_724m, 0.10m, 0.20m, 154_197m);

        // Broers/zussen
        if (rel.Contains("broer") || rel.Contains("zus") || rel.Contains("zusje"))
            return ("Overig (Tariefgroep 2)", 2_658m, 0.30m, 0.40m, 154_197m);

        // Overig
        return ("Overig (Tariefgroep 2)", 2_658m, 0.30m, 0.40m, 154_197m);
    }

    private static decimal BerekenBelasting(decimal belastbaar, decimal schijf1, decimal schijf2, decimal grens)
    {
        if (belastbaar <= 0) return 0m;
        if (belastbaar <= grens)
            return Math.Round(belastbaar * schijf1, 2);
        return Math.Round(grens * schijf1 + (belastbaar - grens) * schijf2, 2);
    }
}
