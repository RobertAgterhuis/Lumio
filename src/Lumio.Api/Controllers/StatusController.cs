using Lumio.Api.Data;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/status")]
public class StatusController : ControllerBase
{
    [HttpGet]
    public IActionResult GetStatus(
        [FromServices] IMasterPasswordService passwordService,
        [FromServices] IProfileService profileService)
    {
        var activeProfile = profileService.ActiveProfile;
        return Ok(new
        {
            status = "ok",
            versie = "1.0.0",
            isOntgrendeld = passwordService.IsUnlocked,
            isEersteKeer = profileService.IsFirstRun,
            profielGeselecteerd = activeProfile != null,
            actiefProfiel = activeProfile?.Naam
        });
    }

    [HttpGet("compleetheid")]
    public async Task<IActionResult> GetCompleetheid([FromServices] LumioDbContext db)
    {
        var eigenaar = await db.Eigenaren.AnyAsync();
        var testament = await db.Testamenten.AnyAsync();
        var euthanasie = await db.Wilsverklaringen.AnyAsync();
        var donor = await db.DonorRegistraties.AnyAsync();
        var digitaalBezit = await db.DigitaleAccounts.AnyAsync() || await db.Wachtwoorden.AnyAsync() || await db.CryptoWallets.AnyAsync();
        var boedel = await db.FysiekeBezittingen.AnyAsync() || await db.Bankrekeningen.AnyAsync() || await db.Verzekeringen.AnyAsync();
        var uitvaart = await db.UitvaartWensen.AnyAsync();
        var documenten = await db.Documenten.AnyAsync();
        var erfgenamen = await db.Erfgenamen.AnyAsync();
        var noodcontacten = await db.Noodcontacten.AnyAsync();

        var domeinen = new[]
        {
            new { domein = "eigenaar", label = "Mijn Profiel", ingevuld = eigenaar },
            new { domein = "testament", label = "Testament", ingevuld = testament },
            new { domein = "euthanasie", label = "Wilsverklaring", ingevuld = euthanasie },
            new { domein = "donor", label = "Donorregistratie", ingevuld = donor },
            new { domein = "digitaal-bezit", label = "Digitaal Bezit", ingevuld = digitaalBezit },
            new { domein = "boedel", label = "Boedel", ingevuld = boedel },
            new { domein = "uitvaart", label = "Uitvaartwensen", ingevuld = uitvaart },
            new { domein = "documenten", label = "Documenten", ingevuld = documenten },
            new { domein = "erfgenamen", label = "Erfgenamen", ingevuld = erfgenamen },
            new { domein = "noodcontacten", label = "Noodcontacten", ingevuld = noodcontacten },
        };

        var aantalIngevuld = domeinen.Count(d => d.ingevuld);
        var totaal = domeinen.Length;
        var percentage = totaal > 0 ? (int)Math.Round(100.0 * aantalIngevuld / totaal) : 0;

        return Ok(new
        {
            percentage,
            aantalIngevuld,
            totaal,
            domeinen
        });
    }
}
