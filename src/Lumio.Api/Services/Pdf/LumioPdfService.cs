using Lumio.Api.Data;
using Microsoft.EntityFrameworkCore;
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
}

public class LumioPdfService : ILumioPdfService
{
    private readonly LumioDbContext _db;

    public LumioPdfService(LumioDbContext db)
    {
        _db = db;
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

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, "Testament"));
                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    if (eigenaar != null)
                        Section(col, "Eigenaar", t =>
                        {
                            Row(t, "Naam", $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim());
                        });
                    if (testament != null)
                        Section(col, "Testament Informatie", t =>
                        {
                            Row(t, "Type", testament.TestamentType ?? "—");
                            Row(t, "Notaris", testament.NotarisNaam ?? "—");
                            Row(t, "Kantoor", testament.NotarisKantoor ?? "—");
                            Row(t, "Datum", testament.DatumTestament?.ToString("dd-MM-yyyy") ?? "—");
                            Row(t, "CTR Nummer", testament.CTR_Nummer ?? "—");
                            Row(t, "Bewaarlocatie", testament.TestamentLocatie ?? "—");
                            if (!string.IsNullOrEmpty(testament.AlgemeneWensen))
                                Row(t, "Algemene wensen", testament.AlgemeneWensen);
                        });
                    if (begunstigden.Count > 0)
                        Section(col, "Begunstigden", t =>
                        {
                            foreach (var b in begunstigden)
                                Row(t, b.Naam, $"{b.Relatie} — {b.Percentage}%");
                        });
                    if (executeurs.Count > 0)
                        Section(col, "Executeurs", t =>
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

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, "Wilsverklaring Euthanasie"));
                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    if (wv != null)
                        Section(col, "Wilsverklaring", t =>
                        {
                            Row(t, "Wil euthanasie", wv.WilEuthanasie ? "Ja" : "Nee");
                            Row(t, "Situatie", wv.SituatieBeschrijving ?? "—");
                            Row(t, "Huisarts", wv.Huisarts ?? "—");
                            Row(t, "Praktijk", wv.HuisartsPraktijk ?? "—");
                            Row(t, "Vertegenwoordiger", wv.VertegenwoordigerNaam ?? "—");
                            Row(t, "Relatie vertegenw.", wv.VertegenwoordigerRelatie ?? "—");
                            if (!string.IsNullOrEmpty(wv.AanvullendeWensen))
                                Row(t, "Aanvullende wensen", wv.AanvullendeWensen);
                            Row(t, "Datum ondertekening", wv.DatumOndertekening?.ToString("dd-MM-yyyy") ?? "—");
                        });
                    if (voorwaarden.Count > 0)
                        Section(col, "Voorwaarden", t =>
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

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, "Donorregistratie"));
                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    if (donor != null)
                        Section(col, "Registratie", t =>
                        {
                            Row(t, "Keuze", donor.Keuze);
                            Row(t, "Donorregister", donor.IsGeregistreerdBijDonorregister ? "Ja" : "Nee");
                            if (!string.IsNullOrEmpty(donor.DonorregisterReferentie))
                                Row(t, "Referentie", donor.DonorregisterReferentie);
                            if (!string.IsNullOrEmpty(donor.Toelichting))
                                Row(t, "Toelichting", donor.Toelichting);
                        });
                    if (organen.Count > 0)
                        Section(col, "Orgaankeuzes", t =>
                        {
                            foreach (var o in organen)
                                Row(t, o.Orgaan, o.WelDoneren ? "Ja" : "Nee");
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

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, "Digitaal Bezit"));
                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    if (accounts.Count > 0)
                        Section(col, "Online Accounts", t =>
                        {
                            foreach (var a in accounts)
                                Row(t, a.PlatformNaam, $"{a.GewensteActie ?? ""} — {a.Gebruikersnaam ?? ""}");
                        });
                    if (wachtwoorden.Count > 0)
                        Section(col, "Wachtwoorden", t =>
                        {
                            t.Item().Text("Wachtwoorden zijn versleuteld en worden niet in de PDF opgenomen.")
                                .Italic().FontSize(9).FontColor(Colors.Grey.Medium);
                            foreach (var w in wachtwoorden)
                                Row(t, w.Naam, w.Gebruikersnaam ?? "");
                        });
                    if (wallets.Count > 0)
                        Section(col, "Crypto Wallets", t =>
                        {
                            t.Item().Text("Seed phrases zijn versleuteld en worden niet in de PDF opgenomen.")
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

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, "Boedel"));
                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    if (bezittingen.Count > 0)
                        Section(col, "Bezittingen", t =>
                        {
                            foreach (var b in bezittingen)
                                Row(t, b.Omschrijving, $"{b.Categorie}{(b.GeschatteWaarde.HasValue ? $" — € {b.GeschatteWaarde:N2}" : "")}");
                        });
                    if (rekeningen.Count > 0)
                        Section(col, "Bankrekeningen", t =>
                        {
                            foreach (var r in rekeningen)
                                Row(t, $"{r.BankNaam} ({r.RekeningType})", r.IBAN);
                        });
                    if (verzekeringen.Count > 0)
                        Section(col, "Verzekeringen", t =>
                        {
                            foreach (var v in verzekeringen)
                                Row(t, $"{v.Verzekeraar} ({v.Type})", $"Polis: {v.PolisNummer}");
                        });
                    if (schulden.Count > 0)
                        Section(col, "Schulden", t =>
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

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, "Uitvaartwensen"));
                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    if (uitvaart != null)
                        Section(col, "Uitvaart", t =>
                        {
                            Row(t, "Type", uitvaart.VoorkeurType ?? "—");
                            Row(t, "Begraafplaats", uitvaart.Begraafplaats ?? "—");
                            Row(t, "Ondernemer", uitvaart.UitvaartOndernemer ?? "—");
                            if (!string.IsNullOrEmpty(uitvaart.Muziekwensen))
                                Row(t, "Muziek", uitvaart.Muziekwensen);
                            if (!string.IsNullOrEmpty(uitvaart.Bloemen))
                                Row(t, "Bloemen", uitvaart.Bloemen);
                            if (!string.IsNullOrEmpty(uitvaart.Kledingwensen))
                                Row(t, "Kleding", uitvaart.Kledingwensen);
                            if (!string.IsNullOrEmpty(uitvaart.RouwkaartTekst))
                                Row(t, "Rouwkaart", uitvaart.RouwkaartTekst);
                            if (!string.IsNullOrEmpty(uitvaart.Condoleance))
                                Row(t, "Condoleance", uitvaart.Condoleance);
                            if (!string.IsNullOrEmpty(uitvaart.OverigeWensen))
                                Row(t, "Overige wensen", uitvaart.OverigeWensen);
                        });
                    if (details.Count > 0)
                        Section(col, "Ceremonie Details", t =>
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

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, "Documenten Overzicht"));
                page.Content().Column(col =>
                {
                    col.Spacing(10);
                    if (documenten.Count > 0)
                        Section(col, "Opgeslagen Documenten", t =>
                        {
                            foreach (var d in documenten)
                                Row(t, d.Naam, $"{d.Categorie} — {d.BestandsNaam}");
                        });
                    else
                        col.Item().Text("Geen documenten opgeslagen.").Italic().FontColor(Colors.Grey.Medium);
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
                AddPage(container, "Erfgenamen", col =>
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
                        Row(t, "Type", testament.TestamentType ?? "—");
                        Row(t, "Notaris", testament.NotarisNaam ?? "—");
                        Row(t, "Datum", testament.DatumTestament?.ToString("dd-MM-yyyy") ?? "—");
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
                        Row(t, "Wil euthanasie", wv.WilEuthanasie ? "Ja" : "Nee");
                        Row(t, "Huisarts", wv.Huisarts ?? "—");
                        Row(t, "Vertegenwoordiger", wv.VertegenwoordigerNaam ?? "—");
                    });
                });

            if (donor != null)
                AddPage(container, "Donorregistratie", col =>
                {
                    Section(col, "Registratie", t =>
                    {
                        Row(t, "Keuze", donor.Keuze);
                        Row(t, "Donorregister", donor.IsGeregistreerdBijDonorregister ? "Ja" : "Nee");
                    });
                    if (organen.Count > 0)
                        Section(col, "Orgaankeuzes", t =>
                        {
                            foreach (var o in organen) Row(t, o.Orgaan, o.WelDoneren ? "Ja" : "Nee");
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
                        Row(t, "Type", uitvaart.VoorkeurType ?? "—");
                        Row(t, "Begraafplaats", uitvaart.Begraafplaats ?? "—");
                        if (!string.IsNullOrEmpty(uitvaart.Muziekwensen)) Row(t, "Muziek", uitvaart.Muziekwensen);
                        if (!string.IsNullOrEmpty(uitvaart.RouwkaartTekst)) Row(t, "Rouwkaart", uitvaart.RouwkaartTekst);
                    });
                });

            if (documenten.Count > 0)
                AddPage(container, "Documenten", col =>
                {
                    Section(col, "Opgeslagen Documenten", t =>
                    {
                        foreach (var d in documenten) Row(t, d.Naam, $"{d.Categorie} — {d.BestandsNaam}");
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

    private static void AddPage(IDocumentContainer container, string title, Action<ColumnDescriptor> content)
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

    private static void Header(IContainer container, string title)
    {
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                row.RelativeItem().Text("Lumio — Digitale Nalatenschap")
                    .FontSize(8).FontColor(Colors.Grey.Medium);
                row.RelativeItem().AlignRight().Text(title)
                    .FontSize(8).FontColor(Colors.Grey.Medium);
            });
            col.Item().PaddingTop(5).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);
            col.Item().PaddingTop(10).Text(title).FontSize(18).Bold().FontColor(Colors.Blue.Darken3);
            col.Item().PaddingBottom(10);
        });
    }

    private static void Footer(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);
            col.Item().PaddingTop(5).Row(row =>
            {
                row.RelativeItem().Text(t =>
                {
                    t.Span("Gegenereerd door Lumio op ").FontSize(7).FontColor(Colors.Grey.Medium);
                    t.Span(DateTime.Now.ToString("dd-MM-yyyy HH:mm")).FontSize(7).FontColor(Colors.Grey.Medium);
                });
                row.RelativeItem().AlignRight().Text(t =>
                {
                    t.Span("Pagina ").FontSize(7).FontColor(Colors.Grey.Medium);
                    t.CurrentPageNumber().FontSize(7).FontColor(Colors.Grey.Medium);
                    t.Span(" / ").FontSize(7).FontColor(Colors.Grey.Medium);
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
