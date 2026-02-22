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
    Task<byte[]> GenerateNoodkaartPdf();
    Task<byte[]> GenerateTestamentConceptPdf();
    Task<byte[]> GenerateWilsverklaringPdf();
    Task<byte[]> GenerateNoodprocedurePdf();
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

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, "Noodkaart"));
                page.Content().Column(col =>
                {
                    col.Spacing(8);

                    // Disclaimer
                    col.Item().Background(Colors.Blue.Lighten5).Padding(8).Column(disclaimer =>
                    {
                        disclaimer.Item().Text("NOODKAART — Bewaar dit document op een veilige, toegankelijke plek")
                            .Bold().FontSize(10).FontColor(Colors.Blue.Darken3);
                        disclaimer.Item().Text($"Gegenereerd op {DateTime.Now:dd-MM-yyyy}")
                            .FontSize(8).FontColor(Colors.Grey.Medium);
                    });

                    // Eigenaar gegevens
                    if (eigenaar != null)
                        Section(col, "Persoonlijke gegevens", t =>
                        {
                            Row(t, "Naam", $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim());
                            Row(t, "Geboortedatum", eigenaar.Geboortedatum.ToString("dd-MM-yyyy"));
                            if (!string.IsNullOrEmpty(eigenaar.BSN)) Row(t, "BSN", eigenaar.BSN);
                            if (!string.IsNullOrEmpty(eigenaar.Adres)) Row(t, "Adres", $"{eigenaar.Adres}, {eigenaar.Postcode} {eigenaar.Woonplaats}");
                            if (!string.IsNullOrEmpty(eigenaar.Telefoon)) Row(t, "Telefoon", eigenaar.Telefoon);
                            if (!string.IsNullOrEmpty(eigenaar.Email)) Row(t, "Email", eigenaar.Email);
                        });

                    // Noodcontacten
                    if (noodcontacten.Count > 0)
                        Section(col, "Noodcontacten", t =>
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
                    Section(col, "Testament & Notaris", t =>
                    {
                        if (testament != null)
                        {
                            Row(t, "Type testament", testament.TestamentType ?? "—");
                            Row(t, "Bewaarlocatie", testament.TestamentLocatie ?? "—");
                            Row(t, "Notaris", testament.NotarisNaam ?? eigenaar?.Notaris ?? "—");
                            Row(t, "Notariskantoor", testament.NotarisKantoor ?? eigenaar?.NotarisKantoor ?? "—");
                            if (!string.IsNullOrEmpty(testament.CTR_Nummer)) Row(t, "CTR Nummer", testament.CTR_Nummer);
                        }
                        else
                        {
                            Row(t, "Notaris", eigenaar?.Notaris ?? "Niet ingevuld");
                            Row(t, "Notariskantoor", eigenaar?.NotarisKantoor ?? "Niet ingevuld");
                        }
                    });

                    // Uitvaartondernemer
                    if (uitvaart != null)
                        Section(col, "Uitvaart", t =>
                        {
                            Row(t, "Voorkeur", uitvaart.VoorkeurType ?? "—");
                            Row(t, "Uitvaartondernemer", uitvaart.UitvaartOndernemer ?? "Niet ingevuld");
                        });

                    // Verzekeringen
                    if (verzekeringen.Count > 0)
                        Section(col, "Verzekeringen", t =>
                        {
                            foreach (var v in verzekeringen)
                                Row(t, $"{v.Verzekeraar} ({v.Type})", $"Polis: {v.PolisNummer}");
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
            : "Onbekend";
        var isNotarieel = testament?.TestamentType == "Notarieel";

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, isNotarieel ? "Concept Testament (Notarieel)" : "Concept Testament (Codicil)"));
                page.Content().Column(col =>
                {
                    col.Spacing(8);

                    // Disclaimer
                    col.Item().Border(1).BorderColor(Colors.Orange.Darken1).Background(Colors.Orange.Lighten4).Padding(10).Column(d =>
                    {
                        d.Item().Text("CONCEPT-DOCUMENT — GEEN RECHTSGELDIG TESTAMENT").Bold().FontSize(10).FontColor(Colors.Orange.Darken3);
                        d.Item().PaddingTop(4).Text(isNotarieel
                            ? "Dit conceptdocument dient als voorbereiding op uw bezoek aan de notaris. Alleen een door de notaris opgesteld en ondertekend testament is rechtsgeldig (Boek 4 BW)."
                            : "Een codicil (onderhands testament) is alleen geldig als het eigenhandig is geschreven, gedateerd en ondertekend. Een geprint document is NIET rechtsgeldig. Gebruik dit concept als voorbeeld om af te schrijven."
                        ).FontSize(8).FontColor(Colors.Orange.Darken2);
                    });

                    // Kop
                    col.Item().PaddingTop(10).Text("UITERSTE WILSBESCHIKKING").Bold().FontSize(14).AlignCenter();
                    col.Item().Text($"van {eigenaarNaam}").FontSize(11).AlignCenter();
                    col.Item().PaddingTop(8);

                    // Art. 1 — Persoonlijke gegevens
                    Section(col, "Artikel 1 — Ondergetekende", t =>
                    {
                        Row(t, "Naam", eigenaarNaam);
                        if (eigenaar?.Geboortedatum != default)
                            Row(t, "Geboortedatum", eigenaar!.Geboortedatum.ToString("dd-MM-yyyy"));
                        if (!string.IsNullOrEmpty(eigenaar?.BSN))
                            Row(t, "BSN", eigenaar!.BSN);
                        if (!string.IsNullOrEmpty(eigenaar?.Adres))
                            Row(t, "Woonplaats", $"{eigenaar!.Adres}, {eigenaar.Postcode} {eigenaar.Woonplaats}".Trim().TrimEnd(','));
                        t.Item().PaddingTop(5).Text("verklaart bij deze uiterste wilsbeschikking te beschikken als volgt:").FontSize(9).Italic();
                    });

                    // Art. 2 — Erfgenamen
                    if (begunstigden.Count > 0)
                    {
                        Section(col, "Artikel 2 — Erfgenamen en Begunstigden", t =>
                        {
                            t.Item().Text("Ik benoem tot mijn erfgenamen:").FontSize(9);
                            t.Item().PaddingTop(4);
                            foreach (var b in begunstigden)
                            {
                                var detail = b.Percentage != null ? $" — {b.Percentage}%" : "";
                                if (b.IsLegitiemePortie) detail += " (legitieme portie)";
                                Row(t, b.Naam, $"{b.Relatie}{detail}");
                            }
                        });
                    }

                    // Art. 3 — Executeur
                    if (executeurs.Count > 0)
                    {
                        Section(col, "Artikel 3 — Executeur", t =>
                        {
                            t.Item().Text("Ik benoem tot executeur van mijn nalatenschap:").FontSize(9);
                            t.Item().PaddingTop(4);
                            foreach (var e in executeurs)
                            {
                                Row(t, e.Naam, e.Bevoegdheden ?? "Beheer en beschikking");
                                if (!string.IsNullOrEmpty(e.Telefoon) || !string.IsNullOrEmpty(e.Email))
                                    Row(t, "Contact", $"{e.Telefoon ?? ""} {e.Email ?? ""}".Trim());
                            }
                        });
                    }

                    // Art. 4 — Uitsluitingsclausule
                    if (testament?.UitsluitingsClausule == true)
                    {
                        Section(col, "Artikel 4 — Uitsluitingsclausule", t =>
                        {
                            t.Item().Text("Ik bepaal dat al hetgeen uit mijn nalatenschap wordt verkregen, " +
                                "alsmede de vruchten daarvan, niet zal vallen in enige gemeenschap van goederen " +
                                "waarin een verkrijger gehuwd mocht zijn of komen te huwen, noch onderwerp zal zijn " +
                                "van enig verrekenbeding.").FontSize(9);
                        });
                    }

                    // Art. 5 — Legaten
                    if (!string.IsNullOrEmpty(testament?.Legaten))
                    {
                        Section(col, $"Artikel {(testament?.UitsluitingsClausule == true ? 5 : 4)} — Legaten", t =>
                        {
                            t.Item().Text(testament!.Legaten).FontSize(9);
                        });
                    }

                    // Bijzondere bepalingen
                    if (!string.IsNullOrEmpty(testament?.BijzondereBepalingen))
                    {
                        Section(col, "Bijzondere Bepalingen", t =>
                        {
                            t.Item().Text(testament!.BijzondereBepalingen).FontSize(9);
                        });
                    }

                    // Algemene wensen
                    if (!string.IsNullOrEmpty(testament?.AlgemeneWensen))
                    {
                        Section(col, "Algemene Wensen", t =>
                        {
                            t.Item().Text(testament!.AlgemeneWensen).FontSize(9);
                        });
                    }

                    // Notaris
                    if (!string.IsNullOrEmpty(testament?.NotarisNaam))
                    {
                        Section(col, "Notaris", t =>
                        {
                            Row(t, "Notaris", testament!.NotarisNaam ?? "—");
                            Row(t, "Kantoor", testament.NotarisKantoor ?? "—");
                            if (!string.IsNullOrEmpty(testament.NotarisTelefoon))
                                Row(t, "Telefoon", testament.NotarisTelefoon);
                            if (!string.IsNullOrEmpty(testament.NotarisEmail))
                                Row(t, "E-mail", testament.NotarisEmail);
                            if (!string.IsNullOrEmpty(testament.CTR_Nummer))
                                Row(t, "CTR Nummer", testament.CTR_Nummer);
                        });
                    }

                    // Ondertekening
                    col.Item().PaddingTop(20).Column(sig =>
                    {
                        sig.Item().Text("Ondertekening").FontSize(11).SemiBold();
                        sig.Item().PaddingTop(10).Text($"Aldus opgemaakt te _______________________ op {(testament?.DatumTestament != null ? testament.DatumTestament.Value.ToString("dd-MM-yyyy") : "____-____-________")}").FontSize(9);
                        sig.Item().PaddingTop(30).Text("Handtekening: ___________________________________________").FontSize(9);
                        sig.Item().PaddingTop(5).Text(eigenaarNaam).FontSize(9);
                    });
                });
                page.Footer().Element(Footer);
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

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, "Wilsverklaring Euthanasie"));
                page.Content().Column(col =>
                {
                    col.Spacing(8);

                    // Disclaimer
                    col.Item().Border(1).BorderColor(Colors.Purple.Darken1).Background(Colors.Purple.Lighten5).Padding(10).Column(d =>
                    {
                        d.Item().Text("SCHRIFTELIJKE WILSVERKLARING — Conform Wet toetsing levensbeëindiging (Wtl)").Bold().FontSize(10).FontColor(Colors.Purple.Darken3);
                        d.Item().PaddingTop(4).Text(
                            "Deze wilsverklaring is een schriftelijke vastlegging van uw wensen. " +
                            "Dit document vervangt geen gesprek met uw huisarts. Overhandig een ondertekend exemplaar " +
                            "aan uw huisarts en bewaar een kopie op een toegankelijke locatie."
                        ).FontSize(8).FontColor(Colors.Purple.Darken2);
                    });

                    // Kop
                    col.Item().PaddingTop(10).Text("SCHRIFTELIJKE WILSVERKLARING EUTHANASIE").Bold().FontSize(14).AlignCenter();
                    col.Item().Text("Conform artikel 2, eerste lid, sub b, Wet toetsing levensbeëindiging op verzoek en hulp bij zelfdoding").FontSize(8).FontColor(Colors.Grey.Darken1).AlignCenter();
                    col.Item().PaddingTop(8);

                    // Ondergetekende
                    Section(col, "Ondergetekende", t =>
                    {
                        Row(t, "Naam", eigenaarNaam);
                        if (eigenaar?.Geboortedatum != default)
                            Row(t, "Geboortedatum", eigenaar!.Geboortedatum.ToString("dd-MM-yyyy"));
                        if (!string.IsNullOrEmpty(eigenaar?.BSN))
                            Row(t, "BSN", eigenaar!.BSN);
                        if (!string.IsNullOrEmpty(eigenaar?.Adres))
                            Row(t, "Woonplaats", $"{eigenaar!.Adres}, {eigenaar.Postcode} {eigenaar.Woonplaats}".Trim().TrimEnd(','));
                    });

                    // Verklaring
                    Section(col, "Verklaring", t =>
                    {
                        if (wilsverklaring?.WilEuthanasie == true)
                        {
                            t.Item().Text("Ondergetekende verklaart hierbij, in het volle bezit van zijn/haar geestelijke vermogens, " +
                                "het nadrukkelijke verzoek te doen om euthanasie te laten toepassen wanneer " +
                                "onderstaande situatie(s) zich voordoen en ondergetekende niet meer in staat is " +
                                "zijn/haar wil kenbaar te maken.").FontSize(9);
                        }
                        else
                        {
                            t.Item().Text("Ondergetekende verklaart hierbij GEEN euthanasie te wensen.").FontSize(9);
                        }
                    });

                    // Situatiebeschrijving
                    if (!string.IsNullOrEmpty(wilsverklaring?.SituatieBeschrijving))
                    {
                        Section(col, "Situatie waarin euthanasie gewenst is", t =>
                        {
                            t.Item().Text(wilsverklaring!.SituatieBeschrijving).FontSize(9);
                        });
                    }

                    // Voorwaarden
                    if (voorwaarden.Count > 0)
                    {
                        Section(col, "Specifieke voorwaarden", t =>
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
                        Section(col, "Dementie-clausule", t =>
                        {
                            t.Item().Text("Ondergetekende verklaart dat deze wilsverklaring ook geldt in het geval van " +
                                "vergevorderde dementie of een andere aandoening die leidt tot wilsonbekwaamheid.").FontSize(9);
                            if (!string.IsNullOrEmpty(wilsverklaring.DementieClausuleToelichting))
                            {
                                t.Item().PaddingTop(4).Text(wilsverklaring.DementieClausuleToelichting).FontSize(9);
                            }
                        });
                    }

                    // Behandelverbod
                    if (!string.IsNullOrEmpty(wilsverklaring?.BehandelVerbod))
                    {
                        Section(col, "Behandelverbod", t =>
                        {
                            t.Item().Text("Ondergetekende weigert de volgende medische behandelingen:").FontSize(9);
                            t.Item().PaddingTop(4).Text(wilsverklaring!.BehandelVerbod).FontSize(9);
                        });
                    }

                    // Huisarts
                    Section(col, "Huisarts", t =>
                    {
                        Row(t, "Naam", wilsverklaring?.Huisarts ?? "Niet ingevuld");
                        Row(t, "Praktijk", wilsverklaring?.HuisartsPraktijk ?? "—");
                        if (!string.IsNullOrEmpty(wilsverklaring?.HuisartsTelefoon))
                            Row(t, "Telefoon", wilsverklaring!.HuisartsTelefoon);
                        if (!string.IsNullOrEmpty(wilsverklaring?.HuisartsEmail))
                            Row(t, "E-mail", wilsverklaring!.HuisartsEmail);
                    });

                    // Vertegenwoordiger
                    if (!string.IsNullOrEmpty(wilsverklaring?.VertegenwoordigerNaam))
                    {
                        Section(col, "Gevolmachtigde vertegenwoordiger (art. 7:465 BW)", t =>
                        {
                            Row(t, "Naam", wilsverklaring!.VertegenwoordigerNaam);
                            Row(t, "Relatie", wilsverklaring.VertegenwoordigerRelatie ?? "—");
                            if (!string.IsNullOrEmpty(wilsverklaring.VertegenwoordigerTelefoon))
                                Row(t, "Telefoon", wilsverklaring.VertegenwoordigerTelefoon);
                            if (!string.IsNullOrEmpty(wilsverklaring.VertegenwoordigerEmail))
                                Row(t, "E-mail", wilsverklaring.VertegenwoordigerEmail);
                            if (!string.IsNullOrEmpty(wilsverklaring.VertegenwoordigerAdres))
                                Row(t, "Adres", $"{wilsverklaring.VertegenwoordigerAdres}, {wilsverklaring.VertegenwoordigerPostcode} {wilsverklaring.VertegenwoordigerWoonplaats}".Trim().TrimEnd(','));
                        });
                    }

                    // Aanvullende wensen
                    if (!string.IsNullOrEmpty(wilsverklaring?.AanvullendeWensen))
                    {
                        Section(col, "Aanvullende wensen", t =>
                        {
                            t.Item().Text(wilsverklaring!.AanvullendeWensen).FontSize(9);
                        });
                    }

                    // Ondertekening
                    col.Item().PaddingTop(20).Column(sig =>
                    {
                        sig.Item().Text("Ondertekening").FontSize(11).SemiBold();
                        sig.Item().PaddingTop(5).Text("Ondergetekende verklaart deze wilsverklaring bij helder bewustzijn en uit vrije wil te hebben opgesteld.").FontSize(9);
                        sig.Item().PaddingTop(10).Text($"Datum: {(wilsverklaring?.DatumOndertekening != null ? wilsverklaring.DatumOndertekening.Value.ToString("dd-MM-yyyy") : "____-____-________")}").FontSize(9);
                        sig.Item().PaddingTop(5).Text($"Plaats: _______________________").FontSize(9);
                        sig.Item().PaddingTop(25).Text("Handtekening: ___________________________________________").FontSize(9);
                        sig.Item().PaddingTop(5).Text(eigenaarNaam).FontSize(9);
                    });

                    // Getuigen
                    col.Item().PaddingTop(20).Column(wit =>
                    {
                        wit.Item().Text("Getuigen (optioneel, versterkt de rechtsgeldigheid)").FontSize(11).SemiBold();
                        wit.Item().PaddingTop(10).Text("Getuige 1:").FontSize(9).SemiBold();
                        wit.Item().PaddingTop(5).Text("Naam: ___________________________________________").FontSize(9);
                        wit.Item().PaddingTop(5).Text("Handtekening: ___________________________________________").FontSize(9);
                        wit.Item().PaddingTop(15).Text("Getuige 2:").FontSize(9).SemiBold();
                        wit.Item().PaddingTop(5).Text("Naam: ___________________________________________").FontSize(9);
                        wit.Item().PaddingTop(5).Text("Handtekening: ___________________________________________").FontSize(9);
                    });
                });
                page.Footer().Element(Footer);
            });
        }).GeneratePdf();
    }

    public async Task<byte[]> GenerateNoodprocedurePdf()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var noodcontacten = await _db.Noodcontacten.ToListAsync();
        var erfgenamen = await _db.Erfgenamen.Where(e => e.HeeftShareOntvangen).OrderBy(e => e.ShareIndex).ToListAsync();
        var drempel = erfgenamen.Count > 0 ? Math.Max(2, (int)Math.Ceiling(erfgenamen.Count * 0.6)) : 2;

        return Document.Create(container =>
        {
            // Page 1: Noodprocedure overzicht
            container.Page(page =>
            {
                ConfigurePage(page);
                page.Header().Element(c => Header(c, "Noodprocedure — Stappen voor Nabestaanden"));
                page.Content().Column(col =>
                {
                    col.Spacing(10);

                    // Intro
                    col.Item().Text("Dit document bevat de stappen die nabestaanden moeten volgen om toegang te krijgen tot de digitale nalatenschap in Lumio. Bewaar dit document op een veilige, bereikbare plek.")
                        .FontSize(9).FontColor(Colors.Grey.Darken1);

                    col.Item().PaddingTop(5);

                    // Eigenaar info
                    if (eigenaar != null)
                    {
                        Section(col, "Gegevens overledene", t =>
                        {
                            Row(t, "Naam", $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim());
                            if (!string.IsNullOrEmpty(eigenaar.Telefoon))
                                Row(t, "Telefoon", eigenaar.Telefoon);
                            if (!string.IsNullOrEmpty(eigenaar.Email))
                                Row(t, "E-mail", eigenaar.Email);
                        });
                    }

                    // Stap 1: Noodcontacten
                    Section(col, "Stap 1 — Noodcontacten informeren", t =>
                    {
                        t.Item().Text("Neem zo snel mogelijk contact op met de volgende personen:")
                            .FontSize(9).FontColor(Colors.Grey.Darken1);
                        t.Item().PaddingTop(3);
                        if (noodcontacten.Count > 0)
                        {
                            foreach (var nc in noodcontacten)
                            {
                                Row(t, $"{nc.Naam} ({nc.Rol})", $"{nc.Telefoon ?? "—"} / {nc.Email ?? "—"}");
                                if (!string.IsNullOrEmpty(nc.Instructies))
                                    Row(t, "  Instructie", nc.Instructies);
                            }
                        }
                        else
                        {
                            t.Item().Text("Geen noodcontacten vastgelegd.").FontSize(9).Italic();
                        }
                    });

                    // Stap 2: Shamir-sleuteldelen verzamelen
                    Section(col, "Stap 2 — Shamir-sleuteldelen verzamelen", t =>
                    {
                        t.Item().Text($"Om Lumio te ontgrendelen zijn minimaal {drempel} sleuteldelen nodig. De volgende erfgenamen hebben een sleuteldeel ontvangen:")
                            .FontSize(9).FontColor(Colors.Grey.Darken1);
                        t.Item().PaddingTop(3);
                        if (erfgenamen.Count > 0)
                        {
                            foreach (var e in erfgenamen)
                            {
                                Row(t, $"Deel #{e.ShareIndex}", $"{e.Voornaam} {e.Achternaam} — {e.Telefoon ?? e.Email ?? "geen contact"}");
                            }
                        }
                        else
                        {
                            t.Item().Text("Geen sleuteldelen verdeeld — neem contact op met de notaris.").FontSize(9).Italic();
                        }
                    });

                    // Stap 3: Lumio installeren
                    Section(col, "Stap 3 — Lumio installeren", t =>
                    {
                        t.Item().Text("Lumio is een desktopapplicatie die lokaal draait. Volg deze stappen:").FontSize(9).FontColor(Colors.Grey.Darken1);
                        t.Item().PaddingTop(3);
                        Row(t, "3a", "Download Lumio vanaf de oorspronkelijke bron (USB-stick, gedeelde map, of website).");
                        Row(t, "3b", "Installeer de applicatie op uw computer (Windows/macOS/Linux).");
                        Row(t, "3c", "Start Lumio — de applicatie opent in uw webbrowser.");
                    });

                    // Stap 4: Backup herstellen
                    Section(col, "Stap 4 — Backup herstellen", t =>
                    {
                        t.Item().Text("Als u een backup-bestand (.db) heeft ontvangen:").FontSize(9).FontColor(Colors.Grey.Darken1);
                        t.Item().PaddingTop(3);
                        Row(t, "4a", "Ga in Lumio naar Instellingen → Backup herstellen.");
                        Row(t, "4b", "Selecteer het backup-bestand (.db).");
                        Row(t, "4c", "Het profiel wordt automatisch geladen.");
                    });

                    // Stap 5: Ontgrendelen
                    Section(col, "Stap 5 — Ontgrendelen met sleuteldelen", t =>
                    {
                        t.Item().Text("Na het herstellen van de backup:").FontSize(9).FontColor(Colors.Grey.Darken1);
                        t.Item().PaddingTop(3);
                        Row(t, "5a", "Selecteer het juiste profiel op het inlogscherm.");
                        Row(t, "5b", "Klik op 'Ik ben een erfgenaam (ontgrendelen met sleuteldelen)'.");
                        Row(t, "5c", $"Voer minimaal {drempel} sleuteldelen in (elk in een apart veld).");
                        Row(t, "5d", "Klik op 'Ontgrendelen met sleuteldelen'.");
                        Row(t, "5e", "U heeft nu alleen-lezen toegang tot alle vastgelegde gegevens.");
                    });

                    // Stap 6: Wat te doen
                    Section(col, "Stap 6 — Gegevens raadplegen", t =>
                    {
                        t.Item().Text("Na ontgrendeling kunt u:").FontSize(9).FontColor(Colors.Grey.Darken1);
                        t.Item().PaddingTop(3);
                        Row(t, "•", "Het nabestaanden-dashboard volgen met een stappenplan");
                        Row(t, "•", "Alle vastgelegde wensen en informatie inzien");
                        Row(t, "•", "PDF-documenten exporteren per onderdeel");
                        Row(t, "•", "Een compleet ZIP-pakket downloaden met alle documenten");
                        Row(t, "•", "De voortgang van afhandeling bijhouden");
                    });
                });
                page.Footer().Element(Footer);
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
