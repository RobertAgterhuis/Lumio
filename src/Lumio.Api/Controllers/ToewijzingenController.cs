using Lumio.Api.Data;
using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Dtos.AssetRegistry;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/toewijzingen")]
public class ToewijzingenController : ControllerBase
{
    private readonly LumioDbContext _db;

    public ToewijzingenController(LumioDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<ErfgenaamToewijzingResponse>>> GetAll()
    {
        var items = await _db.ErfgenaamToewijzingen
            .Include(t => t.Erfgenaam)
            .OrderBy(t => t.Erfgenaam.Achternaam)
            .ToListAsync();

        var result = new List<ErfgenaamToewijzingResponse>();
        foreach (var t in items)
        {
            var entityNaam = await ResolveEntityNaam(t.EntityType, t.EntityId);
            var erfgenaamNaam = $"{t.Erfgenaam.Voornaam} {t.Erfgenaam.Tussenvoegsel} {t.Erfgenaam.Achternaam}".Trim();
            result.Add(new ErfgenaamToewijzingResponse(
                t.Id, t.ErfgenaamId, erfgenaamNaam,
                t.EntityType, t.EntityId, entityNaam, t.Instructies));
        }
        return Ok(result);
    }

    [HttpGet("erfgenaam/{erfgenaamId:guid}")]
    public async Task<ActionResult<List<ErfgenaamToewijzingResponse>>> GetByErfgenaam(Guid erfgenaamId)
    {
        var erfgenaam = await _db.Erfgenamen.FindAsync(erfgenaamId);
        if (erfgenaam is null) return NotFound();

        var items = await _db.ErfgenaamToewijzingen
            .Where(t => t.ErfgenaamId == erfgenaamId)
            .ToListAsync();

        var erfgenaamNaam = $"{erfgenaam.Voornaam} {erfgenaam.Tussenvoegsel} {erfgenaam.Achternaam}".Trim();
        var result = new List<ErfgenaamToewijzingResponse>();
        foreach (var t in items)
        {
            var entityNaam = await ResolveEntityNaam(t.EntityType, t.EntityId);
            result.Add(new ErfgenaamToewijzingResponse(
                t.Id, t.ErfgenaamId, erfgenaamNaam,
                t.EntityType, t.EntityId, entityNaam, t.Instructies));
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ErfgenaamToewijzingResponse>> Create([FromBody] ErfgenaamToewijzingUpsertRequest request)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var erfgenaam = await _db.Erfgenamen.FindAsync(request.ErfgenaamId);
        if (erfgenaam is null) return BadRequest(new { error = "Erfgenaam niet gevonden." });

        // Check for duplicate
        var exists = await _db.ErfgenaamToewijzingen.AnyAsync(t =>
            t.ErfgenaamId == request.ErfgenaamId &&
            t.EntityType == request.EntityType &&
            t.EntityId == request.EntityId);
        if (exists) return BadRequest(new { error = "Deze toewijzing bestaat al." });

        var item = new ErfgenaamToewijzing
        {
            EigenaarId = eigenaar.Id,
            ErfgenaamId = request.ErfgenaamId,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            Instructies = request.Instructies,
        };

        _db.ErfgenaamToewijzingen.Add(item);
        await _db.SaveChangesAsync();

        var entityNaam = await ResolveEntityNaam(item.EntityType, item.EntityId);
        var erfgenaamNaam = $"{erfgenaam.Voornaam} {erfgenaam.Tussenvoegsel} {erfgenaam.Achternaam}".Trim();
        return Created($"/api/toewijzingen/{item.Id}",
            new ErfgenaamToewijzingResponse(
                item.Id, item.ErfgenaamId, erfgenaamNaam,
                item.EntityType, item.EntityId, entityNaam, item.Instructies));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ErfgenaamToewijzingResponse>> Update(Guid id, [FromBody] ErfgenaamToewijzingUpsertRequest request)
    {
        var item = await _db.ErfgenaamToewijzingen.Include(t => t.Erfgenaam).FirstOrDefaultAsync(t => t.Id == id);
        if (item is null) return NotFound();

        item.ErfgenaamId = request.ErfgenaamId;
        item.EntityType = request.EntityType;
        item.EntityId = request.EntityId;
        item.Instructies = request.Instructies;
        await _db.SaveChangesAsync();

        var erfgenaam = await _db.Erfgenamen.FindAsync(item.ErfgenaamId);
        var erfgenaamNaam = erfgenaam != null
            ? $"{erfgenaam.Voornaam} {erfgenaam.Tussenvoegsel} {erfgenaam.Achternaam}".Trim()
            : "Onbekend";
        var entityNaam = await ResolveEntityNaam(item.EntityType, item.EntityId);
        return Ok(new ErfgenaamToewijzingResponse(
            item.Id, item.ErfgenaamId, erfgenaamNaam,
            item.EntityType, item.EntityId, entityNaam, item.Instructies));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _db.ErfgenaamToewijzingen.FindAsync(id);
        if (item is null) return NotFound();

        _db.ErfgenaamToewijzingen.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<string> ResolveEntityNaam(string entityType, Guid entityId)
    {
        return entityType switch
        {
            "FysiekBezit" => (await _db.FysiekeBezittingen.FindAsync(entityId))?.Omschrijving ?? "Onbekend",
            "Bankrekening" => (await _db.Bankrekeningen.FindAsync(entityId))?.BankNaam ?? "Onbekend",
            "Verzekering" => (await _db.Verzekeringen.FindAsync(entityId))?.Verzekeraar ?? "Onbekend",
            "DigitaalAccount" => (await _db.DigitaleAccounts.FindAsync(entityId))?.PlatformNaam ?? "Onbekend",
            "CryptoWallet" => (await _db.CryptoWallets.FindAsync(entityId))?.WalletNaam ?? "Onbekend",
            _ => "Onbekend"
        };
    }
}
