using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

public class NoodkaartGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public NoodkaartGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var eigenaar = data.Eigenaar;
        var noodcontacten = data.Noodcontacten;
        var testament = data.Testament;
        var uitvaart = data.Uitvaart;
        var verzekeringen = data.Verzekeringen;
        var laatstBijgewerkt = eigenaar?.GewijzigdOp ?? DateTime.MinValue;
        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim()
            : null;
        PdfComponents.RenderCoverPage(container, "Noodkaart", eigenaarNaam);
        container.Page(page =>
        {
            PdfComponents.ConfigurePage(page);
            page.Header().Element(c => PdfComponents.RenderHeader(c, L["Page_Noodkaart"].Value, laatstBijgewerkt));
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.SectionSpacing);

                // Disclaimer banner
                PdfComponents.InfoBlock(col,
                    L["Text_NoodkaartDisclaimer"].Value,
                    PdfBrandTheme.InfoLight, PdfBrandTheme.Info);

                // Persoonlijke gegevens
                if (eigenaar != null)
                    PdfComponents.Section(col, L["Section_PersoonlijkeGegevens"].Value, t =>
                    {
                        PdfComponents.Row(t, L["Label_Naam"].Value,
                            $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim());
                        PdfComponents.Row(t, L["Label_Geboortedatum"].Value, eigenaar.Geboortedatum.ToString("dd-MM-yyyy"));
                        if (!string.IsNullOrEmpty(eigenaar.BSN))
                            PdfComponents.Row(t, L["Label_BSN"].Value, eigenaar.BSN);
                        if (!string.IsNullOrEmpty(eigenaar.Adres))
                            PdfComponents.Row(t, L["Label_Adres"].Value,
                                $"{eigenaar.Adres}, {eigenaar.Postcode} {eigenaar.Woonplaats}");
                        if (!string.IsNullOrEmpty(eigenaar.Telefoon))
                            PdfComponents.Row(t, L["Label_Telefoon"].Value, eigenaar.Telefoon);
                        if (!string.IsNullOrEmpty(eigenaar.Email))
                            PdfComponents.Row(t, L["Label_EMail"].Value, eigenaar.Email);
                    });

                // Noodcontacten
                if (noodcontacten.Count > 0)
                    PdfComponents.Section(col, L["Section_Noodcontacten"].Value, t =>
                    {
                        foreach (var nc in noodcontacten)
                        {
                            var details = new List<string> { nc.Relatie };
                            if (!string.IsNullOrEmpty(nc.Telefoon)) details.Add(nc.Telefoon);
                            if (!string.IsNullOrEmpty(nc.Email)) details.Add(nc.Email);
                            PdfComponents.Row(t, $"{nc.Naam} ({nc.Rol})", string.Join(" — ", details));
                            if (!string.IsNullOrEmpty(nc.Instructies))
                                t.Item().PaddingLeft(PdfBrandTheme.LabelColumnWidth)
                                    .Text(nc.Instructies).Italic()
                                    .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                        }
                    });

                // Testament & notaris
                PdfComponents.Section(col, L["Section_TestamentEnNotaris"].Value, t =>
                {
                    if (testament != null)
                    {
                        PdfComponents.Row(t, L["Label_TypeTestament"].Value, testament.TestamentType ?? "—");
                        PdfComponents.Row(t, L["Label_Bewaarlocatie"].Value, testament.TestamentLocatie ?? "—");
                        PdfComponents.Row(t, L["Label_Notaris"].Value, testament.NotarisNaam ?? eigenaar?.Notaris ?? "—");
                        PdfComponents.Row(t, L["Label_Notariskantoor"].Value, testament.NotarisKantoor ?? eigenaar?.NotarisKantoor ?? "—");
                        if (!string.IsNullOrEmpty(testament.CTR_Nummer))
                            PdfComponents.Row(t, L["Label_CTRNummer"].Value, testament.CTR_Nummer);
                    }
                    else
                    {
                        PdfComponents.Row(t, L["Label_Notaris"].Value, eigenaar?.Notaris ?? L["Value_NietIngevuld"].Value);
                        PdfComponents.Row(t, L["Label_Notariskantoor"].Value, eigenaar?.NotarisKantoor ?? L["Value_NietIngevuld"].Value);
                    }
                });

                // Uitvaart
                if (uitvaart != null)
                    PdfComponents.Section(col, L["Section_Uitvaart"].Value, t =>
                    {
                        PdfComponents.Row(t, L["Label_Voorkeur"].Value, uitvaart.VoorkeurType ?? "—");
                        PdfComponents.Row(t, L["Label_Uitvaartondernemer"].Value,
                            uitvaart.UitvaartOndernemer ?? L["Value_NietIngevuld"].Value);
                    });

                // Verzekeringen
                if (verzekeringen.Count > 0)
                    PdfComponents.Section(col, L["Section_Verzekeringen"].Value, t =>
                    {
                        foreach (var v in verzekeringen)
                            PdfComponents.Row(t,
                                $"{v.Verzekeraar} ({v.Type})",
                                string.Format(L["Text_PolisPrefix"].Value, v.PolisNummer));
                    });
            });
            page.Footer().Element(PdfComponents.RenderFooter);
        });
    }
}
