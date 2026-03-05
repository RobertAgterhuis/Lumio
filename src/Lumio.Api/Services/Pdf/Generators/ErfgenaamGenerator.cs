using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

/// <summary>
/// Per-erfgenaam information sheet. Requires data.TargetErfgenaam to be set.
/// Call via PdfDataLoader.LoadForErfgenaamAsync(erfgenaamId).
/// </summary>
public class ErfgenaamGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public ErfgenaamGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var erfgenaam = data.TargetErfgenaam;
        var eigenaar = data.Eigenaar;

        if (erfgenaam is null || eigenaar is null) return;

        var volleNaam = string.Join(" ",
            new[] { erfgenaam.Voornaam, erfgenaam.Tussenvoegsel, erfgenaam.Achternaam }
            .Where(s => !string.IsNullOrWhiteSpace(s)));
        var eigenaarNaam = string.Join(" ",
            new[] { eigenaar.Voornaam, eigenaar.Tussenvoegsel, eigenaar.Achternaam }
            .Where(s => !string.IsNullOrWhiteSpace(s)));

        // Filter toewijzingen for this erfgenaam
        var toewijzingen = data.ErfgenaamToewijzingen
            .Where(t => t.ErfgenaamId == erfgenaam.Id).ToList();

        var bezitIds        = toewijzingen.Where(t => t.EntityType == "FysiekBezit").Select(t => t.EntityId).ToHashSet();
        var bankIds         = toewijzingen.Where(t => t.EntityType == "Bankrekening").Select(t => t.EntityId).ToHashSet();
        var verzekeringIds  = toewijzingen.Where(t => t.EntityType == "Verzekering").Select(t => t.EntityId).ToHashSet();
        var accountIds      = toewijzingen.Where(t => t.EntityType == "DigitaalAccount").Select(t => t.EntityId).ToHashSet();

        var bezittingen   = data.FysiekeBezittingen.Where(b => bezitIds.Contains(b.Id)).ToList();
        var bankrekeningen = data.Bankrekeningen.Where(b => bankIds.Contains(b.Id)).ToList();
        var verzekeringen  = data.Verzekeringen.Where(v => verzekeringIds.Contains(v.Id)).ToList();
        var accounts       = data.DigitaleAccounts.Where(a => accountIds.Contains(a.Id)).ToList();

        // Testament begunstiging: find begunstigde by matching achternaam
        var begunstigde = data.Begunstigden
            .FirstOrDefault(b => b.Naam.Contains(erfgenaam.Achternaam, StringComparison.OrdinalIgnoreCase));

        PdfComponents.RenderCoverPage(container, "Erfgenaam-informatie", eigenaarNaam);

        container.Page(page =>
        {
            PdfComponents.ConfigurePage(page);
            page.Header().Element(c =>
                PdfComponents.RenderHeader(c, string.Format(L["Page_ErfgenaamInformatie"].Value, volleNaam)));
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.ContentSpacing);

                // Intro text
                col.Item().Text(string.Format(L["Text_ErfgenaamPdfIntro"].Value, eigenaarNaam, volleNaam))
                    .FontSize(PdfBrandTheme.FontBody).Italic().FontColor(PdfBrandTheme.TextMuted);

                // Gegevens erfgenaam
                PdfComponents.Section(col, L["Section_UwGegevens"].Value, t =>
                {
                    PdfComponents.Row(t, L["Label_Naam"].Value, volleNaam);
                    PdfComponents.Row(t, L["Label_Relatie"].Value, erfgenaam.Relatie);
                    if (!string.IsNullOrWhiteSpace(erfgenaam.Telefoon))
                        PdfComponents.Row(t, L["Label_Telefoon"].Value, erfgenaam.Telefoon);
                    if (!string.IsNullOrWhiteSpace(erfgenaam.Email))
                        PdfComponents.Row(t, L["Label_EMail"].Value, erfgenaam.Email);
                    if (!string.IsNullOrWhiteSpace(erfgenaam.Adres))
                        PdfComponents.Row(t, L["Label_Adres"].Value,
                            $"{erfgenaam.Adres}, {erfgenaam.Postcode} {erfgenaam.Woonplaats}");
                });

                // Eigenaar overzicht
                PdfComponents.Section(col, L["Section_GegevensErflater"].Value, t =>
                {
                    PdfComponents.Row(t, L["Label_Naam"].Value, eigenaarNaam);
                    if (!string.IsNullOrWhiteSpace(eigenaar.Telefoon))
                        PdfComponents.Row(t, L["Label_Telefoon"].Value, eigenaar.Telefoon);
                    if (!string.IsNullOrWhiteSpace(eigenaar.Email))
                        PdfComponents.Row(t, L["Label_EMail"].Value, eigenaar.Email);
                    if (!string.IsNullOrWhiteSpace(eigenaar.NotarisContact?.Naam))
                        PdfComponents.Row(t, L["Label_Notaris"].Value, $"{eigenaar.NotarisContact?.Naam} ({eigenaar.NotarisContact?.BedrijfsNaam})");
                });

                // Testament positie
                if (begunstigde is not null)
                    PdfComponents.Section(col, L["Section_TestamentUwPositie"].Value, t =>
                    {
                        if (!string.IsNullOrWhiteSpace(begunstigde.Omschrijving))
                            PdfComponents.Row(t, L["Label_Omschrijving"].Value, begunstigde.Omschrijving);
                        if (begunstigde.Percentage.HasValue)
                            PdfComponents.Row(t, L["Label_Percentage"].Value, $"{begunstigde.Percentage}%");
                        PdfComponents.Row(t, L["Label_LegitiemePortie"].Value,
                            begunstigde.IsLegitiemePortie ? L["Value_Ja"].Value : L["Value_Nee"].Value);
                    });

                // Toegewezen bezittingen
                if (bezittingen.Count > 0)
                    PdfComponents.Section(col, L["Section_ToegewezenBezittingen"].Value, t =>
                    {
                        foreach (var b in bezittingen)
                        {
                            t.Item().PaddingBottom(4).Column(item =>
                            {
                                item.Item().Text($"• {b.Omschrijving} ({b.Categorie})")
                                    .FontSize(PdfBrandTheme.FontBody).SemiBold();
                                if (b.GeschatteWaarde.HasValue)
                                    item.Item().PaddingLeft(12)
                                        .Text(string.Format(L["Text_GeschatteWaardePrefix"].Value, b.GeschatteWaarde))
                                        .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                                var instr = toewijzingen.FirstOrDefault(tw => tw.EntityId == b.Id)?.Instructies;
                                if (!string.IsNullOrWhiteSpace(instr))
                                    item.Item().PaddingLeft(12)
                                        .Text(string.Format(L["Text_InstructiePrefix"].Value, instr))
                                        .FontSize(PdfBrandTheme.FontCaption + 1).Italic().FontColor(PdfBrandTheme.TextMuted);
                            });
                        }
                    });

                // Toegewezen bankrekeningen
                if (bankrekeningen.Count > 0)
                    PdfComponents.Section(col, L["Section_ToegewezenBankrekeningen"].Value, t =>
                    {
                        foreach (var b in bankrekeningen)
                        {
                            t.Item().PaddingBottom(4).Column(item =>
                            {
                                item.Item().Text($"• {b.BankNaam} — {b.IBAN}")
                                    .FontSize(PdfBrandTheme.FontBody).SemiBold();
                                if (b.Saldo.HasValue)
                                    item.Item().PaddingLeft(12)
                                        .Text(string.Format(L["Text_SaldoPrefix"].Value, b.Saldo))
                                        .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                            });
                        }
                    });

                // Toegewezen verzekeringen
                if (verzekeringen.Count > 0)
                    PdfComponents.Section(col, L["Section_ToegewezenVerzekeringen"].Value, t =>
                    {
                        foreach (var v in verzekeringen)
                        {
                            t.Item().PaddingBottom(4).Column(item =>
                            {
                                item.Item().Text($"• {v.Verzekeraar} — {v.Type} (polis {v.PolisNummer})")
                                    .FontSize(PdfBrandTheme.FontBody).SemiBold();
                                if (v.VerzekerdBedrag.HasValue)
                                    item.Item().PaddingLeft(12)
                                        .Text(string.Format(L["Text_VerzekerdBedragPrefix"].Value, v.VerzekerdBedrag))
                                        .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                            });
                        }
                    });

                // Toegewezen digitale accounts
                if (accounts.Count > 0)
                    PdfComponents.Section(col, L["Section_ToegewezenDigitaleAccounts"].Value, t =>
                    {
                        foreach (var a in accounts)
                        {
                            t.Item().PaddingBottom(4).Column(item =>
                            {
                                item.Item().Text($"• {a.PlatformNaam}").FontSize(PdfBrandTheme.FontBody).SemiBold();
                                PdfComponents.Row(t, "  " + L["Label_GewensteActie"].Value, a.GewensteActie ?? "—");
                                if (!string.IsNullOrWhiteSpace(a.Notities))
                                    item.Item().PaddingLeft(12)
                                        .Text(string.Format(L["Text_NotitiePrefix"].Value, a.Notities))
                                        .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                            });
                        }
                    });

                // Noodcontacten
                if (data.Noodcontacten.Count > 0)
                    PdfComponents.Section(col, L["Section_BelangrijkeContactpersonen"].Value, t =>
                    {
                        foreach (var n in data.Noodcontacten)
                        {
                            t.Item().PaddingBottom(4).Column(item =>
                            {
                                item.Item().Text($"• {n.Naam} — {n.Rol}").FontSize(PdfBrandTheme.FontBody).SemiBold();
                                if (!string.IsNullOrWhiteSpace(n.Telefoon))
                                    item.Item().PaddingLeft(12)
                                        .Text(string.Format(L["Text_TelPrefix"].Value, n.Telefoon))
                                        .FontSize(PdfBrandTheme.FontCaption + 1);
                                if (!string.IsNullOrWhiteSpace(n.Email))
                                    item.Item().PaddingLeft(12)
                                        .Text(string.Format(L["Text_EMailPrefix"].Value, n.Email))
                                        .FontSize(PdfBrandTheme.FontCaption + 1);
                            });
                        }
                    });

                // No assignments notice
                if (toewijzingen.Count == 0 && begunstigde is null)
                    col.Item().PaddingTop(10)
                        .Text(L["Text_GeenToewijzingen"].Value)
                        .FontSize(PdfBrandTheme.FontBody).Italic().FontColor(PdfBrandTheme.TextMuted);
            });
            page.Footer().Element(PdfComponents.RenderFooter);
        });
    }
}
