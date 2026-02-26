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
            .ThenBy(t => t.Erfgenaam.Voornaam)
            .ToListAsync();

        // Batch-load entity names per EntityType to avoid N+1 queries
        var nameCache = await BuildEntityNameCacheAsync(items.Select(t => (t.EntityType, t.EntityId)));

        var result = items.Select(t =>
        {
            var erfgenaamNaam = $"{t.Erfgenaam.Voornaam} {t.Erfgenaam.Tussenvoegsel} {t.Erfgenaam.Achternaam}"
                .Replace("  ", " ").Trim();
            var entityNaam = nameCache.TryGetValue((t.EntityType, t.EntityId), out var n) ? n : "Onbekend";
            return new ErfgenaamToewijzingResponse(
                t.Id, t.ErfgenaamId, erfgenaamNaam,
                t.EntityType, t.EntityId, entityNaam, t.Instructies);
        }).ToList();

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

        var nameCache = await BuildEntityNameCacheAsync(items.Select(t => (t.EntityType, t.EntityId)));
        var erfgenaamNaam = $"{erfgenaam.Voornaam} {erfgenaam.Tussenvoegsel} {erfgenaam.Achternaam}"
            .Replace("  ", " ").Trim();

        var result = items.Select(t =>
        {
            var entityNaam = nameCache.TryGetValue((t.EntityType, t.EntityId), out var n) ? n : "Onbekend";
            return new ErfgenaamToewijzingResponse(
                t.Id, t.ErfgenaamId, erfgenaamNaam,
                t.EntityType, t.EntityId, entityNaam, t.Instructies);
        }).ToList();

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
        var erfgenaamNaam = $"{erfgenaam.Voornaam} {erfgenaam.Tussenvoegsel} {erfgenaam.Achternaam}".Replace("  ", " ").Trim();
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
            ? $"{erfgenaam.Voornaam} {erfgenaam.Tussenvoegsel} {erfgenaam.Achternaam}".Replace("  ", " ").Trim()
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
        var cache = await BuildEntityNameCacheAsync([(entityType, entityId)]);
        return cache.TryGetValue((entityType, entityId), out var name) ? name : "Onbekend";
    }

    private async Task<Dictionary<(string, Guid), string>> BuildEntityNameCacheAsync(
        IEnumerable<(string EntityType, Guid EntityId)> entries)
    {
        var grouped = entries.ToLookup(e => e.EntityType, e => e.EntityId);
        var cache = new Dictionary<(string, Guid), string>();

        var fysiekIds = grouped["FysiekBezit"].ToHashSet();
        var bankIds = grouped["Bankrekening"].ToHashSet();
        var verzIds = grouped["Verzekering"].ToHashSet();
        var digitaalIds = grouped["DigitaalAccount"].ToHashSet();
        var cryptoIds = grouped["CryptoWallet"].ToHashSet();

        if (fysiekIds.Count > 0)
            foreach (var r in await _db.FysiekeBezittingen
                .Where(f => fysiekIds.Contains(f.Id))
                .Select(f => new { f.Id, Name = f.Omschrijving })
                .ToListAsync())
                cache[("FysiekBezit", r.Id)] = r.Name;

        if (bankIds.Count > 0)
            foreach (var r in await _db.Bankrekeningen
                .Where(b => bankIds.Contains(b.Id))
                .Select(b => new { b.Id, Name = b.BankNaam })
                .ToListAsync())
                cache[("Bankrekening", r.Id)] = r.Name;

        if (verzIds.Count > 0)
            foreach (var r in await _db.Verzekeringen
                .Where(v => verzIds.Contains(v.Id))
                .Select(v => new { v.Id, Name = v.Verzekeraar })
                .ToListAsync())
                cache[("Verzekering", r.Id)] = r.Name;

        if (digitaalIds.Count > 0)
            foreach (var r in await _db.DigitaleAccounts
                .Where(d => digitaalIds.Contains(d.Id))
                .Select(d => new { d.Id, Name = d.PlatformNaam })
                .ToListAsync())
                cache[("DigitaalAccount", r.Id)] = r.Name;

        if (cryptoIds.Count > 0)
            foreach (var r in await _db.CryptoWallets
                .Where(c => cryptoIds.Contains(c.Id))
                .Select(c => new { c.Id, Name = c.WalletNaam })
                .ToListAsync())
                cache[("CryptoWallet", r.Id)] = r.Name;

        return cache;
    }
}
