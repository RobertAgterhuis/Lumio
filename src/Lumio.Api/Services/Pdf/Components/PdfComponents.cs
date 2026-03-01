using Lumio.Api.Services.Pdf.Theme;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Reflection;

namespace Lumio.Api.Services.Pdf.Components;

/// <summary>
/// Shared, brand-aware building blocks for all Lumio PDF generators.
/// All colour/font references go through PdfBrandTheme — no magic strings here.
/// </summary>
public static class PdfComponents
{
    // ── Logo (loaded once from embedded resource) ─────────────────────────

    private static byte[]? _logoBytes;

    private static byte[] GetLogoBytes()
    {
        if (_logoBytes is not null) return _logoBytes;
        var asm = Assembly.GetExecutingAssembly();
        using var stream = asm.GetManifestResourceStream("Lumio.Api.Resources.Images.lumio-logo.png");
        if (stream is null) return _logoBytes = [];
        using var ms = new MemoryStream();
        stream.CopyTo(ms);
        return _logoBytes = ms.ToArray();
    }

    // ── Page configuration ────────────────────────────────────────────────

    public static void ConfigurePage(PageDescriptor page, float? leftMargin = null)
    {
        page.Size(PdfBrandTheme.PageSize);
        if (leftMargin.HasValue)
        {
            page.MarginLeft(leftMargin.Value);
            page.MarginRight(PdfBrandTheme.MarginDefault);
            page.MarginTop(0);
            page.MarginBottom(PdfBrandTheme.MarginDefault);
        }
        else
        {
            page.MarginLeft(PdfBrandTheme.MarginDefault);
            page.MarginRight(PdfBrandTheme.MarginDefault);
            page.MarginTop(0);
            page.MarginBottom(PdfBrandTheme.MarginDefault);
        }
        page.Background().Background(PdfBrandTheme.Background);
        page.DefaultTextStyle(x => x
            .FontFamily(PdfBrandTheme.FontFamily)
            .FontSize(PdfBrandTheme.FontBody)
            .FontColor(PdfBrandTheme.TextPrimary));
    }

    /// <summary>Wraps content in a white card panel to stand out from the page background.</summary>
    public static IContainer CardPanel(this IContainer container)
        => container.Background(PdfBrandTheme.Card).Padding(16);

    // ── Page-level header ──────────────────────────────────────────────────

    public static void RenderHeader(IContainer container, string title, DateTime? lastUpdated = null)
    {
        var logoBytes = GetLogoBytes();

        container.Column(col =>
        {
            // ── Top accent bar (full width, no horizontal margin) ──────────
            col.Item().Height(4).Background(PdfBrandTheme.Primary);

            // ── Logo + brand name row ─────────────────────────────────────
            col.Item().Background(PdfBrandTheme.Card)
                .PaddingVertical(8)
                .Row(row =>
                {
                    // Logo
                    row.AutoItem().AlignMiddle().PaddingRight(7).Element(img =>
                    {
                        if (logoBytes.Length > 0)
                            img.Width(22).Height(22).Image(logoBytes).FitArea();
                        else
                            img.Width(22).Height(22)
                                .Background(PdfBrandTheme.Primary).CornerRadius(4)
                                .AlignCenter().AlignMiddle()
                                .Text("L").FontSize(12).Bold().FontColor(PdfBrandTheme.Card);
                    });

                    // Brand name (left)
                    row.AutoItem().AlignMiddle()
                        .Text("Lumio")
                        .FontSize(PdfBrandTheme.FontSection).Bold().FontColor(PdfBrandTheme.Primary);

                    // Spacer
                    row.RelativeItem();

                    // Document title (right, muted)
                    row.AutoItem().AlignMiddle()
                        .Text(title)
                        .FontSize(PdfBrandTheme.FontBody + 1).FontColor(PdfBrandTheme.TextMuted);
                });

            // ── Divider ───────────────────────────────────────────────────
            col.Item().Background(PdfBrandTheme.PrimaryLight).Height(1);

            // ── Page heading ──────────────────────────────────────────────
            col.Item().Background(PdfBrandTheme.Card)
                .PaddingTop(10).PaddingBottom(8)
                .Column(inner =>
                {
                    inner.Item().Text(title)
                        .FontSize(PdfBrandTheme.FontHeading).Bold().FontColor(PdfBrandTheme.Primary);
                    if (lastUpdated.HasValue)
                        inner.Item().PaddingTop(2)
                            .Text($"Bijgewerkt op {lastUpdated.Value.ToLocalTime():dd-MM-yyyy HH:mm}")
                            .FontSize(PdfBrandTheme.FontCaption + 1).Italic().FontColor(PdfBrandTheme.TextMuted);
                });

            // ── Bottom separator before content ───────────────────────────
            col.Item().Background(PdfBrandTheme.Card).PaddingBottom(8)
                .LineHorizontal(1).LineColor(PdfBrandTheme.PrimaryLight);
        });
    }

    // ── Page-level footer ─────────────────────────────────────────────────

    public static void RenderFooter(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().LineHorizontal(1).LineColor(PdfBrandTheme.PrimaryLight);
            col.Item().Background(PdfBrandTheme.Card).PaddingTop(6).Row(row =>
            {
                row.RelativeItem().AlignMiddle().Text(t =>
                {
                    t.Span("Lumio").FontSize(PdfBrandTheme.FontCaption)
                        .Bold().FontColor(PdfBrandTheme.PrimaryMid);
                    t.Span($"  ·  Gegenereerd op {DateTime.Now:dd-MM-yyyy HH:mm}")
                        .FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);
                });
                row.AutoItem().AlignMiddle().Text(t =>
                {
                    t.Span("Pagina ").FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);
                    t.CurrentPageNumber().FontSize(PdfBrandTheme.FontCaption).Bold().FontColor(PdfBrandTheme.PrimaryMid);
                    t.Span(" / ").FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);
                    t.TotalPages().FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);
                });
            });
        });
    }

    public static void RenderFooterWithDisclaimer(IContainer container, string disclaimer)
    {
        container.Column(col =>
        {
            col.Item().LineHorizontal(1).LineColor(PdfBrandTheme.PrimaryLight);
            col.Item().Background(PdfBrandTheme.Card).PaddingTop(4)
                .Text(disclaimer)
                .FontSize(PdfBrandTheme.FontCaption).Italic().FontColor(PdfBrandTheme.TextMuted);
            col.Item().Background(PdfBrandTheme.Card).PaddingTop(4).Row(row =>
            {
                row.RelativeItem().AlignMiddle().Text(t =>
                {
                    t.Span("Lumio").FontSize(PdfBrandTheme.FontCaption)
                        .Bold().FontColor(PdfBrandTheme.PrimaryMid);
                    t.Span($"  ·  Gegenereerd op {DateTime.Now:dd-MM-yyyy HH:mm}")
                        .FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);
                });
                row.AutoItem().AlignMiddle().Text(t =>
                {
                    t.Span("Pagina ").FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);
                    t.CurrentPageNumber().FontSize(PdfBrandTheme.FontCaption).Bold().FontColor(PdfBrandTheme.PrimaryMid);
                    t.Span(" / ").FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);
                    t.TotalPages().FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);
                });
            });
        });
    }

    // ── Section heading ───────────────────────────────────────────────────

    /// <summary>Branded section with a left accent border, tinted title bar and content.</summary>
    public static void Section(ColumnDescriptor col, string title, Action<ColumnDescriptor> content)
    {
        col.Item().Row(row =>
        {
            // Left accent stripe
            row.ConstantItem(4).Background(PdfBrandTheme.PrimaryMid);

            // Title + content
            row.RelativeItem().Column(section =>
            {
                // Section title row
                section.Item()
                    .Background(PdfBrandTheme.PrimaryLight)
                    .PaddingHorizontal(10).PaddingVertical(6)
                    .Text(title)
                    .FontSize(PdfBrandTheme.FontSection).SemiBold().FontColor(PdfBrandTheme.PrimaryMid);

                // Content area (white card)
                section.Item()
                    .Background(PdfBrandTheme.Card)
                    .PaddingHorizontal(10).PaddingTop(6).PaddingBottom(8)
                    .Column(inner =>
                    {
                        content(inner);
                    });
            });
        });
    }

    // ── Label / value row ─────────────────────────────────────────────────

    public static void Row(ColumnDescriptor col, string label, string value)
    {
        col.Item().PaddingVertical(2).Row(row =>
        {
            row.ConstantItem(PdfBrandTheme.LabelColumnWidth)
                .Text(label)
                .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
            row.RelativeItem()
                .Text(value)
                .FontSize(PdfBrandTheme.FontBody).SemiBold().FontColor(PdfBrandTheme.TextPrimary);
        });
    }

    // ── Notice / info blocks ──────────────────────────────────────────────

    public static void InfoBlock(ColumnDescriptor col, string text,
        string bgColor = PdfBrandTheme.InfoLight, string textColor = PdfBrandTheme.Info)
    {
        col.Item().Row(row =>
        {
            row.ConstantItem(4).Background(textColor);
            row.RelativeItem().Background(bgColor).Padding(8)
                .Text(text).Bold().FontSize(PdfBrandTheme.FontBody).FontColor(textColor);
        });
    }

    public static void InfoBlock(ColumnDescriptor col, string title, string body,
        string bgColor, string titleColor, string bodyColor)
    {
        col.Item().Row(row =>
        {
            row.ConstantItem(4).Background(titleColor);
            row.RelativeItem().Background(bgColor).Padding(10).Column(b =>
            {
                b.Item().Text(title).Bold().FontSize(PdfBrandTheme.FontBody).FontColor(titleColor);
                b.Item().PaddingTop(4).Text(body).FontSize(PdfBrandTheme.FontCaption + 1).FontColor(bodyColor);
            });
        });
    }

    /// <summary>Convenience: inline Ja/Nee text with brand colour.</summary>
    public static string JaNee(bool value) => value ? "Ja" : "Nee";

    // ── Cover page ────────────────────────────────────────────────────────

    /// <summary>
    /// Renders a fully branded cover page. The page uses zero margins so the
    /// teal header band can span edge-to-edge, with internal padding applied
    /// inside each zone.
    /// </summary>
    public static void RenderCoverPage(
        IDocumentContainer container,
        string documentTitle,
        string? ownerName = null,
        string? subtitle = null,
        string? disclaimer = null)
    {
        var logoBytes = GetLogoBytes();

        container.Page(page =>
        {
            page.Size(PdfBrandTheme.PageSize);
            page.Margin(0); // full-bleed: we handle all padding internally
            page.Background().Background(PdfBrandTheme.Background);
            page.DefaultTextStyle(x => x.FontFamily(PdfBrandTheme.FontFamily));

            page.Content().Column(col =>
            {
                // ── Brand header band ─────────────────────────────────────
                col.Item().Background(PdfBrandTheme.Primary).Padding(28).Row(row =>
                {
                    // Logo
                    row.AutoItem().AlignMiddle().PaddingRight(14).Element(img =>
                    {
                        if (logoBytes.Length > 0)
                            img.Width(48).Height(48).Image(logoBytes).FitArea();
                        else
                            img.Width(48).Height(48)
                                .Background(PdfBrandTheme.Card).CornerRadius(10)
                                .AlignCenter().AlignMiddle()
                                .Text("L").FontSize(28).Bold().FontColor(PdfBrandTheme.Primary);
                    });

                    // Brand name + tagline (white on teal)
                    row.RelativeItem().AlignMiddle().Column(brand =>
                    {
                        brand.Item().Text("Lumio")
                            .FontSize(26).Bold().FontColor(PdfBrandTheme.Card);
                        brand.Item().Text("Digitale Nalatenschap")
                            .FontSize(PdfBrandTheme.FontBody + 1).FontColor("#A5C2C9");
                    });
                });

                // ── Thin accent stripe below header ───────────────────────
                col.Item().Height(4).Background(PdfBrandTheme.PrimaryMid);

                // ── Main content area ─────────────────────────────────────
                col.Item().PaddingHorizontal(50).PaddingTop(50).Column(main =>
                {
                    main.Spacing(0);

                    // Document title
                    main.Item().AlignCenter()
                        .Text(documentTitle)
                        .FontSize(PdfBrandTheme.FontCover).Bold().FontColor(PdfBrandTheme.Primary);

                    // Optional subtitle (e.g. "Concept — niet rechtsgeldig")
                    if (!string.IsNullOrWhiteSpace(subtitle))
                    {
                        main.Item().PaddingTop(6).AlignCenter()
                            .Text(subtitle)
                            .FontSize(PdfBrandTheme.FontBody + 2).Italic().FontColor(PdfBrandTheme.Warning);
                    }

                    // Divider below title
                    main.Item().PaddingTop(16).PaddingHorizontal(60)
                        .LineHorizontal(1.5f).LineColor(PdfBrandTheme.PrimaryMid);

                    // Owner + date card
                    main.Item().PaddingTop(28).Row(ownerRow =>
                    {
                        ownerRow.RelativeItem();
                        ownerRow.ConstantItem(280).Row(cardRow =>
                        {
                            // Left accent border
                            cardRow.ConstantItem(4).Background(PdfBrandTheme.PrimaryMid);
                            cardRow.RelativeItem()
                                .Background(PdfBrandTheme.Card)
                                .Border(1).BorderColor(PdfBrandTheme.Border)
                                .PaddingHorizontal(16).PaddingVertical(14)
                                .Column(card =>
                                {
                                    if (!string.IsNullOrWhiteSpace(ownerName))
                                    {
                                        card.Item().Text(t =>
                                        {
                                            t.Span("Opgesteld voor  ")
                                                .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                                            t.Span(ownerName)
                                                .FontSize(PdfBrandTheme.FontBody).Bold().FontColor(PdfBrandTheme.TextPrimary);
                                        });
                                        card.Item().PaddingTop(5).LineHorizontal(0.5f).LineColor(PdfBrandTheme.Border);
                                    }
                                    card.Item().PaddingTop(ownerName != null ? 5 : 0).Text(t =>
                                    {
                                        t.Span("Gegenereerd op  ")
                                            .FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                                        t.Span(DateTime.Now.ToString("dd-MM-yyyy HH:mm"))
                                            .FontSize(PdfBrandTheme.FontBody).Bold().FontColor(PdfBrandTheme.TextPrimary);
                                    });
                                });
                        });
                        ownerRow.RelativeItem();
                    });
                });

                // ── Bottom disclaimer band ────────────────────────────────
                col.Item().Height(60); // spacer before disclaimer
                col.Item().Background(PdfBrandTheme.PrimaryLight)
                    .PaddingHorizontal(50).PaddingVertical(14)
                    .AlignCenter()
                    .Text(disclaimer ?? "Vertrouwelijk — uitsluitend bestemd voor bevoegde personen")
                    .FontSize(PdfBrandTheme.FontCaption + 1).Italic().FontColor(PdfBrandTheme.PrimaryMid);
            });
        });
    }

    // ── Convenience: add a standard content page ─────────────────────────

    /// <summary>
    /// Adds a single branded page with header, scrollable content and footer.
    /// </summary>
    public static void AddPage(
        IDocumentContainer container,
        string title,
        Action<ColumnDescriptor> content,
        string? footerDisclaimer = null)
    {
        container.Page(page =>
        {
            ConfigurePage(page);
            page.Header().Element(c => RenderHeader(c, title));
            page.Content().Background(PdfBrandTheme.Background).Column(col =>
            {
                col.Spacing(PdfBrandTheme.ContentSpacing);
                content(col);
            });
            if (footerDisclaimer != null)
                page.Footer().Element(c => RenderFooterWithDisclaimer(c, footerDisclaimer));
            else
                page.Footer().Element(RenderFooter);
        });
    }
}

