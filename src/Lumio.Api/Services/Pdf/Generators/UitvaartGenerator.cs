using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

public class UitvaartGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public UitvaartGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var uitvaart = data.Uitvaart;
        var eigenaar = data.Eigenaar;
        var latDatums = new[] { uitvaart?.GewijzigdOp, eigenaar?.GewijzigdOp }
            .Where(d => d.HasValue).Select(d => d!.Value).DefaultIfEmpty().Max();
        var latDatum = latDatums == DateTime.MinValue ? (DateTime?)null : latDatums;

        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim()
            : null;
        PdfComponents.RenderCoverPage(container, "Uitvaartwensen", eigenaarNaam);

        container.Page(page =>
        {
            PdfComponents.ConfigurePage(page);
            page.Header().Element(c => PdfComponents.RenderHeader(c, L["Page_Uitvaartwensen"].Value, latDatum));
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.ContentSpacing);

                if (uitvaart != null)
                {
                    PdfComponents.Section(col, L["Section_Uitvaart"].Value, t =>
                    {
                        PdfComponents.Row(t, L["Label_Type"].Value, uitvaart.VoorkeurType ?? "—");
                        PdfComponents.Row(t, L["Label_Begraafplaats"].Value, uitvaart.Begraafplaats ?? "—");
                        if (!string.IsNullOrEmpty(uitvaart.UitvaartOndernemer))
                        {
                            PdfComponents.Row(t, L["Label_Uitvaartondernemer"].Value, uitvaart.UitvaartOndernemer);
                            if (!string.IsNullOrEmpty(uitvaart.UitvaartOndernemerTelefoon))
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text(string.Format(L["Text_TelPrefix"].Value, uitvaart.UitvaartOndernemerTelefoon))
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                            if (!string.IsNullOrEmpty(uitvaart.UitvaartOndernemerEmail))
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text(string.Format(L["Text_EMailPrefix"].Value, uitvaart.UitvaartOndernemerEmail))
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                        }
                        PdfComponents.Row(t, L["Label_Uitvaartverzekering"].Value,
                            uitvaart.HeeftUitvaartVerzekering ? L["Value_Ja"].Value : L["Value_Nee"].Value);
                        if (!string.IsNullOrEmpty(uitvaart.UitvaartVerzekeringDetails))
                            t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                .Text(uitvaart.UitvaartVerzekeringDetails)
                                .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                        if (!string.IsNullOrEmpty(uitvaart.CeremonieLocatie))
                            PdfComponents.Row(t, L["Label_CeremonieLocatie"].Value, uitvaart.CeremonieLocatie);
                        if (!string.IsNullOrEmpty(uitvaart.Muziekwensen))
                            PdfComponents.Row(t, L["Label_Muziek"].Value, uitvaart.Muziekwensen);
                        if (!string.IsNullOrEmpty(uitvaart.Sprekers))
                            PdfComponents.Row(t, L["Label_Sprekers"].Value, uitvaart.Sprekers);
                        if (!string.IsNullOrEmpty(uitvaart.Bloemen))
                            PdfComponents.Row(t, L["Label_Bloemen"].Value, uitvaart.Bloemen);
                        if (!string.IsNullOrEmpty(uitvaart.Kledingwensen))
                            PdfComponents.Row(t, L["Label_Kleding"].Value, uitvaart.Kledingwensen);
                        if (!string.IsNullOrEmpty(uitvaart.RouwkaartTekst))
                            PdfComponents.Row(t, L["Label_Rouwkaart"].Value, uitvaart.RouwkaartTekst);
                        if (!string.IsNullOrEmpty(uitvaart.RouwadvertentieTekst))
                            PdfComponents.Row(t, L["Label_Rouwadvertentie"].Value, uitvaart.RouwadvertentieTekst);
                        if (!string.IsNullOrEmpty(uitvaart.Condoleance))
                            PdfComponents.Row(t, L["Label_Condoleance"].Value, uitvaart.Condoleance);
                        if (!string.IsNullOrEmpty(uitvaart.OverigeWensen))
                            PdfComponents.Row(t, L["Label_AanvullendeWensen"].Value, uitvaart.OverigeWensen);
                        if (!string.IsNullOrEmpty(uitvaart.BudgetRichting))
                            PdfComponents.Row(t, L["Label_BudgetRichting"].Value, uitvaart.BudgetRichting);
                        if (uitvaart.DatumOpgesteld.HasValue)
                            PdfComponents.Row(t, L["Label_DatumOpgesteld"].Value,
                                uitvaart.DatumOpgesteld.Value.ToString("dd-MM-yyyy"));
                    });

                    var heeftLocatieVoorkeur = !string.IsNullOrEmpty(uitvaart.VoorkeurBegraafplaatsNaam)
                        || !string.IsNullOrEmpty(uitvaart.VoorkeurCrematoriumnaam)
                        || !string.IsNullOrEmpty(uitvaart.VoorkeurAulaNaam);
                    if (heeftLocatieVoorkeur)
                        PdfComponents.Section(col, L["Section_LocatieVoorkeuren"].Value, t =>
                        {
                            if (!string.IsNullOrEmpty(uitvaart.VoorkeurBegraafplaatsNaam))
                            {
                                PdfComponents.Row(t, "Begraafplaats", uitvaart.VoorkeurBegraafplaatsNaam);
                                if (!string.IsNullOrEmpty(uitvaart.VoorkeurBegraafplaatsAdres))
                                    t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                        .Text(uitvaart.VoorkeurBegraafplaatsAdres)
                                        .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                            }
                            if (!string.IsNullOrEmpty(uitvaart.VoorkeurCrematoriumnaam))
                            {
                                PdfComponents.Row(t, "Crematorium", uitvaart.VoorkeurCrematoriumnaam);
                                if (!string.IsNullOrEmpty(uitvaart.VoorkeurCrematoriumAdres))
                                    t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                        .Text(uitvaart.VoorkeurCrematoriumAdres)
                                        .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                            }
                            if (!string.IsNullOrEmpty(uitvaart.VoorkeurAulaNaam))
                            {
                                PdfComponents.Row(t, "Aula", uitvaart.VoorkeurAulaNaam);
                                if (!string.IsNullOrEmpty(uitvaart.VoorkeurAulaAdres))
                                    t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                        .Text(uitvaart.VoorkeurAulaAdres)
                                        .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                            }
                        });

                    if (data.CeremonieDetails.Count > 0)
                        PdfComponents.Section(col, L["Section_Ceremonie"].Value, t =>
                        {
                            foreach (var c in data.CeremonieDetails)
                                PdfComponents.Row(t, c.Onderdeel, c.Beschrijving ?? "");
                        });
                }
            });
            page.Footer().Element(PdfComponents.RenderFooter);
        });
    }
}
