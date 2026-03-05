using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.Testament;
using Lumio.Api.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/testament")]
public class TestamentJuridischeCheckController : ControllerBase
{
    private readonly ITestamentJuridischeCheckRepository _repo;
    private readonly IStringLocalizer<TestamentJuridischeCheckController> L;

    public TestamentJuridischeCheckController(
        ITestamentJuridischeCheckRepository repo,
        IStringLocalizer<TestamentJuridischeCheckController> localizer)
    {
        _repo = repo;
        L = localizer;
    }

    [HttpGet("juridische-check")]
    public async Task<IActionResult> JuridischeCheck()
    {
        var data = await _repo.GetCheckDataAsync();

        var eigenaar  = data.Eigenaar;
        var testament = data.Testament;
        var begunstigden = data.Begunstigden;
        var executeurs   = data.Executeurs;
        var erfgenamen   = data.Erfgenamen;
        var boedelBezittingen = data.FysiekeBezittingen;

        var waarschuwingen = new List<object>();

        if (testament != null)
        {
            var type = testament.TestamentType?.ToLowerInvariant() ?? "";
            var heeftOnroerendGoed = boedelBezittingen.Any(b =>
                (b.Categorie ?? "").ToLowerInvariant().Contains("woning") ||
                (b.Categorie ?? "").ToLowerInvariant().Contains("huis") ||
                (b.Categorie ?? "").ToLowerInvariant().Contains("appartement") ||
                (b.Categorie ?? "").ToLowerInvariant().Contains("grond") ||
                (b.Categorie ?? "").ToLowerInvariant().Contains("onroerend") ||
                (b.Categorie ?? "").ToLowerInvariant().Contains("pand") ||
                (b.KadastraalNummer != null && b.KadastraalNummer.Length > 0));

            if (type.Contains("codicil") && heeftOnroerendGoed)
                waarschuwingen.Add(new { ernst = L["SeverityHigh"].Value, categorie = L["CategoryTestamentType"].Value, melding = L["WarningCodicilRealEstate"].Value, suggestie = L["SuggestionConsiderNotarialWill"].Value });

            if ((type.Contains("handgeschreven") || type.Contains("eigen") || type.Contains("olografisch")) && executeurs.Count > 0)
                waarschuwingen.Add(new { ernst = L["SeverityMedium"].Value, categorie = L["CategoryExecutor"].Value, melding = L["WarningHandwrittenExecutor"].Value, suggestie = L["SuggestionIncludeExecutorInNotarialWill"].Value });

            var heeftKinderen = erfgenamen.Any(e =>
                (e.Relatie ?? "").ToLowerInvariant().Contains("kind") ||
                (e.Relatie ?? "").ToLowerInvariant().Contains("zoon") ||
                (e.Relatie ?? "").ToLowerInvariant().Contains("dochter"));
            if (testament.UitsluitingsClausule != true && heeftKinderen)
                waarschuwingen.Add(new { ernst = L["SeverityInfo"].Value, categorie = L["CategoryExclusionClause"].Value, melding = L["WarningNoExclusionClause"].Value, suggestie = L["SuggestionAddExclusionClause"].Value });

            var totPct = begunstigden.Where(b => b.Percentage.HasValue).Sum(b => b.Percentage!.Value);
            if (begunstigden.Count > 0 && totPct > 0 && totPct != 100)
            {
                var pctErnst = totPct > 100 ? L["SeverityHigh"].Value : L["SeverityMedium"].Value;
                waarschuwingen.Add(new { ernst = pctErnst, categorie = L["CategoryDistribution"].Value, melding = L["WarningPercentageMismatch", totPct].Value, suggestie = L["SuggestionCheckPercentages"].Value });
            }

            if (string.IsNullOrWhiteSpace(testament.NotarisContact?.Naam))
                waarschuwingen.Add(new { ernst = L["SeverityInfo"].Value, categorie = L["CategoryNotary"].Value, melding = L["WarningNoNotary"].Value, suggestie = L["SuggestionFillInNotary"].Value });

            var executeurNamen = executeurs.Select(e => e.Naam.ToLowerInvariant()).ToHashSet();
            var begunstigdenAlsExecuteur = begunstigden.Where(b => executeurNamen.Contains(b.Naam.ToLowerInvariant())).ToList();
            if (begunstigdenAlsExecuteur.Count > 0)
            {
                var namen = string.Join(", ", begunstigdenAlsExecuteur.Select(b => b.Naam));
                waarschuwingen.Add(new { ernst = L["SeverityMedium"].Value, categorie = L["CategoryExecutor"].Value, melding = L["WarningExecutorAlsoBeneficiary", namen].Value, suggestie = L["SuggestionExecutorConflict"].Value });
            }

            if (eigenaar is not null &&
                (eigenaar.BurgerlijkeStaat == BurgerlijkeStaat.Gehuwd ||
                 eigenaar.BurgerlijkeStaat == BurgerlijkeStaat.GeregistreerdPartnerschap))
            {
                var partnerAlsBegunstigde = begunstigden.Any(b =>
                    (b.Relatie ?? "").ToLowerInvariant().Contains("partner") ||
                    (b.Relatie ?? "").ToLowerInvariant().Contains("echtgeno"));
                if (!partnerAlsBegunstigde)
                    waarschuwingen.Add(new { ernst = L["SeverityInfo"].Value, categorie = L["CategoryDistribution"].Value, melding = L["WarningPartnerNotBeneficiary"].Value, suggestie = L["SuggestionAddPartnerBeneficiary"].Value });
            }

            if (begunstigden.Count == 0)
                waarschuwingen.Add(new { ernst = L["SeverityHigh"].Value, categorie = L["CategoryDistribution"].Value, melding = L["WarningNoBeneficiaries"].Value, suggestie = L["SuggestionAddBeneficiaries"].Value });
        }

        var zonderContact = erfgenamen.Where(e =>
            string.IsNullOrWhiteSpace(e.Telefoon) && string.IsNullOrWhiteSpace(e.Email)).ToList();
        if (zonderContact.Count > 0)
        {
            var namen = string.Join(", ", zonderContact.Select(e =>
                string.IsNullOrWhiteSpace(e.Tussenvoegsel)
                    ? $"{e.Voornaam} {e.Achternaam}"
                    : $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}"));
            var key = zonderContact.Count == 1 ? "WarningHeirWithoutContactSingle" : "WarningHeirsWithoutContactMultiple";
            waarschuwingen.Add(new { ernst = L["SeverityInfo"].Value, categorie = L["CategoryContactDetails"].Value, melding = L[key, zonderContact.Count, namen].Value, suggestie = L["SuggestionFillContactDetails"].Value });
        }

        return Ok(new { aantalWaarschuwingen = waarschuwingen.Count, waarschuwingen });
    }
}
