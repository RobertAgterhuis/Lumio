using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

public class BoedelGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public BoedelGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var bezittingen = data.FysiekeBezittingen;
        var rekeningen = data.Bankrekeningen;
        var verzekeringen = data.Verzekeringen;
        var schulden = data.Schulden;

        var datums = bezittingen.Select(b => b.GewijzigdOp)
            .Concat(rekeningen.Select(r => r.GewijzigdOp))
            .Concat(verzekeringen.Select(v => v.GewijzigdOp))
            .Concat(schulden.Select(s => s.GewijzigdOp));
        var laatstBijgewerkt = datums.Any() ? datums.Max() : (DateTime?)null;
        var eigenaarNaam = data.Eigenaar != null
            ? $"{data.Eigenaar.Voornaam} {data.Eigenaar.Tussenvoegsel} {data.Eigenaar.Achternaam}".Trim()
            : null;
        PdfComponents.RenderCoverPage(container, "Boedel", eigenaarNaam);
        container.Page(page =>
        {
            PdfComponents.ConfigurePage(page);
            page.Header().Element(c => PdfComponents.RenderHeader(c, L["Page_Boedel"].Value, laatstBijgewerkt));
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.ContentSpacing);

                if (bezittingen.Count > 0)
                    PdfComponents.Section(col, L["Section_FysiekeBezittingen"].Value, t =>
                    {
                        foreach (var b in bezittingen)
                        {
                            PdfComponents.Row(t, b.Omschrijving, b.Categorie);
                            if (b.GeschatteWaarde.HasValue)
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text($"€ {b.GeschatteWaarde:N2}")
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                        }
                    });

                if (rekeningen.Count > 0)
                    PdfComponents.Section(col, L["Section_Bankrekeningen"].Value, t =>
                    {
                        foreach (var r in rekeningen)
                        {
                            PdfComponents.Row(t, r.BankNaam, r.IBAN);
                            if (r.Saldo.HasValue)
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text($"€ {r.Saldo:N2}")
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                        }
                    });

                if (verzekeringen.Count > 0)
                    PdfComponents.Section(col, L["Section_Verzekeringen"].Value, t =>
                    {
                        foreach (var v in verzekeringen)
                        {
                            PdfComponents.Row(t, $"{v.Verzekeraar} ({v.Type})", v.PolisNummer);
                            if (v.VerzekerdBedrag.HasValue)
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text($"€ {v.VerzekerdBedrag:N2}")
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                            if (!string.IsNullOrEmpty(v.Begunstigde))
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text(string.Format(L["Text_BestemdeVoorPrefix"].Value, v.Begunstigde))
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                        }
                    });

                if (schulden.Count > 0)
                    PdfComponents.Section(col, L["Section_Schulden"].Value, t =>
                    {
                        foreach (var s in schulden)
                        {
                            PdfComponents.Row(t, s.Schuldeiser, $"{s.Type} — € {s.Bedrag:N2}");
                            if (!string.IsNullOrEmpty(s.SchuldeiserTelefoon))
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text(string.Format(L["Text_TelPrefix"].Value, s.SchuldeiserTelefoon))
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                            if (s.MaandelijkseAflossing.HasValue)
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text($"Aflossingsbedrag: € {s.MaandelijkseAflossing:N2}/mnd")
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                        }
                    });

                var totBezit    = bezittingen.Sum(b => b.GeschatteWaarde ?? 0);
                var totSaldi    = rekeningen.Sum(r => r.Saldo ?? 0);
                var totVerzeker = verzekeringen.Sum(v => v.VerzekerdBedrag ?? 0);
                var totActiva   = totBezit + totSaldi + totVerzeker;
                var totPassiva  = schulden.Sum(s => s.Bedrag);
                var netto       = totActiva - totPassiva;
                if (totActiva > 0 || totPassiva > 0)
                    PdfComponents.Section(col, L["Section_NettoOverzicht"].Value, t =>
                    {
                        if (totBezit > 0)
                            PdfComponents.Row(t, L["Label_SubtotaalBezittingen"].Value.TrimStart(), $"€ {totBezit:N2}");
                        if (totSaldi > 0)
                            PdfComponents.Row(t, L["Label_SubtotaalSaldi"].Value.TrimStart(), $"€ {totSaldi:N2}");
                        if (totVerzeker > 0)
                            PdfComponents.Row(t, L["Label_SubtotaalVerzekeringen"].Value.TrimStart(), $"€ {totVerzeker:N2}");
                        PdfComponents.Row(t, L["Label_TotaalActivaBruto"].Value, $"€ {totActiva:N2}");
                        if (totPassiva > 0)
                            PdfComponents.Row(t, L["Label_TotaalPassiva"].Value.TrimStart(), $"€ {totPassiva:N2}");
                        PdfComponents.Row(t, L["Label_NettoNalatenschap"].Value, $"€ {netto:N2}");
                    });
            });
            page.Footer().Element(PdfComponents.RenderFooter);
        });
    }
}
