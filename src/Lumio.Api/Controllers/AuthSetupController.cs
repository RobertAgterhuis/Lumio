using Lumio.Api.Data;
using Lumio.Api.Dtos.Auth;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

/// <summary>
/// Handles profile selection and first-run database setup.
/// Extracted from AuthController (SP-7-004 / GUARD-010 refactoring).
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthSetupController : ControllerBase
{
    private readonly IMasterPasswordService _passwordService;
    private readonly IProfileService _profileService;
    private readonly LimietenOptions _limieten;

    public AuthSetupController(
        IMasterPasswordService passwordService,
        IProfileService profileService,
        IOptions<LimietenOptions> limieten)
    {
        _passwordService = passwordService;
        _profileService = profileService;
        _limieten = limieten.Value;
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

        if (string.IsNullOrWhiteSpace(request.Wachtwoord) || request.Wachtwoord.Length < _limieten.WachtwoordMinLengte)
            return BadRequest(new { error = $"Wachtwoord moet minimaal {_limieten.WachtwoordMinLengte} tekens bevatten." });

        // (1) Set the password — now IsUnlocked = true
        await _passwordService.SetupAsync(request.Wachtwoord);

        // (2) Create a NEW scope so DbContext gets the real SQLCipher connection string
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LumioDbContext>();

        // (3) Apply all migrations (creates schema + __EFMigrationsHistory)
        await db.Database.MigrateAsync();

        // Ensure new columns are present even if migration had SQLite FK issues
        await MigratieDbHelper.EnsureSchuldKolommenAsync(db);

        return Ok(new { bericht = "Database aangemaakt en ontgrendeld." });
    }
}
