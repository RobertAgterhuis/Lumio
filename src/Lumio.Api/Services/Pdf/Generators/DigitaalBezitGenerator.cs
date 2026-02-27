using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

public class DigitaalBezitGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public DigitaalBezitGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var accounts = data.DigitaleAccounts;
        var wallets = data.CryptoWallets;
        var wachtwoorden = data.Wachtwoorden;

        var datums = accounts.Select(a => a.GewijzigdOp)
            .Concat(wallets.Select(w => w.GewijzigdOp))
            .Concat(wachtwoorden.Select(w => w.GewijzigdOp));
        var laatstBijgewerkt = datums.Any() ? datums.Max() : (DateTime?)null;
        var eigenaarNaam = data.Eigenaar != null
            ? $"{data.Eigenaar.Voornaam} {data.Eigenaar.Tussenvoegsel} {data.Eigenaar.Achternaam}".Trim()
            : null;
        PdfComponents.RenderCoverPage(container, "Digitaal Bezit", eigenaarNaam);
        container.Page(page =>
        {
            PdfComponents.ConfigurePage(page);
            page.Header().Element(c => PdfComponents.RenderHeader(c, L["Page_DigitaalBezit"].Value, laatstBijgewerkt));
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.ContentSpacing);

                if (accounts.Count > 0)
                    PdfComponents.Section(col, L["Section_OnlineAccounts"].Value, t =>
                    {
                        foreach (var a in accounts)
                        {
                            PdfComponents.Row(t, a.PlatformNaam, a.GewensteActie ?? "—");
                            if (!string.IsNullOrEmpty(a.Notities))
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text(a.Notities)
                                    .FontSize(PdfBrandTheme.FontCaption + 1).Italic().FontColor(PdfBrandTheme.TextMuted);
                        }
                    });

                if (wallets.Count > 0)
                    PdfComponents.Section(col, L["Section_CryptoWallets"].Value, t =>
                    {
                        foreach (var w in wallets)
                        {
                            PdfComponents.Row(t, w.WalletNaam, $"{w.CryptoType} — {w.Exchange ?? ""}");
                            if (!string.IsNullOrEmpty(w.Notities))
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text(w.Notities)
                                    .FontSize(PdfBrandTheme.FontCaption + 1).Italic().FontColor(PdfBrandTheme.TextMuted);
                        }
                    });

                if (wachtwoorden.Count > 0)
                    PdfComponents.Section(col, L["Section_Wachtwoorden"].Value, t =>
                    {
                        foreach (var w in wachtwoorden)
                            PdfComponents.Row(t, w.Naam, w.Gebruikersnaam ?? "—");
                    });
            });
            page.Footer().Element(PdfComponents.RenderFooter);
        });
    }
}
