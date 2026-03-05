using Lumio.Api.Data;
using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.DonorRegistration;
using Lumio.Api.Domain.EuthanasiaDirective;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Rules.Facts;
using Lumio.Api.Rules.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Services;

/// <summary>
/// Builds facts POCO objects for the rules-engine by querying the database.
/// Extracted from StatusController — each method was a private helper in that class.
/// </summary>
public sealed class StatusFactsBuilder : IStatusFactsBuilder
{
    private readonly LumioDbContext _db;
    private readonly LimietenOptions _limieten;
    private readonly ErfbelastingOptions _erfbelasting;
    private readonly ILegitimairePortieService _legitiemairePortieService;

    public StatusFactsBuilder(
        LumioDbContext db,
        IOptions<LimietenOptions> limieten,
        IOptions<ErfbelastingOptions> erfbelasting,
        ILegitimairePortieService legitiemairePortieService)
    {
        _db = db;
        _limieten = limieten.Value;
        _erfbelasting = erfbelasting.Value;
        _legitiemairePortieService = legitiemairePortieService;
    }

    // ── BuildCompleetFacts ──────────────────────────────────────────────

    public async Task<CompleetFacts> BuildCompleetFactsAsync()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var testament = await _db.Testamenten.Include(t => t.Begunstigden).Include(t => t.Executeurs).FirstOrDefaultAsync();
        var euth = await _db.Wilsverklaringen.FirstOrDefaultAsync();
        var donor = await _db.DonorRegistraties.FirstOrDefaultAsync();
        var uitvaart = await _db.UitvaartWensen.FirstOrDefaultAsync();

        return new CompleetFacts(
            eigenaar is not null ? new EigenaarCompleetInfo(
                !string.IsNullOrEmpty(eigenaar.Voornaam),
                !string.IsNullOrEmpty(eigenaar.Achternaam),
                eigenaar.Geboortedatum != default,
                !string.IsNullOrEmpty(eigenaar.Telefoon),
                !string.IsNullOrEmpty(eigenaar.Email),
                !string.IsNullOrEmpty(eigenaar.Adres),
                !string.IsNullOrEmpty(eigenaar.BSN),
                eigenaar.NotarisContactId.HasValue) : null,
            testament is not null ? new TestamentCompleetInfo(
                !string.IsNullOrEmpty(testament.TestamentType),
                testament.NotarisContactId.HasValue,
                testament.DatumTestament.HasValue,
                !string.IsNullOrEmpty(testament.AlgemeneWensen),
                testament.Begunstigden.Count,
                testament.Executeurs.Count) : null,
            euth is not null ? new EuthanasieCompleetInfo(
                euth.DatumOndertekening.HasValue,
                euth.HuisartsContactId.HasValue,
                euth.VertegenwoordigerContactId.HasValue,
                WilEuthanasieIngevuld: true,
                DementieClausuleIngevuld: !euth.WilEuthanasie || euth.DementieClausule) : null,
            donor is not null ? new DonorCompleetInfo(
                !string.IsNullOrEmpty(donor.Keuze),
                donor.Keuze != "Specifiek persoon beslist" || !string.IsNullOrEmpty(donor.BeslisserNaam),
                await _db.OrgaanKeuzes.AnyAsync(o => o.DonorRegistratieId == donor.Id)) : null,
            await _db.DigitaleAccounts.CountAsync() + await _db.Wachtwoorden.CountAsync() + await _db.CryptoWallets.CountAsync(),
            new[] { await _db.FysiekeBezittingen.AnyAsync(), await _db.Bankrekeningen.AnyAsync(), await _db.Verzekeringen.AnyAsync(), await _db.Schulden.AnyAsync() },
            uitvaart is not null ? new UitvaartCompleetInfo(
                !string.IsNullOrEmpty(uitvaart.VoorkeurType),
                uitvaart.UitvaartOndernemerContactId.HasValue,
                !string.IsNullOrEmpty(uitvaart.CeremonieSoort),
                !string.IsNullOrEmpty(uitvaart.RouwkaartTekst),
                !string.IsNullOrEmpty(uitvaart.VoorkeurBegraafplaatsNaam) || !string.IsNullOrEmpty(uitvaart.VoorkeurCrematoriumnaam) || !string.IsNullOrEmpty(uitvaart.VoorkeurAulaNaam),
                !string.IsNullOrEmpty(uitvaart.CeremonieSoort),
                !string.IsNullOrEmpty(uitvaart.Muziekwensen)) : null,
            await _db.Documenten.CountAsync(),
            await _db.Erfgenamen.CountAsync(),
            await _db.Noodcontacten.CountAsync());
    }

    // ── BuildMeldingFacts ──────────────────────────────────────────────

    public async Task<MeldingFacts> BuildMeldingFactsAsync()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var testament = await _db.Testamenten.FirstOrDefaultAsync();
        var wils = await _db.Wilsverklaringen.FirstOrDefaultAsync();
        var donor = await _db.DonorRegistraties.FirstOrDefaultAsync();
        var uitvaart = await _db.UitvaartWensen.FirstOrDefaultAsync();

        var vandaag = DateOnly.FromDateTime(DateTime.Today);
        var over30Dagen = vandaag.AddDays(_limieten.DocumentVerlooptWaarschuwingDagen);

        var laatsteBackup = await _db.AuditLog
            .Where(a => a.Actie == "Backup")
            .OrderByDescending(a => a.Tijdstip)
            .FirstOrDefaultAsync();

        DateTime? laatsteActualisatie = null;
        var verlopenActualisatieDomeinen = new List<string>();
        if (eigenaar is not null)
        {
            var alleBevestigingen = await _db.ActualisatieBevestigingen
                .Where(a => a.EigenaarId == eigenaar.Id)
                .ToListAsync();

            var domeinenLijst = new[] { "eigenaar", "testament", "euthanasie", "donor", "boedel",
                "uitvaart", "erfgenamen", "documenten", "digitaal-bezit", "noodcontacten" };

            var perDomeinLatest = domeinenLijst
                .Select(d => alleBevestigingen
                    .Where(b => b.Domein == d)
                    .OrderByDescending(b => b.BevestigdOp)
                    .FirstOrDefault()?.BevestigdOp)
                .ToList();

            if (perDomeinLatest.All(d => d is not null))
                laatsteActualisatie = perDomeinLatest.Min();

            verlopenActualisatieDomeinen = domeinenLijst
                .Select((d, i) => new { Domein = d, Latest = perDomeinLatest[i] })
                .Where(x => x.Latest.HasValue &&
                            x.Latest.Value < DateTime.UtcNow.AddDays(-_limieten.ActualisatieIntervallen.VoorDomein(x.Domein)))
                .Select(x => x.Domein)
                .ToList();
        }

        var heeftLegitimatie = eigenaar is not null && eigenaar.LegitimatieSoort != LegitimatieSoort.Geen;
        var legiGeldigTot = eigenaar?.LegitimatieGeldigTot;
        var legiIsVerlopen = heeftLegitimatie && legiGeldigTot.HasValue && legiGeldigTot.Value < vandaag;
        var legiIsBijnaVerlopen = heeftLegitimatie && legiGeldigTot.HasValue
            && legiGeldigTot.Value >= vandaag && legiGeldigTot.Value <= vandaag.AddDays(30);

        var wilsVerouderd = wils?.DatumOndertekening.HasValue == true
            && wils!.DatumOndertekening!.Value.AddYears(5) < vandaag;
        var uitvaartIsVerouderd = uitvaart?.DatumOpgesteld.HasValue == true
            && uitvaart!.DatumOpgesteld!.Value.AddYears(2) < vandaag;

        var aantalBegunstigden = testament != null
            ? await _db.Begunstigden.CountAsync(b => b.TestamentInfoId == testament.Id)
            : 0;

        DateTime? shamirOudste = null;
        if (await _db.Erfgenamen.AnyAsync(e => e.HeeftShareOntvangen && e.ShareUitgegevenOp != null))
        {
            shamirOudste = await _db.Erfgenamen
                .Where(e => e.HeeftShareOntvangen && e.ShareUitgegevenOp != null)
                .MinAsync(e => e.ShareUitgegevenOp);
        }

        bool heeftLegitimairePortieSchending = false;
        if (eigenaar is not null && testament is not null)
        {
            var erfgenamen = await _db.Erfgenamen.Where(e => e.EigenaarId == eigenaar.Id).ToListAsync();
            string[] kindRelaties = _erfbelasting.KindRelatiesLegitimairePortie;
            var kinderen = erfgenamen
                .Where(e => kindRelaties.Any(r => e.Relatie.Contains(r, StringComparison.OrdinalIgnoreCase)))
                .ToList();
            if (kinderen.Count > 0)
            {
                var begunstigden = await _db.Begunstigden
                    .Where(b => b.TestamentInfoId == testament.Id).ToListAsync();
                var lpFacts = new LegitimairePortieFacts(
                    true, true,
                    eigenaar.BurgerlijkeStaat switch
                    {
                        BurgerlijkeStaat.Gehuwd => BurgerlijkeStaatFact.Gehuwd,
                        BurgerlijkeStaat.GeregistreerdPartnerschap => BurgerlijkeStaatFact.GeregistreerdPartnerschap,
                        _ => BurgerlijkeStaatFact.Alleenstaand
                    },
                    kinderen.Select(k => new KindErfgenaamFact(
                        k.Id,
                        string.IsNullOrEmpty(k.Tussenvoegsel) ? $"{k.Voornaam} {k.Achternaam}" : $"{k.Voornaam} {k.Tussenvoegsel} {k.Achternaam}",
                        k.Voornaam, k.Achternaam)).ToList(),
                    begunstigden.Select(b => new BegunstigdeFact(b.Naam, b.Percentage)).ToList());
                var lpResult = _legitiemairePortieService.Bereken(lpFacts);
                heeftLegitimairePortieSchending = lpResult.Resultaat.HeeftWaarschuwing;
            }
        }

        bool heeftTijdlijnGezien = eigenaar?.TijdlijnBekeken ?? false;

        var heeftBezitMissendeWaarde = eigenaar is not null
            && await _db.FysiekeBezittingen.AnyAsync(b => b.EigenaarId == eigenaar.Id
                && (b.GeschatteWaarde == null || b.GeschatteWaarde == 0));

        var totaalFysiekBezit = await _db.FysiekeBezittingen.SumAsync(b => b.GeschatteWaarde ?? 0m);
        var totaalRestWaardeVoertuigen = await _db.FysiekeBezittingen
            .Where(b => b.Categorie == "Voertuig" && b.RestWaarde.HasValue)
            .SumAsync(b => b.RestWaarde ?? 0m);
        var totaalBezitWaardering = await _db.FysiekeBezittingen
            .SumAsync(b => b.Categorie == "Voertuig"
                ? (b.RestWaarde ?? b.GeschatteWaarde ?? 0m)
                : (b.GeschatteWaarde ?? 0m));

        var totaalSaldiBoedel = await _db.Bankrekeningen.SumAsync(b => b.Saldo ?? 0m);
        var totaalSchuldenBoedel = await _db.Schulden.SumAsync(s => s.Bedrag);
        var nettoNalatenschapNegatief = eigenaar is not null
            && totaalSchuldenBoedel > (totaalBezitWaardering + totaalSaldiBoedel);

        var heeftBezitZonderErfgenaam = eigenaar is not null
            && await _db.FysiekeBezittingen.AnyAsync(b => b.EigenaarId == eigenaar.Id
                && b.BestemdeErfgenaamId == null);

        var heeftErfgenaamZonderContactgegevens = eigenaar is not null
            && await _db.Erfgenamen.AnyAsync(e => e.EigenaarId == eigenaar.Id
                && string.IsNullOrEmpty(e.Telefoon) && string.IsNullOrEmpty(e.Email));

        var heeftVertrouwenspersoon = eigenaar is not null
            && await _db.Noodcontacten.AnyAsync(n => n.EigenaarId == eigenaar.Id
                && n.Rol == "Vertrouwenspersoon");

        var heeftNoodcontactMetTelefoon = eigenaar is not null
            && await _db.Noodcontacten.AnyAsync(n => n.EigenaarId == eigenaar.Id
                && !string.IsNullOrEmpty(n.Telefoon));

        return new MeldingFacts(
            eigenaar is not null,
            await _db.Testamenten.AnyAsync(),
            await _db.Wilsverklaringen.AnyAsync(),
            await _db.DonorRegistraties.AnyAsync(),
            await _db.UitvaartWensen.AnyAsync(),
            await _db.Erfgenamen.AnyAsync(),
            await _db.Noodcontacten.AnyAsync(),
            await _db.Documenten.AnyAsync(),
            laatsteBackup?.Tijdstip,
            await _db.Erfgenamen.CountAsync(),
            await _db.Erfgenamen.AnyAsync(e => e.HeeftShareOntvangen),
            await _db.Documenten
                .Where(d => d.VerlooptOp != null && d.VerlooptOp <= vandaag)
                .Select(d => d.Naam).Distinct().ToListAsync(),
            await _db.Documenten
                .Where(d => d.VerlooptOp != null && d.VerlooptOp > vandaag && d.VerlooptOp <= over30Dagen)
                .Select(d => d.Naam).Distinct().ToListAsync(),
            laatsteActualisatie,
            aantalBegunstigden,
            testament != null && await _db.TestamentSnapshots.AnyAsync(s => s.TestamentInfoId == testament.Id),
            testament?.AangemaaktOp,
            wilsVerouderd,
            wils?.VertegenwoordigerContactId.HasValue ?? false,
            wils?.WilEuthanasie ?? false,
            !string.IsNullOrEmpty(wils?.BehandelVerbod),
            donor?.Keuze,
            await _db.OrgaanKeuzes.AnyAsync(),
            donor?.BeslisserNaam,
            await _db.FysiekeBezittingen.AnyAsync() || await _db.Bankrekeningen.AnyAsync()
                || await _db.Verzekeringen.AnyAsync() || await _db.Schulden.AnyAsync(),
            await _db.DigitaleAccounts.AnyAsync() || await _db.Wachtwoorden.AnyAsync()
                || await _db.CryptoWallets.AnyAsync(),
            heeftLegitimatie,
            legiIsVerlopen,
            legiIsBijnaVerlopen,
            heeftLegitimatie && !legiGeldigTot.HasValue,
            uitvaart?.VoorkeurType,
            uitvaart?.Begraafplaats,
            uitvaartIsVerouderd,
            uitvaart?.HeeftUitvaartVerzekering ?? false,
            !string.IsNullOrEmpty(uitvaart?.UitvaartVerzekeringDetails),
            !string.IsNullOrEmpty(uitvaart?.CeremonieSoort),
            shamirOudste,
            heeftLegitimairePortieSchending,
            heeftTijdlijnGezien,
            heeftBezitMissendeWaarde,
            nettoNalatenschapNegatief,
            heeftBezitZonderErfgenaam,
            heeftErfgenaamZonderContactgegevens,
            heeftVertrouwenspersoon,
            heeftNoodcontactMetTelefoon,
            verlopenActualisatieDomeinen);
    }

    // ── BuildSuggestieFacts ──────────────────────────────────────────────

    public async Task<SuggestieFacts> BuildSuggestieFactsAsync()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return new SuggestieFacts(false, null, [], [], null, null, 0, false, false, false, false,
                BurgerlijkeStaat.Ongehuwd, HuwelijksVoorwaarden.NietVanToepassing, null, null,
                null, null);

        var erfgenamen = await _db.Erfgenamen.Where(e => e.EigenaarId == eigenaar.Id).ToListAsync();
        var noodcontacten = await _db.Noodcontacten.Where(n => n.EigenaarId == eigenaar.Id).ToListAsync();
        var testament = await _db.Testamenten.FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id);
        var uitvaart = await _db.UitvaartWensen.FirstOrDefaultAsync();

        SuggestieTestamentFact? testamentFact = null;
        if (testament is not null)
        {
            var begunstigden = await _db.Begunstigden.Where(b => b.TestamentInfoId == testament.Id).ToListAsync();
            var executeurs = await _db.Executeurs.Where(e => e.TestamentInfoId == testament.Id).ToListAsync();
            testamentFact = new SuggestieTestamentFact(
                testament.NotarisContact?.Naam,
                begunstigden.Select(b => b.Naam).ToList(),
                executeurs.Select(e => e.Naam).ToList(),
                testament.DatumTestament,
                !string.IsNullOrEmpty(testament.CTR_Nummer));
        }

        static string FullName(Erfgenaam e) =>
            string.IsNullOrWhiteSpace(e.Tussenvoegsel)
                ? $"{e.Voornaam} {e.Achternaam}"
                : $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}";

        var aantalVerzekeringenZonderBegunstigde = await _db.Verzekeringen
            .CountAsync(v => v.EigenaarId == eigenaar.Id && string.IsNullOrEmpty(v.Begunstigde));
        var heeftHypotheekZonderBezit = await _db.Schulden
            .AnyAsync(s => s.EigenaarId == eigenaar.Id
                && s.Type.ToLower().Contains("hypotheek")
                && s.BezitId == null);

        var heeftAccountOverdragenZonderNaam = await _db.DigitaleAccounts
            .AnyAsync(a => a.EigenaarId == eigenaar.Id
                && a.GewensteActie.ToLower().Contains("overdragen")
                && string.IsNullOrEmpty(a.OverdrachtAan));
        var heeftCryptoZonderSeedPhrase = await _db.CryptoWallets
            .AnyAsync(c => c.EigenaarId == eigenaar.Id && c.EncryptedSeedPhrase == null);
        var heeftAccountZonderActie = await _db.DigitaleAccounts
            .AnyAsync(a => a.EigenaarId == eigenaar.Id && string.IsNullOrEmpty(a.GewensteActie));

        var wilsverklaring = await _db.Wilsverklaringen
            .FirstOrDefaultAsync(w => w.EigenaarId == eigenaar.Id);
        SuggestieWilsverklaringFact? wilsverklaringFact = wilsverklaring is null ? null :
            new(wilsverklaring.VertegenwoordigerContact?.Naam,
                wilsverklaring.Vertegenwoordiger2Contact?.Naam,
                wilsverklaring.HuisartsContact?.Naam,
                wilsverklaring.DatumOndertekening);

        var donor = await _db.DonorRegistraties
            .FirstOrDefaultAsync(d => d.EigenaarId == eigenaar.Id);
        SuggestieDonorFact? donorFact = donor is null ? null :
            new(donor.Keuze, donor.BeslisserNaam, donor.IsGeregistreerdBijDonorregister);

        return new SuggestieFacts(
            true,
            eigenaar.NotarisContact?.Naam,
            erfgenamen.Select(e => new SuggestieErfgenaamFact(FullName(e), e.Telefoon, e.Relatie)).ToList(),
            noodcontacten.Select(n => new SuggestieNoodcontactFact(n.Naam, n.Telefoon, n.Rol)).ToList(),
            testamentFact,
            uitvaart?.UitvaartOndernemerContact?.Naam,
            aantalVerzekeringenZonderBegunstigde,
            heeftHypotheekZonderBezit,
            heeftAccountOverdragenZonderNaam,
            heeftCryptoZonderSeedPhrase,
            heeftAccountZonderActie,
            eigenaar.BurgerlijkeStaat,
            eigenaar.HuwelijksVoorwaarden,
            eigenaar.DatumHuwelijk,
            eigenaar.LegitimatieGeldigTot,
            wilsverklaringFact,
            donorFact);
    }
}
