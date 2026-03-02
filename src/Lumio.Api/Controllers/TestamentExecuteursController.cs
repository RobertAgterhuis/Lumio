using Lumio.Api.Domain.Testament;
using Lumio.Api.Dtos.Testament;
using Lumio.Api.Repositories;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/testament/executeurs")]
public class TestamentExecuteursController : ControllerBase
{
    private readonly ITestamentExecuteurRepository _repo;
    private readonly IAuditService _audit;

    public TestamentExecuteursController(ITestamentExecuteurRepository repo, IAuditService audit)
    {
        _repo = repo;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<List<ExecuteurResponse>>> GetExecuteurs()
    {
        var testamentId = await _repo.FindTestamentIdAsync();
        if (testamentId is null) return Ok(new List<ExecuteurResponse>());

        var items = await _repo.GetAllByTestamentAsync(testamentId.Value);
        return Ok(items.Adapt<List<ExecuteurResponse>>());
    }

    [HttpPost]
    public async Task<ActionResult<ExecuteurResponse>> CreateExecuteur([FromBody] ExecuteurUpsertRequest request)
    {
        var testamentId = await _repo.FindTestamentIdAsync();
        if (testamentId is null) return BadRequest(new { error = "Maak eerst testament informatie aan." });

        var item = request.Adapt<Executeur>();
        item.TestamentInfoId = testamentId.Value;
        await _repo.AddAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Aangemaakt", "Executeur", item.Id);
        return Created($"/api/testament/executeurs/{item.Id}", item.Adapt<ExecuteurResponse>());
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ExecuteurResponse>> UpdateExecuteur(Guid id, [FromBody] ExecuteurUpsertRequest request)
    {
        var item = await _repo.FindByIdAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Gewijzigd", "Executeur", id);
        return Ok(item.Adapt<ExecuteurResponse>());
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteExecuteur(Guid id)
    {
        var item = await _repo.FindByIdAsync(id);
        if (item is null) return NotFound();

        await _repo.RemoveAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Verwijderd", "Executeur", id);
        return NoContent();
    }
}
