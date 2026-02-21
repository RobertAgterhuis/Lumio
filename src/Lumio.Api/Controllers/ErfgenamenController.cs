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
}
