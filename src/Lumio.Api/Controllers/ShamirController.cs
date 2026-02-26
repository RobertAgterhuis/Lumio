using Lumio.Api.Data;
using Lumio.Api.Dtos.Shamir;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/shamir")]
public class ShamirController : ControllerBase
{
    private readonly IShamirService _shamirService;
    private readonly IMasterPasswordService _masterPassword;
    private readonly LumioDbContext _db;
    private readonly LimietenOptions _limieten;

    public ShamirController(
        IShamirService shamirService,
        IMasterPasswordService masterPassword,
        LumioDbContext db,
        IOptions<LimietenOptions> limieten)
    {
        _shamirService = shamirService;
        _masterPassword = masterPassword;
        _db = db;
        _limieten = limieten.Value;
    }

    [HttpPost("genereer")]
    public async Task<ActionResult<GenereerSharesResponse>> Genereer([FromBody] GenereerSharesRequest request)
    {
        if (request.Drempel < _limieten.ShamirMinDrempel)
            return BadRequest(new { error = $"Drempel moet minimaal {_limieten.ShamirMinDrempel} zijn." });
        if (request.AantalDelen < request.Drempel)
            return BadRequest(new { error = "Aantal delen moet >= drempel zijn." });

        // S2-07: Validate the master password before generating shares
        var geldig = await _masterPassword.UnlockAsync(request.Wachtwoord);
        if (!geldig)
            return Unauthorized(new { error = "Ongeldig wachtwoord. Shamir-sleutels kunnen niet worden gegenereerd." });

        var result = _shamirService.GenerateShares(request.Wachtwoord, request.AantalDelen, request.Drempel);

        // Reset all existing share assignments first
        var alleErfgenamen = await _db.Erfgenamen.ToListAsync();
        foreach (var e in alleErfgenamen)
        {
            e.ShareIndex = null;
            e.HeeftShareOntvangen = false;
            e.ShareUitgegevenOp = null;
        }

        // Assign shares by stable ID order (not alphabetical)
        var erfgenamen = alleErfgenamen.OrderBy(e => e.Id).Take(result.Shares.Count).ToList();
        for (int i = 0; i < erfgenamen.Count; i++)
        {
            erfgenamen[i].ShareIndex = result.Shares[i].Index;
            erfgenamen[i].HeeftShareOntvangen = true;
            erfgenamen[i].ShareUitgegevenOp = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync();

        var response = new GenereerSharesResponse(
            result.Shares.Select(s => new ShareInfo(s.Index, s.Value)).ToList(),
            result.Threshold,
            result.TotalShares);

        return Ok(response);
    }

    /// <summary>
    /// Valideert Shamir-delen zonder het wachtwoord te retourneren.
    /// Gebruik /reconstrueer-en-ontgrendel voor echte toegang (S2-02/S2-06 security fix).
    /// </summary>
    [HttpPost("reconstrueer")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public IActionResult Reconstrueer([FromBody] ReconstrueerRequest request)
    {
        try
        {
            _shamirService.ReconstructSecret(request.Delen);
            // S2-06: Never return the reconstructed secret — validation only
            return Ok(new { succes = true });
        }
        catch
        {
            return BadRequest(new { error = "Kan geheim niet reconstrueren met de gegeven delen." });
        }
    }

    [HttpPost("reconstrueer-en-ontgrendel")]
    public async Task<IActionResult> ReconstrueerEnOntgrendel([FromBody] ReconstrueerRequest request)
    {
        try
        {
            var wachtwoord = _shamirService.ReconstructSecret(request.Delen);
            var success = await _masterPassword.UnlockAsync(wachtwoord);
            if (!success)
                return Unauthorized(new { error = "Gereconstrueerd wachtwoord is ongeldig." });

            // Erfgenaam-toegang is altijd read-only
            _masterPassword.SetReadOnly(true);

            return Ok(new { succes = true, bericht = "Database ontgrendeld via Shamir reconstructie.", isAlleenLezen = true });
        }
        catch
        {
            return BadRequest(new { error = "Kan geheim niet reconstrueren met de gegeven delen." });
        }
    }
}
