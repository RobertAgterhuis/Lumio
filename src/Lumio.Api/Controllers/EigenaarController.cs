using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services;
using Lumio.Api.Services.Security;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/eigenaar")]
public class EigenaarController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly LimietenOptions _limieten;
    private readonly IProfileService _profileService;
    private readonly IAuditService _audit;

    public EigenaarController(LumioDbContext db, IOptions<LimietenOptions> limieten, IProfileService profileService, IAuditService audit)
    {
        _db = db;
        _limieten = limieten.Value;
        _profileService = profileService;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<EigenaarResponse>> Get()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return NotFound(new { error = "Eigenaar profiel nog niet aangemaakt." });

        return Ok(eigenaar.Adapt<EigenaarResponse>());
    }

    [HttpPost]
    public async Task<ActionResult<EigenaarResponse>> Create([FromBody] EigenaarUpsertRequest request)
    {
        var existing = await _db.Eigenaren.FirstOrDefaultAsync();
        if (existing is not null)
            return BadRequest(new { error = "Eigenaar profiel bestaat al. Gebruik PUT om te wijzigen." });

        var eigenaar = request.Adapt<Eigenaar>();
        _db.Eigenaren.Add(eigenaar);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Aangemaakt", "Eigenaar", eigenaar.Id);

        return CreatedAtAction(nameof(Get), eigenaar.Adapt<EigenaarResponse>());
    }

    [HttpPut]
    public async Task<ActionResult<EigenaarResponse>> Update([FromBody] EigenaarUpsertRequest request)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return NotFound(new { error = "Eigenaar profiel nog niet aangemaakt." });

        request.Adapt(eigenaar);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "Eigenaar", eigenaar.Id);

        return Ok(eigenaar.Adapt<EigenaarResponse>());
    }

    // P-M16: Profielfoto endpoints

    [HttpGet("foto")]
    public async Task<IActionResult> GetFoto()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar?.ProfielFoto is null)
            return NotFound(new { error = "Geen profielfoto gevonden." });

        return File(eigenaar.ProfielFoto, eigenaar.ProfielFotoContentType ?? "image/jpeg", eigenaar.ProfielFotoNaam ?? "profielfoto.jpg");
    }

    [HttpPost("foto")]
    [RequestSizeLimit(10_485_760)] // 10 MB (compile-time upper bound)
    public async Task<IActionResult> UploadFoto([FromForm] IFormFile bestand)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        if (!bestand.ContentType.StartsWith("image/"))
            return BadRequest(new { error = "Alleen afbeeldingen zijn toegestaan." });

        if (bestand.Length > _limieten.FotoMaxBytes)
            return BadRequest(new { error = $"Bestand is te groot. Maximum is {_limieten.FotoMaxBytes / 1_048_576} MB." });

        using var ms = new MemoryStream();
        await bestand.CopyToAsync(ms);

        eigenaar.ProfielFoto = ms.ToArray();
        eigenaar.ProfielFotoContentType = bestand.ContentType;
        eigenaar.ProfielFotoNaam = bestand.FileName;
        await _db.SaveChangesAsync();

        // Save a small thumbnail in profiles.json (available before DB unlock)
        var thumbnailBase64 = $"data:{bestand.ContentType};base64,{Convert.ToBase64String(ms.ToArray())}";
        _profileService.UpdateActiveProfileThumbnail(thumbnailBase64);
        await _audit.LogAsync("Gewijzigd", "Eigenaar", eigenaar.Id, "profielfoto-upload");

        return Ok(new { message = "Profielfoto opgeslagen." });
    }

    [HttpDelete("foto")]
    public async Task<IActionResult> DeleteFoto()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return NotFound(new { error = "Eigenaar profiel niet gevonden." });

        eigenaar.ProfielFoto = null;
        eigenaar.ProfielFotoContentType = null;
        eigenaar.ProfielFotoNaam = null;
        await _db.SaveChangesAsync();

        // Clear thumbnail from profiles.json
        _profileService.UpdateActiveProfileThumbnail(null);
        await _audit.LogAsync("Gewijzigd", "Eigenaar", eigenaar.Id, "profielfoto-verwijderd");

        return NoContent();
    }

    // S6-22: Onboarding wizard status
    [HttpPost("onboarding-voltooid")]
    public async Task<IActionResult> OnboardingVoltooid()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        if (!eigenaar.OnboardingVoltooid)
        {
            eigenaar.OnboardingVoltooid = true;
            await _db.SaveChangesAsync();
            await _audit.LogAsync("Onboarding voltooid", "Eigenaar", eigenaar.Id);
        }
        return Ok(new { onboardingVoltooid = eigenaar.OnboardingVoltooid });
    }

    // S6-22: Get onboarding status
    [HttpGet("onboarding-status")]
    public async Task<IActionResult> GetOnboardingStatus()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return Ok(new { onboardingVoltooid = false });
        return Ok(new { onboardingVoltooid = eigenaar.OnboardingVoltooid });
    }
}
