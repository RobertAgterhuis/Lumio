using Lumio.Api.Data;
using Lumio.Api.Dtos.Shamir;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/shamir")]
public class ShamirController : ControllerBase
{
    private readonly IShamirService _shamirService;
    private readonly IMasterPasswordService _masterPassword;
    private readonly LumioDbContext _db;

    public ShamirController(IShamirService shamirService, IMasterPasswordService masterPassword, LumioDbContext db)
    {
        _shamirService = shamirService;
        _masterPassword = masterPassword;
        _db = db;
    }

    [HttpPost("genereer")]
    public async Task<ActionResult<GenereerSharesResponse>> Genereer([FromBody] GenereerSharesRequest request)
    {
        if (request.Drempel < 2)
            return BadRequest(new { error = "Drempel moet minimaal 2 zijn." });
        if (request.AantalDelen < request.Drempel)
            return BadRequest(new { error = "Aantal delen moet >= drempel zijn." });

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

    [HttpPost("reconstrueer")]
    public IActionResult Reconstrueer([FromBody] ReconstrueerRequest request)
    {
        try
        {
            var secret = _shamirService.ReconstructSecret(request.Delen);
            return Ok(new { wachtwoord = secret });
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

            return Ok(new { succes = true, bericht = "Database ontgrendeld via Shamir reconstructie." });
        }
        catch
        {
            return BadRequest(new { error = "Kan geheim niet reconstrueren met de gegeven delen." });
        }
    }
}
