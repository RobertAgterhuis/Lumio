using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

/// <summary>Legal wilsverklaring euthanasie document with signing blocks.</summary>
public class WilsverklaringGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public WilsverklaringGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var eigenaar = data.Eigenaar;
        var wv = data.Wilsverklaring;

        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim()
            : "Onbekend";

        var latDatum = new[] { eigenaar?.GewijzigdOp, wv?.GewijzigdOp }
            .Where(d => d.HasValue).Select(d => d!.Value).DefaultIfEmpty().Max();

        PdfComponents.RenderCoverPage(container, "Wilsverklaring Euthanasie", eigenaarNaam);

        container.Page(page =>
        {
            PdfComponents.ConfigurePage(page);
            page.Header().Element(c => PdfComponents.RenderHeader(c, "Wilsverklaring Euthanasie", latDatum));
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.SectionSpacing);

                // Legal disclaimer banner
                PdfComponents.InfoBlock(col,
                    L["Legal_WilsverklaringHeader"].Value,
                    L["Legal_WilsverklaringToelichting"].Value,
                    bgColor: PdfBrandTheme.PrimaryLight, titleColor: PdfBrandTheme.PrimaryMid,
                    bodyColor: PdfBrandTheme.TextMuted);

                // Title heading
                col.Item().PaddingTop(10).AlignCenter()
                    .Text(L["Legal_WilsverklaringEuthanasieTitle"].Value)
                    .Bold().FontSize(PdfBrandTheme.FontSection + 2);
                col.Item().AlignCenter()
                    .Text(L["Legal_ConformArtikel2"].Value)
                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                col.Item().PaddingTop(8);

                // Ondergetekende
                PdfComponents.Section(col, L["Section_Ondergetekende"].Value, t =>
                {
                    PdfComponents.Row(t, L["Label_Naam"].Value, eigenaarNaam);
                    if (eigenaar?.Geboortedatum != default)
                        PdfComponents.Row(t, L["Label_Geboortedatum"].Value,
                            eigenaar!.Geboortedatum.ToString("dd-MM-yyyy"));
                    if (!string.IsNullOrEmpty(eigenaar?.BSN))
                        PdfComponents.Row(t, L["Label_BSN"].Value, eigenaar!.BSN);
                    if (!string.IsNullOrEmpty(eigenaar?.Adres))
                        PdfComponents.Row(t, L["Label_Woonplaats"].Value,
                            $"{eigenaar!.Adres}, {eigenaar.Postcode} {eigenaar.Woonplaats}".TrimEnd(','));
                });

                // Verklaring
                PdfComponents.Section(col, L["Section_Verklaring"].Value, t =>
                {
                    t.Item().Text(wv?.WilEuthanasie == true
                            ? L["Legal_EuthanasieVerklaring"].Value
                            : L["Legal_GeenEuthanasie"].Value)
                        .FontSize(PdfBrandTheme.FontBody);
                });

                // Situatiebeschrijving
                if (!string.IsNullOrEmpty(wv?.SituatieBeschrijving))
                    PdfComponents.Section(col, L["Section_SituatieEuthanasie"].Value, t =>
                    {
                        t.Item().Text(wv!.SituatieBeschrijving).FontSize(PdfBrandTheme.FontBody);
                    });

                // Specifieke voorwaarden
                if (data.Voorwaarden.Count > 0)
                    PdfComponents.Section(col, L["Section_SpecifiekeVoorwaarden"].Value, t =>
                    {
                        foreach (var v in data.Voorwaarden)
                        {
                            t.Item().Text($"\u2022 {v.Voorwaarde}").FontSize(PdfBrandTheme.FontBody);
                            if (!string.IsNullOrEmpty(v.Toelichting))
                                t.Item().PaddingLeft(15).Text(v.Toelichting)
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                        }
                    });

                // Dementie-clausule
                if (wv?.DementieClausule == true)
                    PdfComponents.Section(col, L["Section_DementieClausule"].Value, t =>
                    {
                        t.Item().Text(L["Legal_DementieClausule"].Value).FontSize(PdfBrandTheme.FontBody);
                        if (!string.IsNullOrEmpty(wv.DementieClausuleToelichting))
                            t.Item().PaddingTop(4).Text(wv.DementieClausuleToelichting).FontSize(PdfBrandTheme.FontBody);
                    });

                // Behandelverbod
                if (!string.IsNullOrEmpty(wv?.BehandelVerbod))
                    PdfComponents.Section(col, L["Section_Behandelverbod"].Value, t =>
                    {
                        t.Item().Text(L["Legal_Behandelverbod"].Value).FontSize(PdfBrandTheme.FontBody);
                        t.Item().PaddingTop(4).Text(wv!.BehandelVerbod).FontSize(PdfBrandTheme.FontBody);
                    });

                // Huisarts
                PdfComponents.Section(col, L["Section_Huisarts"].Value, t =>
                {
                    PdfComponents.Row(t, L["Label_Naam"].Value, wv?.Huisarts ?? "Niet ingevuld");
                    PdfComponents.Row(t, L["Label_Praktijk"].Value, wv?.HuisartsPraktijk ?? "—");
                    if (!string.IsNullOrEmpty(wv?.HuisartsTelefoon))
                        PdfComponents.Row(t, L["Label_Telefoon"].Value, wv!.HuisartsTelefoon);
                });

                // Vertegenwoordiger
                if (!string.IsNullOrEmpty(wv?.VertegenwoordigerNaam))
                    PdfComponents.Section(col, L["Section_GevolmachtigdeVertegenwoordiger"].Value, t =>
                    {
                        PdfComponents.Row(t, L["Label_Naam"].Value, wv!.VertegenwoordigerNaam);
                        PdfComponents.Row(t, L["Label_Relatie"].Value, wv.VertegenwoordigerRelatie ?? "—");
                        if (!string.IsNullOrEmpty(wv.VertegenwoordigerTelefoon))
                            PdfComponents.Row(t, L["Label_Telefoon"].Value, wv.VertegenwoordigerTelefoon);
                        if (!string.IsNullOrEmpty(wv.VertegenwoordigerEmail))
                            PdfComponents.Row(t, L["Label_EMail"].Value, wv.VertegenwoordigerEmail);
                    });

                // Aanvullende wensen
                if (!string.IsNullOrEmpty(wv?.AanvullendeWensen))
                    PdfComponents.Section(col, L["Section_AanvullendeWensen"].Value, t =>
                    {
                        t.Item().Text(wv!.AanvullendeWensen).FontSize(PdfBrandTheme.FontBody);
                    });

                // Signing block
                col.Item().PaddingTop(20).Column(sig =>
                {
                    sig.Item().Text(L["Signing_Ondertekening"].Value).FontSize(PdfBrandTheme.FontBody + 2).SemiBold();
                    sig.Item().PaddingTop(5).Text(L["Legal_HelderBewustzijn"].Value).FontSize(PdfBrandTheme.FontBody);
                    sig.Item().PaddingTop(10).Text(string.Format(L["Signing_DatumPrefix"].Value,
                        wv?.DatumOndertekening != null
                            ? wv.DatumOndertekening.Value.ToString("dd-MM-yyyy")
                            : "____-____-________"))
                        .FontSize(PdfBrandTheme.FontBody);
                    sig.Item().PaddingTop(5).Text(L["Signing_Plaats"].Value).FontSize(PdfBrandTheme.FontBody);
                    sig.Item().PaddingTop(25).Text(L["Signing_Handtekening"].Value).FontSize(PdfBrandTheme.FontBody);
                    sig.Item().PaddingTop(5).Text(eigenaarNaam).FontSize(PdfBrandTheme.FontBody);
                });

                // Getuigen
                col.Item().PaddingTop(20).Column(wit =>
                {
                    wit.Item().Text(L["Signing_Getuigen"].Value).FontSize(PdfBrandTheme.FontBody + 2).SemiBold();
                    foreach (var i in new[] { 1, 2 })
                    {
                        wit.Item().PaddingTop(10).Text($"{L["Signing_Getuige1".Replace("1", i.ToString())].Value}").FontSize(PdfBrandTheme.FontBody).SemiBold();
                        wit.Item().PaddingTop(5).Text(L["Signing_Naam"].Value).FontSize(PdfBrandTheme.FontBody);
                        wit.Item().PaddingTop(5).Text(L["Signing_Handtekening"].Value).FontSize(PdfBrandTheme.FontBody);
                    }
                });
            });
            page.Footer().Element(c =>
                PdfComponents.RenderFooterWithDisclaimer(c, L["Footer_WilsverklaringDisclaimer"].Value));
        });
    }
}
