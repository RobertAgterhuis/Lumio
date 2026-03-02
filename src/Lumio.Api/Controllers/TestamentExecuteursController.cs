using Lumio.Api.Data;
using Lumio.Api.Domain.Testament;
using Lumio.Api.Dtos.Testament;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/testament/executeurs")]
public class TestamentExecuteursController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly IAuditService _audit;

    public TestamentExecuteursController(LumioDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<List<ExecuteurResponse>>> GetExecuteurs()
    {
        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        if (testament is null) return Ok(new List<ExecuteurResponse>());

        var items = await _db.Executeurs
            .Where(e => e.TestamentInfoId == testament.Id)
            .ToListAsync();
        return Ok(items.Adapt<List<ExecuteurResponse>>());
    }

    [HttpPost]
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

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ExecuteurResponse>> UpdateExecuteur(Guid id, [FromBody] ExecuteurUpsertRequest request)
    {
        var item = await _db.Executeurs.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "Executeur", id);
        return Ok(item.Adapt<ExecuteurResponse>());
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteExecuteur(Guid id)
    {
        var item = await _db.Executeurs.FindAsync(id);
        if (item is null) return NotFound();

        _db.Executeurs.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "Executeur", id);
        return NoContent();
    }
}
