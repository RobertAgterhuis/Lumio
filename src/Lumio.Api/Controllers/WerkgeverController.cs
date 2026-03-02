using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Repositories;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/werkgever")]
public class WerkgeverController : ControllerBase
{
    private readonly IWerkgeverRepository _repo;
    private readonly IAuditService _audit;

    public WerkgeverController(IWerkgeverRepository repo, IAuditService audit)
    {
        _repo = repo;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<List<WerkgeverResponse>>> GetAll()
    {
        var items = await _repo.GetAllAsync();
        return Ok(items.Adapt<List<WerkgeverResponse>>());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WerkgeverResponse>> GetById(Guid id)
    {
        var item = await _repo.FindByIdAsync(id);
        if (item is null) return NotFound();
        return Ok(item.Adapt<WerkgeverResponse>());
    }

    [HttpPost]
    public async Task<ActionResult<WerkgeverResponse>> Create([FromBody] WerkgeverUpsertRequest request)
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<Werkgever>();
        item.EigenaarId = eigenaarId.Value;
        await _repo.AddAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Aangemaakt", "Werkgever", item.Id);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item.Adapt<WerkgeverResponse>());
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<WerkgeverResponse>> Update(Guid id, [FromBody] WerkgeverUpsertRequest request)
    {
        var item = await _repo.FindByIdAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Gewijzigd", "Werkgever", id);
        return Ok(item.Adapt<WerkgeverResponse>());
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _repo.FindByIdAsync(id);
        if (item is null) return NotFound();

        await _repo.RemoveAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Verwijderd", "Werkgever", id);
        return NoContent();
    }
}
