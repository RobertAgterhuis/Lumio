using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/noodcontacten")]
public class NoodcontactenController : ControllerBase
{
    private readonly LumioDbContext _db;

    public NoodcontactenController(LumioDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<NoodcontactResponse>>> GetAll()
    {
        var items = await _db.Noodcontacten.OrderBy(n => n.Naam).ToListAsync();
        return Ok(items.Adapt<List<NoodcontactResponse>>());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NoodcontactResponse>> GetById(Guid id)
    {
        var item = await _db.Noodcontacten.FindAsync(id);
        if (item is null) return NotFound();
        return Ok(item.Adapt<NoodcontactResponse>());
    }

    [HttpPost]
    public async Task<ActionResult<NoodcontactResponse>> Create([FromBody] NoodcontactUpsertRequest request)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<Noodcontact>();
        item.EigenaarId = eigenaar.Id;
        _db.Noodcontacten.Add(item);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item.Adapt<NoodcontactResponse>());
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<NoodcontactResponse>> Update(Guid id, [FromBody] NoodcontactUpsertRequest request)
    {
        var item = await _db.Noodcontacten.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        return Ok(item.Adapt<NoodcontactResponse>());
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _db.Noodcontacten.FindAsync(id);
        if (item is null) return NotFound();

        _db.Noodcontacten.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
