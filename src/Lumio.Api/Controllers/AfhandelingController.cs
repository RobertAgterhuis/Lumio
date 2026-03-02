using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/afhandeling")]
public class AfhandelingController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly IStringLocalizer<AfhandelingController> L;

    public AfhandelingController(LumioDbContext db, IStringLocalizer<AfhandelingController> localizer)
    {
        _db = db;
        L = localizer;
    }

    [HttpGet]
    public async Task<ActionResult<List<AfhandelingsItemDto>>> GetAll([FromQuery] string? domein = null)
    {
        var query = _db.AfhandelingsItems.AsQueryable();

        if (!string.IsNullOrWhiteSpace(domein))
            query = query.Where(a => a.Domein == domein);

        var items = await query
            .OrderBy(a => a.Domein)
            .ThenBy(a => a.AangemaaktOp)
            .Select(a => new AfhandelingsItemDto(
                a.Id,
                a.Domein,
                a.EntityId,
                a.Label,
                a.Status.ToString(),
                a.Notitie,
                a.AfgehandeldOp,
                a.AangemaaktOp,
                a.GewijzigdOp
            ))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("samenvatting")]
    public async Task<IActionResult> GetSamenvatting()
    {
        var items = await _db.AfhandelingsItems.ToListAsync();

        var perDomein = items
            .GroupBy(a => a.Domein)
            .Select(g => new
            {
                domein = g.Key,
                totaal = g.Count(),
                open = g.Count(a => a.Status == AfhandelingsStatus.Open),
                inBehandeling = g.Count(a => a.Status == AfhandelingsStatus.InBehandeling),
                afgehandeld = g.Count(a => a.Status == AfhandelingsStatus.Afgehandeld)
            })
            .ToList();

        return Ok(new
        {
            totaal = items.Count,
            open = items.Count(a => a.Status == AfhandelingsStatus.Open),
            inBehandeling = items.Count(a => a.Status == AfhandelingsStatus.InBehandeling),
            afgehandeld = items.Count(a => a.Status == AfhandelingsStatus.Afgehandeld),
            perDomein
        });
    }

    [HttpPost]
    public async Task<ActionResult<AfhandelingsItemDto>> Create([FromBody] AfhandelingsItemCreateRequest request)
    {
        var item = new AfhandelingsItem
        {
            Domein = request.Domein,
            EntityId = request.EntityId,
            Label = request.Label,
            Notitie = request.Notitie,
            Status = AfhandelingsStatus.Open
        };

        _db.AfhandelingsItems.Add(item);
        await _db.SaveChangesAsync();

        return Created($"/api/afhandeling/{item.Id}", new AfhandelingsItemDto(
            item.Id,
            item.Domein,
            item.EntityId,
            item.Label,
            item.Status.ToString(),
            item.Notitie,
            item.AfgehandeldOp,
            item.AangemaaktOp,
            item.GewijzigdOp
        ));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AfhandelingsItemUpdateRequest request)
    {
        var item = await _db.AfhandelingsItems.FindAsync(id);
        if (item is null)
            return NotFound(new { error = "Afhandelingsitem niet gevonden." });

        if (!Enum.TryParse<AfhandelingsStatus>(request.Status, ignoreCase: true, out var status))
            return BadRequest(new { error = $"Ongeldige status: {request.Status}. Gebruik Open, InBehandeling of Afgehandeld." });

        item.Status = status;
        item.Notitie = request.Notitie ?? item.Notitie;

        if (status == AfhandelingsStatus.Afgehandeld && item.AfgehandeldOp is null)
            item.AfgehandeldOp = DateTime.UtcNow;
        else if (status != AfhandelingsStatus.Afgehandeld)
            item.AfgehandeldOp = null;

        await _db.SaveChangesAsync();

        return Ok(new AfhandelingsItemDto(
            item.Id,
            item.Domein,
            item.EntityId,
            item.Label,
            item.Status.ToString(),
            item.Notitie,
            item.AfgehandeldOp,
            item.AangemaaktOp,
            item.GewijzigdOp
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, [FromServices] IMasterPasswordService passwordService)
    {
        // S2-03: Block deletion in read-only (erfgenaam) mode
        if (passwordService.IsReadOnly)
            return StatusCode(403, new { error = "Verwijderen is niet toegestaan in alleen-lezen modus (erfgenaam-toegang)." });

        var item = await _db.AfhandelingsItems.FindAsync(id);
        if (item is null)
            return NotFound(new { error = "Afhandelingsitem niet gevonden." });

        _db.AfhandelingsItems.Remove(item);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Initialize standard tracking items for all domains that have data.
    /// Called once when heirs first access the system.
    /// </summary>
    [HttpPost("initialiseer")]
    public async Task<IActionResult> Initialiseer()
    {
        // Don't re-initialize if items already exist
        if (await _db.AfhandelingsItems.AnyAsync())
            return Ok(new { bericht = L["AlreadyInitialized"].Value, aangemaakt = 0 });

        var items = new List<AfhandelingsItem>();

        // Check each domain and create tracking items for domains that have data
        if (await _db.Noodcontacten.AnyAsync())
            items.Add(new AfhandelingsItem { Domein = "noodcontacten", Label = L["LabelNotifyEmergencyContacts"].Value });

        if (await _db.UitvaartWensen.AnyAsync())
            items.Add(new AfhandelingsItem { Domein = "uitvaart", Label = L["LabelArrangeFuneral"].Value });

        if (await _db.DonorRegistraties.AnyAsync())
            items.Add(new AfhandelingsItem { Domein = "donor", Label = L["LabelCheckDonor"].Value });

        if (await _db.Wilsverklaringen.AnyAsync())
            items.Add(new AfhandelingsItem { Domein = "euthanasie", Label = L["LabelViewLivingWill"].Value });

        if (await _db.Testamenten.AnyAsync())
            items.Add(new AfhandelingsItem { Domein = "testament", Label = L["LabelViewTestament"].Value });

        if (await _db.Erfgenamen.AnyAsync())
            items.Add(new AfhandelingsItem { Domein = "erfgenamen", Label = L["LabelNotifyHeirs"].Value });

        if (await _db.Documenten.AnyAsync())
            items.Add(new AfhandelingsItem { Domein = "documenten", Label = L["LabelCollectDocuments"].Value });

        if (await _db.FysiekeBezittingen.AnyAsync() || await _db.Bankrekeningen.AnyAsync()
            || await _db.Verzekeringen.AnyAsync() || await _db.Schulden.AnyAsync())
            items.Add(new AfhandelingsItem { Domein = "boedel", Label = L["LabelSettleEstate"].Value });

        if (await _db.DigitaleAccounts.AnyAsync() || await _db.Wachtwoorden.AnyAsync()
            || await _db.CryptoWallets.AnyAsync())
            items.Add(new AfhandelingsItem { Domein = "digitaal-bezit", Label = L["LabelSettleDigitalAssets"].Value });

        if (await _db.Eigenaren.AnyAsync())
            items.Add(new AfhandelingsItem { Domein = "eigenaar", Label = L["LabelPersonalData"].Value });

        // Always add export item
        items.Add(new AfhandelingsItem { Domein = "export", Label = L["LabelExportDossier"].Value });

        _db.AfhandelingsItems.AddRange(items);
        await _db.SaveChangesAsync();

        return Ok(new { bericht = L["Initialized"].Value, aangemaakt = items.Count });
    }
}
