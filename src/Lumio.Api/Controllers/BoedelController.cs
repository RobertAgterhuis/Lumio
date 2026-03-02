using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Dtos.AssetRegistry;
using Lumio.Api.Repositories;
using Lumio.Api.Rules;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/boedel")]
public class BoedelController : ControllerBase
{
    private readonly IBoedelRepository _repo;
    private readonly IAuditService _audit;

    public BoedelController(IBoedelRepository repo, IAuditService audit)
    {
        _repo = repo;
        _audit = audit;
    }

    // --- Samenvatting ---

    [HttpGet("samenvatting")]
    public async Task<IActionResult> GetSamenvatting()
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return NotFound(new { error = "Geen eigenaar profiel gevonden." });
        var eid = eigenaarId.Value;

        var bezittingen = await _repo.GetFysiekeBezittingenAsync(eid);
        var rekeningen = await _repo.GetBankrekeningenAsync(eid);
        var verzekeringen = await _repo.GetVerzekeringenAsync(eid);
        var schulden = await _repo.GetSchuldenAsync(eid);

        var totaalBezittingen = bezittingen.Sum(b => b.GeschatteWaarde ?? 0);
        var totaalSaldi = rekeningen.Sum(r => r.Saldo ?? 0);
        var totaalVerzekeringen = verzekeringen.Sum(v => v.VerzekerdBedrag ?? 0);
        var totaalVerzekeringenMetBegunstigde = verzekeringen
            .Where(v => !string.IsNullOrEmpty(v.Begunstigde))
            .Sum(v => v.VerzekerdBedrag ?? 0);
        var totaalSchulden = schulden.Sum(s => s.Bedrag);
        var (brutoNalatenschap, nettoNalatenschap) = NalatenschapHelper.Bereken(
            totaalBezittingen, totaalSaldi, totaalVerzekeringen, totaalSchulden, totaalVerzekeringenMetBegunstigde);

        return Ok(new
        {
            totaalBezittingen,
            totaalSaldi,
            totaalVerzekeringen,
            totaalSchulden,
            brutoNalatenschap,
            nettoNalatenschap,
            aantalBezittingen = bezittingen.Count,
            aantalRekeningen = rekeningen.Count,
            aantalVerzekeringen = verzekeringen.Count,
            aantalSchulden = schulden.Count
        });
    }

    // --- Bezittingen ---

    [HttpGet("bezittingen")]
    public async Task<ActionResult<List<FysiekBezitResponse>>> GetBezittingen()
    {
        var items = await _repo.GetBezittingenWithNavigationAsync();
        return Ok(items.Select(ToBezitResponse).ToList());
    }

    [HttpPost("bezittingen")]
    public async Task<ActionResult<FysiekBezitResponse>> CreateBezit([FromBody] FysiekBezitUpsertRequest request)
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<FysiekBezit>();
        item.EigenaarId = eigenaarId.Value;
        await _repo.AddAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Aangemaakt", "FysiekBezit", item.Id);
        return Created($"/api/boedel/bezittingen/{item.Id}", ToBezitResponse(item));
    }

    [HttpPut("bezittingen/{id:guid}")]
    public async Task<ActionResult<FysiekBezitResponse>> UpdateBezit(Guid id, [FromBody] FysiekBezitUpsertRequest request)
    {
        var item = await _repo.FindBezitWithNavigationAsync(id);
        if (item is null) return NotFound();
        request.Adapt(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Gewijzigd", "FysiekBezit", id);
        return Ok(ToBezitResponse(item));
    }

    [HttpDelete("bezittingen/{id:guid}")]
    public async Task<IActionResult> DeleteBezit(Guid id)
    {
        var item = await _repo.FindFysiekBezitAsync(id);
        if (item is null) return NotFound();
        await _repo.RemoveAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Verwijderd", "FysiekBezit", id);
        return NoContent();
    }

    private static FysiekBezitResponse ToBezitResponse(FysiekBezit f) => new(
        f.Id, f.Categorie, f.Omschrijving,
        f.GeschatteWaarde, f.Locatie,
        f.BestemdeErfgenaamId,
        f.BestemdeErfgenaam != null
            ? $"{f.BestemdeErfgenaam.Voornaam} {f.BestemdeErfgenaam.Tussenvoegsel} {f.BestemdeErfgenaam.Achternaam}".Replace("  ", " ").Trim()
            : null,
        f.VermogensSoort,
        f.Notities, f.KadastraalNummer, f.Kenteken, f.KvKNummer,
        f.LinkedSchulden.Select(s => new BezitSchuldSummary(
            s.Id, s.Schuldeiser, s.Type, s.Bedrag,
            s.MaandelijkseAflossing, s.LeaseMaatschappij,
            s.Rentepercentage, s.Einddatum)).ToList());

    // --- Bankrekeningen ---

    [HttpGet("bankrekeningen")]
    public async Task<ActionResult<List<BankrekeningResponse>>> GetBankrekeningen()
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return Ok(new List<BankrekeningResponse>());
        var items = await _repo.GetBankrekeningenAsync(eigenaarId.Value);
        return Ok(items.Adapt<List<BankrekeningResponse>>());
    }

    [HttpPost("bankrekeningen")]
    public async Task<ActionResult<BankrekeningResponse>> CreateBankrekening([FromBody] BankrekeningUpsertRequest request)
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<Bankrekening>();
        item.EigenaarId = eigenaarId.Value;
        await _repo.AddAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Aangemaakt", "Bankrekening", item.Id);
        return Created($"/api/boedel/bankrekeningen/{item.Id}", item.Adapt<BankrekeningResponse>());
    }

    [HttpPut("bankrekeningen/{id:guid}")]
    public async Task<ActionResult<BankrekeningResponse>> UpdateBankrekening(Guid id, [FromBody] BankrekeningUpsertRequest request)
    {
        var item = await _repo.FindBankrekeningAsync(id);
        if (item is null) return NotFound();
        request.Adapt(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Gewijzigd", "Bankrekening", id);
        return Ok(item.Adapt<BankrekeningResponse>());
    }

    [HttpDelete("bankrekeningen/{id:guid}")]
    public async Task<IActionResult> DeleteBankrekening(Guid id)
    {
        var item = await _repo.FindBankrekeningAsync(id);
        if (item is null) return NotFound();
        await _repo.RemoveAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Verwijderd", "Bankrekening", id);
        return NoContent();
    }

    // --- Verzekeringen ---

    [HttpGet("verzekeringen")]
    public async Task<ActionResult<List<VerzekeringResponse>>> GetVerzekeringen()
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return Ok(new List<VerzekeringResponse>());
        var items = await _repo.GetVerzekeringenAsync(eigenaarId.Value);
        return Ok(items.Adapt<List<VerzekeringResponse>>());
    }

    [HttpPost("verzekeringen")]
    public async Task<ActionResult<VerzekeringResponse>> CreateVerzekering([FromBody] VerzekeringUpsertRequest request)
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<Verzekering>();
        item.EigenaarId = eigenaarId.Value;
        await _repo.AddAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Aangemaakt", "Verzekering", item.Id);
        return Created($"/api/boedel/verzekeringen/{item.Id}", item.Adapt<VerzekeringResponse>());
    }

    [HttpPut("verzekeringen/{id:guid}")]
    public async Task<ActionResult<VerzekeringResponse>> UpdateVerzekering(Guid id, [FromBody] VerzekeringUpsertRequest request)
    {
        var item = await _repo.FindVerzekeringAsync(id);
        if (item is null) return NotFound();
        request.Adapt(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Gewijzigd", "Verzekering", id);
        return Ok(item.Adapt<VerzekeringResponse>());
    }

    [HttpDelete("verzekeringen/{id:guid}")]
    public async Task<IActionResult> DeleteVerzekering(Guid id)
    {
        var item = await _repo.FindVerzekeringAsync(id);
        if (item is null) return NotFound();
        await _repo.RemoveAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Verwijderd", "Verzekering", id);
        return NoContent();
    }

    // --- Schulden ---

    [HttpGet("schulden")]
    public async Task<ActionResult<List<SchuldResponse>>> GetSchulden()
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return NotFound(new { error = "Geen eigenaar profiel gevonden." });

        var items = await _repo.GetSchuldenWithBezitAsync(eigenaarId.Value);
        return Ok(items.Select(s => ToSchuldResponse(s)).ToList());
    }

    // --- Bezittingen / gekoppelde schulden ---

    [HttpGet("bezittingen/{bezitId:guid}/schulden")]
    public async Task<ActionResult<List<SchuldResponse>>> GetBezitSchulden(Guid bezitId)
    {
        var bezit = await _repo.FindFysiekBezitAsync(bezitId);
        if (bezit is null) return NotFound();

        var items = await _repo.GetSchuldenByBezitIdAsync(bezitId);
        return Ok(items.Select(s => ToSchuldResponse(s)).ToList());
    }

    [HttpPost("bezittingen/{bezitId:guid}/schulden")]
    public async Task<ActionResult<SchuldResponse>> CreateBezitSchuld(Guid bezitId, [FromBody] BezitSchuldUpsertRequest request)
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var bezit = await _repo.FindFysiekBezitAsync(bezitId);
        if (bezit is null) return NotFound(new { error = "Bezitting niet gevonden." });

        var schuld = new Schuld
        {
            EigenaarId = eigenaarId.Value,
            BezitId = bezitId,
            Schuldeiser = request.Schuldeiser,
            Type = request.Type,
            Bedrag = request.Bedrag,
            MaandelijkseAflossing = request.MaandelijkseAflossing,
            LeaseMaatschappij = request.LeaseMaatschappij,
            Rentepercentage = request.Rentepercentage,
            Einddatum = request.Einddatum,
        };
        await _repo.AddAsync(schuld);
        await _repo.CommitAsync();

        schuld.Bezit = bezit;
        await _audit.LogAsync("Aangemaakt", "Schuld", schuld.Id);
        return Created($"/api/boedel/bezittingen/{bezitId}/schulden/{schuld.Id}", ToSchuldResponse(schuld));
    }

    [HttpDelete("bezittingen/{bezitId:guid}/schulden/{schuldId:guid}")]
    public async Task<IActionResult> DeleteBezitSchuld(Guid bezitId, Guid schuldId)
    {
        var schuld = await _repo.FindSchuldByIdAndBezitIdAsync(schuldId, bezitId);
        if (schuld is null) return NotFound();
        await _repo.RemoveAsync(schuld);
        await _repo.CommitAsync();
        await _audit.LogAsync("Verwijderd", "Schuld", schuldId);
        return NoContent();
    }

    // S7-05: Atomische batch-aanmaak
    [HttpPost("bezittingen/{bezitId:guid}/schulden/batch")]
    public async Task<ActionResult<List<SchuldResponse>>> CreateBezitSchuldenBatch(
        Guid bezitId,
        [FromBody] List<BezitSchuldUpsertRequest> requests)
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var bezit = await _repo.FindFysiekBezitAsync(bezitId);
        if (bezit is null) return NotFound(new { error = "Bezitting niet gevonden." });

        if (requests.Count == 0) return Ok(new List<SchuldResponse>());

        var schulden = requests.Select(r => new Schuld
        {
            EigenaarId = eigenaarId.Value,
            BezitId = bezitId,
            Schuldeiser = r.Schuldeiser,
            Type = r.Type,
            Bedrag = r.Bedrag,
            MaandelijkseAflossing = r.MaandelijkseAflossing,
            LeaseMaatschappij = r.LeaseMaatschappij,
            Rentepercentage = r.Rentepercentage,
            Einddatum = r.Einddatum,
        }).ToList();

        await _repo.BatchCreateSchuldenAsync(schulden);

        foreach (var s in schulden) { s.Bezit = bezit; }
        await _audit.LogAsync("Aangemaakt", "Schuld (batch)", schulden[0].Id);

        return Ok(schulden.Select(s => ToSchuldResponse(s)).ToList());
    }

    private static SchuldResponse ToSchuldResponse(Schuld s) => new(
        s.Id, s.Schuldeiser,
        s.SchuldeiserTelefoon, s.SchuldeiserEmail,
        s.Type, s.Bedrag, s.MaandelijkseAflossing,
        s.Referentie, s.VermogensSoort, s.Notities,
        s.HypotheekVorm, s.Rentepercentage,
        s.MaandelijkseRente, s.Einddatum, s.Restschuld,
        s.LeaseMaatschappij,
        s.BezitId, s.Bezit?.Omschrijving);

    [HttpPost("schulden")]
    public async Task<ActionResult<SchuldResponse>> CreateSchuld([FromBody] SchuldUpsertRequest request)
    {
        var eigenaarId = await _repo.GetEigenaarIdAsync();
        if (eigenaarId is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<Schuld>();
        item.EigenaarId = eigenaarId.Value;
        await _repo.AddAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Aangemaakt", "Schuld", item.Id);
        return Created($"/api/boedel/schulden/{item.Id}", ToSchuldResponse(item));
    }

    [HttpPut("schulden/{id:guid}")]
    public async Task<ActionResult<SchuldResponse>> UpdateSchuld(Guid id, [FromBody] SchuldUpsertRequest request)
    {
        var item = await _repo.FindSchuldAsync(id);
        if (item is null) return NotFound();
        request.Adapt(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Gewijzigd", "Schuld", id);
        return Ok(ToSchuldResponse(item));
    }

    [HttpDelete("schulden/{id:guid}")]
    public async Task<IActionResult> DeleteSchuld(Guid id)
    {
        var item = await _repo.FindSchuldAsync(id);
        if (item is null) return NotFound();
        await _repo.RemoveAsync(item);
        await _repo.CommitAsync();
        await _audit.LogAsync("Verwijderd", "Schuld", id);
        return NoContent();
    }
}