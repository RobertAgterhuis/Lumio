using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

/// <summary>
/// Generates a nabestaanden-instructiekaartje (next-of-kin instruction card).
/// Contains: contact persons, location of digital keys, steps to take.
/// Does NOT contain BSN or medical data (AVG / SP-UX-02-002 AC).
/// </summary>
public class NabestaandenInstructieGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public NabestaandenInstructieGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var eigenaar = data.Eigenaar;
        var noodcontacten = data.Noodcontacten;
        var shamirErfgenamen = data.Erfgenamen
            .Where(e => e.HeeftShareOntvangen)
            .OrderBy(e => e.ShareIndex)
            .ToList();
        var drempel = shamirErfgenamen.Count > 0
            ? Math.Max(2, (int)Math.Ceiling(shamirErfgenamen.Count * 0.6))
            : 2;
        var latDatum = eigenaar?.GewijzigdOp ?? DateTime.MinValue;

        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim()
            : null;
        PdfComponents.RenderCoverPage(container, L["Page_NabestaandenInstructie"].Value, eigenaarNaam);

        container.Page(page =>
        {
            PdfComponents.ConfigurePage(page);
            page.Header().Element(c => PdfComponents.RenderHeader(c, L["Page_NabestaandenInstructie"].Value, latDatum));
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.ContentSpacing);

                col.Item().Text(L["Text_NabestaandenInstructieIntro"].Value)
                    .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);

                // Stap 1 — Noodcontacten
                PdfComponents.Section(col, L["Section_Stap1Noodcontacten"].Value, t =>
                {
                    if (noodcontacten.Count > 0)
                    {
                        foreach (var nc in noodcontacten)
                        {
                            PdfComponents.Row(t, $"{nc.Naam} ({nc.Rol})",
                                $"{nc.Telefoon ?? "—"} / {nc.Email ?? "—"}");
                            if (!string.IsNullOrEmpty(nc.Instructies))
                                PdfComponents.Row(t, L["Label_Instructie"].Value, nc.Instructies);
                        }
                    }
                    else
                        t.Item().Text(L["Text_GeenNoodcontacten"].Value)
                            .FontSize(PdfBrandTheme.FontBody).Italic();
                });

                // Stap 2 — Digitale sleutels (Shamir)
                PdfComponents.Section(col, L["Section_Stap2DigitaleSleutels"].Value, t =>
                {
                    t.Item().Text(string.Format(L["Text_ShamirSleuteldelenNodig"].Value, drempel))
                        .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                    t.Item().PaddingTop(3);
                    if (shamirErfgenamen.Count > 0)
                    {
                        t.Item().Text(string.Format(L["Label_ShamirDrempel"].Value, drempel, shamirErfgenamen.Count))
                            .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                        t.Item().PaddingTop(2);
                        foreach (var e in shamirErfgenamen)
                            PdfComponents.Row(t,
                                string.Format(L["Label_DeelNummer"].Value, e.ShareIndex),
                                $"{e.Voornaam} {e.Achternaam} — {e.Telefoon ?? e.Email ?? L["Text_GeenContact"].Value}");
                    }
                    else
                        t.Item().Text(L["Text_GeenSleuteldelen"].Value)
                            .FontSize(PdfBrandTheme.FontBody).Italic();
                });

                // Stap 3 — Te nemen stappen
                PdfComponents.Section(col, L["Section_Stap3TeNemenStappen"].Value, t =>
                {
                    t.Item().Text(L["Text_StappenToelichting"].Value)
                        .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                    t.Item().PaddingTop(3);
                    PdfComponents.Row(t, "1", L["Text_StapNoodcontactenBellen"].Value);
                    PdfComponents.Row(t, "2", L["Text_StapSleutelsBijElkaar"].Value);
                    PdfComponents.Row(t, "3", L["Text_StapLumioOpenen"].Value);
                    PdfComponents.Row(t, "4", L["Text_StapGegevensRaadplegen"].Value);
                    PdfComponents.Row(t, "5", L["Text_StapWensenUitvoeren"].Value);
                });

                // Stap 4 — Lumio backup locatie
                PdfComponents.Section(col, L["Section_Stap4BackupLocatie"].Value, t =>
                {
                    t.Item().Text(L["Text_BackupLocatieToelichting"].Value)
                        .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                    t.Item().PaddingTop(3);
                    PdfComponents.Row(t, "•", L["Text_BackupLumioDesktop"].Value);
                    PdfComponents.Row(t, "•", L["Text_BackupExterneMedium"].Value);
                });
            });
            page.Footer().Element(PdfComponents.RenderFooter);
        });
    }
}
