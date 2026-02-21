using Lumio.Api.Data;
using Lumio.Api.Domain.Testament;
using Lumio.Api.Dtos.Testament;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/testament")]
public class TestamentController : ControllerBase
{
    private readonly LumioDbContext _db;

    public TestamentController(LumioDbContext db) => _db = db;

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

        var item = await _db.Testamenten.FirstOrDefaultAsync();
        if (item is null)
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
        return Ok(item.Adapt<TestamentInfoResponse>());
    }

    // --- Begunstigden ---

    [HttpGet("begunstigden")]
    public async Task<ActionResult<List<BegunstigdeResponse>>> GetBegunstigden()
    {
        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        if (testament is null) return Ok(new List<BegunstigdeResponse>());

        var items = await _db.Begunstigden
            .Where(b => b.TestamentInfoId == testament.Id)
            .ToListAsync();
        return Ok(items.Adapt<List<BegunstigdeResponse>>());
    }

    [HttpPost("begunstigden")]
    public async Task<ActionResult<BegunstigdeResponse>> CreateBegunstigde([FromBody] BegunstigdeUpsertRequest request)
    {
        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        if (testament is null) return BadRequest(new { error = "Maak eerst testament informatie aan." });

        var item = request.Adapt<Begunstigde>();
        item.TestamentInfoId = testament.Id;
        _db.Begunstigden.Add(item);
        await _db.SaveChangesAsync();
        return Created($"/api/testament/begunstigden/{item.Id}", item.Adapt<BegunstigdeResponse>());
    }

    [HttpPut("begunstigden/{id:guid}")]
    public async Task<ActionResult<BegunstigdeResponse>> UpdateBegunstigde(Guid id, [FromBody] BegunstigdeUpsertRequest request)
    {
        var item = await _db.Begunstigden.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        return Ok(item.Adapt<BegunstigdeResponse>());
    }

    [HttpDelete("begunstigden/{id:guid}")]
    public async Task<IActionResult> DeleteBegunstigde(Guid id)
    {
        var item = await _db.Begunstigden.FindAsync(id);
        if (item is null) return NotFound();

        _db.Begunstigden.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // --- Executeurs ---

    [HttpGet("executeurs")]
    public async Task<ActionResult<List<ExecuteurResponse>>> GetExecuteurs()
    {
        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        if (testament is null) return Ok(new List<ExecuteurResponse>());

        var items = await _db.Executeurs
            .Where(e => e.TestamentInfoId == testament.Id)
            .ToListAsync();
        return Ok(items.Adapt<List<ExecuteurResponse>>());
    }

    [HttpPost("executeurs")]
    public async Task<ActionResult<ExecuteurResponse>> CreateExecuteur([FromBody] ExecuteurUpsertRequest request)
    {
        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        if (testament is null) return BadRequest(new { error = "Maak eerst testament informatie aan." });

        var item = request.Adapt<Executeur>();
        item.TestamentInfoId = testament.Id;
        _db.Executeurs.Add(item);
        await _db.SaveChangesAsync();
        return Created($"/api/testament/executeurs/{item.Id}", item.Adapt<ExecuteurResponse>());
    }

    [HttpPut("executeurs/{id:guid}")]
    public async Task<ActionResult<ExecuteurResponse>> UpdateExecuteur(Guid id, [FromBody] ExecuteurUpsertRequest request)
    {
        var item = await _db.Executeurs.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        return Ok(item.Adapt<ExecuteurResponse>());
    }

    [HttpDelete("executeurs/{id:guid}")]
    public async Task<IActionResult> DeleteExecuteur(Guid id)
    {
        var item = await _db.Executeurs.FindAsync(id);
        if (item is null) return NotFound();

        _db.Executeurs.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
