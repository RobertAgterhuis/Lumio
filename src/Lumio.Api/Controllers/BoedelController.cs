using Lumio.Api.Data;
using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Dtos.AssetRegistry;
using Lumio.Api.Rules;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/boedel")]
public class BoedelController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly IAuditService _audit;

    public BoedelController(LumioDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    private async Task<Guid?> GetEigenaarId()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        return eigenaar?.Id;
    }

    // --- Financieel Samenvatting (P-M3) ---

    [HttpGet("samenvatting")]
    public async Task<IActionResult> GetSamenvatting()
    {
        var eigenaarId = await GetEigenaarId();
        if (eigenaarId is null) return NotFound(new { error = "Geen eigenaar profiel gevonden." });
        var eid = eigenaarId.Value;

        var bezittingen = await _db.FysiekeBezittingen.Where(f => f.EigenaarId == eid).ToListAsync();
        var rekeningen = await _db.Bankrekeningen.Where(b => b.EigenaarId == eid).ToListAsync();
        var verzekeringen = await _db.Verzekeringen.Where(v => v.EigenaarId == eid).ToListAsync();
        var schulden = await _db.Schulden.Where(s => s.EigenaarId == eid).ToListAsync();

        var totaalBezittingen = bezittingen.Sum(b => b.GeschatteWaarde ?? 0);
        var totaalSaldi = rekeningen.Sum(r => r.Saldo ?? 0);
        var totaalVerzekeringen = verzekeringen.Sum(v => v.VerzekerdBedrag ?? 0);
        var totaalVerzekeringenMetBegunstigde = verzekeringen
            .Where(v => !string.IsNullOrEmpty(v.Begunstigde))
            .Sum(v => v.VerzekerdBedrag ?? 0);
        var totaalSchulden = schulden.Sum(s => s.Bedrag);
        var (brutoNalatenschap, nettoNalatenschap) = NalatenschapHelper.Bereken(
            totaalBezittingen, totaalSaldi, totaalVerzekeringen, totaalSchulden, totaalVerzekeringenMetBegunstigde);

        return Ok(new
        {
            totaalBezittingen,
            totaalSaldi,
            totaalVerzekeringen,
            totaalSchulden,
            brutoNalatenschap,
            nettoNalatenschap,
            aantalBezittingen = bezittingen.Count,
            aantalRekeningen = rekeningen.Count,
            aantalVerzekeringen = verzekeringen.Count,
            aantalSchulden = schulden.Count
        });
    }

    // --- Bezittingen ---

    [HttpGet("bezittingen")]
    public async Task<ActionResult<List<FysiekBezitResponse>>> GetBezittingen()
    {
        var items = await _db.FysiekeBezittingen
            .Include(f => f.LinkedSchulden)
            .OrderBy(f => f.Categorie)
            .ToListAsync();
        return Ok(items.Select(ToBezitResponse).ToList());
    }

    [HttpPost("bezittingen")]
    public async Task<ActionResult<FysiekBezitResponse>> CreateBezit([FromBody] FysiekBezitUpsertRequest request)
    {
        var eigenaarId = await GetEigenaarId();
        if (eigenaarId is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<FysiekBezit>();
        item.EigenaarId = eigenaarId.Value;
        _db.FysiekeBezittingen.Add(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Aangemaakt", "FysiekBezit", item.Id);
        return Created($"/api/boedel/bezittingen/{item.Id}", ToBezitResponse(item));
    }

    [HttpPut("bezittingen/{id:guid}")]
    public async Task<ActionResult<FysiekBezitResponse>> UpdateBezit(Guid id, [FromBody] FysiekBezitUpsertRequest request)
    {
        var item = await _db.FysiekeBezittingen
            .Include(f => f.LinkedSchulden)
            .FirstOrDefaultAsync(f => f.Id == id);
        if (item is null) return NotFound();
        request.Adapt(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "FysiekBezit", id);
        return Ok(ToBezitResponse(item));
    }

    [HttpDelete("bezittingen/{id:guid}")]
    public async Task<IActionResult> DeleteBezit(Guid id)
    {
        var item = await _db.FysiekeBezittingen.FindAsync(id);
        if (item is null) return NotFound();
        _db.FysiekeBezittingen.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "FysiekBezit", id);
        return NoContent();
    }

    private static FysiekBezitResponse ToBezitResponse(FysiekBezit f) => new(
        f.Id, f.Categorie, f.Omschrijving,
        f.GeschatteWaarde, f.Locatie,
        f.BestemdeErfgenaam, f.VermogensSoort,
        f.Notities, f.KadastraalNummer, f.Kenteken, f.KvKNummer,
        f.LinkedSchulden.Select(s => new BezitSchuldSummary(
            s.Id, s.Schuldeiser, s.Type, s.Bedrag,
            s.MaandelijkseAflossing, s.LeaseMaatschappij,
            s.Rentepercentage, s.Einddatum)).ToList());

    // --- Bankrekeningen ---

    [HttpGet("bankrekeningen")]
    public async Task<ActionResult<List<BankrekeningResponse>>> GetBankrekeningen()
    {
        var items = await _db.Bankrekeningen.OrderBy(b => b.BankNaam).ToListAsync();
        return Ok(items.Adapt<List<BankrekeningResponse>>());
    }

    [HttpPost("bankrekeningen")]
    public async Task<ActionResult<BankrekeningResponse>> CreateBankrekening([FromBody] BankrekeningUpsertRequest request)
    {
        var eigenaarId = await GetEigenaarId();
        if (eigenaarId is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<Bankrekening>();
        item.EigenaarId = eigenaarId.Value;
        _db.Bankrekeningen.Add(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Aangemaakt", "Bankrekening", item.Id);
        return Created($"/api/boedel/bankrekeningen/{item.Id}", item.Adapt<BankrekeningResponse>());
    }

    [HttpPut("bankrekeningen/{id:guid}")]
    public async Task<ActionResult<BankrekeningResponse>> UpdateBankrekening(Guid id, [FromBody] BankrekeningUpsertRequest request)
    {
        var item = await _db.Bankrekeningen.FindAsync(id);
        if (item is null) return NotFound();
        request.Adapt(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "Bankrekening", id);
        return Ok(item.Adapt<BankrekeningResponse>());
    }

    [HttpDelete("bankrekeningen/{id:guid}")]
    public async Task<IActionResult> DeleteBankrekening(Guid id)
    {
        var item = await _db.Bankrekeningen.FindAsync(id);
        if (item is null) return NotFound();
        _db.Bankrekeningen.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "Bankrekening", id);
        return NoContent();
    }

    // --- Verzekeringen ---

    [HttpGet("verzekeringen")]
    public async Task<ActionResult<List<VerzekeringResponse>>> GetVerzekeringen()
    {
        var items = await _db.Verzekeringen.OrderBy(v => v.Verzekeraar).ToListAsync();
        return Ok(items.Adapt<List<VerzekeringResponse>>());
    }

    [HttpPost("verzekeringen")]
    public async Task<ActionResult<VerzekeringResponse>> CreateVerzekering([FromBody] VerzekeringUpsertRequest request)
    {
        var eigenaarId = await GetEigenaarId();
        if (eigenaarId is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<Verzekering>();
        item.EigenaarId = eigenaarId.Value;
        _db.Verzekeringen.Add(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Aangemaakt", "Verzekering", item.Id);
        return Created($"/api/boedel/verzekeringen/{item.Id}", item.Adapt<VerzekeringResponse>());
    }

    [HttpPut("verzekeringen/{id:guid}")]
    public async Task<ActionResult<VerzekeringResponse>> UpdateVerzekering(Guid id, [FromBody] VerzekeringUpsertRequest request)
    {
        var item = await _db.Verzekeringen.FindAsync(id);
        if (item is null) return NotFound();
        request.Adapt(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "Verzekering", id);
        return Ok(item.Adapt<VerzekeringResponse>());
    }

    [HttpDelete("verzekeringen/{id:guid}")]
    public async Task<IActionResult> DeleteVerzekering(Guid id)
    {
        var item = await _db.Verzekeringen.FindAsync(id);
        if (item is null) return NotFound();
        _db.Verzekeringen.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "Verzekering", id);
        return NoContent();
    }

    // --- Schulden ---

    [HttpGet("schulden")]
    public async Task<ActionResult<List<SchuldResponse>>> GetSchulden()
    {
        var eigenaarId = await GetEigenaarId();
        if (eigenaarId is null) return NotFound(new { error = "Geen eigenaar profiel gevonden." });

        var items = await _db.Schulden
            .Include(s => s.Bezit)
            .Where(s => s.EigenaarId == eigenaarId.Value)
            .OrderBy(s => s.Schuldeiser)
            .ToListAsync();
        return Ok(items.Select(s => ToSchuldResponse(s)).ToList());
    }

    // --- Bezittingen / gekoppelde schulden ---

    [HttpGet("bezittingen/{bezitId:guid}/schulden")]
    public async Task<ActionResult<List<SchuldResponse>>> GetBezitSchulden(Guid bezitId)
    {
        var bezit = await _db.FysiekeBezittingen.FindAsync(bezitId);
        if (bezit is null) return NotFound();

        var items = await _db.Schulden
            .Include(s => s.Bezit)
            .Where(s => s.BezitId == bezitId)
            .OrderBy(s => s.Schuldeiser)
            .ToListAsync();
        return Ok(items.Select(s => ToSchuldResponse(s)).ToList());
    }

    [HttpPost("bezittingen/{bezitId:guid}/schulden")]
    public async Task<ActionResult<SchuldResponse>> CreateBezitSchuld(Guid bezitId, [FromBody] BezitSchuldUpsertRequest request)
    {
        var eigenaarId = await GetEigenaarId();
        if (eigenaarId is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var bezit = await _db.FysiekeBezittingen.FindAsync(bezitId);
        if (bezit is null) return NotFound(new { error = "Bezitting niet gevonden." });

        var schuld = new Schuld
        {
            EigenaarId = eigenaarId.Value,
            BezitId = bezitId,
            Schuldeiser = request.Schuldeiser,
            Type = request.Type,
            Bedrag = request.Bedrag,
            MaandelijkseAflossing = request.MaandelijkseAflossing,
            LeaseMaatschappij = request.LeaseMaatschappij,
            Rentepercentage = request.Rentepercentage,
            Einddatum = request.Einddatum,
        };
        _db.Schulden.Add(schuld);
        await _db.SaveChangesAsync();

        // Reload with navigation for response
        schuld.Bezit = bezit;
        await _audit.LogAsync("Aangemaakt", "Schuld", schuld.Id);
        return Created($"/api/boedel/bezittingen/{bezitId}/schulden/{schuld.Id}", ToSchuldResponse(schuld));
    }

    [HttpDelete("bezittingen/{bezitId:guid}/schulden/{schuldId:guid}")]
    public async Task<IActionResult> DeleteBezitSchuld(Guid bezitId, Guid schuldId)
    {
        var schuld = await _db.Schulden.FirstOrDefaultAsync(s => s.Id == schuldId && s.BezitId == bezitId);
        if (schuld is null) return NotFound();
        _db.Schulden.Remove(schuld);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "Schuld", schuldId);
        return NoContent();
    }

    private static SchuldResponse ToSchuldResponse(Schuld s) => new(
        s.Id, s.Schuldeiser,
        s.SchuldeiserTelefoon, s.SchuldeiserEmail,
        s.Type, s.Bedrag, s.MaandelijkseAflossing,
        s.Referentie, s.VermogensSoort, s.Notities,
        s.HypotheekVorm, s.Rentepercentage,
        s.MaandelijkseRente, s.Einddatum, s.Restschuld,
        s.LeaseMaatschappij,
        s.BezitId, s.Bezit?.Omschrijving);

    [HttpPost("schulden")]
    public async Task<ActionResult<SchuldResponse>> CreateSchuld([FromBody] SchuldUpsertRequest request)
    {
        var eigenaarId = await GetEigenaarId();
        if (eigenaarId is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<Schuld>();
        item.EigenaarId = eigenaarId.Value;
        _db.Schulden.Add(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Aangemaakt", "Schuld", item.Id);
        return Created($"/api/boedel/schulden/{item.Id}", ToSchuldResponse(item));
    }

    [HttpPut("schulden/{id:guid}")]
    public async Task<ActionResult<SchuldResponse>> UpdateSchuld(Guid id, [FromBody] SchuldUpsertRequest request)
    {
        var item = await _db.Schulden.FindAsync(id);
        if (item is null) return NotFound();
        request.Adapt(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "Schuld", id);
        return Ok(ToSchuldResponse(item));
    }

    [HttpDelete("schulden/{id:guid}")]
    public async Task<IActionResult> DeleteSchuld(Guid id)
    {
        var item = await _db.Schulden.FindAsync(id);
        if (item is null) return NotFound();
        _db.Schulden.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "Schuld", id);
        return NoContent();
    }
}
