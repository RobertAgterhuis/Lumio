using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

/// <summary>Concepttestament / codicil — legal-style document with disclaimer and signing block.</summary>
public class TestamentConceptGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public TestamentConceptGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var eigenaar = data.Eigenaar;
        var testament = data.Testament;
        var isNotarieel = testament?.TestamentType == "Notarieel";

        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim()
            : L["Value_Onbekend"].Value;

        var latDatum = new[] { eigenaar?.GewijzigdOp, testament?.GewijzigdOp }
            .Where(d => d.HasValue).Select(d => d!.Value).DefaultIfEmpty().Max();

        var pageTitle = isNotarieel
            ? L["Page_ConceptTestamentNotarieel"].Value
            : L["Page_ConceptTestamentCodicil"].Value;

        PdfComponents.RenderCoverPage(container, pageTitle, eigenaarNaam);

        container.Page(page =>
        {
            PdfComponents.ConfigurePage(page);
            page.Header().Element(c => PdfComponents.RenderHeader(c, pageTitle, latDatum));
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.SectionSpacing);

                // Disclaimer
                PdfComponents.InfoBlock(col,
                    L["Legal_ConceptDocumentDisclaimer"].Value,
                    isNotarieel ? L["Legal_ConceptNotarieelToelichting"].Value : L["Legal_ConceptCodicilToelichting"].Value,
                    bgColor: PdfBrandTheme.WarningLight, titleColor: PdfBrandTheme.Warning,
                    bodyColor: PdfBrandTheme.TextMuted);

                // Document heading
                col.Item().PaddingTop(10).AlignCenter()
                    .Text(L["Legal_UitersteWilsbeschikking"].Value)
                    .Bold().FontSize(PdfBrandTheme.FontSection + 2);
                col.Item().AlignCenter()
                    .Text(string.Format(L["Text_Van"].Value, eigenaarNaam))
                    .FontSize(PdfBrandTheme.FontBody + 2);
                col.Item().PaddingTop(8);

                // Art. 1 — Ondergetekende
                PdfComponents.Section(col, L["Section_Artikel1Ondergetekende"].Value, t =>
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
                    t.Item().PaddingTop(5)
                        .Text(L["Legal_VerklaartTeSchikken"].Value)
                        .FontSize(PdfBrandTheme.FontBody).Italic();
                });

                // Art. 2 — Begunstigden / erfgenamen
                if (data.Begunstigden.Count > 0)
                    PdfComponents.Section(col, L["Section_Artikel2ErfgenamenBegunstigden"].Value, t =>
                    {
                        t.Item().Text(L["Legal_IkBenoemErfgenamen"].Value).FontSize(PdfBrandTheme.FontBody);
                        t.Item().PaddingTop(4);
                        foreach (var b in data.Begunstigden)
                        {
                            var detail = b.Percentage != null ? $" — {b.Percentage}%" : "";
                            if (b.IsLegitiemePortie) detail += $" {L["Value_LegitiemePortie"].Value}";
                            PdfComponents.Row(t, b.Naam, $"{b.Relatie}{detail}");
                        }
                    });

                // Art. 3 — Executeur
                if (data.Executeurs.Count > 0)
                    PdfComponents.Section(col, L["Section_Artikel3Executeur"].Value, t =>
                    {
                        t.Item().Text(L["Legal_IkBenoemExecuteur"].Value).FontSize(PdfBrandTheme.FontBody);
                        t.Item().PaddingTop(4);
                        foreach (var e in data.Executeurs)
                        {
                            PdfComponents.Row(t, e.Naam, e.Bevoegdheden ?? L["Value_BeheerEnBeschikking"].Value);
                            if (!string.IsNullOrEmpty(e.Telefoon) || !string.IsNullOrEmpty(e.Email))
                                PdfComponents.Row(t, L["Label_Contact"].Value,
                                    $"{e.Telefoon ?? ""} {e.Email ?? ""}".Trim());
                        }
                    });

                // Art. 4 — Uitsluitingsclausule
                if (testament?.UitsluitingsClausule == true)
                    PdfComponents.Section(col, L["Section_Artikel4Uitsluitingsclausule"].Value, t =>
                    {
                        t.Item().Text(L["Legal_Uitsluitingsclausule"].Value).FontSize(PdfBrandTheme.FontBody);
                    });

                // Legaten
                if (!string.IsNullOrEmpty(testament?.Legaten))
                    PdfComponents.Section(col, string.Format(
                        L["Section_ArtikelLegaten"].Value,
                        testament.UitsluitingsClausule == true ? 5 : 4), t =>
                    {
                        t.Item().Text(testament!.Legaten).FontSize(PdfBrandTheme.FontBody);
                    });

                // Bijzondere bepalingen
                if (!string.IsNullOrEmpty(testament?.BijzondereBepalingen))
                    PdfComponents.Section(col, L["Section_BijzondereBepalingen"].Value, t =>
                    {
                        t.Item().Text(testament!.BijzondereBepalingen).FontSize(PdfBrandTheme.FontBody);
                    });

                // Algemene wensen
                if (!string.IsNullOrEmpty(testament?.AlgemeneWensen))
                    PdfComponents.Section(col, L["Section_AlgemeneWensen"].Value, t =>
                    {
                        t.Item().Text(testament!.AlgemeneWensen).FontSize(PdfBrandTheme.FontBody);
                    });

                // Notarisgegevens
                if (!string.IsNullOrEmpty(testament?.NotarisContact?.Naam))
                    PdfComponents.Section(col, L["Section_Notaris"].Value, t =>
                    {
                        PdfComponents.Row(t, L["Label_Notaris"].Value, testament!.NotarisContact?.Naam ?? "—");
                        PdfComponents.Row(t, L["Label_Kantoor"].Value, testament.NotarisContact?.BedrijfsNaam ?? "—");
                        if (!string.IsNullOrEmpty(testament.NotarisContact?.Telefoon))
                            PdfComponents.Row(t, L["Label_Telefoon"].Value, testament.NotarisContact.Telefoon);
                        if (!string.IsNullOrEmpty(testament.NotarisContact?.Email))
                            PdfComponents.Row(t, L["Label_EMail"].Value, testament.NotarisContact.Email);
                        if (!string.IsNullOrEmpty(testament.CTR_Nummer))
                            PdfComponents.Row(t, L["Label_CTRNummer"].Value, testament.CTR_Nummer);
                    });

                // Signing block
                col.Item().PaddingTop(20).Column(sig =>
                {
                    sig.Item().Text(L["Signing_Ondertekening"].Value)
                        .FontSize(PdfBrandTheme.FontBody + 2).SemiBold();
                    sig.Item().PaddingTop(10).Text(string.Format(L["Signing_AldusOpgemaakt"].Value,
                        testament?.DatumTestament != null
                            ? testament.DatumTestament.Value.ToString("dd-MM-yyyy")
                            : "____-____-________"))
                        .FontSize(PdfBrandTheme.FontBody);
                    sig.Item().PaddingTop(30).Text(L["Signing_Handtekening"].Value).FontSize(PdfBrandTheme.FontBody);
                    sig.Item().PaddingTop(5).Text(eigenaarNaam).FontSize(PdfBrandTheme.FontBody);
                });
            });
            page.Footer().Element(c =>
                PdfComponents.RenderFooterWithDisclaimer(c, L["Footer_TestamentConceptDisclaimer"].Value));
        });
    }
}
