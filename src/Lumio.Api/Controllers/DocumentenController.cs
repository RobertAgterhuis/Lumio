using Lumio.Api.Data;
using Lumio.Api.Domain.Documents;
using Lumio.Api.Dtos.Documents;
using Lumio.Api.Services.Security;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/documenten")]
public class DocumentenController : ControllerBase
{
    private readonly LumioDbContext _db;

    public DocumentenController(LumioDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<DocumentResponse>>> GetAll()
    {
        var items = await _db.Documenten
            .OrderBy(d => d.Categorie)
            .ThenBy(d => d.Naam)
            .ToListAsync();
        return Ok(items.Adapt<List<DocumentResponse>>());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DocumentResponse>> GetById(Guid id)
    {
        var item = await _db.Documenten.FindAsync(id);
        if (item is null) return NotFound();
        return Ok(item.Adapt<DocumentResponse>());
    }

    [HttpPost("uploaden")]
    [RequestSizeLimit(52_428_800)] // 50 MB
    public async Task<ActionResult<DocumentResponse>> Upload(
        [FromForm] IFormFile bestand,
        [FromForm] string naam,
        [FromForm] string categorie,
        [FromForm] string? notities,
        [FromServices] IEncryptionService encryption)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        using var ms = new MemoryStream();
        await bestand.CopyToAsync(ms);
        var content = ms.ToArray();

        var item = new PersoonlijkDocument
        {
            EigenaarId = eigenaar.Id,
            Naam = naam,
            Categorie = categorie,
            BestandsNaam = bestand.FileName,
            ContentType = bestand.ContentType,
            BestandsGrootte = bestand.Length,
            BestandsInhoud = content,
            Notities = notities
        };

        _db.Documenten.Add(item);
        await _db.SaveChangesAsync();
        return Created($"/api/documenten/{item.Id}", item.Adapt<DocumentResponse>());
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(Guid id)
    {
        var item = await _db.Documenten.FindAsync(id);
        if (item is null) return NotFound();

        return File(item.BestandsInhoud, item.ContentType, item.BestandsNaam);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _db.Documenten.FindAsync(id);
        if (item is null) return NotFound();

        _db.Documenten.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
