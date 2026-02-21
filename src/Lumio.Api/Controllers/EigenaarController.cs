using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/eigenaar")]
public class EigenaarController : ControllerBase
{
    private readonly LumioDbContext _db;

    public EigenaarController(LumioDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<EigenaarResponse>> Get()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return NotFound(new { error = "Eigenaar profiel nog niet aangemaakt." });

        return Ok(eigenaar.Adapt<EigenaarResponse>());
    }

    [HttpPost]
    public async Task<ActionResult<EigenaarResponse>> Create([FromBody] EigenaarUpsertRequest request)
    {
        var existing = await _db.Eigenaren.FirstOrDefaultAsync();
        if (existing is not null)
            return BadRequest(new { error = "Eigenaar profiel bestaat al. Gebruik PUT om te wijzigen." });

        var eigenaar = request.Adapt<Eigenaar>();
        _db.Eigenaren.Add(eigenaar);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), eigenaar.Adapt<EigenaarResponse>());
    }

    [HttpPut]
    public async Task<ActionResult<EigenaarResponse>> Update([FromBody] EigenaarUpsertRequest request)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return NotFound(new { error = "Eigenaar profiel nog niet aangemaakt." });

        request.Adapt(eigenaar);
        await _db.SaveChangesAsync();

        return Ok(eigenaar.Adapt<EigenaarResponse>());
    }
}
