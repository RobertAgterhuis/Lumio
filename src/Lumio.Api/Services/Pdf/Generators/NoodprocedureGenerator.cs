using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

public class NoodprocedureGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public NoodprocedureGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var eigenaar = data.Eigenaar;
        var noodcontacten = data.Noodcontacten;
        // Shamir erfgenamen: those who have received a share (filter from all erfgenamen)
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
        PdfComponents.RenderCoverPage(container, "Noodprocedure", eigenaarNaam);

        container.Page(page =>
        {
            PdfComponents.ConfigurePage(page);
            page.Header().Element(c => PdfComponents.RenderHeader(c, L["Page_Noodprocedure"].Value, latDatum));
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.ContentSpacing);

                col.Item().Text(L["Text_NoodprocedureIntro"].Value)
                    .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);

                // Eigenaar
                if (eigenaar != null)
                    PdfComponents.Section(col, L["Section_GegevensOverledene"].Value, t =>
                    {
                        PdfComponents.Row(t, L["Label_Naam"].Value,
                            $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim());
                        if (!string.IsNullOrEmpty(eigenaar.Telefoon))
                            PdfComponents.Row(t, L["Label_Telefoon"].Value, eigenaar.Telefoon);
                        if (!string.IsNullOrEmpty(eigenaar.Email))
                            PdfComponents.Row(t, L["Label_EMail"].Value, eigenaar.Email);
                    });

                // Stap 1
                PdfComponents.Section(col, L["Section_Stap1Noodcontacten"].Value, t =>
                {
                    t.Item().Text(L["Text_NeemContactOp"].Value)
                        .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                    t.Item().PaddingTop(3);
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

                // Stap 2 — Shamir
                PdfComponents.Section(col, L["Section_Stap2ShamirSleuteldelen"].Value, t =>
                {
                    t.Item().Text(string.Format(L["Text_ShamirSleuteldelenNodig"].Value, drempel))
                        .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                    t.Item().PaddingTop(3);
                    if (shamirErfgenamen.Count > 0)
                    {
                        foreach (var e in shamirErfgenamen)
                            PdfComponents.Row(t,
                                string.Format(L["Label_DeelNummer"].Value, e.ShareIndex),
                                $"{e.Voornaam} {e.Achternaam} — {e.Telefoon ?? e.Email ?? L["Text_GeenContact"].Value}");
                    }
                    else
                        t.Item().Text(L["Text_GeenSleuteldelen"].Value).FontSize(PdfBrandTheme.FontBody).Italic();
                });

                // Stap 3
                PdfComponents.Section(col, L["Section_Stap3LumioInstalleren"].Value, t =>
                {
                    t.Item().Text(L["Text_LumioDesktopInstructie"].Value)
                        .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                    t.Item().PaddingTop(3);
                    PdfComponents.Row(t, "3a", L["Text_Stap3aInstructie"].Value);
                    PdfComponents.Row(t, "3b", L["Text_Stap3bInstructie"].Value);
                    PdfComponents.Row(t, "3c", L["Text_Stap3cInstructie"].Value);
                });

                // Stap 4
                PdfComponents.Section(col, L["Section_Stap4BackupHerstellen"].Value, t =>
                {
                    t.Item().Text(L["Text_AlsBackupOntvangen"].Value)
                        .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                    t.Item().PaddingTop(3);
                    PdfComponents.Row(t, "4a", L["Text_Stap4aInstructie"].Value);
                    PdfComponents.Row(t, "4b", L["Text_Stap4bInstructie"].Value);
                    PdfComponents.Row(t, "4c", L["Text_Stap4cInstructie"].Value);
                });

                // Stap 5
                PdfComponents.Section(col, L["Section_Stap5Ontgrendelen"].Value, t =>
                {
                    t.Item().Text(L["Text_NaHerstellen"].Value)
                        .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                    t.Item().PaddingTop(3);
                    PdfComponents.Row(t, "5a", L["Text_Stap5aInstructie"].Value);
                    PdfComponents.Row(t, "5b", L["Text_Stap5bInstructie"].Value);
                    PdfComponents.Row(t, "5c", string.Format(L["Text_Stap5cInstructie"].Value, drempel));
                    PdfComponents.Row(t, "5d", L["Text_Stap5dInstructie"].Value);
                    PdfComponents.Row(t, "5e", L["Text_Stap5eInstructie"].Value);
                });

                // Stap 6
                PdfComponents.Section(col, L["Section_Stap6GegevensRaadplegen"].Value, t =>
                {
                    t.Item().Text(L["Text_NaOntgrendeling"].Value)
                        .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                    t.Item().PaddingTop(3);
                    PdfComponents.Row(t, "•", L["Text_DashboardStappenplan"].Value);
                    PdfComponents.Row(t, "•", L["Text_WensenInzien"].Value);
                    PdfComponents.Row(t, "•", L["Text_PdfExporteren"].Value);
                    PdfComponents.Row(t, "•", L["Text_ZipDownloaden"].Value);
                    PdfComponents.Row(t, "•", L["Text_VoortgangBijhouden"].Value);
                });
            });
            page.Footer().Element(PdfComponents.RenderFooter);
        });
    }
}
