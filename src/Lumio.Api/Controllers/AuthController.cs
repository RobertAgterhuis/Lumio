using Lumio.Api.Data;
using Lumio.Api.Dtos.Auth;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IMasterPasswordService _passwordService;
    private readonly IProfileService _profileService;
    private readonly IAuditService _audit;
    private readonly LimietenOptions _limieten;
    private readonly IWebHostEnvironment _env;
    private readonly IBruteForceProtectionService _bruteForce;

    public AuthController(
        IMasterPasswordService passwordService,
        IProfileService profileService,
        IAuditService audit,
        IOptions<LimietenOptions> limieten,
        IWebHostEnvironment env,
        IBruteForceProtectionService bruteForce)
    {
        _passwordService = passwordService;
        _profileService = profileService;
        _audit = audit;
        _limieten = limieten.Value;
        _env = env;
        _bruteForce = bruteForce;
    }

    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        var activeProfile = _profileService.ActiveProfile;
        return Ok(new
        {
            isOntgrendeld = _passwordService.IsUnlocked,
            isEersteKeer = _profileService.IsFirstRun,
            isAlleenLezen = _passwordService.IsReadOnly,
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

    [HttpPost("ontgrendel")]
    public async Task<IActionResult> Ontgrendel(
        [FromBody] OntgrendelRequest request,
        [FromServices] IServiceProvider serviceProvider)
    {
        if (_profileService.ActiveProfile == null)
            return BadRequest(new { error = "Geen profiel geselecteerd." });

        if (_passwordService.IsFirstRun)
            return BadRequest(new { error = "Geen database gevonden. Gebruik setup." });

        if (_passwordService.IsUnlocked)
            return Ok(new { bericht = "Database is al ontgrendeld." });

        // GAP-SEC-02: Brute-force bescherming — geef 429 terug als het account geblokkeerd is.
        var profileId = _profileService.ActiveProfile.Id.ToString();
        if (_bruteForce.IsLocked(profileId))
        {
            var remaining = _bruteForce.GetRemainingLockout(profileId);
            return StatusCode(
                StatusCodes.Status429TooManyRequests,
                new
                {
                    error = "Te veel mislukte pogingen. Probeer het later opnieuw.",
                    lockoutRemainingSeconds = (int)(remaining?.TotalSeconds ?? 0)
                });
        }

        var success = await _passwordService.UnlockAsync(request.Wachtwoord);
        if (!success)
        {
            _bruteForce.RecordFailedAttempt(profileId);
            return Unauthorized(new { error = "Ongeldig wachtwoord." });
        }

        // Succesvolle ontgrendeling — reset pogingenteller.
        _bruteForce.RecordSuccess(profileId);

        // In development: apply any pending EF migrations automatically.
        // In production: the schema is managed by SQL scripts — no auto-migration.
        if (_env.IsDevelopment())
        {
            using var scope = serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<LumioDbContext>();
            await db.Database.MigrateAsync();
        }

        await _audit.LogAsync("Ontgrendeld", details: $"Profiel: {_profileService.ActiveProfile?.Naam}");
        return Ok(new { bericht = "Database ontgrendeld." });
    }

    [HttpPost("vergrendel")]
    public async Task<IActionResult> Vergrendel()
    {
        await _audit.LogAsync("Vergrendeld", details: $"Profiel: {_profileService.ActiveProfile?.Naam}");
        _passwordService.Lock();
        _profileService.DeselectProfile();
        return Ok(new { bericht = "Database vergrendeld." });
    }

    [HttpPost("wachtwoord")]
    public async Task<IActionResult> WijzigWachtwoord([FromBody] WachtwoordWijzigenRequest request)
    {
        if (!_passwordService.IsUnlocked)
            return StatusCode(423, new { error = "Database is vergrendeld." });

        if (string.IsNullOrWhiteSpace(request.NieuwWachtwoord) || request.NieuwWachtwoord.Length < _limieten.WachtwoordMinLengte)
            return BadRequest(new { error = $"Nieuw wachtwoord moet minimaal {_limieten.WachtwoordMinLengte} tekens bevatten." });

        await _passwordService.ChangePasswordAsync(request.HuidigWachtwoord, request.NieuwWachtwoord);
        await _audit.LogAsync("Wachtwoord gewijzigd", details: $"Profiel: {_profileService.ActiveProfile?.Naam}");
        return Ok(new { bericht = "Wachtwoord gewijzigd. Let op: bestaande Shamir-sleuteldelen zijn ongeldig geworden." });
    }

    [HttpDelete("account")]
    public async Task<IActionResult> VerwijderAccount([FromBody] OntgrendelRequest request)
    {
        if (!_passwordService.IsUnlocked)
            return StatusCode(423, new { error = "Database is vergrendeld." });

        if (_profileService.ActiveProfile == null)
            return BadRequest(new { error = "Geen profiel geselecteerd." });

        // AVG Art.17: Re-authenticate with password before destructive operation.
        // Use VerifyPasswordAsync (no side-effects) — DB is already unlocked.
        var verified = await _passwordService.VerifyPasswordAsync(request.Wachtwoord);
        if (!verified)
            return Unauthorized(new { error = "Ongeldig wachtwoord." });

        var profileId = _profileService.ActiveProfile.Id;
        var profileNaam = _profileService.ActiveProfile.Naam;

        // AVG Art.17: Audit BEFORE lock/delete — DB must still be open to write the log.
        await _audit.LogAsync("Account verwijderd", entityType: "Account", entityId: profileId,
            details: $"Profiel '{profileNaam}' en alle bijbehorende gegevens permanent verwijderd (AVG Art.17 verzoek).");

        // Lock the database connection before removing the files.
        _passwordService.Lock();

        // Delete the profile entry, database file and salt.
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

            // Erfgenaam-toegang is altijd read-only
            _passwordService.SetReadOnly(true);

            return Ok(new { bericht = "Database ontgrendeld via erfgenaam-toegang.", isAlleenLezen = true });
        }
        catch
        {
            return BadRequest(new { error = "Ongeldige sleuteldelen. Controleer of u het juiste aantal delen heeft." });
        }
    }
}
