using Lumio.Api.Dtos.Auth;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/profielen")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    /// <summary>Get all profiles.</summary>
    [HttpGet]
    public ActionResult<List<ProfileResponse>> GetAll()
    {
        var profiles = _profileService.GetProfiles()
            .Select(p => new ProfileResponse(p.Id, p.Naam, p.Relatie, p.IsPrimair, p.AangemaaktOp, p.FotoThumbnail))
            .ToList();
        return Ok(profiles);
    }

    /// <summary>Create a new profile. Max 5.</summary>
    [HttpPost]
    public ActionResult<ProfileResponse> Create([FromBody] CreateProfileRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Naam))
            return BadRequest(new { error = "Naam is verplicht." });

        if (string.IsNullOrWhiteSpace(request.Relatie))
            return BadRequest(new { error = "Relatie is verplicht." });

        var allowedRelaties = new[] { "Partner", "Kind", "Ouder", "Overig" };
        if (!_profileService.IsFirstRun && !allowedRelaties.Contains(request.Relatie))
            return BadRequest(new { error = "Ongeldige relatie. Kies uit: Partner, Kind, Ouder, Overig." });

        try
        {
            var profile = _profileService.CreateProfile(request.Naam, request.Relatie);
            return Ok(new ProfileResponse(profile.Id, profile.Naam, profile.Relatie, profile.IsPrimair, profile.AangemaaktOp, profile.FotoThumbnail));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>Delete a profile and all its data. Requires the active database to be unlocked.</summary>
    [HttpDelete("{id:guid}")]
    public IActionResult Delete(
        Guid id,
        [FromServices] IMasterPasswordService passwordService)
    {
        var profile = _profileService.GetProfile(id);
        if (profile == null)
            return NotFound(new { error = "Profiel niet gevonden." });

        // S2-04: Allow deleting any non-primary profile when the active DB is unlocked
        if (!passwordService.IsUnlocked)
            return StatusCode(423, new { error = "Database is vergrendeld. Ontgrendel uw profiel eerst." });

        try
        {
            // Lock the session only when deleting the currently active profile
            if (_profileService.ActiveProfile?.Id == id)
                passwordService.Lock();

            _profileService.DeleteProfile(id);
            return Ok(new { bericht = "Profiel en alle bijbehorende gegevens zijn permanent verwijderd." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
