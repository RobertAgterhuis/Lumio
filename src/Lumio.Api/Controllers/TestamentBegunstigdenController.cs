using Lumio.Api.Data;
using Lumio.Api.Domain.Testament;
using Lumio.Api.Dtos.Testament;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/testament/begunstigden")]
public class TestamentBegunstigdenController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly IAuditService _audit;

    public TestamentBegunstigdenController(LumioDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<List<BegunstigdeResponse>>> GetBegunstigden()
    {
        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        if (testament is null) return Ok(new List<BegunstigdeResponse>());

        var items = await _db.Begunstigden
            .Where(b => b.TestamentInfoId == testament.Id)
            .ToListAsync();
        return Ok(items.Adapt<List<BegunstigdeResponse>>());
    }

    [HttpPost]
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

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BegunstigdeResponse>> UpdateBegunstigde(Guid id, [FromBody] BegunstigdeUpsertRequest request)
    {
        var item = await _db.Begunstigden.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "Begunstigde", id);
        return Ok(item.Adapt<BegunstigdeResponse>());
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteBegunstigde(Guid id)
    {
        var item = await _db.Begunstigden.FindAsync(id);
        if (item is null) return NotFound();

        _db.Begunstigden.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "Begunstigde", id);
        return NoContent();
    }
}
