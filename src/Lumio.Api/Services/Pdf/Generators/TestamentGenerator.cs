using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

public class TestamentGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public TestamentGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var eigenaar = data.Eigenaar;
        var testament = data.Testament;

        var laatstBijgewerkt = new[] { eigenaar?.GewijzigdOp, testament?.GewijzigdOp }
            .Where(d => d.HasValue).Select(d => d!.Value).DefaultIfEmpty().Max();
        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim()
            : null;
        PdfComponents.RenderCoverPage(container, "Testament", eigenaarNaam);
        container.Page(page =>
        {
            PdfComponents.ConfigurePage(page);
            page.Header().Element(c => PdfComponents.RenderHeader(c, L["Page_Testament"].Value, laatstBijgewerkt));
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.ContentSpacing);

                if (eigenaar != null)
                    PdfComponents.Section(col, L["Section_Eigenaar"].Value, t =>
                    {
                        PdfComponents.Row(t, L["Label_Naam"].Value,
                            $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim());
                    });

                if (testament != null)
                    PdfComponents.Section(col, L["Section_TestamentInformatie"].Value, t =>
                    {
                        PdfComponents.Row(t, L["Label_Type"].Value, testament.TestamentType ?? "—");
                        PdfComponents.Row(t, L["Label_Notaris"].Value, testament.NotarisContact?.Naam ?? "—");
                        PdfComponents.Row(t, L["Label_Kantoor"].Value, testament.NotarisContact?.BedrijfsNaam ?? "—");
                        if (!string.IsNullOrEmpty(testament.NotarisContact?.Telefoon))
                            PdfComponents.Row(t, L["Label_TelNotaris"].Value, testament.NotarisContact.Telefoon);
                        if (!string.IsNullOrEmpty(testament.NotarisContact?.Email))
                            PdfComponents.Row(t, L["Label_EMailNotaris"].Value, testament.NotarisContact.Email);
                        PdfComponents.Row(t, L["Label_Datum"].Value, testament.DatumTestament?.ToString("dd-MM-yyyy") ?? "—");
                        PdfComponents.Row(t, L["Label_CTRNummer"].Value, testament.CTR_Nummer ?? "—");
                        PdfComponents.Row(t, L["Label_Bewaarlocatie"].Value, testament.TestamentLocatie ?? "—");
                        if (testament.UitsluitingsClausule.HasValue)
                            PdfComponents.Row(t, L["Label_Uitsluitingsclausule"].Value,
                                testament.UitsluitingsClausule.Value ? L["Value_Ja"].Value : L["Value_Nee"].Value);
                        if (!string.IsNullOrEmpty(testament.Legaten))
                            PdfComponents.Row(t, L["Label_Legaten"].Value, testament.Legaten);
                        if (!string.IsNullOrEmpty(testament.AlgemeneWensen))
                            PdfComponents.Row(t, L["Label_AlgemeneWensen"].Value, testament.AlgemeneWensen);
                        if (!string.IsNullOrEmpty(testament.BijzondereBepalingen))
                            PdfComponents.Row(t, L["Label_BijzondereBepalingen"].Value, testament.BijzondereBepalingen);
                    });

                if (data.Begunstigden.Count > 0)
                    PdfComponents.Section(col, L["Section_Begunstigden"].Value, t =>
                    {
                        foreach (var b in data.Begunstigden)
                        {
                            var pct = b.Percentage.HasValue ? $" — {b.Percentage}%" : "";
                            var leg = b.IsLegitiemePortie ? $" {L["Value_LegitiemePortie"].Value}" : "";
                            PdfComponents.Row(t, b.Naam, $"{b.Relatie}{pct}{leg}");
                            if (!string.IsNullOrEmpty(b.Omschrijving))
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text(b.Omschrijving)
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                        }
                    });

                if (data.Executeurs.Count > 0)
                    PdfComponents.Section(col, L["Section_Executeurs"].Value, t =>
                    {
                        foreach (var e in data.Executeurs)
                        {
                            PdfComponents.Row(t, e.Naam, e.Relatie ?? "");
                            if (!string.IsNullOrEmpty(e.Telefoon))
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text($"{L["Label_Telefoon"].Value}: {e.Telefoon}")
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                            if (!string.IsNullOrEmpty(e.Email))
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text($"{L["Label_EMail"].Value}: {e.Email}")
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                            if (!string.IsNullOrEmpty(e.Bevoegdheden))
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text($"{L["Label_Bevoegdheden"].Value.TrimStart()}: {e.Bevoegdheden}")
                                    .FontSize(PdfBrandTheme.FontCaption + 1).Italic().FontColor(PdfBrandTheme.TextMuted);
                        }
                    });
            });
            page.Footer().Element(PdfComponents.RenderFooter);
        });
    }
}
