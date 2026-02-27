using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

public class DocumentenGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public DocumentenGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var documenten = data.Documenten;
        var lastUpdated = documenten.Select(d => d.GewijzigdOp).DefaultIfEmpty().Max();
        var latUpdated = lastUpdated == DateTime.MinValue ? (DateTime?)null : lastUpdated;

        var eigenaarNaam = data.Eigenaar != null
            ? $"{data.Eigenaar.Voornaam} {data.Eigenaar.Tussenvoegsel} {data.Eigenaar.Achternaam}".Trim()
            : null;
        PdfComponents.RenderCoverPage(container, "Documenten Overzicht", eigenaarNaam);

        container.Page(page =>
        {
            PdfComponents.ConfigurePage(page);
            page.Header().Element(c => PdfComponents.RenderHeader(c, L["Page_DocumentenOverzicht"].Value, latUpdated));
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.ContentSpacing);

                if (documenten.Count > 0)
                    PdfComponents.Section(col, L["Section_OpgeslagenDocumenten"].Value, t =>
                    {
                        foreach (var d in documenten)
                            PdfComponents.Row(t, d.Naam, $"{d.Categorie} — {d.BestandsNaam}");
                    });
                else
                    col.Item().Text(L["Text_GeenDocumenten"].Value)
                        .Italic().FontColor(PdfBrandTheme.TextMuted);
            });
            page.Footer().Element(PdfComponents.RenderFooter);
        });
    }
}
