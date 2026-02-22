using Lumio.Api.Data;
using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Dtos.AssetRegistry;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/boedel")]
public class BoedelController : ControllerBase
{
    private readonly LumioDbContext _db;

    public BoedelController(LumioDbContext db) => _db = db;

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
        var totaalSchulden = schulden.Sum(s => s.Bedrag);
        var brutoNalatenschap = totaalBezittingen + totaalSaldi + totaalVerzekeringen;
        var nettoNalatenschap = brutoNalatenschap - totaalSchulden;

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
        var items = await _db.FysiekeBezittingen.OrderBy(f => f.Categorie).ToListAsync();
        return Ok(items.Adapt<List<FysiekBezitResponse>>());
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
        return Created($"/api/boedel/bezittingen/{item.Id}", item.Adapt<FysiekBezitResponse>());
    }

    [HttpPut("bezittingen/{id:guid}")]
    public async Task<ActionResult<FysiekBezitResponse>> UpdateBezit(Guid id, [FromBody] FysiekBezitUpsertRequest request)
    {
        var item = await _db.FysiekeBezittingen.FindAsync(id);
        if (item is null) return NotFound();
        request.Adapt(item);
        await _db.SaveChangesAsync();
        return Ok(item.Adapt<FysiekBezitResponse>());
    }

    [HttpDelete("bezittingen/{id:guid}")]
    public async Task<IActionResult> DeleteBezit(Guid id)
    {
        var item = await _db.FysiekeBezittingen.FindAsync(id);
        if (item is null) return NotFound();
        _db.FysiekeBezittingen.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

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
        return Created($"/api/boedel/bankrekeningen/{item.Id}", item.Adapt<BankrekeningResponse>());
    }

    [HttpPut("bankrekeningen/{id:guid}")]
    public async Task<ActionResult<BankrekeningResponse>> UpdateBankrekening(Guid id, [FromBody] BankrekeningUpsertRequest request)
    {
        var item = await _db.Bankrekeningen.FindAsync(id);
        if (item is null) return NotFound();
        request.Adapt(item);
        await _db.SaveChangesAsync();
        return Ok(item.Adapt<BankrekeningResponse>());
    }

    [HttpDelete("bankrekeningen/{id:guid}")]
    public async Task<IActionResult> DeleteBankrekening(Guid id)
    {
        var item = await _db.Bankrekeningen.FindAsync(id);
        if (item is null) return NotFound();
        _db.Bankrekeningen.Remove(item);
        await _db.SaveChangesAsync();
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
        return Created($"/api/boedel/verzekeringen/{item.Id}", item.Adapt<VerzekeringResponse>());
    }

    [HttpPut("verzekeringen/{id:guid}")]
    public async Task<ActionResult<VerzekeringResponse>> UpdateVerzekering(Guid id, [FromBody] VerzekeringUpsertRequest request)
    {
        var item = await _db.Verzekeringen.FindAsync(id);
        if (item is null) return NotFound();
        request.Adapt(item);
        await _db.SaveChangesAsync();
        return Ok(item.Adapt<VerzekeringResponse>());
    }

    [HttpDelete("verzekeringen/{id:guid}")]
    public async Task<IActionResult> DeleteVerzekering(Guid id)
    {
        var item = await _db.Verzekeringen.FindAsync(id);
        if (item is null) return NotFound();
        _db.Verzekeringen.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // --- Schulden ---

    [HttpGet("schulden")]
    public async Task<ActionResult<List<SchuldResponse>>> GetSchulden()
    {
        var items = await _db.Schulden.OrderBy(s => s.Schuldeiser).ToListAsync();
        return Ok(items.Adapt<List<SchuldResponse>>());
    }

    [HttpPost("schulden")]
    public async Task<ActionResult<SchuldResponse>> CreateSchuld([FromBody] SchuldUpsertRequest request)
    {
        var eigenaarId = await GetEigenaarId();
        if (eigenaarId is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<Schuld>();
        item.EigenaarId = eigenaarId.Value;
        _db.Schulden.Add(item);
        await _db.SaveChangesAsync();
        return Created($"/api/boedel/schulden/{item.Id}", item.Adapt<SchuldResponse>());
    }

    [HttpPut("schulden/{id:guid}")]
    public async Task<ActionResult<SchuldResponse>> UpdateSchuld(Guid id, [FromBody] SchuldUpsertRequest request)
    {
        var item = await _db.Schulden.FindAsync(id);
        if (item is null) return NotFound();
        request.Adapt(item);
        await _db.SaveChangesAsync();
        return Ok(item.Adapt<SchuldResponse>());
    }

    [HttpDelete("schulden/{id:guid}")]
    public async Task<IActionResult> DeleteSchuld(Guid id)
    {
        var item = await _db.Schulden.FindAsync(id);
        if (item is null) return NotFound();
        _db.Schulden.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
