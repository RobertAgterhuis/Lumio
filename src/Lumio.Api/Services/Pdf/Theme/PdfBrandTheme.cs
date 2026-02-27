using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Theme;

/// <summary>
/// Single source of truth for all Lumio brand tokens used in PDF generation.
/// Mirrors the CSS design tokens defined in lumio-web/src/app/globals.css.
/// </summary>
public static class PdfBrandTheme
{
    // ── Colours ──────────────────────────────────────────────────────────
    public const string Primary      = "#355E68";   // teal-dark — titles
    public const string PrimaryMid   = "#4F7A83";   // teal-mid  — section heads
    public const string PrimaryLight = "#E6EFF1";   // teal-100  — subtle backgrounds
    public const string Background   = "#F3F7F8";   // page background (= login screen)
    public const string Card         = "#FFFFFF";   // card / content area
    public const string TextPrimary  = "#1F2933";   // body text
    public const string TextMuted    = "#6B7280";   // labels / captions
    public const string Border       = "#E5E7EB";   // rules / dividers
    public const string Sage         = "#6B8E7A";   // accent — nature / calm
    public const string SageLight    = "#E8F0EB";   // sage-100
    public const string Success      = "#5E8C61";   // Ja / groen
    public const string SuccessLight = "#E8F5E9";   // success-100
    public const string Danger       = "#B44A4A";   // Nee / rood / destructive
    public const string DangerLight  = "#FDE8E8";   // danger-100
    public const string Warning      = "#D4A017";   // oranje — concept
    public const string WarningLight = "#FFF8E1";   // warning-100
    public const string Info         = "#3A506B";   // info blauw
    public const string InfoLight    = "#E3EDF5";   // info-100

    // ── Font family ───────────────────────────────────────────────────────
    /// <summary>Registered font family name — must match FontManager.RegisterFont call in Program.cs.</summary>
    public const string FontFamily = "DM Sans";

    // ── Font sizes (pt) ───────────────────────────────────────────────────
    public const float FontCover   = 28f;   // cover page document title
    public const float FontTitle   = 20f;   // used on cover for subtitle
    public const float FontName    = 14f;   // used on cover for owner name
    public const float FontHeading = 18f;   // page-level heading (H1)
    public const float FontSection = 12f;   // section-level heading
    public const float FontBody    =  9f;   // default body text
    public const float FontCaption =  7f;   // footer / meta

    // ── Page layout ───────────────────────────────────────────────────────
    public static readonly PageSize PageSize = PageSizes.A4;
    public const float MarginDefault   = 40f;
    public const float MarginNotaris   = 60f;   // extra left margin for notaris pdf
    public const float ContentSpacing  = 10f;
    public const float SectionSpacing  =  8f;
    public const float LabelColumnWidth = 150f;
}
