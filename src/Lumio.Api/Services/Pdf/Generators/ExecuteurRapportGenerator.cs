using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Domain.Common;
using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

public class ExecuteurRapportGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public ExecuteurRapportGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var eigenaar = data.Eigenaar;
        var erfgenamen = data.Erfgenamen;
        var bezittingen = data.FysiekeBezittingen;
        var rekeningen = data.Bankrekeningen;
        var verzekeringen = data.Verzekeringen;
        var schulden = data.Schulden;
        var testament = data.Testament;
        var executeurs = data.Executeurs;
        var begunstigden = data.Begunstigden;
        var noodcontacten = data.Noodcontacten;

        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Replace("  ", " ").Trim()
            : L["Value_Onbekend"].Value;

        var totActiva   = bezittingen.Sum(b => b.GeschatteWaarde ?? 0)
                        + rekeningen.Sum(r => r.Saldo ?? 0)
                        + verzekeringen.Sum(v => v.VerzekerdBedrag ?? 0);
        var totPassiva  = schulden.Sum(s => s.Bedrag);
        var netto       = totActiva - totPassiva;

        PdfComponents.RenderCoverPage(container, "Executeur-rapport", eigenaarNaam);

        // ── Pagina 1: Overzicht & executeur ──
        PdfComponents.AddPage(container, L["Page_ExecuteurRapport"].Value, col =>
        {
            PdfComponents.InfoBlock(col,
                L["Legal_ConceptGeenJuridisch"].Value,
                string.Format(L["Legal_ExecuteurRapportDisclaimer"].Value, DateTime.Now.ToString("dd-MM-yyyy")),
                bgColor: PdfBrandTheme.Background, titleColor: PdfBrandTheme.TextMuted,
                bodyColor: PdfBrandTheme.TextMuted);

            if (eigenaar != null)
                PdfComponents.Section(col, L["Section_1GegevensErflater"].Value, t =>
                {
                    PdfComponents.Row(t, L["Label_Naam"].Value, eigenaarNaam);
                    PdfComponents.Row(t, L["Label_Geboortedatum"].Value, eigenaar.Geboortedatum.ToString("dd-MM-yyyy"));
                    if (!string.IsNullOrEmpty(eigenaar.Adres))
                        PdfComponents.Row(t, L["Label_Adres"].Value,
                            $"{eigenaar.Adres}, {eigenaar.Postcode} {eigenaar.Woonplaats}".TrimEnd(','));
                    if (!string.IsNullOrEmpty(eigenaar.BSN))
                        PdfComponents.Row(t, L["Label_BSN"].Value, eigenaar.BSN);
                    PdfComponents.Row(t, L["Label_BurgerlijkeStaat"].Value, eigenaar.BurgerlijkeStaat switch
                    {
                        BurgerlijkeStaat.Gehuwd => L["Value_Gehuwd"].Value,
                        BurgerlijkeStaat.GeregistreerdPartnerschap => L["Value_GeregistreerdPartnerschap"].Value,
                        BurgerlijkeStaat.Gescheiden => L["Value_Gescheiden"].Value,
                        BurgerlijkeStaat.Weduwe => L["Value_WeduweWeduwnaar"].Value,
                        _ => L["Value_Ongehuwd"].Value
                    });
                });

            PdfComponents.Section(col, L["Section_2Executeurs"].Value, t =>
            {
                if (executeurs.Count > 0)
                    foreach (var ex in executeurs)
                    {
                        t.Item().PaddingBottom(4).Column(item =>
                        {
                            item.Item().Text($"• {ex.Naam}").FontSize(PdfBrandTheme.FontBody).SemiBold();
                            if (!string.IsNullOrEmpty(ex.Relatie))
                                PdfComponents.Row(t, "  " + L["Label_Relatie"].Value, ex.Relatie);
                            if (!string.IsNullOrEmpty(ex.Bevoegdheden))
                                PdfComponents.Row(t, "  " + L["Label_Bevoegdheden"].Value, ex.Bevoegdheden);
                            if (!string.IsNullOrEmpty(ex.Telefoon))
                                PdfComponents.Row(t, "  " + L["Label_Telefoon"].Value, ex.Telefoon);
                            if (!string.IsNullOrEmpty(ex.Email))
                                PdfComponents.Row(t, "  " + L["Label_EMail"].Value, ex.Email);
                        });
                    }
                else
                    t.Item().Text(L["Text_GeenExecuteur"].Value).Italic().FontColor(PdfBrandTheme.TextMuted);
            });

            PdfComponents.Section(col, L["Section_3Testament"].Value, t =>
            {
                if (testament != null)
                {
                    if (!string.IsNullOrEmpty(testament.TestamentType))
                        PdfComponents.Row(t, L["Label_Type"].Value, testament.TestamentType);
                    if (testament.DatumTestament.HasValue)
                        PdfComponents.Row(t, L["Label_DatumTestament"].Value, testament.DatumTestament.Value.ToString("dd-MM-yyyy"));
                    if (!string.IsNullOrEmpty(testament.CTR_Nummer))
                        PdfComponents.Row(t, L["Label_CTRNummer"].Value, testament.CTR_Nummer);
                    if (!string.IsNullOrEmpty(testament.NotarisNaam))
                        PdfComponents.Row(t, L["Label_Notaris"].Value,
                            $"{testament.NotarisNaam}{(!string.IsNullOrEmpty(testament.NotarisKantoor) ? $" ({testament.NotarisKantoor})" : "")}");
                    if (!string.IsNullOrEmpty(testament.AlgemeneWensen))
                        PdfComponents.Row(t, L["Label_AlgemeneWensen"].Value, testament.AlgemeneWensen);
                    if (!string.IsNullOrEmpty(testament.BijzondereBepalingen))
                        PdfComponents.Row(t, L["Label_BijzondereBepalingen"].Value, testament.BijzondereBepalingen);
                }
                else
                    t.Item().Text(L["Text_GeenTestamentInfo"].Value).Italic().FontColor(PdfBrandTheme.TextMuted);
            });
        });

        // ── Pagina 2: Erfgenamen & begunstigden ──
        PdfComponents.AddPage(container, L["Page_ExecuteurRapportActiva"].Value, col =>
        {
            PdfComponents.Section(col, L["Section_4Erfgenamen"].Value, t =>
            {
                if (erfgenamen.Count > 0)
                    foreach (var e in erfgenamen)
                    {
                        var naam = $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}".Replace("  ", " ").Trim();
                        t.Item().PaddingBottom(4).Column(item =>
                        {
                            item.Item().Text($"• {naam} — {e.Relatie}").FontSize(PdfBrandTheme.FontBody).SemiBold();
                            if (e.Geboortedatum.HasValue)
                                PdfComponents.Row(t, "  " + L["Label_Geboortedatum"].Value, e.Geboortedatum.Value.ToString("dd-MM-yyyy"));
                            if (!string.IsNullOrEmpty(e.BSN))
                                PdfComponents.Row(t, "  " + L["Label_BSN"].Value, e.BSN);
                            if (!string.IsNullOrEmpty(e.Telefoon))
                                PdfComponents.Row(t, "  " + L["Label_Telefoon"].Value, e.Telefoon);
                            if (!string.IsNullOrEmpty(e.Email))
                                PdfComponents.Row(t, "  " + L["Label_EMail"].Value, e.Email);
                            if (e.LegitimatieSoort != LegitimatieSoort.Geen)
                                PdfComponents.Row(t, "  " + L["Label_Legitimatie"].Value, $"{e.LegitimatieSoort} — {e.LegitimatieNummer}");
                        });
                    }
                else
                    t.Item().Text(L["Text_GeenErfgenamen"].Value).Italic().FontColor(PdfBrandTheme.TextMuted);
            });

            if (begunstigden.Count > 0)
                PdfComponents.Section(col, L["Section_5BegunstigdenTestamentair"].Value, t =>
                {
                    foreach (var b in begunstigden)
                    {
                        var perc = b.Percentage.HasValue ? $" — {b.Percentage:0.##}%" : "";
                        var legPo = b.IsLegitiemePortie ? " (" + L["Value_LegitiemePortie"].Value + ")" : "";
                        t.Item().PaddingBottom(2).Column(item =>
                        {
                            item.Item().Text($"• {b.Naam} ({b.Relatie}){perc}{legPo}")
                                .FontSize(PdfBrandTheme.FontBody).SemiBold();
                            if (!string.IsNullOrEmpty(b.Omschrijving))
                                item.Item().PaddingLeft(12).Text(b.Omschrijving)
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                        });
                    }
                });
        });

        // ── Pagina 3: Financieel overzicht ──
        PdfComponents.AddPage(container, L["Page_ExecuteurRapportVerdeling"].Value, col =>
        {
            PdfComponents.Section(col, L["Section_6Activa"].Value, t =>
            {
                t.Item().Text(L["Section_ER6aFysiekeBezittingen"].Value).SemiBold().FontSize(PdfBrandTheme.FontBody + 1);
                if (bezittingen.Count > 0)
                    foreach (var b in bezittingen)
                        PdfComponents.Row(t, $"  {b.Omschrijving}", b.GeschatteWaarde.HasValue ? $"€ {b.GeschatteWaarde:N2}" : "—");
                else
                    t.Item().Text("  " + L["Text_GeenBezittingen"].Value).Italic().FontColor(PdfBrandTheme.TextMuted);

                t.Item().PaddingTop(5).Text(L["Section_ER6bBankrekeningen"].Value).SemiBold().FontSize(PdfBrandTheme.FontBody + 1);
                if (rekeningen.Count > 0)
                    foreach (var r in rekeningen)
                        PdfComponents.Row(t, $"  {r.BankNaam} ({r.IBAN})", r.Saldo.HasValue ? $"€ {r.Saldo:N2}" : "—");
                else
                    t.Item().Text("  " + L["Text_GeenBankrekeningen"].Value).Italic().FontColor(PdfBrandTheme.TextMuted);

                t.Item().PaddingTop(5).Text(L["Section_ER6cVerzekeringen"].Value).SemiBold().FontSize(PdfBrandTheme.FontBody + 1);
                if (verzekeringen.Count > 0)
                    foreach (var v in verzekeringen)
                    {
                        PdfComponents.Row(t, $"  {v.Verzekeraar} ({v.Type})", v.VerzekerdBedrag.HasValue ? $"€ {v.VerzekerdBedrag:N2}" : "—");
                        if (!string.IsNullOrEmpty(v.PolisNummer))
                            t.Item().PaddingLeft(12).Text(string.Format(L["Text_PolisnrPrefix"].Value, v.PolisNummer))
                                .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                    }
                else
                    t.Item().Text("  " + L["Text_GeenVerzekeringen"].Value).Italic().FontColor(PdfBrandTheme.TextMuted);

                t.Item().PaddingTop(8);
                PdfComponents.Row(t, L["Label_TotaalActivaBruto"].Value, $"€ {totActiva:N2}");
            });

            PdfComponents.Section(col, L["Section_7Passiva"].Value, t =>
            {
                if (schulden.Count > 0)
                {
                    foreach (var s in schulden)
                        PdfComponents.Row(t, $"  {s.Schuldeiser} ({s.Type})", $"€ {s.Bedrag:N2}");
                    PdfComponents.Row(t, "  " + L["Label_TotaalPassiva"].Value, $"€ {totPassiva:N2}");
                }
                else
                    t.Item().Text("  " + L["Text_GeenSchulden"].Value).Italic().FontColor(PdfBrandTheme.TextMuted);
            });

            // Netto saldo
            col.Item().PaddingTop(5).Background(PdfBrandTheme.PrimaryLight).Padding(8).Column(saldo =>
            {
                saldo.Item().Row(row =>
                {
                    row.ConstantItem(200).Text(L["Label_NettoNalatenschap"].Value)
                        .FontSize(PdfBrandTheme.FontBody + 2).Bold().FontColor(PdfBrandTheme.Primary);
                    row.RelativeItem().AlignRight().Text($"€ {netto:N2}")
                        .FontSize(PdfBrandTheme.FontBody + 2).Bold().FontColor(PdfBrandTheme.Primary);
                });
            });

            // Indicatieve verdeling
            if (erfgenamen.Count > 0 && begunstigden.Any(b => b.Percentage.HasValue && b.Percentage > 0))
                PdfComponents.Section(col, L["Section_8IndicatieveVerdeling"].Value, t =>
                {
                    t.Item().Text(L["Text_OpBasisPercentages"].Value).FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                    foreach (var b in begunstigden.Where(b => b.Percentage.HasValue && b.Percentage > 0))
                    {
                        var aandeel = netto * (b.Percentage!.Value / 100m);
                        PdfComponents.Row(t, $"  {b.Naam} ({b.Percentage:0.##}%)", $"€ {aandeel:N2}");
                    }
                    t.Item().PaddingTop(5).Text(L["Text_BedragenIndicatief"].Value)
                        .FontSize(PdfBrandTheme.FontCaption).Italic().FontColor(PdfBrandTheme.TextMuted);
                });

            if (noodcontacten.Count > 0)
                PdfComponents.Section(col, L["Section_9RelevanteContactpersonen"].Value, t =>
                {
                    foreach (var n in noodcontacten)
                    {
                        var details = new List<string>();
                        if (!string.IsNullOrEmpty(n.Telefoon)) details.Add(n.Telefoon);
                        if (!string.IsNullOrEmpty(n.Email)) details.Add(n.Email);
                        PdfComponents.Row(t, $"  {n.Naam} ({n.Rol})", string.Join(" | ", details));
                    }
                });
        });

        // ── Pagina 4: Ondertekening ──
        PdfComponents.AddPage(container, L["Page_ExecuteurRapportContactpersonen"].Value, col =>
        {
            col.Item().Text(L["Legal_OndertekeningVerklaring"].Value).FontSize(PdfBrandTheme.FontBody);
            col.Item().PaddingTop(15).Column(sig =>
            {
                if (executeurs.Count > 0)
                    foreach (var ex in executeurs)
                    {
                        sig.Item().PaddingTop(15)
                            .Text(string.Format(L["Signing_ExecuteurPrefix"].Value, ex.Naam))
                            .FontSize(PdfBrandTheme.FontBody).SemiBold();
                        sig.Item().PaddingTop(5).Text(L["Signing_DatumHandtekening"].Value).FontSize(PdfBrandTheme.FontBody);
                    }
                else
                {
                    sig.Item().PaddingTop(15).Text(L["Signing_Executeur"].Value).FontSize(PdfBrandTheme.FontBody).SemiBold();
                    sig.Item().PaddingTop(5).Text(L["Signing_Naam"].Value).FontSize(PdfBrandTheme.FontBody);
                    sig.Item().PaddingTop(5).Text(L["Signing_DatumHandtekening"].Value).FontSize(PdfBrandTheme.FontBody);
                }
                foreach (var e in erfgenamen)
                {
                    var naam = $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}".Replace("  ", " ").Trim();
                    sig.Item().PaddingTop(15)
                        .Text(string.Format(L["Signing_ErfgenaamPrefix"].Value, naam))
                        .FontSize(PdfBrandTheme.FontBody).SemiBold();
                    sig.Item().PaddingTop(5).Text(L["Signing_DatumHandtekening"].Value).FontSize(PdfBrandTheme.FontBody);
                }
                sig.Item().PaddingTop(20).Text(L["Signing_Notaris"].Value).FontSize(PdfBrandTheme.FontBody).SemiBold();
                sig.Item().PaddingTop(5).Text(L["Signing_Naam"].Value).FontSize(PdfBrandTheme.FontBody);
                sig.Item().PaddingTop(5).Text(L["Signing_DatumHandtekening"].Value).FontSize(PdfBrandTheme.FontBody);
                sig.Item().PaddingTop(5).Text(L["Signing_Stempel"].Value + ":").FontSize(PdfBrandTheme.FontBody);
            });
        });
    }
}
