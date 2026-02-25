using Lumio.Api.Data;
using Lumio.Api.Domain.FuneralWishes;
using Lumio.Api.Dtos.FuneralWishes;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/uitvaart")]
public class UitvaartController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly IAuditService _audit;

    public UitvaartController(LumioDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<UitvaartWensenResponse>> Get()
    {
        var item = await _db.UitvaartWensen.FirstOrDefaultAsync();
        if (item is null) return NotFound();
        return Ok(item.Adapt<UitvaartWensenResponse>());
    }

    [HttpPut]
    public async Task<ActionResult<UitvaartWensenResponse>> Upsert([FromBody] UitvaartWensenUpsertRequest request)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = await _db.UitvaartWensen.FirstOrDefaultAsync();
        if (item is null)
        {
            item = request.Adapt<Domain.FuneralWishes.UitvaartWensen>();
            item.EigenaarId = eigenaar.Id;
            _db.UitvaartWensen.Add(item);
        }
        else
        {
            request.Adapt(item);
        }

        await _db.SaveChangesAsync();
        await _audit.LogAsync("Opgeslagen", "UitvaartWens", item.Id);
        return Ok(item.Adapt<UitvaartWensenResponse>());
    }

    [HttpGet("details")]
    public async Task<ActionResult<List<CeremonieDetailResponse>>> GetDetails()
    {
        var uitvaart = await _db.UitvaartWensen.FirstOrDefaultAsync();
        if (uitvaart is null) return Ok(new List<CeremonieDetailResponse>());

        var items = await _db.CeremonieDetails
            .Where(c => c.UitvaartWensenId == uitvaart.Id)
            .OrderBy(c => c.Volgorde)
            .ToListAsync();
        return Ok(items.Adapt<List<CeremonieDetailResponse>>());
    }

    [HttpPost("details")]
    public async Task<ActionResult<CeremonieDetailResponse>> CreateDetail([FromBody] CeremonieDetailUpsertRequest request)
    {
        var uitvaart = await _db.UitvaartWensen.FirstOrDefaultAsync();
        if (uitvaart is null)
            return BadRequest(new { error = "Maak eerst uitvaartwensen aan." });

        var item = request.Adapt<CeremonieDetail>();
        item.UitvaartWensenId = uitvaart.Id;
        _db.CeremonieDetails.Add(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Aangemaakt", "CeremonieDetail", item.Id);
        return Created($"/api/uitvaart/details/{item.Id}", item.Adapt<CeremonieDetailResponse>());
    }

    [HttpPut("details/{id:guid}")]
    public async Task<ActionResult<CeremonieDetailResponse>> UpdateDetail(Guid id, [FromBody] CeremonieDetailUpsertRequest request)
    {
        var item = await _db.CeremonieDetails.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "CeremonieDetail", id);
        return Ok(item.Adapt<CeremonieDetailResponse>());
    }

    [HttpDelete("details/{id:guid}")]
    public async Task<IActionResult> DeleteDetail(Guid id)
    {
        var item = await _db.CeremonieDetails.FindAsync(id);
        if (item is null) return NotFound();

        _db.CeremonieDetails.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "CeremonieDetail", id);
        return NoContent();
    }

    // --- Genodigden ---

    [HttpGet("genodigden")]
    public async Task<ActionResult<List<UitvaartGenodigdeResponse>>> GetGenodigden()
    {
        var uitvaart = await _db.UitvaartWensen.FirstOrDefaultAsync();
        if (uitvaart is null) return Ok(new List<UitvaartGenodigdeResponse>());

        var items = await _db.UitvaartGenodigden
            .Where(g => g.UitvaartWensenId == uitvaart.Id)
            .OrderBy(g => g.Naam)
            .ToListAsync();
        return Ok(items.Adapt<List<UitvaartGenodigdeResponse>>());
    }

    [HttpPost("genodigden")]
    public async Task<ActionResult<UitvaartGenodigdeResponse>> CreateGenodigde([FromBody] UitvaartGenodigdeUpsertRequest request)
    {
        var uitvaart = await _db.UitvaartWensen.FirstOrDefaultAsync();
        if (uitvaart is null)
            return BadRequest(new { error = "Maak eerst uitvaartwensen aan." });

        var item = request.Adapt<UitvaartGenodigde>();
        item.UitvaartWensenId = uitvaart.Id;
        _db.UitvaartGenodigden.Add(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Aangemaakt", "UitvaartGenodigde", item.Id);
        return Created($"/api/uitvaart/genodigden/{item.Id}", item.Adapt<UitvaartGenodigdeResponse>());
    }

    [HttpPut("genodigden/{id:guid}")]
    public async Task<ActionResult<UitvaartGenodigdeResponse>> UpdateGenodigde(Guid id, [FromBody] UitvaartGenodigdeUpsertRequest request)
    {
        var item = await _db.UitvaartGenodigden.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "UitvaartGenodigde", id);
        return Ok(item.Adapt<UitvaartGenodigdeResponse>());
    }

    [HttpDelete("genodigden/{id:guid}")]
    public async Task<IActionResult> DeleteGenodigde(Guid id)
    {
        var item = await _db.UitvaartGenodigden.FindAsync(id);
        if (item is null) return NotFound();

        _db.UitvaartGenodigden.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "UitvaartGenodigde", id);
        return NoContent();
    }
}
