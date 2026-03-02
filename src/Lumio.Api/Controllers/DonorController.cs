using Lumio.Api.Domain.DonorRegistration;
using Lumio.Api.Dtos.DonorRegistration;
using Lumio.Api.Repositories;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/donor")]
public class DonorController : ControllerBase
{
    private readonly IDonorRepository _repo;
    private readonly IAuditService _audit;

    public DonorController(IDonorRepository repo, IAuditService audit)
    {
        _repo = repo;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<DonorRegistratieResponse>> Get()
    {
        var item = await _repo.FindDonorRegistratieAsync();
        if (item is null) return NotFound();

        var orgaanKeuzes = await _repo.GetAlleOrgaanKeuzesAsync(item.Id);

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
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = await _repo.FindDonorRegistratieAsync();
        if (item is null)
        {
            item = request.Adapt<DonorRegistratie>();
            item.EigenaarId = eigenaarId.Value;
            await _repo.AddAsync(item);
        }
        else
        {
            request.Adapt(item);
        }

        await _repo.CommitAsync();
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
        var donor = await _repo.FindDonorRegistratieAsync();
        if (donor is null) return Ok(new List<OrgaanKeuzeResponse>());

        var items = await _repo.GetAlleOrgaanKeuzesAsync(donor.Id);
        return Ok(items.Adapt<List<OrgaanKeuzeResponse>>());
    }

    [HttpPost("orgaankeuzes")]
    public async Task<ActionResult<OrgaanKeuzeResponse>> CreateOrgaanKeuze([FromBody] OrgaanKeuzeUpsertRequest request)
    {
        var donor = await _repo.FindDonorRegistratieAsync();
        if (donor is null)
            return BadRequest(new { error = "Maak eerst donor registratie aan." });

        var item = request.Adapt<OrgaanKeuze>();
        item.DonorRegistratieId = donor.Id;
        await _repo.AddOrgaanKeuzeAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Aangemaakt", "OrgaanKeuze", item.Id);
        return Created($"/api/donor/orgaankeuzes/{item.Id}", item.Adapt<OrgaanKeuzeResponse>());
    }

    [HttpPut("orgaankeuzes/{id:guid}")]
    public async Task<ActionResult<OrgaanKeuzeResponse>> UpdateOrgaanKeuze(Guid id, [FromBody] OrgaanKeuzeUpsertRequest request)
    {
        var item = await _repo.FindOrgaanKeuzeByIdAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Gewijzigd", "OrgaanKeuze", id);
        return Ok(item.Adapt<OrgaanKeuzeResponse>());
    }

    [HttpDelete("orgaankeuzes/{id:guid}")]
    public async Task<IActionResult> DeleteOrgaanKeuze(Guid id)
    {
        var item = await _repo.FindOrgaanKeuzeByIdAsync(id);
        if (item is null) return NotFound();

        await _repo.RemoveOrgaanKeuzeAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Verwijderd", "OrgaanKeuze", id);
        return NoContent();
    }

    [HttpPut("orgaankeuzes/batch")]
    public async Task<ActionResult<List<OrgaanKeuzeResponse>>> BatchUpdateOrgaanKeuzes(
        [FromBody] List<OrgaanKeuzeUpsertRequest> keuzes)
    {
        var donor = await _repo.FindDonorRegistratieAsync();
        if (donor is null)
            return BadRequest(new { error = "Maak eerst een donor registratie aan." });

        var result = await _repo.BatchUpdateOrgaanKeuzesAsync(donor.Id, keuzes.Adapt<List<OrgaanKeuze>>());
        return Ok(result.Adapt<List<OrgaanKeuzeResponse>>());
    }
}
