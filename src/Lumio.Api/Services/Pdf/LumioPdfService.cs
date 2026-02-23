using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.AssetRegistry;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf;

public interface ILumioPdfService
{
    Task<byte[]> GenerateTestamentPdf();
    Task<byte[]> GenerateEuthanasiePdf();
    Task<byte[]> GenerateDonorPdf();
    Task<byte[]> GenerateDigitaalBezitPdf();
    Task<byte[]> GenerateBoedelPdf();
    Task<byte[]> GenerateUitvaartPdf();
    Task<byte[]> GenerateDocumentenOverzichtPdf();
    Task<byte[]> GenerateCompleetPdf();
    Task<byte[]> GenerateNoodkaartPdf();
    Task<byte[]> GenerateTestamentConceptPdf();
    Task<byte[]> GenerateWilsverklaringPdf();
    Task<byte[]> GenerateNoodprocedurePdf();
    Task<byte[]> GenerateBoedelbeschrijvingPdf();
    Task<byte[]> GenerateErfgenaamPdf(Guid erfgenaamId);
    Task<byte[]> GenerateExecuteurRapportPdf();
    Task<byte[]> GenerateNotarisPdf();
}

public class LumioPdfService : ILumioPdfService
{
    private readonly LumioDbContext _db;
    private readonly IStringLocalizer<LumioPdfService> L;

    public LumioPdfService(LumioDbContext db, IStringLocalizer<LumioPdfService> localizer)
    {
        _db = db;
        L = localizer;
    }

    public async Task<byte[]> GenerateTestamentPdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var testament = eigenaar != null
            ? await _db.Testamenten.FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id)
            : null;
        var begunstigden = testament != null
            ? await _db.Begunstigden.Where(b => b.TestamentInfoId == testament.Id).ToListAsync()
            : [];
        var executeurs = testament != null
            ? await _db.Executeurs.Where(e => e.TestamentInfoId == testament.Id).ToListAsync()
            : [];

        var laatstBijgewerkt = new[] { eigenaar?.GewijzigdOp, testament?.GewijzigdOp }
            .Where(d => d.HasValue).Select(d => d!.Value).DefaultIfEmpty().Max();

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, L["Page_Testament"].Value, laatstBijgewerkt));
                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    if (eigenaar != null)
                        Section(col, L["Section_Eigenaar"].Value, t =>
                        {
                            Row(t, L["Label_Naam"].Value, $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim());
                        });
                    if (testament != null)
                        Section(col, L["Section_TestamentInformatie"].Value, t =>
                        {
                            Row(t, L["Label_Type"].Value, testament.TestamentType ?? "—");
                            Row(t, L["Label_Notaris"].Value, testament.NotarisNaam ?? "—");
                            Row(t, L["Label_Kantoor"].Value, testament.NotarisKantoor ?? "—");
                            Row(t, L["Label_Datum"].Value, testament.DatumTestament?.ToString("dd-MM-yyyy") ?? "—");
                            Row(t, L["Label_CTRNummer"].Value, testament.CTR_Nummer ?? "—");
                            Row(t, L["Label_Bewaarlocatie"].Value, testament.TestamentLocatie ?? "—");
                            if (!string.IsNullOrEmpty(testament.AlgemeneWensen))
                                Row(t, L["Label_AlgemeneWensen"].Value, testament.AlgemeneWensen);
                        });
                    if (begunstigden.Count > 0)
                        Section(col, L["Section_Begunstigden"].Value, t =>
                        {
                            foreach (var b in begunstigden)
                                Row(t, b.Naam, $"{b.Relatie} — {b.Percentage}%");
                        });
                    if (executeurs.Count > 0)
                        Section(col, L["Section_Executeurs"].Value, t =>
                        {
                            foreach (var e in executeurs)
                                Row(t, e.Naam, e.Relatie ?? "");
                        });
                });
                page.Footer().Element(Footer);
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateEuthanasiePdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var wv = eigenaar != null
            ? await _db.Wilsverklaringen.FirstOrDefaultAsync(w => w.EigenaarId == eigenaar.Id)
            : null;
        var voorwaarden = wv != null
            ? await _db.EuthanasieVoorwaarden.Where(v => v.WilsverklaringId == wv.Id).ToListAsync()
            : [];

        var laatstBijgewerkt = wv?.GewijzigdOp ?? eigenaar?.GewijzigdOp ?? DateTime.MinValue;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, L["Page_WilsverklaringEuthanasie"].Value, laatstBijgewerkt));
                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    if (wv != null)
                        Section(col, L["Section_Wilsverklaring"].Value, t =>
                        {
                            Row(t, L["Label_WilEuthanasie"].Value, wv.WilEuthanasie ? L["Value_Ja"].Value : L["Value_Nee"].Value);
                            Row(t, L["Label_Situatie"].Value, wv.SituatieBeschrijving ?? "—");
                            Row(t, L["Label_Huisarts"].Value, wv.Huisarts ?? "—");
                            Row(t, L["Label_Praktijk"].Value, wv.HuisartsPraktijk ?? "—");
                            Row(t, L["Label_Vertegenwoordiger"].Value, wv.VertegenwoordigerNaam ?? "—");
                            Row(t, L["Label_RelatieVertegenwoordiger"].Value, wv.VertegenwoordigerRelatie ?? "—");
                            if (!string.IsNullOrEmpty(wv.AanvullendeWensen))
                                Row(t, L["Label_AanvullendeWensen"].Value, wv.AanvullendeWensen);
                            Row(t, L["Label_DatumOndertekening"].Value, wv.DatumOndertekening?.ToString("dd-MM-yyyy") ?? "—");
                        });
                    if (voorwaarden.Count > 0)
                        Section(col, L["Section_Voorwaarden"].Value, t =>
                        {
                            foreach (var v in voorwaarden)
                                Row(t, v.Voorwaarde, v.Toelichting ?? "");
                        });
                });
                page.Footer().Element(Footer);
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateDonorPdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var donor = eigenaar != null
            ? await _db.DonorRegistraties.FirstOrDefaultAsync(d => d.EigenaarId == eigenaar.Id)
            : null;
        var organen = donor != null
            ? await _db.OrgaanKeuzes.Where(o => o.DonorRegistratieId == donor.Id).ToListAsync()
            : [];

        var laatstBijgewerkt = donor?.GewijzigdOp ?? eigenaar?.GewijzigdOp ?? DateTime.MinValue;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, L["Page_Donorregistratie"].Value, laatstBijgewerkt));
                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    if (donor != null)
                        Section(col, L["Section_Registratie"].Value, t =>
                        {
                            Row(t, L["Label_Keuze"].Value, donor.Keuze);
                            Row(t, L["Label_Donorregister"].Value, donor.IsGeregistreerdBijDonorregister ? L["Value_Ja"].Value : L["Value_Nee"].Value);
                            if (!string.IsNullOrEmpty(donor.DonorregisterReferentie))
                                Row(t, L["Label_Referentie"].Value, donor.DonorregisterReferentie);
                            if (!string.IsNullOrEmpty(donor.Toelichting))
                                Row(t, L["Label_Toelichting"].Value, donor.Toelichting);
                        });
                    if (organen.Count > 0)
                        Section(col, L["Section_Orgaankeuzes"].Value, t =>
                        {
                            foreach (var o in organen)
                                Row(t, o.Orgaan, o.WelDoneren ? L["Value_Ja"].Value : L["Value_Nee"].Value);
                        });
                });
                page.Footer().Element(Footer);
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateDigitaalBezitPdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var eid = eigenaar?.Id ?? Guid.Empty;
        var accounts = await _db.DigitaleAccounts.Where(a => a.EigenaarId == eid).ToListAsync();
        var wachtwoorden = await _db.Wachtwoorden.Where(w => w.EigenaarId == eid).ToListAsync();
        var wallets = await _db.CryptoWallets.Where(c => c.EigenaarId == eid).ToListAsync();

        var laatstBijgewerkt = accounts.Select(a => a.GewijzigdOp)
            .Concat(wachtwoorden.Select(w => w.GewijzigdOp))
            .Concat(wallets.Select(c => c.GewijzigdOp))
            .DefaultIfEmpty().Max();

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, L["Page_DigitaalBezit"].Value, laatstBijgewerkt));
                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    if (accounts.Count > 0)
                        Section(col, L["Section_OnlineAccounts"].Value, t =>
                        {
                            foreach (var a in accounts)
                                Row(t, a.PlatformNaam, $"{a.GewensteActie ?? ""} — {a.Gebruikersnaam ?? ""}");
                        });
                    if (wachtwoorden.Count > 0)
                        Section(col, L["Section_Wachtwoorden"].Value, t =>
                        {
                            t.Item().Text(L["Text_WachtwoordenVersleuteld"].Value)
                                .Italic().FontSize(9).FontColor(Colors.Grey.Medium);
                            foreach (var w in wachtwoorden)
                                Row(t, w.Naam, w.Gebruikersnaam ?? "");
                        });
                    if (wallets.Count > 0)
                        Section(col, L["Section_CryptoWallets"].Value, t =>
                        {
                            t.Item().Text(L["Text_SeedPhrasesVersleuteld"].Value)
                                .Italic().FontSize(9).FontColor(Colors.Grey.Medium);
                            foreach (var cw in wallets)
                                Row(t, cw.WalletNaam, $"{cw.CryptoType} — {cw.Exchange ?? ""}");
                        });
                });
                page.Footer().Element(Footer);
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateBoedelPdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var eid = eigenaar?.Id ?? Guid.Empty;
        var bezittingen = await _db.FysiekeBezittingen.Where(f => f.EigenaarId == eid).ToListAsync();
        var rekeningen = await _db.Bankrekeningen.Where(b => b.EigenaarId == eid).ToListAsync();
        var verzekeringen = await _db.Verzekeringen.Where(v => v.EigenaarId == eid).ToListAsync();
        var schulden = await _db.Schulden.Where(s => s.EigenaarId == eid).ToListAsync();

        var laatstBijgewerkt = bezittingen.Select(b => b.GewijzigdOp)
            .Concat(rekeningen.Select(r => r.GewijzigdOp))
            .Concat(verzekeringen.Select(v => v.GewijzigdOp))
            .Concat(schulden.Select(s => s.GewijzigdOp))
            .DefaultIfEmpty().Max();

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, L["Page_Boedel"].Value, laatstBijgewerkt));
                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    if (bezittingen.Count > 0)
                        Section(col, L["Section_Bezittingen"].Value, t =>
                        {
                            foreach (var b in bezittingen)
                                Row(t, b.Omschrijving, $"{b.Categorie}{(b.GeschatteWaarde.HasValue ? $" — € {b.GeschatteWaarde:N2}" : "")}");
                        });
                    if (rekeningen.Count > 0)
                        Section(col, L["Section_Bankrekeningen"].Value, t =>
                        {
                            foreach (var r in rekeningen)
                                Row(t, $"{r.BankNaam} ({r.RekeningType})", r.IBAN);
                        });
                    if (verzekeringen.Count > 0)
                        Section(col, L["Section_Verzekeringen"].Value, t =>
                        {
                            foreach (var v in verzekeringen)
                                Row(t, $"{v.Verzekeraar} ({v.Type})", string.Format(L["Text_PolisPrefix"].Value, v.PolisNummer));
                        });
                    if (schulden.Count > 0)
                        Section(col, L["Section_Schulden"].Value, t =>
                        {
                            foreach (var s in schulden)
                                Row(t, s.Schuldeiser, $"{s.Type} — € {s.Bedrag:N2}");
                        });
                });
                page.Footer().Element(Footer);
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateUitvaartPdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var uitvaart = eigenaar != null
            ? await _db.UitvaartWensen.FirstOrDefaultAsync(u => u.EigenaarId == eigenaar.Id)
            : null;
        var details = uitvaart != null
            ? await _db.CeremonieDetails.Where(c => c.UitvaartWensenId == uitvaart.Id).OrderBy(c => c.Volgorde).ToListAsync()
            : [];

        var laatstBijgewerkt = uitvaart?.GewijzigdOp ?? eigenaar?.GewijzigdOp ?? DateTime.MinValue;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, L["Page_Uitvaartwensen"].Value, laatstBijgewerkt));
                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    if (uitvaart != null)
                        Section(col, L["Section_Uitvaart"].Value, t =>
                        {
                            Row(t, L["Label_Type"].Value, uitvaart.VoorkeurType ?? "—");
                            Row(t, L["Label_Begraafplaats"].Value, uitvaart.Begraafplaats ?? "—");
                            Row(t, L["Label_Ondernemer"].Value, uitvaart.UitvaartOndernemer ?? "—");
                            if (!string.IsNullOrEmpty(uitvaart.Muziekwensen))
                                Row(t, L["Label_Muziek"].Value, uitvaart.Muziekwensen);
                            if (!string.IsNullOrEmpty(uitvaart.Bloemen))
                                Row(t, L["Label_Bloemen"].Value, uitvaart.Bloemen);
                            if (!string.IsNullOrEmpty(uitvaart.Kledingwensen))
                                Row(t, L["Label_Kleding"].Value, uitvaart.Kledingwensen);
                            if (!string.IsNullOrEmpty(uitvaart.RouwkaartTekst))
                                Row(t, L["Label_Rouwkaart"].Value, uitvaart.RouwkaartTekst);
                            if (!string.IsNullOrEmpty(uitvaart.Condoleance))
                                Row(t, L["Label_Condoleance"].Value, uitvaart.Condoleance);
                            if (!string.IsNullOrEmpty(uitvaart.OverigeWensen))
                                Row(t, L["Label_OverigeWensen"].Value, uitvaart.OverigeWensen);
                        });
                    if (details.Count > 0)
                        Section(col, L["Section_CeremonieDetails"].Value, t =>
                        {
                            foreach (var d in details)
                                Row(t, d.Onderdeel, d.Beschrijving ?? "");
                        });
                });
                page.Footer().Element(Footer);
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateDocumentenOverzichtPdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var eid = eigenaar?.Id ?? Guid.Empty;
        var documenten = await _db.Documenten.Where(d => d.EigenaarId == eid).ToListAsync();

        var laatstBijgewerkt = documenten.Select(d => d.GewijzigdOp).DefaultIfEmpty().Max();

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, L["Page_DocumentenOverzicht"].Value, laatstBijgewerkt));
                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    if (documenten.Count > 0)
                        Section(col, L["Section_OpgeslagenDocumenten"].Value, t =>
                        {
                            foreach (var d in documenten)
                                Row(t, d.Naam, $"{d.Categorie} — {d.BestandsNaam}");
                        });
                    else
                        col.Item().Text(L["Text_GeenDocumenten"].Value).Italic().FontColor(Colors.Grey.Medium);
                });
                page.Footer().Element(Footer);
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateCompleetPdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var eid = eigenaar?.Id ?? Guid.Empty;
        var erfgenamen = await _db.Erfgenamen.Where(e => e.EigenaarId == eid).ToListAsync();
        var testament = eigenaar != null
            ? await _db.Testamenten.FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id)
            : null;
        var begunstigden = testament != null
            ? await _db.Begunstigden.Where(b => b.TestamentInfoId == testament.Id).ToListAsync()
            : [];
        var executeurs = testament != null
            ? await _db.Executeurs.Where(e => e.TestamentInfoId == testament.Id).ToListAsync()
            : [];
        var wv = eigenaar != null
            ? await _db.Wilsverklaringen.FirstOrDefaultAsync(w => w.EigenaarId == eigenaar.Id)
            : null;
        var donor = eigenaar != null
            ? await _db.DonorRegistraties.FirstOrDefaultAsync(d => d.EigenaarId == eigenaar.Id)
            : null;
        var organen = donor != null
            ? await _db.OrgaanKeuzes.Where(o => o.DonorRegistratieId == donor.Id).ToListAsync()
            : [];
        var accounts = await _db.DigitaleAccounts.Where(a => a.EigenaarId == eid).ToListAsync();
        var wallets = await _db.CryptoWallets.Where(c => c.EigenaarId == eid).ToListAsync();
        var bezittingen = await _db.FysiekeBezittingen.Where(f => f.EigenaarId == eid).ToListAsync();
        var rekeningen = await _db.Bankrekeningen.Where(b => b.EigenaarId == eid).ToListAsync();
        var verzekeringen = await _db.Verzekeringen.Where(v => v.EigenaarId == eid).ToListAsync();
        var schulden = await _db.Schulden.Where(s => s.EigenaarId == eid).ToListAsync();
        var uitvaart = eigenaar != null
            ? await _db.UitvaartWensen.FirstOrDefaultAsync(u => u.EigenaarId == eigenaar.Id)
            : null;
        var documenten = await _db.Documenten.Where(d => d.EigenaarId == eid).ToListAsync();

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Content().AlignCenter().AlignMiddle().Column(col =>
                {
                    col.Spacing(10);
                    col.Item().AlignCenter().Text("Lumio").FontSize(36).Bold().FontColor(Colors.Blue.Darken3);
                    col.Item().AlignCenter().Text("Digitale Nalatenschap").FontSize(18).FontColor(Colors.Grey.Darken1);
                    if (eigenaar != null)
                        col.Item().AlignCenter().Text($"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim())
                            .FontSize(14).FontColor(Colors.Grey.Medium);
                    col.Item().AlignCenter().Text($"Gegenereerd op {DateTime.Now:dd-MM-yyyy HH:mm}")
                        .FontSize(10).FontColor(Colors.Grey.Medium);
                });
            });

            if (erfgenamen.Count > 0)
                AddPage(container, L["Page_Erfgenamen"].Value, col =>
                {
                    Section(col, "Erfgenamen", t =>
                    {
                        foreach (var e in erfgenamen)
                            Row(t, $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}".Trim(), e.Relatie);
                    });
                });

            if (testament != null)
                AddPage(container, "Testament", col =>
                {
                    Section(col, "Testament Informatie", t =>
                    {
                        Row(t, L["Label_Type"].Value, testament.TestamentType ?? "—");
                        Row(t, L["Label_Notaris"].Value, testament.NotarisNaam ?? "—");
                        Row(t, L["Label_Datum"].Value, testament.DatumTestament?.ToString("dd-MM-yyyy") ?? "—");
                    });
                    if (begunstigden.Count > 0)
                        Section(col, "Begunstigden", t =>
                        {
                            foreach (var b in begunstigden) Row(t, b.Naam, $"{b.Relatie} — {b.Percentage}%");
                        });
                    if (executeurs.Count > 0)
                        Section(col, "Executeurs", t =>
                        {
                            foreach (var e in executeurs) Row(t, e.Naam, e.Relatie ?? "");
                        });
                });

            if (wv != null)
                AddPage(container, "Wilsverklaring Euthanasie", col =>
                {
                    Section(col, "Wilsverklaring", t =>
                    {
                        Row(t, L["Label_WilEuthanasie"].Value, wv.WilEuthanasie ? L["Value_Ja"].Value : L["Value_Nee"].Value);
                        Row(t, L["Label_Huisarts"].Value, wv.Huisarts ?? "—");
                        Row(t, L["Label_Vertegenwoordiger"].Value, wv.VertegenwoordigerNaam ?? "—");
                    });
                });

            if (donor != null)
                AddPage(container, "Donorregistratie", col =>
                {
                    Section(col, "Registratie", t =>
                    {
                        Row(t, L["Label_Keuze"].Value, donor.Keuze);
                        Row(t, L["Label_Donorregister"].Value, donor.IsGeregistreerdBijDonorregister ? L["Value_Ja"].Value : L["Value_Nee"].Value);
                    });
                    if (organen.Count > 0)
                        Section(col, "Orgaankeuzes", t =>
                        {
                            foreach (var o in organen) Row(t, o.Orgaan, o.WelDoneren ? L["Value_Ja"].Value : L["Value_Nee"].Value);
                        });
                });

            if (accounts.Count > 0 || wallets.Count > 0)
                AddPage(container, "Digitaal Bezit", col =>
                {
                    if (accounts.Count > 0)
                        Section(col, "Online Accounts", t =>
                        {
                            foreach (var a in accounts) Row(t, a.PlatformNaam, a.GewensteActie ?? "");
                        });
                    if (wallets.Count > 0)
                        Section(col, "Crypto Wallets", t =>
                        {
                            foreach (var cw in wallets) Row(t, cw.WalletNaam, $"{cw.CryptoType} — {cw.Exchange ?? ""}");
                        });
                });

            if (bezittingen.Count > 0 || rekeningen.Count > 0 || verzekeringen.Count > 0 || schulden.Count > 0)
                AddPage(container, "Boedel", col =>
                {
                    if (bezittingen.Count > 0)
                        Section(col, "Bezittingen", t =>
                        {
                            foreach (var b in bezittingen) Row(t, b.Omschrijving, b.Categorie);
                        });
                    if (rekeningen.Count > 0)
                        Section(col, "Bankrekeningen", t =>
                        {
                            foreach (var r in rekeningen) Row(t, r.BankNaam, r.IBAN);
                        });
                    if (verzekeringen.Count > 0)
                        Section(col, "Verzekeringen", t =>
                        {
                            foreach (var v in verzekeringen) Row(t, v.Verzekeraar, v.PolisNummer);
                        });
                    if (schulden.Count > 0)
                        Section(col, "Schulden", t =>
                        {
                            foreach (var s in schulden) Row(t, s.Schuldeiser, $"€ {s.Bedrag:N2}");
                        });
                });

            if (uitvaart != null)
                AddPage(container, "Uitvaartwensen", col =>
                {
                    Section(col, "Uitvaart", t =>
                    {
                        Row(t, L["Label_Type"].Value, uitvaart.VoorkeurType ?? "—");
                        Row(t, L["Label_Begraafplaats"].Value, uitvaart.Begraafplaats ?? "—");
                        if (!string.IsNullOrEmpty(uitvaart.Muziekwensen)) Row(t, L["Label_Muziek"].Value, uitvaart.Muziekwensen);
                        if (!string.IsNullOrEmpty(uitvaart.RouwkaartTekst)) Row(t, L["Label_Rouwkaart"].Value, uitvaart.RouwkaartTekst);
                    });
                });

            if (documenten.Count > 0)
                AddPage(container, L["Page_Documenten"].Value, col =>
                {
                    Section(col, "Opgeslagen Documenten", t =>
                    {
                        foreach (var d in documenten) Row(t, d.Naam, $"{d.Categorie} — {d.BestandsNaam}");
                    });
                });
        }).GeneratePdf();
    }

    // ── Noodkaart ──

    public async Task<byte[]> GenerateNoodkaartPdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var eid = eigenaar?.Id ?? Guid.Empty;
        var noodcontacten = await _db.Noodcontacten.Where(n => n.EigenaarId == eid).OrderBy(n => n.Naam).ToListAsync();
        var testament = eigenaar != null
            ? await _db.Testamenten.FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id)
            : null;
        var uitvaart = eigenaar != null
            ? await _db.UitvaartWensen.FirstOrDefaultAsync(u => u.EigenaarId == eigenaar.Id)
            : null;
        var verzekeringen = await _db.Verzekeringen.Where(v => v.EigenaarId == eid).ToListAsync();

        var laatstBijgewerkt = eigenaar?.GewijzigdOp ?? DateTime.MinValue;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, L["Page_Noodkaart"].Value, laatstBijgewerkt));
                page.Content().Column(col =>
                {
                    col.Spacing(8);

                    // Disclaimer
                    col.Item().Background(Colors.Blue.Lighten5).Padding(8).Column(disclaimer =>
                    {
                        disclaimer.Item().Text(L["Text_NoodkaartDisclaimer"].Value)
                            .Bold().FontSize(10).FontColor(Colors.Blue.Darken3);
                        disclaimer.Item().Text($"Gegenereerd op {DateTime.Now:dd-MM-yyyy}")
                            .FontSize(8).FontColor(Colors.Grey.Medium);
                    });

                    // Eigenaar gegevens
                    if (eigenaar != null)
                        Section(col, L["Section_PersoonlijkeGegevens"].Value, t =>
                        {
                            Row(t, L["Label_Naam"].Value, $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim());
                            Row(t, L["Label_Geboortedatum"].Value, eigenaar.Geboortedatum.ToString("dd-MM-yyyy"));
                            if (!string.IsNullOrEmpty(eigenaar.BSN)) Row(t, L["Label_BSN"].Value, eigenaar.BSN);
                            if (!string.IsNullOrEmpty(eigenaar.Adres)) Row(t, L["Label_Adres"].Value, $"{eigenaar.Adres}, {eigenaar.Postcode} {eigenaar.Woonplaats}");
                            if (!string.IsNullOrEmpty(eigenaar.Telefoon)) Row(t, L["Label_Telefoon"].Value, eigenaar.Telefoon);
                            if (!string.IsNullOrEmpty(eigenaar.Email)) Row(t, L["Label_EMail"].Value, eigenaar.Email);
                        });

                    // Noodcontacten
                    if (noodcontacten.Count > 0)
                        Section(col, L["Section_Noodcontacten"].Value, t =>
                        {
                            foreach (var nc in noodcontacten)
                            {
                                var details = new List<string> { nc.Relatie };
                                if (!string.IsNullOrEmpty(nc.Telefoon)) details.Add(nc.Telefoon);
                                if (!string.IsNullOrEmpty(nc.Email)) details.Add(nc.Email);
                                Row(t, $"{nc.Naam} ({nc.Rol})", string.Join(" — ", details));
                                if (!string.IsNullOrEmpty(nc.Instructies))
                                    t.Item().PaddingLeft(150).Text(nc.Instructies).Italic().FontSize(8).FontColor(Colors.Grey.Darken1);
                            }
                        });

                    // Testament & notaris
                    Section(col, L["Section_TestamentEnNotaris"].Value, t =>
                    {
                        if (testament != null)
                        {
                            Row(t, L["Label_TypeTestament"].Value, testament.TestamentType ?? "—");
                            Row(t, L["Label_Bewaarlocatie"].Value, testament.TestamentLocatie ?? "—");
                            Row(t, L["Label_Notaris"].Value, testament.NotarisNaam ?? eigenaar?.Notaris ?? "—");
                            Row(t, L["Label_Notariskantoor"].Value, testament.NotarisKantoor ?? eigenaar?.NotarisKantoor ?? "—");
                            if (!string.IsNullOrEmpty(testament.CTR_Nummer)) Row(t, L["Label_CTRNummer"].Value, testament.CTR_Nummer);
                        }
                        else
                        {
                            Row(t, L["Label_Notaris"].Value, eigenaar?.Notaris ?? L["Value_NietIngevuld"].Value);
                            Row(t, L["Label_Notariskantoor"].Value, eigenaar?.NotarisKantoor ?? L["Value_NietIngevuld"].Value);
                        }
                    });

                    // Uitvaartondernemer
                    if (uitvaart != null)
                        Section(col, "Uitvaart", t =>
                        {
                            Row(t, L["Label_Voorkeur"].Value, uitvaart.VoorkeurType ?? "—");
                            Row(t, L["Label_Uitvaartondernemer"].Value, uitvaart.UitvaartOndernemer ?? L["Value_NietIngevuld"].Value);
                        });

                    // Verzekeringen
                    if (verzekeringen.Count > 0)
                        Section(col, "Verzekeringen", t =>
                        {
                            foreach (var v in verzekeringen)
                                Row(t, $"{v.Verzekeraar} ({v.Type})", string.Format(L["Text_PolisPrefix"].Value, v.PolisNummer));
                        });
                });
                page.Footer().Element(Footer);
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateTestamentConceptPdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var testament = eigenaar != null
            ? await _db.Testamenten.FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id)
            : null;
        var begunstigden = testament != null
            ? await _db.Begunstigden.Where(b => b.TestamentInfoId == testament.Id).ToListAsync()
            : new List<Domain.Testament.Begunstigde>();
        var executeurs = testament != null
            ? await _db.Executeurs.Where(e => e.TestamentInfoId == testament.Id).ToListAsync()
            : new List<Domain.Testament.Executeur>();

        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim()
            : L["Value_Onbekend"].Value;
        var isNotarieel = testament?.TestamentType == "Notarieel";

        var laatstBijgewerkt = new[] { eigenaar?.GewijzigdOp, testament?.GewijzigdOp }
            .Where(d => d.HasValue).Select(d => d!.Value).DefaultIfEmpty().Max();

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, isNotarieel ? L["Page_ConceptTestamentNotarieel"].Value : L["Page_ConceptTestamentCodicil"].Value, laatstBijgewerkt));
                page.Content().Column(col =>
                {
                    col.Spacing(8);

                    // Disclaimer
                    col.Item().Border(1).BorderColor(Colors.Orange.Darken1).Background(Colors.Orange.Lighten4).Padding(10).Column(d =>
                    {
                        d.Item().Text(L["Legal_ConceptDocumentDisclaimer"].Value).Bold().FontSize(10).FontColor(Colors.Orange.Darken3);
                        d.Item().PaddingTop(4).Text(isNotarieel
                            ? L["Legal_ConceptNotarieelToelichting"].Value
                            : L["Legal_ConceptCodicilToelichting"].Value
                        ).FontSize(8).FontColor(Colors.Orange.Darken2);
                    });

                    // Kop
                    col.Item().PaddingTop(10).Text(L["Legal_UitersteWilsbeschikking"].Value).Bold().FontSize(14).AlignCenter();
                    col.Item().Text(string.Format(L["Text_Van"].Value, eigenaarNaam)).FontSize(11).AlignCenter();
                    col.Item().PaddingTop(8);

                    // Art. 1 — Persoonlijke gegevens
                    Section(col, L["Section_Artikel1Ondergetekende"].Value, t =>
                    {
                        Row(t, L["Label_Naam"].Value, eigenaarNaam);
                        if (eigenaar?.Geboortedatum != default)
                            Row(t, L["Label_Geboortedatum"].Value, eigenaar!.Geboortedatum.ToString("dd-MM-yyyy"));
                        if (!string.IsNullOrEmpty(eigenaar?.BSN))
                            Row(t, L["Label_BSN"].Value, eigenaar!.BSN);
                        if (!string.IsNullOrEmpty(eigenaar?.Adres))
                            Row(t, L["Label_Woonplaats"].Value, $"{eigenaar!.Adres}, {eigenaar.Postcode} {eigenaar.Woonplaats}".Trim().TrimEnd(','));
                        t.Item().PaddingTop(5).Text(L["Legal_VerklaartTeSchikken"].Value).FontSize(9).Italic();
                    });

                    // Art. 2 — Erfgenamen
                    if (begunstigden.Count > 0)
                    {
                        Section(col, L["Section_Artikel2ErfgenamenBegunstigden"].Value, t =>
                        {
                            t.Item().Text(L["Legal_IkBenoemErfgenamen"].Value).FontSize(9);
                            t.Item().PaddingTop(4);
                            foreach (var b in begunstigden)
                            {
                                var detail = b.Percentage != null ? $" — {b.Percentage}%" : "";
                                if (b.IsLegitiemePortie) detail += $" {L["Value_LegitiemePortie"].Value}";
                                Row(t, b.Naam, $"{b.Relatie}{detail}");
                            }
                        });
                    }

                    // Art. 3 — Executeur
                    if (executeurs.Count > 0)
                    {
                        Section(col, L["Section_Artikel3Executeur"].Value, t =>
                        {
                            t.Item().Text(L["Legal_IkBenoemExecuteur"].Value).FontSize(9);
                            t.Item().PaddingTop(4);
                            foreach (var e in executeurs)
                            {
                                Row(t, e.Naam, e.Bevoegdheden ?? L["Value_BeheerEnBeschikking"].Value);
                                if (!string.IsNullOrEmpty(e.Telefoon) || !string.IsNullOrEmpty(e.Email))
                                    Row(t, L["Label_Contact"].Value, $"{e.Telefoon ?? ""} {e.Email ?? ""}".Trim());
                            }
                        });
                    }

                    // Art. 4 — Uitsluitingsclausule
                    if (testament?.UitsluitingsClausule == true)
                    {
                        Section(col, L["Section_Artikel4Uitsluitingsclausule"].Value, t =>
                        {
                            t.Item().Text(L["Legal_Uitsluitingsclausule"].Value).FontSize(9);
                        });
                    }

                    // Art. 5 — Legaten
                    if (!string.IsNullOrEmpty(testament?.Legaten))
                    {
                        Section(col, string.Format(L["Section_ArtikelLegaten"].Value, testament?.UitsluitingsClausule == true ? 5 : 4), t =>
                        {
                            t.Item().Text(testament!.Legaten).FontSize(9);
                        });
                    }

                    // Bijzondere bepalingen
                    if (!string.IsNullOrEmpty(testament?.BijzondereBepalingen))
                    {
                        Section(col, L["Section_BijzondereBepalingen"].Value, t =>
                        {
                            t.Item().Text(testament!.BijzondereBepalingen).FontSize(9);
                        });
                    }

                    // Algemene wensen
                    if (!string.IsNullOrEmpty(testament?.AlgemeneWensen))
                    {
                        Section(col, L["Section_AlgemeneWensen"].Value, t =>
                        {
                            t.Item().Text(testament!.AlgemeneWensen).FontSize(9);
                        });
                    }

                    // Notaris
                    if (!string.IsNullOrEmpty(testament?.NotarisNaam))
                    {
                        Section(col, L["Section_Notaris"].Value, t =>
                        {
                            Row(t, L["Label_Notaris"].Value, testament!.NotarisNaam ?? "—");
                            Row(t, L["Label_Kantoor"].Value, testament.NotarisKantoor ?? "—");
                            if (!string.IsNullOrEmpty(testament.NotarisTelefoon))
                                Row(t, L["Label_Telefoon"].Value, testament.NotarisTelefoon);
                            if (!string.IsNullOrEmpty(testament.NotarisEmail))
                                Row(t, L["Label_EMail"].Value, testament.NotarisEmail);
                            if (!string.IsNullOrEmpty(testament.CTR_Nummer))
                                Row(t, L["Label_CTRNummer"].Value, testament.CTR_Nummer);
                        });
                    }

                    // Ondertekening
                    col.Item().PaddingTop(20).Column(sig =>
                    {
                        sig.Item().Text(L["Signing_Ondertekening"].Value).FontSize(11).SemiBold();
                        sig.Item().PaddingTop(10).Text(string.Format(L["Signing_AldusOpgemaakt"].Value, testament?.DatumTestament != null ? testament.DatumTestament.Value.ToString("dd-MM-yyyy") : "____-____-________")).FontSize(9);
                        sig.Item().PaddingTop(30).Text(L["Signing_Handtekening"].Value).FontSize(9);
                        sig.Item().PaddingTop(5).Text(eigenaarNaam).FontSize(9);
                    });
                });
                page.Footer().Element(c => FooterWithDisclaimer(c,
                    L["Footer_TestamentConceptDisclaimer"].Value));
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateWilsverklaringPdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var wilsverklaring = eigenaar != null
            ? await _db.Wilsverklaringen.FirstOrDefaultAsync(w => w.EigenaarId == eigenaar.Id)
            : null;
        var voorwaarden = wilsverklaring != null
            ? await _db.EuthanasieVoorwaarden.Where(v => v.WilsverklaringId == wilsverklaring.Id).ToListAsync()
            : new List<Domain.EuthanasiaDirective.EuthanasieVoorwaarde>();

        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim()
            : "Onbekend";

        var laatstBijgewerkt = new[] { eigenaar?.GewijzigdOp, wilsverklaring?.GewijzigdOp }
            .Where(d => d.HasValue).Select(d => d!.Value).DefaultIfEmpty().Max();

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, "Wilsverklaring Euthanasie", laatstBijgewerkt));
                page.Content().Column(col =>
                {
                    col.Spacing(8);

                    // Disclaimer
                    col.Item().Border(1).BorderColor(Colors.Purple.Darken1).Background(Colors.Purple.Lighten5).Padding(10).Column(d =>
                    {
                        d.Item().Text(L["Legal_WilsverklaringHeader"].Value).Bold().FontSize(10).FontColor(Colors.Purple.Darken3);
                        d.Item().PaddingTop(4).Text(
                            L["Legal_WilsverklaringToelichting"].Value
                        ).FontSize(8).FontColor(Colors.Purple.Darken2);
                    });

                    // Kop
                    col.Item().PaddingTop(10).Text(L["Legal_WilsverklaringEuthanasieTitle"].Value).Bold().FontSize(14).AlignCenter();
                    col.Item().Text(L["Legal_ConformArtikel2"].Value).FontSize(8).FontColor(Colors.Grey.Darken1).AlignCenter();
                    col.Item().PaddingTop(8);

                    // Ondergetekende
                    Section(col, L["Section_Ondergetekende"].Value, t =>
                    {
                        Row(t, L["Label_Naam"].Value, eigenaarNaam);
                        if (eigenaar?.Geboortedatum != default)
                            Row(t, L["Label_Geboortedatum"].Value, eigenaar!.Geboortedatum.ToString("dd-MM-yyyy"));
                        if (!string.IsNullOrEmpty(eigenaar?.BSN))
                            Row(t, L["Label_BSN"].Value, eigenaar!.BSN);
                        if (!string.IsNullOrEmpty(eigenaar?.Adres))
                            Row(t, L["Label_Woonplaats"].Value, $"{eigenaar!.Adres}, {eigenaar.Postcode} {eigenaar.Woonplaats}".Trim().TrimEnd(','));
                    });

                    // Verklaring
                    Section(col, L["Section_Verklaring"].Value, t =>
                    {
                        if (wilsverklaring?.WilEuthanasie == true)
                        {
                            t.Item().Text(L["Legal_EuthanasieVerklaring"].Value).FontSize(9);
                        }
                        else
                        {
                            t.Item().Text(L["Legal_GeenEuthanasie"].Value).FontSize(9);
                        }
                    });

                    // Situatiebeschrijving
                    if (!string.IsNullOrEmpty(wilsverklaring?.SituatieBeschrijving))
                    {
                        Section(col, L["Section_SituatieEuthanasie"].Value, t =>
                        {
                            t.Item().Text(wilsverklaring!.SituatieBeschrijving).FontSize(9);
                        });
                    }

                    // Voorwaarden
                    if (voorwaarden.Count > 0)
                    {
                        Section(col, L["Section_SpecifiekeVoorwaarden"].Value, t =>
                        {
                            foreach (var v in voorwaarden)
                            {
                                t.Item().Text($"\u2022 {v.Voorwaarde}").FontSize(9);
                                if (!string.IsNullOrEmpty(v.Toelichting))
                                    t.Item().PaddingLeft(15).Text(v.Toelichting).FontSize(8).FontColor(Colors.Grey.Darken1);
                            }
                        });
                    }

                    // Dementie-clausule
                    if (wilsverklaring?.DementieClausule == true)
                    {
                        Section(col, L["Section_DementieClausule"].Value, t =>
                        {
                            t.Item().Text(L["Legal_DementieClausule"].Value).FontSize(9);
                            if (!string.IsNullOrEmpty(wilsverklaring.DementieClausuleToelichting))
                            {
                                t.Item().PaddingTop(4).Text(wilsverklaring.DementieClausuleToelichting).FontSize(9);
                            }
                        });
                    }

                    // Behandelverbod
                    if (!string.IsNullOrEmpty(wilsverklaring?.BehandelVerbod))
                    {
                        Section(col, L["Section_Behandelverbod"].Value, t =>
                        {
                            t.Item().Text(L["Legal_Behandelverbod"].Value).FontSize(9);
                            t.Item().PaddingTop(4).Text(wilsverklaring!.BehandelVerbod).FontSize(9);
                        });
                    }

                    // Huisarts
                    Section(col, L["Section_Huisarts"].Value, t =>
                    {
                        Row(t, L["Label_Naam"].Value, wilsverklaring?.Huisarts ?? "Niet ingevuld");
                        Row(t, L["Label_Praktijk"].Value, wilsverklaring?.HuisartsPraktijk ?? "—");
                        if (!string.IsNullOrEmpty(wilsverklaring?.HuisartsTelefoon))
                            Row(t, L["Label_Telefoon"].Value, wilsverklaring!.HuisartsTelefoon);
                        if (!string.IsNullOrEmpty(wilsverklaring?.HuisartsEmail))
                            Row(t, L["Label_EMail"].Value, wilsverklaring!.HuisartsEmail);
                    });

                    // Vertegenwoordiger
                    if (!string.IsNullOrEmpty(wilsverklaring?.VertegenwoordigerNaam))
                    {
                        Section(col, L["Section_GevolmachtigdeVertegenwoordiger"].Value, t =>
                        {
                            Row(t, L["Label_Naam"].Value, wilsverklaring!.VertegenwoordigerNaam);
                            Row(t, L["Label_Relatie"].Value, wilsverklaring.VertegenwoordigerRelatie ?? "—");
                            if (!string.IsNullOrEmpty(wilsverklaring.VertegenwoordigerTelefoon))
                                Row(t, L["Label_Telefoon"].Value, wilsverklaring.VertegenwoordigerTelefoon);
                            if (!string.IsNullOrEmpty(wilsverklaring.VertegenwoordigerEmail))
                                Row(t, L["Label_EMail"].Value, wilsverklaring.VertegenwoordigerEmail);
                            if (!string.IsNullOrEmpty(wilsverklaring.VertegenwoordigerAdres))
                                Row(t, "Adres", $"{wilsverklaring.VertegenwoordigerAdres}, {wilsverklaring.VertegenwoordigerPostcode} {wilsverklaring.VertegenwoordigerWoonplaats}".Trim().TrimEnd(','));
                        });
                    }

                    // Aanvullende wensen
                    if (!string.IsNullOrEmpty(wilsverklaring?.AanvullendeWensen))
                    {
                        Section(col, L["Section_AanvullendeWensen"].Value, t =>
                        {
                            t.Item().Text(wilsverklaring!.AanvullendeWensen).FontSize(9);
                        });
                    }

                    // Ondertekening
                    col.Item().PaddingTop(20).Column(sig =>
                    {
                        sig.Item().Text(L["Signing_Ondertekening"].Value).FontSize(11).SemiBold();
                        sig.Item().PaddingTop(5).Text(L["Legal_HelderBewustzijn"].Value).FontSize(9);
                        sig.Item().PaddingTop(10).Text(string.Format(L["Signing_DatumPrefix"].Value, wilsverklaring?.DatumOndertekening != null ? wilsverklaring.DatumOndertekening.Value.ToString("dd-MM-yyyy") : "____-____-________")).FontSize(9);
                        sig.Item().PaddingTop(5).Text(L["Signing_Plaats"].Value).FontSize(9);
                        sig.Item().PaddingTop(25).Text(L["Signing_Handtekening"].Value).FontSize(9);
                        sig.Item().PaddingTop(5).Text(eigenaarNaam).FontSize(9);
                    });

                    // Getuigen
                    col.Item().PaddingTop(20).Column(wit =>
                    {
                        wit.Item().Text(L["Signing_Getuigen"].Value).FontSize(11).SemiBold();
                        wit.Item().PaddingTop(10).Text(L["Signing_Getuige1"].Value).FontSize(9).SemiBold();
                        wit.Item().PaddingTop(5).Text(L["Signing_Naam"].Value).FontSize(9);
                        wit.Item().PaddingTop(5).Text(L["Signing_Handtekening"].Value).FontSize(9);
                        wit.Item().PaddingTop(15).Text(L["Signing_Getuige2"].Value).FontSize(9).SemiBold();
                        wit.Item().PaddingTop(5).Text(L["Signing_Naam"].Value).FontSize(9);
                        wit.Item().PaddingTop(5).Text(L["Signing_Handtekening"].Value).FontSize(9);
                    });
                });
                page.Footer().Element(c => FooterWithDisclaimer(c,
                    L["Footer_WilsverklaringDisclaimer"].Value));
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateNoodprocedurePdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var noodcontacten = await _db.Noodcontacten.ToListAsync();
        var erfgenamen = await _db.Erfgenamen.Where(e => e.HeeftShareOntvangen).OrderBy(e => e.ShareIndex).ToListAsync();
        var drempel = erfgenamen.Count > 0 ? Math.Max(2, (int)Math.Ceiling(erfgenamen.Count * 0.6)) : 2;

        var laatstBijgewerkt = eigenaar?.GewijzigdOp ?? DateTime.MinValue;

        return Document.Create(container =>
        {
            // Page 1: Noodprocedure overzicht
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, L["Page_Noodprocedure"].Value, laatstBijgewerkt));
                page.Content().Column(col =>
                {
                    col.Spacing(10);

                    // Intro
                    col.Item().Text(L["Text_NoodprocedureIntro"].Value)
                        .FontSize(9).FontColor(Colors.Grey.Darken1);

                    col.Item().PaddingTop(5);

                    // Eigenaar info
                    if (eigenaar != null)
                    {
                        Section(col, L["Section_GegevensOverledene"].Value, t =>
                        {
                            Row(t, L["Label_Naam"].Value, $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim());
                            if (!string.IsNullOrEmpty(eigenaar.Telefoon))
                                Row(t, L["Label_Telefoon"].Value, eigenaar.Telefoon);
                            if (!string.IsNullOrEmpty(eigenaar.Email))
                                Row(t, L["Label_EMail"].Value, eigenaar.Email);
                        });
                    }

                    // Stap 1: Noodcontacten
                    Section(col, L["Section_Stap1Noodcontacten"].Value, t =>
                    {
                        t.Item().Text(L["Text_NeemContactOp"].Value)
                            .FontSize(9).FontColor(Colors.Grey.Darken1);
                        t.Item().PaddingTop(3);
                        if (noodcontacten.Count > 0)
                        {
                            foreach (var nc in noodcontacten)
                            {
                                Row(t, $"{nc.Naam} ({nc.Rol})", $"{nc.Telefoon ?? "—"} / {nc.Email ?? "—"}");
                                if (!string.IsNullOrEmpty(nc.Instructies))
                                    Row(t, L["Label_Instructie"].Value, nc.Instructies);
                            }
                        }
                        else
                        {
                            t.Item().Text(L["Text_GeenNoodcontacten"].Value).FontSize(9).Italic();
                        }
                    });

                    // Stap 2: Shamir-sleuteldelen verzamelen
                    Section(col, L["Section_Stap2ShamirSleuteldelen"].Value, t =>
                    {
                        t.Item().Text(string.Format(L["Text_ShamirSleuteldelenNodig"].Value, drempel))
                            .FontSize(9).FontColor(Colors.Grey.Darken1);
                        t.Item().PaddingTop(3);
                        if (erfgenamen.Count > 0)
                        {
                            foreach (var e in erfgenamen)
                            {
                                Row(t, string.Format(L["Label_DeelNummer"].Value, e.ShareIndex), $"{e.Voornaam} {e.Achternaam} — {e.Telefoon ?? e.Email ?? L["Text_GeenContact"].Value}");
                            }
                        }
                        else
                        {
                            t.Item().Text(L["Text_GeenSleuteldelen"].Value).FontSize(9).Italic();
                        }
                    });

                    // Stap 3: Lumio installeren
                    Section(col, L["Section_Stap3LumioInstalleren"].Value, t =>
                    {
                        t.Item().Text(L["Text_LumioDesktopInstructie"].Value).FontSize(9).FontColor(Colors.Grey.Darken1);
                        t.Item().PaddingTop(3);
                        Row(t, "3a", L["Text_Stap3aInstructie"].Value);
                        Row(t, "3b", L["Text_Stap3bInstructie"].Value);
                        Row(t, "3c", L["Text_Stap3cInstructie"].Value);
                    });

                    // Stap 4: Backup herstellen
                    Section(col, L["Section_Stap4BackupHerstellen"].Value, t =>
                    {
                        t.Item().Text(L["Text_AlsBackupOntvangen"].Value).FontSize(9).FontColor(Colors.Grey.Darken1);
                        t.Item().PaddingTop(3);
                        Row(t, "4a", L["Text_Stap4aInstructie"].Value);
                        Row(t, "4b", L["Text_Stap4bInstructie"].Value);
                        Row(t, "4c", L["Text_Stap4cInstructie"].Value);
                    });

                    // Stap 5: Ontgrendelen
                    Section(col, L["Section_Stap5Ontgrendelen"].Value, t =>
                    {
                        t.Item().Text(L["Text_NaHerstellen"].Value).FontSize(9).FontColor(Colors.Grey.Darken1);
                        t.Item().PaddingTop(3);
                        Row(t, "5a", L["Text_Stap5aInstructie"].Value);
                        Row(t, "5b", L["Text_Stap5bInstructie"].Value);
                        Row(t, "5c", string.Format(L["Text_Stap5cInstructie"].Value, drempel));
                        Row(t, "5d", L["Text_Stap5dInstructie"].Value);
                        Row(t, "5e", L["Text_Stap5eInstructie"].Value);
                    });

                    // Stap 6: Wat te doen
                    Section(col, L["Section_Stap6GegevensRaadplegen"].Value, t =>
                    {
                        t.Item().Text(L["Text_NaOntgrendeling"].Value).FontSize(9).FontColor(Colors.Grey.Darken1);
                        t.Item().PaddingTop(3);
                        Row(t, "•", L["Text_DashboardStappenplan"].Value);
                        Row(t, "•", L["Text_WensenInzien"].Value);
                        Row(t, "•", L["Text_PdfExporteren"].Value);
                        Row(t, "•", L["Text_ZipDownloaden"].Value);
                        Row(t, "•", L["Text_VoortgangBijhouden"].Value);
                    });
                });
                page.Footer().Element(Footer);
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateBoedelbeschrijvingPdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var eid = eigenaar?.Id ?? Guid.Empty;
        var erfgenamen = await _db.Erfgenamen.Where(e => e.EigenaarId == eid).ToListAsync();
        var bezittingen = await _db.FysiekeBezittingen.Where(f => f.EigenaarId == eid).ToListAsync();
        var rekeningen = await _db.Bankrekeningen.Where(b => b.EigenaarId == eid).ToListAsync();
        var verzekeringen = await _db.Verzekeringen.Where(v => v.EigenaarId == eid).ToListAsync();
        var schulden = await _db.Schulden.Where(s => s.EigenaarId == eid).ToListAsync();
        var testament = eigenaar != null
            ? await _db.Testamenten.FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id)
            : null;
        var executeurs = testament != null
            ? await _db.Executeurs.Where(e => e.TestamentInfoId == testament.Id).ToListAsync()
            : new List<Domain.Testament.Executeur>();

        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Replace("  ", " ").Trim()
            : L["Value_Onbekend"].Value;

        // Bereken totalen
        var totaalBezittingenPrivé = bezittingen.Where(b => b.VermogensSoort == VermogensSoort.Prive).Sum(b => b.GeschatteWaarde ?? 0);
        var totaalBezittingenGem = bezittingen.Where(b => b.VermogensSoort == VermogensSoort.Gemeenschap).Sum(b => b.GeschatteWaarde ?? 0);
        var totaalSaldiPrivé = rekeningen.Where(r => r.VermogensSoort == VermogensSoort.Prive).Sum(r => r.Saldo ?? 0);
        var totaalSaldiGem = rekeningen.Where(r => r.VermogensSoort == VermogensSoort.Gemeenschap).Sum(r => r.Saldo ?? 0);
        var totaalVerzekeringenPrivé = verzekeringen.Where(v => v.VermogensSoort == VermogensSoort.Prive).Sum(v => v.VerzekerdBedrag ?? 0);
        var totaalVerzekeringenGem = verzekeringen.Where(v => v.VermogensSoort == VermogensSoort.Gemeenschap).Sum(v => v.VerzekerdBedrag ?? 0);
        var totaalSchuldenPrivé = schulden.Where(s => s.VermogensSoort == VermogensSoort.Prive).Sum(s => s.Bedrag);
        var totaalSchuldenGem = schulden.Where(s => s.VermogensSoort == VermogensSoort.Gemeenschap).Sum(s => s.Bedrag);

        var brutoPrivé = totaalBezittingenPrivé + totaalSaldiPrivé + totaalVerzekeringenPrivé;
        var brutoGem = totaalBezittingenGem + totaalSaldiGem + totaalVerzekeringenGem;
        var nettoPrivé = brutoPrivé - totaalSchuldenPrivé;
        var nettoGem = brutoGem - totaalSchuldenGem;
        var brutoTotaal = brutoPrivé + brutoGem;
        var nettoTotaal = nettoPrivé + nettoGem;

        // Laatste wijziging datum van alle boedel-items
        var alleDatums = bezittingen.Select(b => b.GewijzigdOp)
            .Concat(rekeningen.Select(r => r.GewijzigdOp))
            .Concat(verzekeringen.Select(v => v.GewijzigdOp))
            .Concat(schulden.Select(s => s.GewijzigdOp));
        var laatsteWijziging = alleDatums.Any() ? alleDatums.Max() : (DateTime?)null;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, L["Page_Boedelbeschrijving"].Value, laatsteWijziging));
                page.Content().Column(col =>
                {
                    col.Spacing(8);

                    // Juridische disclaimer (P-M19)
                    col.Item().Background(Colors.Grey.Lighten4).Padding(8).Column(disc =>
                    {
                        disc.Item().Text(L["Legal_JuridischeDisclaimer"].Value).FontSize(8).Bold().FontColor(Colors.Grey.Darken2);
                        disc.Item().PaddingTop(3).Text(
                            string.Format(L["Legal_BoedelbeschrijvingDisclaimer"].Value, DateTime.Now.ToString("dd-MM-yyyy")))
                            .FontSize(7).FontColor(Colors.Grey.Darken1);
                    });

                    // Persoonsgegevens overledene
                    if (eigenaar != null)
                    {
                        Section(col, L["Section_1Persoonsgegevens"].Value, t =>
                        {
                            Row(t, L["Label_Naam"].Value, eigenaarNaam);
                            Row(t, L["Label_Geboortedatum"].Value, eigenaar.Geboortedatum.ToString("dd-MM-yyyy"));
                            if (!string.IsNullOrEmpty(eigenaar.Adres))
                                Row(t, L["Label_Adres"].Value, $"{eigenaar.Adres}, {eigenaar.Postcode} {eigenaar.Woonplaats}".Trim().TrimEnd(','));
                            Row(t, L["Label_BurgerlijkeStaat"].Value, eigenaar.BurgerlijkeStaat switch
                            {
                                BurgerlijkeStaat.Ongehuwd => L["Value_Ongehuwd"].Value,
                                BurgerlijkeStaat.Gehuwd => L["Value_Gehuwd"].Value,
                                BurgerlijkeStaat.GeregistreerdPartnerschap => L["Value_GeregistreerdPartnerschap"].Value,
                                BurgerlijkeStaat.Gescheiden => L["Value_Gescheiden"].Value,
                                BurgerlijkeStaat.Weduwe => L["Value_WeduweWeduwnaar"].Value,
                                _ => "—"
                            });
                            if (eigenaar.BurgerlijkeStaat is BurgerlijkeStaat.Gehuwd or BurgerlijkeStaat.GeregistreerdPartnerschap)
                            {
                                Row(t, L["Label_Huwelijksvoorwaarden"].Value, eigenaar.HuwelijksVoorwaarden switch
                                {
                                    HuwelijksVoorwaarden.GemeenschapVanGoederen => L["Value_GemeenschapVanGoederen"].Value,
                                    HuwelijksVoorwaarden.BeperkteGemeenschap => L["Value_BeperkteGemeenschap"].Value,
                                    HuwelijksVoorwaarden.KoudeUitsluiting => L["Value_KoudeUitsluiting"].Value,
                                    _ => L["Value_NietVanToepassing"].Value
                                });
                                if (eigenaar.DatumHuwelijk.HasValue)
                                    Row(t, L["Label_DatumHuwelijk"].Value, eigenaar.DatumHuwelijk.Value.ToString("dd-MM-yyyy"));
                            }
                            // Legitimatiegegevens
                            if (eigenaar.LegitimatieSoort != LegitimatieSoort.Geen)
                            {
                                Row(t, L["Label_Legitimatie"].Value, eigenaar.LegitimatieSoort switch
                                {
                                    LegitimatieSoort.Paspoort => L["Value_Paspoort"].Value,
                                    LegitimatieSoort.Identiteitskaart => L["Value_Identiteitskaart"].Value,
                                    LegitimatieSoort.Rijbewijs => L["Value_Rijbewijs"].Value,
                                    _ => "—"
                                });
                                if (!string.IsNullOrEmpty(eigenaar.LegitimatieNummer))
                                    Row(t, L["Label_Documentnummer"].Value, eigenaar.LegitimatieNummer);
                                if (eigenaar.LegitimatieDatumAfgifte.HasValue)
                                    Row(t, L["Label_DatumAfgifte"].Value, eigenaar.LegitimatieDatumAfgifte.Value.ToString("dd-MM-yyyy"));
                                if (eigenaar.LegitimatieGeldigTot.HasValue)
                                    Row(t, L["Label_GeldigTot"].Value, eigenaar.LegitimatieGeldigTot.Value.ToString("dd-MM-yyyy"));
                            }
                        });
                    }

                    // Erfgenamen
                    if (erfgenamen.Count > 0)
                    {
                        Section(col, L["Section_2Erfgenamen"].Value, t =>
                        {
                            foreach (var e in erfgenamen)
                            {
                                var naam = $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}".Replace("  ", " ").Trim();
                                Row(t, naam, $"{e.Relatie}{(e.Geboortedatum.HasValue ? $", geb. {e.Geboortedatum.Value:dd-MM-yyyy}" : "")}");
                            }
                        });
                    }

                    // ACTIVA
                    Section(col, L["Section_3Activa"].Value, t =>
                    {
                        t.Item().Text(L["Text_FysiekeBezittingen"].Value).FontSize(10).SemiBold();
                        if (bezittingen.Count > 0)
                        {
                            foreach (var b in bezittingen)
                            {
                                var verm = b.VermogensSoort == VermogensSoort.Gemeenschap ? " [G]" : " [P]";
                                Row(t, $"  {b.Omschrijving}{verm}", b.GeschatteWaarde.HasValue ? $"€ {b.GeschatteWaarde:N2}" : "—");
                            }
                            Row(t, L["Label_SubtotaalBezittingen"].Value, $"€ {(totaalBezittingenPrivé + totaalBezittingenGem):N2}");
                        }
                        else
                            t.Item().Text(L["Text_GeenBezittingen"].Value).FontSize(9).Italic().FontColor(Colors.Grey.Medium);

                        t.Item().PaddingTop(5).Text(L["Text_Bankrekeningen"].Value).FontSize(10).SemiBold();
                        if (rekeningen.Count > 0)
                        {
                            foreach (var r in rekeningen)
                            {
                                var verm = r.VermogensSoort == VermogensSoort.Gemeenschap ? " [G]" : " [P]";
                                Row(t, $"  {r.BankNaam} ({r.IBAN}){verm}", r.Saldo.HasValue ? $"€ {r.Saldo:N2}" : "—");
                            }
                            Row(t, L["Label_SubtotaalSaldi"].Value, $"€ {(totaalSaldiPrivé + totaalSaldiGem):N2}");
                        }
                        else
                            t.Item().Text(L["Text_GeenBankrekeningen"].Value).FontSize(9).Italic().FontColor(Colors.Grey.Medium);

                        t.Item().PaddingTop(5).Text(L["Text_Verzekeringen"].Value).FontSize(10).SemiBold();
                        if (verzekeringen.Count > 0)
                        {
                            foreach (var v in verzekeringen)
                            {
                                var verm = v.VermogensSoort == VermogensSoort.Gemeenschap ? " [G]" : " [P]";
                                Row(t, $"  {v.Verzekeraar} ({v.Type}){verm}", v.VerzekerdBedrag.HasValue ? $"€ {v.VerzekerdBedrag:N2}" : "—");
                            }
                            Row(t, L["Label_SubtotaalVerzekeringen"].Value, $"€ {(totaalVerzekeringenPrivé + totaalVerzekeringenGem):N2}");
                        }
                        else
                            t.Item().Text(L["Text_GeenVerzekeringen"].Value).FontSize(9).Italic().FontColor(Colors.Grey.Medium);

                        t.Item().PaddingTop(8);
                        Row(t, L["Label_TotaalActivaBruto"].Value, $"€ {brutoTotaal:N2}");
                    });

                    // PASSIVA
                    Section(col, L["Section_4Passiva"].Value, t =>
                    {
                        if (schulden.Count > 0)
                        {
                            foreach (var s in schulden)
                            {
                                var verm = s.VermogensSoort == VermogensSoort.Gemeenschap ? " [G]" : " [P]";
                                Row(t, $"  {s.Schuldeiser} ({s.Type}){verm}", $"€ {s.Bedrag:N2}");
                            }
                            Row(t, L["Label_TotaalPassiva"].Value, $"€ {(totaalSchuldenPrivé + totaalSchuldenGem):N2}");
                        }
                        else
                            t.Item().Text(L["Text_GeenSchulden"].Value).FontSize(9).Italic().FontColor(Colors.Grey.Medium);
                    });

                    // Saldo
                    col.Item().PaddingTop(5).Background(Colors.Blue.Lighten5).Padding(8).Column(saldo =>
                    {
                        saldo.Item().Row(row =>
                        {
                            row.ConstantItem(150).Text(L["Label_NettoNalatenschap"].Value).FontSize(11).Bold().FontColor(Colors.Blue.Darken3);
                            row.RelativeItem().AlignRight().Text($"€ {nettoTotaal:N2}").FontSize(11).Bold().FontColor(Colors.Blue.Darken3);
                        });
                        if (eigenaar?.BurgerlijkeStaat is BurgerlijkeStaat.Gehuwd or BurgerlijkeStaat.GeregistreerdPartnerschap &&
                            eigenaar?.HuwelijksVoorwaarden != HuwelijksVoorwaarden.KoudeUitsluiting)
                        {
                            saldo.Item().PaddingTop(3).Row(row =>
                            {
                                row.ConstantItem(150).Text(L["Label_WaarvanPrive"].Value).FontSize(9).FontColor(Colors.Grey.Darken1);
                                row.RelativeItem().AlignRight().Text($"€ {nettoPrivé:N2}").FontSize(9);
                            });
                            saldo.Item().Row(row =>
                            {
                                row.ConstantItem(150).Text(L["Label_WaarvanGemeenschap"].Value).FontSize(9).FontColor(Colors.Grey.Darken1);
                                row.RelativeItem().AlignRight().Text($"€ {nettoGem:N2}").FontSize(9);
                            });
                        }
                    });

                    // Legenda
                    col.Item().PaddingTop(5).Text(L["Text_Legenda"].Value)
                        .FontSize(7).FontColor(Colors.Grey.Medium);

                    // Ondertekening
                    col.Item().PaddingTop(20).Column(sig =>
                    {
                        sig.Item().Text(L["Signing_Ondertekening"].Value).FontSize(11).SemiBold();
                        sig.Item().PaddingTop(5).Text(L["Text_OndertekendVoorGezien"].Value).FontSize(9);

                        // Executeur
                        if (executeurs.Count > 0)
                        {
                            foreach (var ex in executeurs)
                            {
                                sig.Item().PaddingTop(15).Text(string.Format(L["Signing_ExecuteurPrefix"].Value, ex.Naam)).FontSize(9).SemiBold();
                                sig.Item().PaddingTop(5).Text(L["Signing_DatumHandtekening"].Value).FontSize(9);
                            }
                        }
                        else
                        {
                            sig.Item().PaddingTop(15).Text(L["Signing_Executeur"].Value).FontSize(9).SemiBold();
                            sig.Item().PaddingTop(5).Text(L["Signing_Naam"].Value).FontSize(9);
                            sig.Item().PaddingTop(5).Text(L["Signing_DatumHandtekening"].Value).FontSize(9);
                        }

                        // Erfgenamen
                        foreach (var e in erfgenamen)
                        {
                            var naam = $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}".Replace("  ", " ").Trim();
                            sig.Item().PaddingTop(15).Text(string.Format(L["Signing_ErfgenaamPrefix"].Value, naam)).FontSize(9).SemiBold();
                            sig.Item().PaddingTop(5).Text(L["Signing_DatumHandtekening"].Value).FontSize(9);
                        }
                    });
                });
                page.Footer().Element(c => FooterWithDisclaimer(c,
                    string.Format(L["Footer_BoedelbeschrijvingOpgesteld"].Value, DateTime.Now.ToString("dd-MM-yyyy"))));
            });
        }).GeneratePdf();
    }

    // ── P-S6: Export per erfgenaam ──

    public async Task<byte[]> GenerateErfgenaamPdf(Guid erfgenaamId)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var erfgenaam = await _db.Erfgenamen.FindAsync(erfgenaamId);
        if (eigenaar is null || erfgenaam is null) return [];

        var volleNaam = string.Join(" ",
            new[] { erfgenaam.Voornaam, erfgenaam.Tussenvoegsel, erfgenaam.Achternaam }
            .Where(s => !string.IsNullOrWhiteSpace(s)));
        var eigenaarNaam = string.Join(" ",
            new[] { eigenaar.Voornaam, eigenaar.Tussenvoegsel, eigenaar.Achternaam }
            .Where(s => !string.IsNullOrWhiteSpace(s)));

        // Get toewijzingen for this erfgenaam
        var toewijzingen = await _db.ErfgenaamToewijzingen
            .Where(t => t.ErfgenaamId == erfgenaamId).ToListAsync();

        // Resolve assigned entities
        var bezitIds = toewijzingen.Where(t => t.EntityType == "FysiekBezit").Select(t => t.EntityId).ToList();
        var bankIds = toewijzingen.Where(t => t.EntityType == "Bankrekening").Select(t => t.EntityId).ToList();
        var verzekeringIds = toewijzingen.Where(t => t.EntityType == "Verzekering").Select(t => t.EntityId).ToList();
        var accountIds = toewijzingen.Where(t => t.EntityType == "DigitaalAccount").Select(t => t.EntityId).ToList();

        var bezittingen = bezitIds.Count > 0
            ? await _db.FysiekeBezittingen.Where(b => bezitIds.Contains(b.Id)).ToListAsync() : [];
        var bankrekeningen = bankIds.Count > 0
            ? await _db.Bankrekeningen.Where(b => bankIds.Contains(b.Id)).ToListAsync() : [];
        var verzekeringen = verzekeringIds.Count > 0
            ? await _db.Verzekeringen.Where(v => verzekeringIds.Contains(v.Id)).ToListAsync() : [];
        var accounts = accountIds.Count > 0
            ? await _db.DigitaleAccounts.Where(d => accountIds.Contains(d.Id)).ToListAsync() : [];

        // Check if erfgenaam is a begunstigde in testament
        var testament = await _db.Testamenten.FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id);
        var begunstigde = testament is not null
            ? await _db.Begunstigden.FirstOrDefaultAsync(b =>
                b.TestamentInfoId == testament.Id && b.Naam.Contains(erfgenaam.Achternaam))
            : null;

        // Noodcontacten (always useful for context)
        var noodcontacten = await _db.Noodcontacten
            .Where(n => n.EigenaarId == eigenaar.Id).ToListAsync();

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, string.Format(L["Page_ErfgenaamInformatie"].Value, volleNaam)));
                page.Content().Column(col =>
                {
                    col.Spacing(10);

                    // Intro
                    col.Item().Text(string.Format(L["Text_ErfgenaamPdfIntro"].Value, eigenaarNaam, volleNaam))
                        .FontSize(9).Italic().FontColor(Colors.Grey.Darken1);

                    // Gegevens van de erfgenaam
                    Section(col, L["Section_UwGegevens"].Value, section =>
                    {
                        Row(section, L["Label_Naam"].Value, volleNaam);
                        Row(section, L["Label_Relatie"].Value, erfgenaam.Relatie);
                        if (!string.IsNullOrWhiteSpace(erfgenaam.Telefoon))
                            Row(section, L["Label_Telefoon"].Value, erfgenaam.Telefoon);
                        if (!string.IsNullOrWhiteSpace(erfgenaam.Email))
                            Row(section, L["Label_EMail"].Value, erfgenaam.Email);
                        if (!string.IsNullOrWhiteSpace(erfgenaam.Adres))
                            Row(section, L["Label_Adres"].Value, $"{erfgenaam.Adres}, {erfgenaam.Postcode} {erfgenaam.Woonplaats}");
                    });

                    // Eigenaar overzicht
                    Section(col, L["Section_GegevensErflater"].Value, section =>
                    {
                        Row(section, L["Label_Naam"].Value, eigenaarNaam);
                        if (!string.IsNullOrWhiteSpace(eigenaar.Telefoon))
                            Row(section, L["Label_Telefoon"].Value, eigenaar.Telefoon);
                        if (!string.IsNullOrWhiteSpace(eigenaar.Email))
                            Row(section, L["Label_EMail"].Value, eigenaar.Email);
                        if (!string.IsNullOrWhiteSpace(eigenaar.Notaris))
                            Row(section, L["Label_Notaris"].Value, $"{eigenaar.Notaris} ({eigenaar.NotarisKantoor})");
                    });

                    // Testament-begunstiging
                    if (begunstigde is not null)
                    {
                        Section(col, L["Section_TestamentUwPositie"].Value, section =>
                        {
                            if (!string.IsNullOrWhiteSpace(begunstigde.Omschrijving))
                                Row(section, L["Label_Omschrijving"].Value, begunstigde.Omschrijving);
                            if (begunstigde.Percentage.HasValue)
                                Row(section, L["Label_Percentage"].Value, $"{begunstigde.Percentage}%");
                            Row(section, L["Label_LegitiemePortie"].Value, begunstigde.IsLegitiemePortie ? L["Value_Ja"].Value : L["Value_Nee"].Value);
                        });
                    }

                    // Toegewezen bezittingen
                    if (bezittingen.Count > 0)
                    {
                        Section(col, L["Section_ToegewezenBezittingen"].Value, section =>
                        {
                            foreach (var b in bezittingen)
                            {
                                section.Item().PaddingBottom(4).Column(item =>
                                {
                                    item.Item().Text($"• {b.Omschrijving} ({b.Categorie})")
                                        .FontSize(9).SemiBold();
                                    if (b.GeschatteWaarde.HasValue)
                                        item.Item().PaddingLeft(12).Text(string.Format(L["Text_GeschatteWaardePrefix"].Value, b.GeschatteWaarde))
                                            .FontSize(8).FontColor(Colors.Grey.Darken1);
                                    var instr = toewijzingen.FirstOrDefault(t => t.EntityId == b.Id)?.Instructies;
                                    if (!string.IsNullOrWhiteSpace(instr))
                                        item.Item().PaddingLeft(12).Text(string.Format(L["Text_InstructiePrefix"].Value, instr))
                                            .FontSize(8).Italic().FontColor(Colors.Grey.Darken1);
                                });
                            }
                        });
                    }

                    // Toegewezen bankrekeningen
                    if (bankrekeningen.Count > 0)
                    {
                        Section(col, L["Section_ToegewezenBankrekeningen"].Value, section =>
                        {
                            foreach (var b in bankrekeningen)
                            {
                                section.Item().PaddingBottom(4).Column(item =>
                                {
                                    item.Item().Text($"• {b.BankNaam} — {b.IBAN}")
                                        .FontSize(9).SemiBold();
                                    if (b.Saldo.HasValue)
                                        item.Item().PaddingLeft(12).Text(string.Format(L["Text_SaldoPrefix"].Value, b.Saldo))
                                            .FontSize(8).FontColor(Colors.Grey.Darken1);
                                });
                            }
                        });
                    }

                    // Toegewezen verzekeringen
                    if (verzekeringen.Count > 0)
                    {
                        Section(col, L["Section_ToegewezenVerzekeringen"].Value, section =>
                        {
                            foreach (var v in verzekeringen)
                            {
                                section.Item().PaddingBottom(4).Column(item =>
                                {
                                    item.Item().Text($"• {v.Verzekeraar} — {v.Type} (polis {v.PolisNummer})")
                                        .FontSize(9).SemiBold();
                                    if (v.VerzekerdBedrag.HasValue)
                                        item.Item().PaddingLeft(12).Text(string.Format(L["Text_VerzekerdBedragPrefix"].Value, v.VerzekerdBedrag))
                                            .FontSize(8).FontColor(Colors.Grey.Darken1);
                                });
                            }
                        });
                    }

                    // Toegewezen digitale accounts
                    if (accounts.Count > 0)
                    {
                        Section(col, L["Section_ToegewezenDigitaleAccounts"].Value, section =>
                        {
                            foreach (var a in accounts)
                            {
                                section.Item().PaddingBottom(4).Column(item =>
                                {
                                    item.Item().Text($"• {a.PlatformNaam}")
                                        .FontSize(9).SemiBold();
                                    Row(section, "  " + L["Label_GewensteActie"].Value, a.GewensteActie);
                                    if (!string.IsNullOrWhiteSpace(a.Notities))
                                        item.Item().PaddingLeft(12).Text(string.Format(L["Text_NotitiePrefix"].Value, a.Notities))
                                            .FontSize(8).FontColor(Colors.Grey.Darken1);
                                });
                            }
                        });
                    }

                    // Noodcontacten
                    if (noodcontacten.Count > 0)
                    {
                        Section(col, L["Section_BelangrijkeContactpersonen"].Value, section =>
                        {
                            foreach (var n in noodcontacten)
                            {
                                section.Item().PaddingBottom(4).Column(item =>
                                {
                                    item.Item().Text($"• {n.Naam} — {n.Rol}")
                                        .FontSize(9).SemiBold();
                                    if (!string.IsNullOrWhiteSpace(n.Telefoon))
                                        item.Item().PaddingLeft(12).Text(string.Format(L["Text_TelPrefix"].Value, n.Telefoon)).FontSize(8);
                                    if (!string.IsNullOrWhiteSpace(n.Email))
                                        item.Item().PaddingLeft(12).Text(string.Format(L["Text_EMailPrefix"].Value, n.Email)).FontSize(8);
                                });
                            }
                        });
                    }

                    // No assignments notice
                    if (toewijzingen.Count == 0 && begunstigde is null)
                    {
                        col.Item().PaddingTop(10).Text(
                            L["Text_GeenToewijzingen"].Value)
                            .FontSize(9).Italic().FontColor(Colors.Grey.Darken1);
                    }
                });
                page.Footer().Element(Footer);
            });
        }).GeneratePdf();
    }

    // ── P-S2: Executeur-rapport PDF ──

    public async Task<byte[]> GenerateExecuteurRapportPdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var eid = eigenaar?.Id ?? Guid.Empty;
        var erfgenamen = await _db.Erfgenamen.Where(e => e.EigenaarId == eid).ToListAsync();
        var bezittingen = await _db.FysiekeBezittingen.Where(f => f.EigenaarId == eid).ToListAsync();
        var rekeningen = await _db.Bankrekeningen.Where(b => b.EigenaarId == eid).ToListAsync();
        var verzekeringen = await _db.Verzekeringen.Where(v => v.EigenaarId == eid).ToListAsync();
        var schulden = await _db.Schulden.Where(s => s.EigenaarId == eid).ToListAsync();
        var testament = eigenaar != null
            ? await _db.Testamenten.Include(t => t.Executeurs).Include(t => t.Begunstigden)
                .FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id)
            : null;
        var executeurs = testament?.Executeurs ?? [];
        var begunstigden = testament?.Begunstigden ?? [];
        var noodcontacten = await _db.Noodcontacten.Where(n => n.EigenaarId == eid).ToListAsync();

        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Replace("  ", " ").Trim()
            : L["Value_Onbekend"].Value;

        // Totalen
        var totActiva = bezittingen.Sum(b => b.GeschatteWaarde ?? 0)
                      + rekeningen.Sum(r => r.Saldo ?? 0)
                      + verzekeringen.Sum(v => v.VerzekerdBedrag ?? 0);
        var totPassiva = schulden.Sum(s => s.Bedrag);
        var nettoNalatenschap = totActiva - totPassiva;

        return Document.Create(container =>
        {
            // ── Pagina 1: Overzicht & executeur ──
            AddPage(container, L["Page_ExecuteurRapport"].Value, col =>
            {
                // Disclaimer
                col.Item().Background(Colors.Grey.Lighten4).Padding(8).Column(disc =>
                {
                    disc.Item().Text(L["Legal_ConceptGeenJuridisch"].Value).FontSize(8).Bold().FontColor(Colors.Grey.Darken2);
                    disc.Item().PaddingTop(3).Text(
                        string.Format(L["Legal_ExecuteurRapportDisclaimer"].Value, DateTime.Now.ToString("dd-MM-yyyy"))).FontSize(7).FontColor(Colors.Grey.Darken1);
                });

                // 1. Erflater
                if (eigenaar != null)
                {
                    Section(col, L["Section_1GegevensErflater"].Value, t =>
                    {
                        Row(t, L["Label_Naam"].Value, eigenaarNaam);
                        Row(t, L["Label_Geboortedatum"].Value, eigenaar.Geboortedatum.ToString("dd-MM-yyyy"));
                        if (!string.IsNullOrEmpty(eigenaar.Adres))
                            Row(t, L["Label_Adres"].Value, $"{eigenaar.Adres}, {eigenaar.Postcode} {eigenaar.Woonplaats}".Trim().TrimEnd(','));
                        if (!string.IsNullOrEmpty(eigenaar.BSN))
                            Row(t, L["Label_BSN"].Value, eigenaar.BSN);
                        Row(t, L["Label_BurgerlijkeStaat"].Value, eigenaar.BurgerlijkeStaat switch
                        {
                            BurgerlijkeStaat.Gehuwd => L["Value_Gehuwd"].Value,
                            BurgerlijkeStaat.GeregistreerdPartnerschap => L["Value_GeregistreerdPartnerschap"].Value,
                            BurgerlijkeStaat.Gescheiden => L["Value_Gescheiden"].Value,
                            BurgerlijkeStaat.Weduwe => L["Value_WeduweWeduwnaar"].Value,
                            _ => L["Value_Ongehuwd"].Value
                        });
                    });
                }

                // 2. Executeur(s)
                Section(col, L["Section_2Executeurs"].Value, t =>
                {
                    if (executeurs.Count > 0)
                    {
                        foreach (var ex in executeurs)
                        {
                            t.Item().PaddingBottom(4).Column(item =>
                            {
                                item.Item().Text($"• {ex.Naam}").FontSize(9).SemiBold();
                                if (!string.IsNullOrEmpty(ex.Relatie))
                                    Row(t, "  " + L["Label_Relatie"].Value, ex.Relatie);
                                if (!string.IsNullOrEmpty(ex.Bevoegdheden))
                                    Row(t, "  " + L["Label_Bevoegdheden"].Value, ex.Bevoegdheden);
                                if (!string.IsNullOrEmpty(ex.Telefoon))
                                    Row(t, "  " + L["Label_Telefoon"].Value, ex.Telefoon);
                                if (!string.IsNullOrEmpty(ex.Email))
                                    Row(t, "  " + L["Label_EMail"].Value, ex.Email);
                                if (!string.IsNullOrEmpty(ex.Adres))
                                    Row(t, "  " + L["Label_Adres"].Value, $"{ex.Adres}, {ex.Postcode} {ex.Woonplaats}".Trim().TrimEnd(','));
                            });
                        }
                    }
                    else
                        t.Item().Text(L["Text_GeenExecuteur"].Value).FontSize(9).Italic().FontColor(Colors.Grey.Medium);
                });

                // 3. Testamentaire informatie
                Section(col, L["Section_3Testament"].Value, t =>
                {
                    if (testament != null)
                    {
                        if (!string.IsNullOrEmpty(testament.TestamentType))
                            Row(t, L["Label_Type"].Value, testament.TestamentType);
                        if (testament.DatumTestament.HasValue)
                            Row(t, L["Label_DatumTestament"].Value, testament.DatumTestament.Value.ToString("dd-MM-yyyy"));
                        if (!string.IsNullOrEmpty(testament.CTR_Nummer))
                            Row(t, L["Label_CTRNummer"].Value, testament.CTR_Nummer);
                        if (!string.IsNullOrEmpty(testament.NotarisNaam))
                            Row(t, L["Label_Notaris"].Value, $"{testament.NotarisNaam}{(string.IsNullOrEmpty(testament.NotarisKantoor) ? "" : $" ({testament.NotarisKantoor})")}");
                        if (!string.IsNullOrEmpty(testament.NotarisTelefoon))
                            Row(t, L["Label_TelNotaris"].Value, testament.NotarisTelefoon);
                        if (!string.IsNullOrEmpty(testament.NotarisEmail))
                            Row(t, L["Label_EMailNotaris"].Value, testament.NotarisEmail);
                        if (testament.UitsluitingsClausule)
                            Row(t, L["Label_Uitsluitingsclausule"].Value, L["Value_Ja"].Value);
                        if (!string.IsNullOrEmpty(testament.Legaten))
                            Row(t, L["Label_Legaten"].Value, testament.Legaten);
                        if (!string.IsNullOrEmpty(testament.AlgemeneWensen))
                            Row(t, L["Label_AlgemeneWensen"].Value, testament.AlgemeneWensen);
                        if (!string.IsNullOrEmpty(testament.BijzondereBepalingen))
                            Row(t, L["Label_BijzondereBepalingen"].Value, testament.BijzondereBepalingen);
                    }
                    else
                        t.Item().Text(L["Text_GeenTestamentInfo"].Value).FontSize(9).Italic().FontColor(Colors.Grey.Medium);
                });
            });

            // ── Pagina 2: Erfgenamen & begunstigden ──
            AddPage(container, L["Page_ExecuteurRapportActiva"].Value, col =>
            {
                Section(col, L["Section_4Erfgenamen"].Value, t =>
                {
                    if (erfgenamen.Count > 0)
                    {
                        foreach (var e in erfgenamen)
                        {
                            var naam = $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}".Replace("  ", " ").Trim();
                            t.Item().PaddingBottom(4).Column(item =>
                            {
                                item.Item().Text($"• {naam} — {e.Relatie}").FontSize(9).SemiBold();
                                if (e.Geboortedatum.HasValue)
                                    Row(t, "  " + L["Label_Geboortedatum"].Value, e.Geboortedatum.Value.ToString("dd-MM-yyyy"));
                                if (!string.IsNullOrEmpty(e.BSN))
                                    Row(t, "  " + L["Label_BSN"].Value, e.BSN);
                                if (!string.IsNullOrEmpty(e.Telefoon))
                                    Row(t, "  " + L["Label_Telefoon"].Value, e.Telefoon);
                                if (!string.IsNullOrEmpty(e.Email))
                                    Row(t, "  " + L["Label_EMail"].Value, e.Email);
                                if (!string.IsNullOrEmpty(e.Adres))
                                    Row(t, "  " + L["Label_Adres"].Value, $"{e.Adres}, {e.Postcode} {e.Woonplaats}".Trim().TrimEnd(','));
                                if (e.LegitimatieSoort != LegitimatieSoort.Geen)
                                    Row(t, "  " + L["Label_Legitimatie"].Value, $"{e.LegitimatieSoort} — {e.LegitimatieNummer}");
                            });
                        }
                    }
                    else
                        t.Item().Text(L["Text_GeenErfgenamen"].Value).FontSize(9).Italic().FontColor(Colors.Grey.Medium);
                });

                if (begunstigden.Count > 0)
                {
                    Section(col, L["Section_5BegunstigdenTestamentair"].Value, t =>
                    {
                        foreach (var b in begunstigden)
                        {
                            var perc = b.Percentage.HasValue ? $" — {b.Percentage:0.##}%" : "";
                            var legPo = b.IsLegitiemePortie ? " (" + L["Value_LegitiemePortie"].Value + ")" : "";
                            t.Item().PaddingBottom(2).Column(item =>
                            {
                                item.Item().Text($"• {b.Naam} ({b.Relatie}){perc}{legPo}").FontSize(9).SemiBold();
                                if (!string.IsNullOrEmpty(b.Omschrijving))
                                    item.Item().PaddingLeft(12).Text(b.Omschrijving).FontSize(8).FontColor(Colors.Grey.Darken1);
                            });
                        }
                    });
                }
            });

            // ── Pagina 3: Financieel overzicht ──
            AddPage(container, L["Page_ExecuteurRapportVerdeling"].Value, col =>
            {
                // Activa
                Section(col, L["Section_6Activa"].Value, t =>
                {
                    t.Item().Text(L["Section_ER6aFysiekeBezittingen"].Value).FontSize(10).SemiBold();
                    if (bezittingen.Count > 0)
                    {
                        foreach (var b in bezittingen)
                        {
                            var extra = new List<string>();
                            if (!string.IsNullOrEmpty(b.KadastraalNummer)) extra.Add($"Kad. {b.KadastraalNummer}");
                            if (!string.IsNullOrEmpty(b.Kenteken)) extra.Add(b.Kenteken);
                            if (!string.IsNullOrEmpty(b.KvKNummer)) extra.Add($"KvK {b.KvKNummer}");
                            var extraStr = extra.Count > 0 ? $" ({string.Join(", ", extra)})" : "";
                            Row(t, $"  {b.Omschrijving}{extraStr}", b.GeschatteWaarde.HasValue ? $"€ {b.GeschatteWaarde:N2}" : "—");
                            if (!string.IsNullOrEmpty(b.BestemdeErfgenaam))
                                t.Item().PaddingLeft(12).Text(string.Format(L["Text_BestemdeVoorPrefix"].Value, b.BestemdeErfgenaam)).FontSize(8).FontColor(Colors.Grey.Darken1);
                        }
                    }
                    else
                        t.Item().Text("  " + L["Text_GeenBezittingen"].Value).FontSize(9).Italic().FontColor(Colors.Grey.Medium);

                    t.Item().PaddingTop(5).Text(L["Section_ER6bBankrekeningen"].Value).FontSize(10).SemiBold();
                    if (rekeningen.Count > 0)
                    {
                        foreach (var r in rekeningen)
                            Row(t, $"  {r.BankNaam} ({r.IBAN})", r.Saldo.HasValue ? $"€ {r.Saldo:N2}" : "—");
                    }
                    else
                        t.Item().Text("  " + L["Text_GeenBankrekeningen"].Value).FontSize(9).Italic().FontColor(Colors.Grey.Medium);

                    t.Item().PaddingTop(5).Text(L["Section_ER6cVerzekeringen"].Value).FontSize(10).SemiBold();
                    if (verzekeringen.Count > 0)
                    {
                        foreach (var v in verzekeringen)
                        {
                            Row(t, $"  {v.Verzekeraar} ({v.Type})", v.VerzekerdBedrag.HasValue ? $"€ {v.VerzekerdBedrag:N2}" : "—");
                            if (!string.IsNullOrEmpty(v.PolisNummer))
                                t.Item().PaddingLeft(12).Text(string.Format(L["Text_PolisnrPrefix"].Value, v.PolisNummer)).FontSize(8).FontColor(Colors.Grey.Darken1);
                        }
                    }
                    else
                        t.Item().Text("  " + L["Text_GeenVerzekeringen"].Value).FontSize(9).Italic().FontColor(Colors.Grey.Medium);

                    t.Item().PaddingTop(8);
                    Row(t, L["Label_TotaalActivaBruto"].Value, $"€ {totActiva:N2}");
                });

                // Passiva
                Section(col, L["Section_7Passiva"].Value, t =>
                {
                    if (schulden.Count > 0)
                    {
                        foreach (var s in schulden)
                            Row(t, $"  {s.Schuldeiser} ({s.Type})", $"€ {s.Bedrag:N2}");
                        Row(t, "  " + L["Label_TotaalPassiva"].Value, $"€ {totPassiva:N2}");
                    }
                    else
                        t.Item().Text("  " + L["Text_GeenSchulden"].Value).FontSize(9).Italic().FontColor(Colors.Grey.Medium);
                });

                // Netto nalatenschap
                col.Item().PaddingTop(5).Background(Colors.Blue.Lighten5).Padding(8).Column(saldo =>
                {
                    saldo.Item().Row(row =>
                    {
                        row.ConstantItem(200).Text(L["Label_NettoNalatenschap"].Value).FontSize(11).Bold().FontColor(Colors.Blue.Darken3);
                        row.RelativeItem().AlignRight().Text($"€ {nettoNalatenschap:N2}").FontSize(11).Bold().FontColor(Colors.Blue.Darken3);
                    });
                });

                // Verdeling indicatie
                if (erfgenamen.Count > 0 && begunstigden.Count > 0)
                {
                    Section(col, L["Section_8IndicatieveVerdeling"].Value, t =>
                    {
                        t.Item().Text(L["Text_OpBasisPercentages"].Value).FontSize(9).FontColor(Colors.Grey.Darken1);
                        foreach (var b in begunstigden.Where(b => b.Percentage.HasValue && b.Percentage > 0))
                        {
                            var aandeel = nettoNalatenschap * (b.Percentage!.Value / 100m);
                            Row(t, $"  {b.Naam} ({b.Percentage:0.##}%)", $"€ {aandeel:N2}");
                        }
                        t.Item().PaddingTop(5).Text(L["Text_BedragenIndicatief"].Value)
                            .FontSize(7).Italic().FontColor(Colors.Grey.Medium);
                    });
                }

                // Relevante contactpersonen
                if (noodcontacten.Count > 0)
                {
                    Section(col, L["Section_9RelevanteContactpersonen"].Value, t =>
                    {
                        foreach (var n in noodcontacten)
                        {
                            var details = new List<string>();
                            if (!string.IsNullOrEmpty(n.Telefoon)) details.Add(n.Telefoon);
                            if (!string.IsNullOrEmpty(n.Email)) details.Add(n.Email);
                            Row(t, $"  {n.Naam} ({n.Rol})", string.Join(" | ", details));
                        }
                    });
                }
            });

            // ── Pagina 4: Ondertekening ──
            AddPage(container, L["Page_ExecuteurRapportContactpersonen"].Value, col =>
            {
                col.Item().Text(L["Legal_OndertekeningVerklaring"].Value)
                    .FontSize(9);

                col.Item().PaddingTop(15).Column(sig =>
                {
                    // Executeur
                    if (executeurs.Count > 0)
                    {
                        foreach (var ex in executeurs)
                        {
                            sig.Item().PaddingTop(15).Text(string.Format(L["Signing_ExecuteurPrefix"].Value, ex.Naam)).FontSize(9).SemiBold();
                            sig.Item().PaddingTop(5).Text(L["Signing_DatumHandtekening"].Value).FontSize(9);
                        }
                    }
                    else
                    {
                        sig.Item().PaddingTop(15).Text(L["Signing_Executeur"].Value).FontSize(9).SemiBold();
                        sig.Item().PaddingTop(5).Text(L["Signing_Naam"].Value).FontSize(9);
                        sig.Item().PaddingTop(5).Text(L["Signing_DatumHandtekening"].Value).FontSize(9);
                    }

                    // Erfgenamen
                    foreach (var e in erfgenamen)
                    {
                        var naam = $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}".Replace("  ", " ").Trim();
                        sig.Item().PaddingTop(15).Text(string.Format(L["Signing_ErfgenaamPrefix"].Value, naam)).FontSize(9).SemiBold();
                        sig.Item().PaddingTop(5).Text(L["Signing_DatumHandtekening"].Value).FontSize(9);
                    }

                    // Notaris
                    sig.Item().PaddingTop(20).Text(L["Signing_Notaris"].Value).FontSize(9).SemiBold();
                    sig.Item().PaddingTop(5).Text(L["Signing_Naam"].Value).FontSize(9);
                    sig.Item().PaddingTop(5).Text(L["Signing_DatumHandtekening"].Value).FontSize(9);
                    sig.Item().PaddingTop(5).Text(L["Signing_Stempel"].Value + ":").FontSize(9);
                });
            });
        }).GeneratePdf();
    }

    // ── Notaris-specifieke PDF-template ──

    public async Task<byte[]> GenerateNotarisPdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var testament = eigenaar != null
            ? await _db.Testamenten.FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id)
            : null;
        var begunstigden = testament != null
            ? await _db.Begunstigden.Where(b => b.TestamentInfoId == testament.Id).OrderBy(b => b.Naam).ToListAsync()
            : new List<Domain.Testament.Begunstigde>();
        var executeurs = testament != null
            ? await _db.Executeurs.Where(e => e.TestamentInfoId == testament.Id).OrderBy(e => e.Naam).ToListAsync()
            : new List<Domain.Testament.Executeur>();
        var erfgenamen = eigenaar != null
            ? await _db.Erfgenamen.Where(e => e.EigenaarId == eigenaar.Id).OrderBy(e => e.Achternaam).ToListAsync()
            : new List<Erfgenaam>();
        var noodcontacten = eigenaar != null
            ? await _db.Noodcontacten.Where(n => n.EigenaarId == eigenaar.Id).OrderBy(n => n.Naam).ToListAsync()
            : new List<Noodcontact>();

        var nu = DateTime.Now;
        var naam = eigenaar != null
            ? $"{eigenaar.Voornaam} {(string.IsNullOrWhiteSpace(eigenaar.Tussenvoegsel) ? "" : eigenaar.Tussenvoegsel + " ")}{eigenaar.Achternaam}"
            : L["Value_Onbekend"].Value;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.MarginTop(30);
                page.MarginBottom(30);
                page.MarginLeft(60); // Extra brede marge links voor aantekeningen
                page.MarginRight(40);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    // Notaris briefhoofd
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(left =>
                        {
                            left.Item().Text(L["Page_NotarieelDossier"].Value).FontSize(14).Bold().FontColor(Colors.Blue.Darken4);
                            left.Item().PaddingTop(3).Text(L["Header_LumioDigitaleNalatenschap"].Value).FontSize(8).FontColor(Colors.Grey.Medium);
                        });
                        row.ConstantItem(200).AlignRight().Column(right =>
                        {
                            right.Item().Text($"{L["Label_Datum"].Value}: {nu:dd-MM-yyyy}").FontSize(8);
                            right.Item().Text(string.Format(L["Header_Tijdstip"].Value, nu.ToString("HH:mm"))).FontSize(8);
                        });
                    });
                    col.Item().PaddingTop(5).LineHorizontal(1f).LineColor(Colors.Blue.Darken4);

                    // Referentie-vak
                    col.Item().PaddingTop(10).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(8).Column(ref_ =>
                    {
                        ref_.Item().Text(L["Header_Referentiegegevens"].Value).FontSize(8).Bold().FontColor(Colors.Blue.Darken3);
                        ref_.Item().PaddingTop(3).Row(row =>
                        {
                            row.ConstantItem(120).Text(L["Label_Dossiernaam"].Value + ":").FontSize(9).FontColor(Colors.Grey.Darken1);
                            row.RelativeItem().Text(string.Format(L["Header_NalatenschapPrefix"].Value, naam)).FontSize(9);
                        });
                        ref_.Item().Row(row =>
                        {
                            row.ConstantItem(120).Text(L["Label_ErflaterColon"].Value).FontSize(9).FontColor(Colors.Grey.Darken1);
                            row.RelativeItem().Text(naam).FontSize(9);
                        });
                        if (eigenaar?.Geboortedatum != default)
                        {
                            ref_.Item().Row(row =>
                            {
                                row.ConstantItem(120).Text(L["Label_Geboortedatum"].Value + ":").FontSize(9).FontColor(Colors.Grey.Darken1);
                                row.RelativeItem().Text(eigenaar!.Geboortedatum.ToString("dd-MM-yyyy")).FontSize(9);
                            });
                        }
                        if (!string.IsNullOrWhiteSpace(eigenaar?.BSN))
                        {
                            ref_.Item().Row(row =>
                            {
                                row.ConstantItem(120).Text(L["Label_BSN"].Value + ":").FontSize(9).FontColor(Colors.Grey.Darken1);
                                row.RelativeItem().Text(eigenaar.BSN).FontSize(9);
                            });
                        }
                        if (!string.IsNullOrWhiteSpace(eigenaar?.Woonplaats))
                        {
                            ref_.Item().Row(row =>
                            {
                                row.ConstantItem(120).Text(L["Label_Woonplaats"].Value + ":").FontSize(9).FontColor(Colors.Grey.Darken1);
                                row.RelativeItem().Text(eigenaar.Woonplaats).FontSize(9);
                            });
                        }
                        ref_.Item().Row(row =>
                        {
                            row.ConstantItem(120).Text(L["Label_Dossiernummer"].Value + ":").FontSize(9).FontColor(Colors.Grey.Darken1);
                            row.RelativeItem().Text("________________________________").FontSize(9).FontColor(Colors.Grey.Lighten1);
                        });
                    });

                    col.Item().PaddingBottom(10);
                });

                page.Content().Column(col =>
                {
                    col.Spacing(8);

                    // Testament
                    if (testament != null)
                    {
                        Section(col, L["Section_1TestamentaireGegevens"].Value, section =>
                        {
                            Row(section, L["Label_TypeTestament"].Value, testament.TestamentType ?? L["Value_NietOpgegeven"].Value);
                            Row(section, L["Label_DatumTestament"].Value, testament.DatumTestament?.ToString("dd-MM-yyyy") ?? "—");
                            Row(section, L["Label_CTRNummer"].Value, testament.CTR_Nummer ?? "—");
                            Row(section, L["Label_LocatieColon"].Value, testament.TestamentLocatie ?? "—");
                            Row(section, L["Label_Notaris"].Value, testament.NotarisNaam ?? "—");
                            Row(section, L["Label_Kantoor"].Value, testament.NotarisKantoor ?? "—");
                            Row(section, L["Label_Uitsluitingsclausule"].Value, testament.UitsluitingsClausule ? L["Value_Ja"].Value : L["Value_Nee"].Value);
                            if (!string.IsNullOrWhiteSpace(testament.AlgemeneWensen))
                                Row(section, L["Label_AlgemeneWensen"].Value, testament.AlgemeneWensen);
                            if (!string.IsNullOrWhiteSpace(testament.BijzondereBepalingen))
                                Row(section, L["Label_BijzondereBepalingen"].Value, testament.BijzondereBepalingen);
                            if (!string.IsNullOrWhiteSpace(testament.Legaten))
                                Row(section, L["Label_Legaten"].Value, testament.Legaten);

                            // Aantekeningen ruimte
                            section.Item().PaddingTop(5).Text(L["Label_AantekeningenNotaris"].Value).FontSize(8).Italic().FontColor(Colors.Grey.Darken1);
                            section.Item().PaddingTop(3).MinHeight(40).Border(0.3f).BorderColor(Colors.Grey.Lighten2).Padding(5)
                                .Text(" ").FontSize(8);
                        });
                    }

                    // Erfgenamen
                    if (erfgenamen.Count > 0)
                    {
                        Section(col, L["Section_N2Erfgenamen"].Value, section =>
                        {
                            foreach (var e in erfgenamen)
                            {
                                section.Item().PaddingTop(2).Row(row =>
                                {
                                    var volledigeNaam = string.IsNullOrWhiteSpace(e.Tussenvoegsel)
                                        ? $"{e.Voornaam} {e.Achternaam}"
                                        : $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}";
                                    row.ConstantItem(150).Text(volledigeNaam).FontSize(9);
                                    row.ConstantItem(100).Text(e.Relatie).FontSize(9).FontColor(Colors.Grey.Darken1);
                                    row.RelativeItem().Text(e.Telefoon ?? "").FontSize(9);
                                });
                            }
                        });
                    }

                    // Begunstigden
                    if (begunstigden.Count > 0)
                    {
                        Section(col, L["Section_3Begunstigden"].Value, section =>
                        {
                            foreach (var b in begunstigden)
                            {
                                section.Item().PaddingTop(2).Row(row =>
                                {
                                    row.ConstantItem(150).Text(b.Naam).FontSize(9);
                                    row.ConstantItem(100).Text(b.Relatie).FontSize(9).FontColor(Colors.Grey.Darken1);
                                    row.RelativeItem().Text(b.Percentage.HasValue ? $"{b.Percentage}%" : "—").FontSize(9);
                                });
                            }
                        });
                    }

                    // Executeurs
                    if (executeurs.Count > 0)
                    {
                        Section(col, L["Section_4Executeurs"].Value, section =>
                        {
                            foreach (var ex in executeurs)
                            {
                                section.Item().PaddingTop(2).Row(row =>
                                {
                                    row.ConstantItem(150).Text(ex.Naam).FontSize(9);
                                    row.ConstantItem(100).Text(ex.Relatie ?? "").FontSize(9).FontColor(Colors.Grey.Darken1);
                                    row.RelativeItem().Text(ex.Bevoegdheden ?? "—").FontSize(9);
                                });
                            }
                        });
                    }

                    // Noodcontacten
                    if (noodcontacten.Count > 0)
                    {
                        Section(col, L["Section_5Contactpersonen"].Value, section =>
                        {
                            foreach (var n in noodcontacten)
                            {
                                section.Item().PaddingTop(2).Row(row =>
                                {
                                    row.ConstantItem(120).Text(n.Naam).FontSize(9);
                                    row.ConstantItem(80).Text(n.Rol).FontSize(9).FontColor(Colors.Grey.Darken1);
                                    row.ConstantItem(100).Text(n.Telefoon ?? "").FontSize(9);
                                    row.RelativeItem().Text(n.Email ?? "").FontSize(9);
                                });
                            }
                        });
                    }

                    // Handtekeningblokken
                    col.Item().PaddingTop(30).Column(sig =>
                    {
                        sig.Item().Text(L["Signing_Ondertekening"].Value).FontSize(11).Bold().FontColor(Colors.Blue.Darken3);
                        sig.Item().PaddingTop(5).LineHorizontal(0.3f).LineColor(Colors.Grey.Lighten3);

                        sig.Item().PaddingTop(15).Text(L["Signing_ErflaterTestateur"].Value).FontSize(9).SemiBold();
                        sig.Item().PaddingTop(5).Row(row =>
                        {
                            row.ConstantItem(250).Text(L["Signing_Naam"].Value).FontSize(9);
                            row.RelativeItem().Text(L["Signing_Datum"].Value).FontSize(9);
                        });
                        sig.Item().PaddingTop(5).Text(L["Signing_Handtekening"].Value).FontSize(9);

                        sig.Item().PaddingTop(20).Text(L["Signing_Notaris"].Value).FontSize(9).SemiBold();
                        sig.Item().PaddingTop(5).Row(row =>
                        {
                            row.ConstantItem(250).Text(L["Signing_Naam"].Value).FontSize(9);
                            row.RelativeItem().Text(L["Signing_Datum"].Value).FontSize(9);
                        });
                        sig.Item().PaddingTop(5).Text(L["Signing_Handtekening"].Value).FontSize(9);
                        sig.Item().PaddingTop(5).Text(L["Signing_StempelKantoor"].Value).FontSize(9);

                        sig.Item().PaddingTop(20).Text(L["Signing_Getuige1"].Value).FontSize(9).SemiBold();
                        sig.Item().PaddingTop(5).Row(row =>
                        {
                            row.ConstantItem(250).Text(L["Signing_Naam"].Value).FontSize(9);
                            row.RelativeItem().Text(L["Signing_Datum"].Value).FontSize(9);
                        });
                        sig.Item().PaddingTop(5).Text(L["Signing_Handtekening"].Value).FontSize(9);

                        sig.Item().PaddingTop(20).Text(L["Signing_Getuige2"].Value).FontSize(9).SemiBold();
                        sig.Item().PaddingTop(5).Row(row =>
                        {
                            row.ConstantItem(250).Text(L["Signing_Naam"].Value).FontSize(9);
                            row.RelativeItem().Text(L["Signing_Datum"].Value).FontSize(9);
                        });
                        sig.Item().PaddingTop(5).Text(L["Signing_Handtekening"].Value).FontSize(9);
                    });
                });

                page.Footer().Column(col =>
                {
                    col.Item().LineHorizontal(0.5f).LineColor(Colors.Blue.Darken4);
                    col.Item().PaddingTop(3).Text(L["Legal_NotarisWerkdocument"].Value)
                        .FontSize(6).Italic().FontColor(Colors.Grey.Medium);
                    col.Item().PaddingTop(3).Row(row =>
                    {
                        row.RelativeItem().Text(t =>
                        {
                            t.Span(L["Footer_GegenereerOp"].Value).FontSize(7).FontColor(Colors.Grey.Medium);
                            t.Span(nu.ToString("dd-MM-yyyy HH:mm")).FontSize(7).FontColor(Colors.Grey.Medium);
                        });
                        row.RelativeItem().AlignRight().Text(t =>
                        {
                            t.Span(L["Footer_Pagina"].Value).FontSize(7).FontColor(Colors.Grey.Medium);
                            t.CurrentPageNumber().FontSize(7).FontColor(Colors.Grey.Medium);
                            t.Span(L["Footer_Slash"].Value).FontSize(7).FontColor(Colors.Grey.Medium);
                            t.TotalPages().FontSize(7).FontColor(Colors.Grey.Medium);
                        });
                    });
                });
            });
        }).GeneratePdf();
    }

    // ── Shared helpers ──

    private static void ConfigurePage(PageDescriptor page)
    {
        page.Size(PageSizes.A4);
        page.Margin(40);
        page.DefaultTextStyle(x => x.FontSize(10));
    }

    private void AddPage(IDocumentContainer container, string title, Action<ColumnDescriptor> content)
    {
        container.Page(page =>
        {
            ConfigurePage(page);
            page.Header().Element(c => Header(c, title));
            page.Content().Column(col =>
            {
                col.Spacing(10);
                content(col);
            });
            page.Footer().Element(Footer);
        });
    }

    private void Header(IContainer container, string title, DateTime? laatstBijgewerkt = null)
    {
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                row.RelativeItem().Text(L["Header_LumioDigitaleNalatenschap"].Value)
                    .FontSize(8).FontColor(Colors.Grey.Medium);
                row.RelativeItem().AlignRight().Text(title)
                    .FontSize(8).FontColor(Colors.Grey.Medium);
            });
            col.Item().PaddingTop(5).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);
            col.Item().PaddingTop(10).Text(title).FontSize(18).Bold().FontColor(Colors.Blue.Darken3);
            if (laatstBijgewerkt.HasValue)
                col.Item().Text(string.Format(L["Header_LaatsteUpdate"].Value, laatstBijgewerkt.Value.ToLocalTime().ToString("dd-MM-yyyy HH:mm")))
                    .FontSize(8).Italic().FontColor(Colors.Grey.Darken1);
            col.Item().PaddingBottom(10);
        });
    }

    private void Footer(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);
            col.Item().PaddingTop(5).Row(row =>
            {
                row.RelativeItem().Text(t =>
                {
                    t.Span(string.Format(L["Footer_GegenereerDoorLumio"].Value, DateTime.Now.ToString("dd-MM-yyyy HH:mm"))).FontSize(7).FontColor(Colors.Grey.Medium);
                });
                row.RelativeItem().AlignRight().Text(t =>
                {
                    t.Span(L["Footer_Pagina"].Value).FontSize(7).FontColor(Colors.Grey.Medium);
                    t.CurrentPageNumber().FontSize(7).FontColor(Colors.Grey.Medium);
                    t.Span(L["Footer_Slash"].Value).FontSize(7).FontColor(Colors.Grey.Medium);
                    t.TotalPages().FontSize(7).FontColor(Colors.Grey.Medium);
                });
            });
        });
    }

    private void FooterWithDisclaimer(IContainer container, string disclaimer)
    {
        container.Column(col =>
        {
            col.Item().LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);
            col.Item().PaddingTop(3).Text(disclaimer).FontSize(6).Italic().FontColor(Colors.Grey.Medium);
            col.Item().PaddingTop(3).Row(row =>
            {
                row.RelativeItem().Text(t =>
                {
                    t.Span(string.Format(L["Footer_GegenereerDoorLumio"].Value, DateTime.Now.ToString("dd-MM-yyyy HH:mm"))).FontSize(7).FontColor(Colors.Grey.Medium);
                });
                row.RelativeItem().AlignRight().Text(t =>
                {
                    t.Span(L["Footer_Pagina"].Value).FontSize(7).FontColor(Colors.Grey.Medium);
                    t.CurrentPageNumber().FontSize(7).FontColor(Colors.Grey.Medium);
                    t.Span(L["Footer_Slash"].Value).FontSize(7).FontColor(Colors.Grey.Medium);
                    t.TotalPages().FontSize(7).FontColor(Colors.Grey.Medium);
                });
            });
        });
    }

    private static void Section(ColumnDescriptor col, string title, Action<ColumnDescriptor> content)
    {
        col.Item().Column(section =>
        {
            section.Item().Text(title).FontSize(13).SemiBold().FontColor(Colors.Blue.Darken2);
            section.Item().PaddingTop(3).LineHorizontal(0.3f).LineColor(Colors.Grey.Lighten3);
            section.Item().PaddingTop(5);
            content(section);
        });
    }

    private static void Row(ColumnDescriptor col, string label, string value)
    {
        col.Item().Row(row =>
        {
            row.ConstantItem(150).Text(label).FontSize(9).FontColor(Colors.Grey.Darken1);
            row.RelativeItem().Text(value).FontSize(9);
        });
    }
}
