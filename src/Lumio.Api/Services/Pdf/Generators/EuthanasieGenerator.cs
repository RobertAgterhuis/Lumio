using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

/// <summary>Summary view of the euthanasie wilsverklaring (not the legal document — see WilsverklaringGenerator).</summary>
public class EuthanasieGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public EuthanasieGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var eigenaar = data.Eigenaar;
        var wv = data.Wilsverklaring;
        var laatstBijgewerkt = wv?.GewijzigdOp ?? eigenaar?.GewijzigdOp ?? DateTime.MinValue;
        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim()
            : null;
        PdfComponents.RenderCoverPage(container, "Wilsverklaring Euthanasie", eigenaarNaam);
        container.Page(page =>
        {
            PdfComponents.ConfigurePage(page);
            page.Header().Element(c => PdfComponents.RenderHeader(c, L["Page_WilsverklaringEuthanasie"].Value, laatstBijgewerkt));
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.ContentSpacing);

                if (wv != null)
                    PdfComponents.Section(col, L["Section_Wilsverklaring"].Value, t =>
                    {
                        PdfComponents.Row(t, L["Label_WilEuthanasie"].Value,
                            wv.WilEuthanasie ? L["Value_Ja"].Value : L["Value_Nee"].Value);
                        PdfComponents.Row(t, L["Label_Situatie"].Value, wv.SituatieBeschrijving ?? "—");
                        PdfComponents.Row(t, L["Label_Huisarts"].Value, wv.HuisartsContact?.Naam ?? "—");
                        PdfComponents.Row(t, L["Label_Praktijk"].Value, wv.HuisartsContact?.BedrijfsNaam ?? "—");
                        if (!string.IsNullOrEmpty(wv.VertegenwoordigerContact?.Naam))
                            PdfComponents.Row(t, L["Label_Vertegenwoordiger"].Value, wv.VertegenwoordigerContact.Naam);
                    });

                if (data.Voorwaarden.Count > 0)
                    PdfComponents.Section(col, L["Section_Voorwaarden"].Value, t =>
                    {
                        foreach (var v in data.Voorwaarden)
                        {
                            t.Item().Text($"• {v.Voorwaarde}").FontSize(PdfBrandTheme.FontBody)
                                .FontColor(PdfBrandTheme.TextPrimary);
                            if (!string.IsNullOrEmpty(v.Toelichting))
                                t.Item().PaddingLeft(12).Text(v.Toelichting)
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                        }
                    });
            });
            page.Footer().Element(PdfComponents.RenderFooter);
        });
    }
}
