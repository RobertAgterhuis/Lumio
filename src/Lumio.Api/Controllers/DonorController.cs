using Lumio.Api.Data;
using Lumio.Api.Domain.DonorRegistration;
using Lumio.Api.Dtos.DonorRegistration;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/donor")]
public class DonorController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly IAuditService _audit;

    public DonorController(LumioDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<DonorRegistratieResponse>> Get()
    {
        var item = await _db.DonorRegistraties.FirstOrDefaultAsync();
        if (item is null) return NotFound();

        var orgaanKeuzes = await _db.OrgaanKeuzes
            .Where(o => o.DonorRegistratieId == item.Id)
            .ToListAsync();

        var response = new DonorRegistratieResponse(
            item.Id,
            item.EigenaarId,
            item.Keuze,
            item.IsGeregistreerdBijDonorregister,
            item.DonorregisterReferentie,
            item.Toelichting,
            item.BeslisserNaam,
            item.BeslisserRelatie,
            item.BeslisserTelefoon,
            item.AangemaaktOp,
            item.GewijzigdOp,
            orgaanKeuzes.Adapt<List<OrgaanKeuzeResponse>>());
        return Ok(response);
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
        await _audit.LogAsync("Opgeslagen", "DonorRegistratie", item.Id);

        var response = new DonorRegistratieResponse(
            item.Id,
            item.EigenaarId,
            item.Keuze,
            item.IsGeregistreerdBijDonorregister,
            item.DonorregisterReferentie,
            item.Toelichting,
            item.BeslisserNaam,
            item.BeslisserRelatie,
            item.BeslisserTelefoon,
            item.AangemaaktOp,
            item.GewijzigdOp,
            []);
        return Ok(response);
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
        await _audit.LogAsync("Aangemaakt", "OrgaanKeuze", item.Id);
        return Created($"/api/donor/orgaankeuzes/{item.Id}", item.Adapt<OrgaanKeuzeResponse>());
    }

    [HttpPut("orgaankeuzes/{id:guid}")]
    public async Task<ActionResult<OrgaanKeuzeResponse>> UpdateOrgaanKeuze(Guid id, [FromBody] OrgaanKeuzeUpsertRequest request)
    {
        var item = await _db.OrgaanKeuzes.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "OrgaanKeuze", id);
        return Ok(item.Adapt<OrgaanKeuzeResponse>());
    }

    [HttpDelete("orgaankeuzes/{id:guid}")]
    public async Task<IActionResult> DeleteOrgaanKeuze(Guid id)
    {
        var item = await _db.OrgaanKeuzes.FindAsync(id);
        if (item is null) return NotFound();

        _db.OrgaanKeuzes.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "OrgaanKeuze", id);
        return NoContent();
    }

    [HttpPut("orgaankeuzes/batch")]
    public async Task<ActionResult<List<OrgaanKeuzeResponse>>> BatchUpdateOrgaanKeuzes(
        [FromBody] List<OrgaanKeuzeUpsertRequest> keuzes)
    {
        var donor = await _db.DonorRegistraties.FirstOrDefaultAsync();
        if (donor is null)
            return BadRequest(new { error = "Maak eerst een donor registratie aan." });

        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var bestaande = _db.OrgaanKeuzes.Where(o => o.DonorRegistratieId == donor.Id);
            _db.OrgaanKeuzes.RemoveRange(bestaande);

            foreach (var k in keuzes)
            {
                var item = k.Adapt<OrgaanKeuze>();
                item.DonorRegistratieId = donor.Id;
                _db.OrgaanKeuzes.Add(item);
            }

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            var result = await _db.OrgaanKeuzes
                .Where(o => o.DonorRegistratieId == donor.Id)
                .ToListAsync();
            return Ok(result.Adapt<List<OrgaanKeuzeResponse>>());
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
