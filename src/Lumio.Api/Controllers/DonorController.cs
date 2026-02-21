using Lumio.Api.Data;
using Lumio.Api.Domain.DonorRegistration;
using Lumio.Api.Dtos.DonorRegistration;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/donor")]
public class DonorController : ControllerBase
{
    private readonly LumioDbContext _db;

    public DonorController(LumioDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<DonorRegistratieResponse>> Get()
    {
        var item = await _db.DonorRegistraties.FirstOrDefaultAsync();
        if (item is null) return NotFound();
        return Ok(item.Adapt<DonorRegistratieResponse>());
    }

    [HttpPut]
    public async Task<ActionResult<DonorRegistratieResponse>> Upsert([FromBody] DonorRegistratieUpsertRequest request)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = await _db.DonorRegistraties.FirstOrDefaultAsync();
        if (item is null)
        {
            item = request.Adapt<DonorRegistratie>();
            item.EigenaarId = eigenaar.Id;
            _db.DonorRegistraties.Add(item);
        }
        else
        {
            request.Adapt(item);
        }

        await _db.SaveChangesAsync();
        return Ok(item.Adapt<DonorRegistratieResponse>());
    }

    [HttpGet("orgaankeuzes")]
    public async Task<ActionResult<List<OrgaanKeuzeResponse>>> GetOrgaanKeuzes()
    {
        var donor = await _db.DonorRegistraties.FirstOrDefaultAsync();
        if (donor is null) return Ok(new List<OrgaanKeuzeResponse>());

        var items = await _db.OrgaanKeuzes
            .Where(o => o.DonorRegistratieId == donor.Id)
            .ToListAsync();
        return Ok(items.Adapt<List<OrgaanKeuzeResponse>>());
    }

    [HttpPost("orgaankeuzes")]
    public async Task<ActionResult<OrgaanKeuzeResponse>> CreateOrgaanKeuze([FromBody] OrgaanKeuzeUpsertRequest request)
    {
        var donor = await _db.DonorRegistraties.FirstOrDefaultAsync();
        if (donor is null)
            return BadRequest(new { error = "Maak eerst donor registratie aan." });

        var item = request.Adapt<OrgaanKeuze>();
        item.DonorRegistratieId = donor.Id;
        _db.OrgaanKeuzes.Add(item);
        await _db.SaveChangesAsync();
        return Created($"/api/donor/orgaankeuzes/{item.Id}", item.Adapt<OrgaanKeuzeResponse>());
    }

    [HttpPut("orgaankeuzes/{id:guid}")]
    public async Task<ActionResult<OrgaanKeuzeResponse>> UpdateOrgaanKeuze(Guid id, [FromBody] OrgaanKeuzeUpsertRequest request)
    {
        var item = await _db.OrgaanKeuzes.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        return Ok(item.Adapt<OrgaanKeuzeResponse>());
    }

    [HttpDelete("orgaankeuzes/{id:guid}")]
    public async Task<IActionResult> DeleteOrgaanKeuze(Guid id)
    {
        var item = await _db.OrgaanKeuzes.FindAsync(id);
        if (item is null) return NotFound();

        _db.OrgaanKeuzes.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
