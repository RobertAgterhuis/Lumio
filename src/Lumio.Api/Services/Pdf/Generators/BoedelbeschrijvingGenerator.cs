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

public class BoedelbeschrijvingGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public BoedelbeschrijvingGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var eigenaar = data.Eigenaar;
        var bezittingen = data.FysiekeBezittingen;
        var rekeningen = data.Bankrekeningen;
        var verzekeringen = data.Verzekeringen;
        var schulden = data.Schulden;
        var erfgenamen = data.Erfgenamen;
        var executeurs = data.Executeurs;

        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Replace("  ", " ").Trim()
            : L["Value_Onbekend"].Value;

        // Financial totals
        var totPrive  = bezittingen.Where(b => b.VermogensSoort == VermogensSoort.Prive).Sum(b => b.GeschatteWaarde ?? 0)
                      + rekeningen.Where(r => r.VermogensSoort == VermogensSoort.Prive).Sum(r => r.Saldo ?? 0)
                      + verzekeringen.Where(v => v.VermogensSoort == VermogensSoort.Prive).Sum(v => v.VerzekerdBedrag ?? 0);
        var totGem    = bezittingen.Where(b => b.VermogensSoort == VermogensSoort.Gemeenschap).Sum(b => b.GeschatteWaarde ?? 0)
                      + rekeningen.Where(r => r.VermogensSoort == VermogensSoort.Gemeenschap).Sum(r => r.Saldo ?? 0)
                      + verzekeringen.Where(v => v.VermogensSoort == VermogensSoort.Gemeenschap).Sum(v => v.VerzekerdBedrag ?? 0);
        var schPrivé  = schulden.Where(s => s.VermogensSoort == VermogensSoort.Prive).Sum(s => s.Bedrag);
        var schGem    = schulden.Where(s => s.VermogensSoort == VermogensSoort.Gemeenschap).Sum(s => s.Bedrag);
        var brutoBezit = bezittingen.Sum(b => b.GeschatteWaarde ?? 0)
                       + rekeningen.Sum(r => r.Saldo ?? 0)
                       + verzekeringen.Sum(v => v.VerzekerdBedrag ?? 0);
        var totaalSchuld = schulden.Sum(s => s.Bedrag);
        var nettoTotaal  = brutoBezit - totaalSchuld;
        var nettoPrivé   = totPrive - schPrivé;
        var nettoGem     = totGem   - schGem;

        var alleDatums = bezittingen.Select(b => b.GewijzigdOp)
            .Concat(rekeningen.Select(r => r.GewijzigdOp))
            .Concat(verzekeringen.Select(v => v.GewijzigdOp))
            .Concat(schulden.Select(s => s.GewijzigdOp));
        var latWijziging = alleDatums.Any() ? alleDatums.Max() : (DateTime?)null;

        PdfComponents.RenderCoverPage(container, "Boedelbeschrijving", eigenaarNaam);

        container.Page(page =>
        {
            PdfComponents.ConfigurePage(page);
            page.Header().Element(c => PdfComponents.RenderHeader(c, L["Page_Boedelbeschrijving"].Value, latWijziging));
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.SectionSpacing);

                // Legal disclaimer
                PdfComponents.InfoBlock(col,
                    L["Legal_JuridischeDisclaimer"].Value,
                    string.Format(L["Legal_BoedelbeschrijvingDisclaimer"].Value, DateTime.Now.ToString("dd-MM-yyyy")),
                    bgColor: PdfBrandTheme.Background, titleColor: PdfBrandTheme.TextMuted,
                    bodyColor: PdfBrandTheme.TextMuted);

                // 1. Persoonsgegevens
                if (eigenaar != null)
                    PdfComponents.Section(col, L["Section_1Persoonsgegevens"].Value, t =>
                    {
                        PdfComponents.Row(t, L["Label_Naam"].Value, eigenaarNaam);
                        PdfComponents.Row(t, L["Label_Geboortedatum"].Value, eigenaar.Geboortedatum.ToString("dd-MM-yyyy"));
                        if (!string.IsNullOrEmpty(eigenaar.Adres))
                            PdfComponents.Row(t, L["Label_Adres"].Value,
                                $"{eigenaar.Adres}, {eigenaar.Postcode} {eigenaar.Woonplaats}".TrimEnd(','));
                        PdfComponents.Row(t, L["Label_BurgerlijkeStaat"].Value, eigenaar.BurgerlijkeStaat switch
                        {
                            BurgerlijkeStaat.Ongehuwd  => L["Value_Ongehuwd"].Value,
                            BurgerlijkeStaat.Gehuwd    => L["Value_Gehuwd"].Value,
                            BurgerlijkeStaat.GeregistreerdPartnerschap => L["Value_GeregistreerdPartnerschap"].Value,
                            BurgerlijkeStaat.Gescheiden => L["Value_Gescheiden"].Value,
                            BurgerlijkeStaat.Weduwe     => L["Value_WeduweWeduwnaar"].Value,
                            _ => "—"
                        });
                        if (eigenaar.BurgerlijkeStaat is BurgerlijkeStaat.Gehuwd or BurgerlijkeStaat.GeregistreerdPartnerschap)
                            PdfComponents.Row(t, L["Label_Huwelijksvoorwaarden"].Value, eigenaar.HuwelijksVoorwaarden switch
                            {
                                HuwelijksVoorwaarden.GemeenschapVanGoederen => L["Value_GemeenschapVanGoederen"].Value,
                                HuwelijksVoorwaarden.BeperkteGemeenschap   => L["Value_BeperkteGemeenschap"].Value,
                                HuwelijksVoorwaarden.KoudeUitsluiting      => L["Value_KoudeUitsluiting"].Value,
                                _ => L["Value_NietVanToepassing"].Value
                            });
                        if (eigenaar.LegitimatieSoort != LegitimatieSoort.Geen)
                        {
                            PdfComponents.Row(t, L["Label_Legitimatie"].Value, eigenaar.LegitimatieSoort switch
                            {
                                LegitimatieSoort.Paspoort        => L["Value_Paspoort"].Value,
                                LegitimatieSoort.Identiteitskaart => L["Value_Identiteitskaart"].Value,
                                LegitimatieSoort.Rijbewijs       => L["Value_Rijbewijs"].Value,
                                _ => "—"
                            });
                            if (!string.IsNullOrEmpty(eigenaar.LegitimatieNummer))
                                PdfComponents.Row(t, L["Label_Documentnummer"].Value, eigenaar.LegitimatieNummer);
                        }
                    });

                // 2. Erfgenamen
                if (erfgenamen.Count > 0)
                    PdfComponents.Section(col, L["Section_2Erfgenamen"].Value, t =>
                    {
                        foreach (var e in erfgenamen)
                            PdfComponents.Row(t,
                                $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}".Replace("  ", " ").Trim(),
                                $"{e.Relatie}{(e.Geboortedatum.HasValue ? $", geb. {e.Geboortedatum.Value:dd-MM-yyyy}" : "")}");
                    });

                // 3. Activa
                PdfComponents.Section(col, L["Section_3Activa"].Value, t =>
                {
                    t.Item().Text(L["Text_FysiekeBezittingen"].Value).SemiBold().FontSize(PdfBrandTheme.FontBody + 1);
                    if (bezittingen.Count > 0)
                        foreach (var b in bezittingen)
                        {
                            var tag = b.VermogensSoort == VermogensSoort.Gemeenschap ? " [G]" : " [P]";
                            PdfComponents.Row(t, $"  {b.Omschrijving}{tag}",
                                b.GeschatteWaarde.HasValue ? $"€ {b.GeschatteWaarde:N2}" : "—");
                        }
                    else t.Item().Text("  " + L["Text_GeenBezittingen"].Value).Italic().FontColor(PdfBrandTheme.TextMuted);

                    t.Item().PaddingTop(5).Text(L["Text_Bankrekeningen"].Value).SemiBold().FontSize(PdfBrandTheme.FontBody + 1);
                    if (rekeningen.Count > 0)
                        foreach (var r in rekeningen)
                        {
                            var tag = r.VermogensSoort == VermogensSoort.Gemeenschap ? " [G]" : " [P]";
                            PdfComponents.Row(t, $"  {r.BankNaam} ({r.IBAN}){tag}",
                                r.Saldo.HasValue ? $"€ {r.Saldo:N2}" : "—");
                        }
                    else t.Item().Text("  " + L["Text_GeenBankrekeningen"].Value).Italic().FontColor(PdfBrandTheme.TextMuted);

                    t.Item().PaddingTop(5).Text(L["Text_Verzekeringen"].Value).SemiBold().FontSize(PdfBrandTheme.FontBody + 1);
                    if (verzekeringen.Count > 0)
                        foreach (var v in verzekeringen)
                        {
                            var tag = v.VermogensSoort == VermogensSoort.Gemeenschap ? " [G]" : " [P]";
                            PdfComponents.Row(t, $"  {v.Verzekeraar} ({v.Type}){tag}",
                                v.VerzekerdBedrag.HasValue ? $"€ {v.VerzekerdBedrag:N2}" : "—");
                        }
                    else t.Item().Text("  " + L["Text_GeenVerzekeringen"].Value).Italic().FontColor(PdfBrandTheme.TextMuted);

                    t.Item().PaddingTop(8);
                    PdfComponents.Row(t, L["Label_TotaalActivaBruto"].Value, $"€ {brutoBezit:N2}");
                });

                // 4. Passiva
                PdfComponents.Section(col, L["Section_4Passiva"].Value, t =>
                {
                    if (schulden.Count > 0)
                    {
                        foreach (var s in schulden)
                        {
                            var tag = s.VermogensSoort == VermogensSoort.Gemeenschap ? " [G]" : " [P]";
                            PdfComponents.Row(t, $"  {s.Schuldeiser} ({s.Type}){tag}", $"€ {s.Bedrag:N2}");
                        }
                        PdfComponents.Row(t, L["Label_TotaalPassiva"].Value, $"€ {totaalSchuld:N2}");
                    }
                    else
                        t.Item().Text(L["Text_GeenSchulden"].Value).Italic().FontColor(PdfBrandTheme.TextMuted);
                });

                // Netto saldo summary
                col.Item().PaddingTop(5).Background(PdfBrandTheme.PrimaryLight).Padding(8).Column(saldo =>
                {
                    saldo.Item().Row(row =>
                    {
                        row.ConstantItem(PdfBrandTheme.LabelColumnWidth)
                            .Text(L["Label_NettoNalatenschap"].Value)
                            .FontSize(PdfBrandTheme.FontBody + 2).Bold().FontColor(PdfBrandTheme.Primary);
                        row.RelativeItem().AlignRight()
                            .Text($"€ {nettoTotaal:N2}")
                            .FontSize(PdfBrandTheme.FontBody + 2).Bold().FontColor(PdfBrandTheme.Primary);
                    });
                    if (eigenaar?.BurgerlijkeStaat is BurgerlijkeStaat.Gehuwd or BurgerlijkeStaat.GeregistreerdPartnerschap
                        && eigenaar?.HuwelijksVoorwaarden != HuwelijksVoorwaarden.KoudeUitsluiting)
                    {
                        saldo.Item().PaddingTop(3).Row(row =>
                        {
                            row.ConstantItem(PdfBrandTheme.LabelColumnWidth)
                                .Text(L["Label_WaarvanPrive"].Value).FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                            row.RelativeItem().AlignRight().Text($"€ {nettoPrivé:N2}").FontSize(PdfBrandTheme.FontBody);
                        });
                        saldo.Item().Row(row =>
                        {
                            row.ConstantItem(PdfBrandTheme.LabelColumnWidth)
                                .Text(L["Label_WaarvanGemeenschap"].Value).FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                            row.RelativeItem().AlignRight().Text($"€ {nettoGem:N2}").FontSize(PdfBrandTheme.FontBody);
                        });
                    }
                });

                col.Item().PaddingTop(3).Text(L["Text_Legenda"].Value)
                    .FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);

                // Signing block
                col.Item().PaddingTop(20).Column(sig =>
                {
                    sig.Item().Text(L["Signing_Ondertekening"].Value).FontSize(PdfBrandTheme.FontBody + 2).SemiBold();
                    sig.Item().PaddingTop(5).Text(L["Text_OndertekendVoorGezien"].Value).FontSize(PdfBrandTheme.FontBody);
                    if (executeurs.Count > 0)
                        foreach (var ex in executeurs)
                        {
                            sig.Item().PaddingTop(15).Text(string.Format(L["Signing_ExecuteurPrefix"].Value, ex.Naam))
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
                });
            });
            page.Footer().Element(c =>
                PdfComponents.RenderFooterWithDisclaimer(c,
                    string.Format(L["Footer_BoedelbeschrijvingOpgesteld"].Value, DateTime.Now.ToString("dd-MM-yyyy"))));
        });
    }
}
