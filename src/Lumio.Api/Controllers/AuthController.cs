using Lumio.Api.Data;
using Lumio.Api.Dtos.Auth;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMasterPasswordService _passwordService;
    private readonly IProfileService _profileService;

    public AuthController(IMasterPasswordService passwordService, IProfileService profileService)
    {
        _passwordService = passwordService;
        _profileService = profileService;
    }

    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        var activeProfile = _profileService.ActiveProfile;
        return Ok(new
        {
            isOntgrendeld = _passwordService.IsUnlocked,
            isEersteKeer = _profileService.IsFirstRun,
            profielGeselecteerd = activeProfile != null,
            actiefProfiel = activeProfile == null ? null : new
            {
                id = activeProfile.Id,
                naam = activeProfile.Naam
            },
            // If a profile is selected but has no DB yet, it needs setup
            profielHeeftSetupNodig = activeProfile != null && !_profileService.ActiveProfileDbExists
        });
    }

    [HttpPost("selecteer-profiel")]
    public IActionResult SelecteerProfiel([FromBody] SelectProfileRequest request)
    {
        try
        {
            // Lock current profile first if unlocked
            if (_passwordService.IsUnlocked)
                _passwordService.Lock();

            _profileService.SelectProfile(request.ProfielId);
            var profile = _profileService.ActiveProfile!;
            return Ok(new
            {
                bericht = $"Profiel '{profile.Naam}' geselecteerd.",
                heeftSetupNodig = !_profileService.ActiveProfileDbExists
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("setup")]
    public async Task<IActionResult> Setup(
        [FromBody] SetupRequest request,
        [FromServices] IServiceProvider serviceProvider)
    {
        if (_profileService.ActiveProfile == null)
            return BadRequest(new { error = "Geen profiel geselecteerd. Selecteer of maak eerst een profiel aan." });

        if (!_passwordService.IsFirstRun)
            return BadRequest(new { error = "Database bestaat al. Gebruik ontgrendel." });

        if (string.IsNullOrWhiteSpace(request.Wachtwoord) || request.Wachtwoord.Length < 8)
            return BadRequest(new { error = "Wachtwoord moet minimaal 8 tekens bevatten." });

        // (1) Set the password — now IsUnlocked = true
        await _passwordService.SetupAsync(request.Wachtwoord);

        // (2) Create a NEW scope so DbContext gets the real SQLCipher connection string
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LumioDbContext>();

        // (3) Now the connection string points to the real encrypted database
        await db.Database.EnsureCreatedAsync();

        return Ok(new { bericht = "Database aangemaakt en ontgrendeld." });
    }

    [HttpPost("ontgrendel")]
    public async Task<IActionResult> Ontgrendel([FromBody] OntgrendelRequest request)
    {
        if (_profileService.ActiveProfile == null)
            return BadRequest(new { error = "Geen profiel geselecteerd." });

        if (_passwordService.IsFirstRun)
            return BadRequest(new { error = "Geen database gevonden. Gebruik setup." });

        if (_passwordService.IsUnlocked)
            return Ok(new { bericht = "Database is al ontgrendeld." });

        var success = await _passwordService.UnlockAsync(request.Wachtwoord);
        if (!success)
            return Unauthorized(new { error = "Ongeldig wachtwoord." });

        return Ok(new { bericht = "Database ontgrendeld." });
    }

    [HttpPost("vergrendel")]
    public IActionResult Vergrendel()
    {
        _passwordService.Lock();
        _profileService.DeselectProfile();
        return Ok(new { bericht = "Database vergrendeld." });
    }

    [HttpPost("wachtwoord")]
    public async Task<IActionResult> WijzigWachtwoord([FromBody] WachtwoordWijzigenRequest request)
    {
        if (!_passwordService.IsUnlocked)
            return StatusCode(423, new { error = "Database is vergrendeld." });

        if (string.IsNullOrWhiteSpace(request.NieuwWachtwoord) || request.NieuwWachtwoord.Length < 8)
            return BadRequest(new { error = "Nieuw wachtwoord moet minimaal 8 tekens bevatten." });

        await _passwordService.ChangePasswordAsync(request.HuidigWachtwoord, request.NieuwWachtwoord);
        return Ok(new { bericht = "Wachtwoord gewijzigd. Let op: bestaande Shamir-sleuteldelen zijn ongeldig geworden." });
    }

    [HttpDelete("account")]
    public async Task<IActionResult> VerwijderAccount([FromBody] OntgrendelRequest request)
    {
        if (!_passwordService.IsUnlocked)
            return StatusCode(423, new { error = "Database is vergrendeld." });

        if (_profileService.ActiveProfile == null)
            return BadRequest(new { error = "Geen profiel geselecteerd." });

        // Verify the password before deleting
        var success = await _passwordService.UnlockAsync(request.Wachtwoord);
        if (!success)
            return Unauthorized(new { error = "Ongeldig wachtwoord." });

        var profileId = _profileService.ActiveProfile.Id;

        // Lock the database first
        _passwordService.Lock();

        // Delete the profile and its files
        _profileService.DeleteProfile(profileId);

        return Ok(new { bericht = "Alle gegevens zijn permanent verwijderd." });
    }

    [HttpPost("ontgrendel-erfgenaam")]
    public async Task<IActionResult> OntgrendelErfgenaam(
        [FromBody] OntgrendelErfgenaamRequest request,
        [FromServices] IShamirService shamirService)
    {
        if (_passwordService.IsFirstRun)
            return BadRequest(new { error = "Geen database gevonden." });

        try
        {
            var password = shamirService.ReconstructSecret(request.Shares);
            var success = await _passwordService.UnlockAsync(password);
            if (!success)
                return Unauthorized(new { error = "Sleuteldelen konden het wachtwoord niet herstellen." });

            return Ok(new { bericht = "Database ontgrendeld via erfgenaam-toegang." });
        }
        catch
        {
            return BadRequest(new { error = "Ongeldige sleuteldelen. Controleer of u het juiste aantal delen heeft." });
        }
    }
}
