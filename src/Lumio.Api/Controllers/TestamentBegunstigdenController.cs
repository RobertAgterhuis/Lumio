using Lumio.Api.Domain.Testament;
using Lumio.Api.Dtos.Testament;
using Lumio.Api.Repositories;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/testament/begunstigden")]
public class TestamentBegunstigdenController : ControllerBase
{
    private readonly ITestamentBegunstigdeRepository _repo;
    private readonly IAuditService _audit;

    public TestamentBegunstigdenController(ITestamentBegunstigdeRepository repo, IAuditService audit)
    {
        _repo = repo;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<List<BegunstigdeResponse>>> GetBegunstigden()
    {
        var testamentId = await _repo.FindTestamentIdAsync();
        if (testamentId is null) return Ok(new List<BegunstigdeResponse>());

        var items = await _repo.GetAllByTestamentAsync(testamentId.Value);
        return Ok(items.Adapt<List<BegunstigdeResponse>>());
    }

    [HttpPost]
    public async Task<ActionResult<BegunstigdeResponse>> CreateBegunstigde([FromBody] BegunstigdeUpsertRequest request)
    {
        var testamentId = await _repo.FindTestamentIdAsync();
        if (testamentId is null) return BadRequest(new { error = "Maak eerst testament informatie aan." });

        var item = request.Adapt<Begunstigde>();
        item.TestamentInfoId = testamentId.Value;
        await _repo.AddAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Aangemaakt", "Begunstigde", item.Id);
        return Created($"/api/testament/begunstigden/{item.Id}", item.Adapt<BegunstigdeResponse>());
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BegunstigdeResponse>> UpdateBegunstigde(Guid id, [FromBody] BegunstigdeUpsertRequest request)
    {
        var item = await _repo.FindByIdAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Gewijzigd", "Begunstigde", id);
        return Ok(item.Adapt<BegunstigdeResponse>());
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteBegunstigde(Guid id)
    {
        var item = await _repo.FindByIdAsync(id);
        if (item is null) return NotFound();

        await _repo.RemoveAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Verwijderd", "Begunstigde", id);
        return NoContent();
    }
}
