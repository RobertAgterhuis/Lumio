using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Repositories;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/afhandeling")]
public class AfhandelingController : ControllerBase
{
    private readonly IAfhandelingRepository _repo;
    private readonly IStringLocalizer<AfhandelingController> L;

    public AfhandelingController(IAfhandelingRepository repo, IStringLocalizer<AfhandelingController> localizer)
    {
        _repo = repo;
        L = localizer;
    }

    [HttpGet]
    public async Task<ActionResult<List<AfhandelingsItemDto>>> GetAll([FromQuery] string? domein = null)
    {
        var items = await _repo.GetAllAsync(domein);
        return Ok(items.Select(a => new AfhandelingsItemDto(
            a.Id, a.Domein, a.EntityId, a.Label,
            a.Status.ToString(), a.Notitie,
            a.AfgehandeldOp, a.AangemaaktOp, a.GewijzigdOp
        )).ToList());
    }

    [HttpGet("samenvatting")]
    public async Task<IActionResult> GetSamenvatting()
    {
        var items = await _repo.GetAllAsync();

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

        await _repo.AddAsync(item);
        await _repo.CommitAsync();

        return Created($"/api/afhandeling/{item.Id}", new AfhandelingsItemDto(
            item.Id, item.Domein, item.EntityId, item.Label,
            item.Status.ToString(), item.Notitie,
            item.AfgehandeldOp, item.AangemaaktOp, item.GewijzigdOp
        ));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AfhandelingsItemUpdateRequest request)
    {
        var item = await _repo.FindByIdAsync(id);
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

        await _repo.CommitAsync();

        return Ok(new AfhandelingsItemDto(
            item.Id, item.Domein, item.EntityId, item.Label,
            item.Status.ToString(), item.Notitie,
            item.AfgehandeldOp, item.AangemaaktOp, item.GewijzigdOp
        ));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, [FromServices] IMasterPasswordService passwordService)
    {
        if (passwordService.IsReadOnly)
            return StatusCode(403, new { error = "Verwijderen is niet toegestaan in alleen-lezen modus (erfgenaam-toegang)." });

        var item = await _repo.FindByIdAsync(id);
        if (item is null)
            return NotFound(new { error = "Afhandelingsitem niet gevonden." });

        await _repo.RemoveAsync(item);
        await _repo.CommitAsync();

        return NoContent();
    }

    [HttpPost("initialiseer")]
    public async Task<IActionResult> Initialiseer()
    {
        if (await _repo.AnyAsync())
            return Ok(new { bericht = L["AlreadyInitialized"].Value, aangemaakt = 0 });

        var bronnen = await _repo.GetBronnenStatusAsync();
        var items = new List<AfhandelingsItem>();

        if (bronnen.HeeftNoodcontacten)
            items.Add(new AfhandelingsItem { Domein = "noodcontacten", Label = L["LabelNotifyEmergencyContacts"].Value });
        if (bronnen.HeeftUitvaartWensen)
            items.Add(new AfhandelingsItem { Domein = "uitvaart", Label = L["LabelArrangeFuneral"].Value });
        if (bronnen.HeeftDonorRegistratie)
            items.Add(new AfhandelingsItem { Domein = "donor", Label = L["LabelCheckDonor"].Value });
        if (bronnen.HeeftWilsverklaring)
            items.Add(new AfhandelingsItem { Domein = "euthanasie", Label = L["LabelViewLivingWill"].Value });
        if (bronnen.HeeftTestament)
            items.Add(new AfhandelingsItem { Domein = "testament", Label = L["LabelViewTestament"].Value });
        if (bronnen.HeeftErfgenamen)
            items.Add(new AfhandelingsItem { Domein = "erfgenamen", Label = L["LabelNotifyHeirs"].Value });
        if (bronnen.HeeftDocumenten)
            items.Add(new AfhandelingsItem { Domein = "documenten", Label = L["LabelCollectDocuments"].Value });
        if (bronnen.HeeftBoedel)
            items.Add(new AfhandelingsItem { Domein = "boedel", Label = L["LabelSettleEstate"].Value });
        if (bronnen.HeeftDigitaalBezit)
            items.Add(new AfhandelingsItem { Domein = "digitaal-bezit", Label = L["LabelSettleDigitalAssets"].Value });
        if (bronnen.HeeftEigenaar)
            items.Add(new AfhandelingsItem { Domein = "eigenaar", Label = L["LabelPersonalData"].Value });

        items.Add(new AfhandelingsItem { Domein = "export", Label = L["LabelExportDossier"].Value });

        await _repo.AddRangeAsync(items);
        await _repo.CommitAsync();

        return Ok(new { bericht = L["Initialized"].Value, aangemaakt = items.Count });
    }
}