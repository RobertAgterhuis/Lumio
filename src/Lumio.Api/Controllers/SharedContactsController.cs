using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

/// <summary>
/// API endpoints voor gedeelde contacten (notaris, huisarts, uitvaartondernemer, etc.)
/// Voorkomt duplicatie van contactgegevens over meerdere domeinen.
/// </summary>
[ApiController]
[Route("api/v1/shared-contacts")]
public class SharedContactsController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly IAuditService _audit;

    public SharedContactsController(LumioDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    /// <summary>
    /// Haal alle shared contacts op, optioneel gefilterd op type
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<SharedContactResponse>>> GetAll([FromQuery] string? type = null)
    {
        var eigenaarId = await GetEigenaarIdAsync();
        if (eigenaarId is null)
            return Ok(new List<SharedContactResponse>());

        var query = _db.SharedContacts
            .Where(c => c.EigenaarId == eigenaarId.Value);

        if (!string.IsNullOrEmpty(type) && Enum.TryParse<ContactType>(type, out var contactType))
        {
            query = query.Where(c => c.Type == contactType);
        }

        var contacts = await query
            .OrderBy(c => c.Naam)
            .ToListAsync();

        return Ok(contacts.Select(SharedContactResponse.FromEntity).ToList());
    }

    /// <summary>
    /// Haal lijst items op (lichtgewicht voor dropdowns)
    /// </summary>
    [HttpGet("list")]
    public async Task<ActionResult<List<SharedContactListItem>>> GetList([FromQuery] string? type = null)
    {
        var eigenaarId = await GetEigenaarIdAsync();
        if (eigenaarId is null)
            return Ok(new List<SharedContactListItem>());

        var query = _db.SharedContacts
            .Where(c => c.EigenaarId == eigenaarId.Value);

        if (!string.IsNullOrEmpty(type) && Enum.TryParse<ContactType>(type, out var contactType))
        {
            query = query.Where(c => c.Type == contactType);
        }

        var contacts = await query
            .OrderBy(c => c.Naam)
            .ToListAsync();

        return Ok(contacts.Select(SharedContactListItem.FromEntity).ToList());
    }

    /// <summary>
    /// Haal een specifiek contact op
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SharedContactResponse>> GetById(Guid id)
    {
        var contact = await _db.SharedContacts.FindAsync(id);
        if (contact is null)
            return NotFound(new { error = "Contact niet gevonden" });

        return Ok(SharedContactResponse.FromEntity(contact));
    }

    /// <summary>
    /// Maak een nieuw shared contact aan
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<SharedContactResponse>> Create([FromBody] SharedContactUpsertRequest request)
    {
        var eigenaarId = await GetEigenaarIdAsync();
        if (eigenaarId is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        // Check voor duplicaten (zelfde naam + telefoon/email)
        var duplicate = await FindDuplicateAsync(eigenaarId.Value, request);
        if (duplicate is not null)
        {
            return Conflict(new
            {
                error = "Er bestaat al een contact met deze naam en telefoon/e-mail",
                existingContactId = duplicate.Id,
                existingContact = SharedContactResponse.FromEntity(duplicate)
            });
        }

        var contact = request.ToEntity(eigenaarId.Value);
        _db.SharedContacts.Add(contact);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("Aangemaakt", "SharedContact", contact.Id, $"Type: {contact.Type}, Naam: {contact.Naam}");

        return CreatedAtAction(
            nameof(GetById),
            new { id = contact.Id },
            SharedContactResponse.FromEntity(contact));
    }

    /// <summary>
    /// Update een bestaand shared contact
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SharedContactResponse>> Update(Guid id, [FromBody] SharedContactUpsertRequest request)
    {
        var contact = await _db.SharedContacts.FindAsync(id);
        if (contact is null)
            return NotFound(new { error = "Contact niet gevonden" });

        // Check voor duplicaten (exclusief huidige record)
        var duplicate = await FindDuplicateAsync(contact.EigenaarId, request, excludeId: id);
        if (duplicate is not null)
        {
            return Conflict(new
            {
                error = "Er bestaat al een contact met deze naam en telefoon/e-mail",
                existingContactId = duplicate.Id
            });
        }

        var oudType = contact.Type;
        var oudNaam = contact.Naam;

        request.UpdateEntity(contact);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("Gewijzigd", "SharedContact", id, $"Type: {oudType} → {contact.Type}, Naam: {oudNaam} → {contact.Naam}");

        return Ok(SharedContactResponse.FromEntity(contact));
    }

    /// <summary>
    /// Verwijder een shared contact
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var contact = await _db.SharedContacts.FindAsync(id);
        if (contact is null)
            return NotFound(new { error = "Contact niet gevonden" });

        // Check of contact in gebruik is
        var inUse = await IsContactInUseAsync(id);
        if (inUse)
        {
            return Conflict(new
            {
                error = "Dit contact kan niet verwijderd worden omdat het nog in gebruik is. Verwijder eerst de koppelingen in testament, uitvaart, etc."
            });
        }

        _db.SharedContacts.Remove(contact);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("Verwijderd", "SharedContact", id, $"Type: {contact.Type}, Naam: {contact.Naam}");

        return NoContent();
    }

    private async Task<Guid?> GetEigenaarIdAsync()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        return eigenaar?.Id;
    }

    private async Task<SharedContact?> FindDuplicateAsync(Guid eigenaarId, SharedContactUpsertRequest request, Guid? excludeId = null)
    {
        var query = _db.SharedContacts
            .Where(c => c.EigenaarId == eigenaarId &&
                        c.Naam == request.Naam);

        if (excludeId.HasValue)
        {
            query = query.Where(c => c.Id != excludeId.Value);
        }

        // Match op telefoon OF email (indien aanwezig)
        return await query
            .Where(c => (!string.IsNullOrEmpty(request.Telefoon) && c.Telefoon == request.Telefoon) ||
                       (!string.IsNullOrEmpty(request.Email) && c.Email == request.Email))
            .FirstOrDefaultAsync();
    }

    private async Task<bool> IsContactInUseAsync(Guid contactId)
    {
        // Check Eigenaar (notaris, huisarts, uitvaartondernemer)
        var eigenaarUsage = await _db.Eigenaren.AnyAsync(e =>
            e.NotarisContactId == contactId ||
            e.HuisartsContactId == contactId ||
            e.UitvaartOndernemerContactId == contactId);
        if (eigenaarUsage) return true;

        // Check TestamentInfo (notaris)
        var testamentUsage = await _db.Testamenten.AnyAsync(t => t.NotarisContactId == contactId);
        if (testamentUsage) return true;

        // Check UitvaartWensen (uitvaartondernemer)
        var uitvaartWensenUsage = await _db.UitvaartWensen.AnyAsync(u => u.UitvaartOndernemerContactId == contactId);
        if (uitvaartWensenUsage) return true;

        // Check WilsverklaringEuthanasie (huisarts, vertegenwoordiger1, vertegenwoordiger2)
        var wilsverklaringUsage = await _db.Wilsverklaringen.AnyAsync(w =>
            w.HuisartsContactId == contactId ||
            w.VertegenwoordigerContactId == contactId ||
            w.Vertegenwoordiger2ContactId == contactId);
        if (wilsverklaringUsage) return true;

        return false;
    }
}
