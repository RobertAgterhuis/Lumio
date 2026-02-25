using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Results;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Rules.Services;

/// <summary>Berekent de compleetheid van het profiel op basis van ingevulde velden.</summary>
public interface ICompleetheidsService
{
    /// <summary>Simpele domein-level compleetheid (aan/uit per domein).</summary>
    PolicyResult<CompleetheidsResultaat> BerekenSimpel(CompleetFacts facts);

    /// <summary>Granulaire veld-level compleetheid met deelscores.</summary>
    PolicyResult<CompleetheidsResultaat> BerekenGranulair(CompleetFacts facts);
}

/// <summary>
/// Compleetheids-berekening: zowel simpel (boolean per domein) als granulair (velden per domein).
/// Vervangt inline logica in StatusController.GetCompleetheid() en GetGranulairCompleetheid().
/// </summary>
public class CompleetheidsService : ICompleetheidsService
{
    private readonly CompleetheidsOptions _options;
    private readonly string _regelVersie;
    private readonly IStringLocalizer<CompleetheidsService> L;

    public CompleetheidsService(
        IOptions<CompleetheidsOptions> options,
        IOptions<LumioRulesOptions> rootOptions,
        IStringLocalizer<CompleetheidsService> localizer)
    {
        _options = options.Value;
        _regelVersie = rootOptions.Value.Versie;
        L = localizer;
    }

    public PolicyResult<CompleetheidsResultaat> BerekenSimpel(CompleetFacts facts)
    {
        var toegepasteRegels = new List<string> { "BR-COMPL-01: Simpele compleetheidscheck per domein" };

        var domeinen = new List<DomeinCompleetheid>
        {
            new("eigenaar", L["DomainMyProfile"].Value, facts.Eigenaar is not null ? 1 : 0, 1),
            new("testament", L["DomainTestament"].Value, facts.Testament is not null ? 1 : 0, 1),
            new("euthanasie", L["DomainLivingWill"].Value, facts.Euthanasie is not null ? 1 : 0, 1),
            new("donor", L["DomainDonor"].Value, facts.Donor is not null ? 1 : 0, 1),
            new("digitaal-bezit", L["DomainDigitalAssets"].Value, facts.DigitaalBezitAantal > 0 ? 1 : 0, 1),
            new("boedel", L["DomainEstate"].Value, facts.BoedelCategorieën.Any(b => b) ? 1 : 0, 1),
            new("uitvaart", L["DomainFuneral"].Value, facts.Uitvaart is not null ? 1 : 0, 1),
            new("documenten", L["DomainDocuments"].Value, facts.DocumentenAantal > 0 ? 1 : 0, 1),
            new("erfgenamen", L["DomainHeirs"].Value, facts.ErfgenamenAantal > 0 ? 1 : 0, 1),
            new("noodcontacten", L["DomainEmergencyContacts"].Value, facts.NoodcontactenAantal > 0 ? 1 : 0, 1),
        };

        var aantalIngevuld = domeinen.Count(d => d.Ingevuld > 0);
        var totaal = domeinen.Count;
        var percentage = totaal > 0 ? (int)Math.Round(100.0 * aantalIngevuld / totaal) : 0;

        return new PolicyResult<CompleetheidsResultaat>
        {
            Resultaat = new CompleetheidsResultaat(percentage, aantalIngevuld, totaal, domeinen),
            RegelVersie = _regelVersie,
            ToegepasteRegels = toegepasteRegels
        };
    }

    public PolicyResult<CompleetheidsResultaat> BerekenGranulair(CompleetFacts facts)
    {
        var toegepasteRegels = new List<string> { "BR-COMPL-02: Granulaire compleetheidscheck per veld" };
        var domeinen = new List<DomeinCompleetheid>();

        // Eigenaar
        if (facts.Eigenaar is { } eig)
        {
            var velden = new[] { eig.HeeftVoornaam, eig.HeeftAchternaam, eig.HeeftGeboortedatum, eig.HeeftTelefoon, eig.HeeftEmail, eig.HeeftAdres, eig.HeeftBSN, eig.HeeftNotaris };
            domeinen.Add(new("eigenaar", L["DomainMyProfile"].Value, velden.Count(v => v), velden.Length));
        }
        else
            domeinen.Add(new("eigenaar", L["DomainMyProfile"].Value, 0, _options.EigenaarVelden));

        // Testament
        if (facts.Testament is { } test)
        {
            var velden = new[] { test.HeeftType, test.HeeftNotaris, test.HeeftDatum, test.HeeftWensen, test.AantalBegunstigden > 0, test.AantalExecuteurs > 0 };
            domeinen.Add(new("testament", L["DomainTestament"].Value, velden.Count(v => v), velden.Length));
        }
        else
            domeinen.Add(new("testament", L["DomainTestament"].Value, 0, _options.TestamentVelden));

        // Euthanasie
        if (facts.Euthanasie is { } euth)
        {
            var velden = new[] { euth.HeeftDatum, euth.HeeftHuisarts, euth.HeeftVertegenwoordiger };
            domeinen.Add(new("euthanasie", L["DomainLivingWill"].Value, velden.Count(v => v), velden.Length));
        }
        else
            domeinen.Add(new("euthanasie", L["DomainLivingWill"].Value, 0, _options.EuthanasieVelden));

        // Donor
        domeinen.Add(new("donor", L["DomainDonor"].Value, facts.Donor is not null ? 1 : 0, _options.DonorVelden));

        // Digitaal bezit
        domeinen.Add(new("digitaal-bezit", L["DomainDigitalAssets"].Value, Math.Min(facts.DigitaalBezitAantal, _options.DigitaalBezitCap), _options.DigitaalBezitCap));

        // Boedel
        domeinen.Add(new("boedel", L["DomainEstate"].Value, facts.BoedelCategorieën.Count(v => v), facts.BoedelCategorieën.Length));

        // Uitvaart
        if (facts.Uitvaart is { } uitv)
        {
            var velden = new[] { uitv.HeeftVoorkeurType, uitv.HeeftOndernemer, uitv.HeeftCeremonie, uitv.HeeftRouwkaart };
            domeinen.Add(new("uitvaart", L["DomainFuneral"].Value, velden.Count(v => v), velden.Length));
        }
        else
            domeinen.Add(new("uitvaart", L["DomainFuneral"].Value, 0, _options.UitvaartVelden));

        // Documenten
        domeinen.Add(new("documenten", L["DomainDocuments"].Value, Math.Min(facts.DocumentenAantal, _options.DocumentenCap), _options.DocumentenCap));

        // Erfgenamen
        domeinen.Add(new("erfgenamen", L["DomainHeirs"].Value, Math.Min(facts.ErfgenamenAantal, _options.ErfgenamenCap), _options.ErfgenamenCap));

        // Noodcontacten
        domeinen.Add(new("noodcontacten", L["DomainEmergencyContacts"].Value, Math.Min(facts.NoodcontactenAantal, _options.NoodcontactenCap), _options.NoodcontactenCap));

        var totaalIngevuld = domeinen.Sum(d => d.Ingevuld);
        var totaalVelden = domeinen.Sum(d => d.Totaal);
        var percentage = totaalVelden > 0 ? (int)Math.Round(100.0 * totaalIngevuld / totaalVelden) : 0;

        return new PolicyResult<CompleetheidsResultaat>
        {
            Resultaat = new CompleetheidsResultaat(percentage, totaalIngevuld, totaalVelden, domeinen),
            RegelVersie = _regelVersie,
            ToegepasteRegels = toegepasteRegels
        };
    }
}
