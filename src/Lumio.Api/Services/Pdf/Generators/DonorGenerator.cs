using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

public class DonorGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public DonorGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var donor = data.Donor;
        var eigenaar = data.Eigenaar;
        var laatstBijgewerkt = donor?.GewijzigdOp ?? eigenaar?.GewijzigdOp ?? DateTime.MinValue;
        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim()
            : null;
        PdfComponents.RenderCoverPage(container, "Donorregistratie", eigenaarNaam);
        container.Page(page =>
        {
            PdfComponents.ConfigurePage(page);
            page.Header().Element(c => PdfComponents.RenderHeader(c, L["Page_Donorregistratie"].Value, laatstBijgewerkt));
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.ContentSpacing);

                if (donor != null)
                    PdfComponents.Section(col, L["Section_Registratie"].Value, t =>
                    {
                        PdfComponents.Row(t, L["Label_Keuze"].Value, donor.Keuze);
                        PdfComponents.Row(t, L["Label_Donorregister"].Value,
                            donor.IsGeregistreerdBijDonorregister ? L["Value_Ja"].Value : L["Value_Nee"].Value);
                        if (!string.IsNullOrEmpty(donor.DonorregisterReferentie))
                            PdfComponents.Row(t, L["Label_Referentie"].Value, donor.DonorregisterReferentie);
                        if (!string.IsNullOrEmpty(donor.Toelichting))
                            PdfComponents.Row(t, L["Label_Toelichting"].Value, donor.Toelichting);
                    });

                if (data.OrgaanKeuzes.Count > 0)
                    PdfComponents.Section(col, L["Section_Orgaankeuzes"].Value, t =>
                    {
                        foreach (var o in data.OrgaanKeuzes)
                            PdfComponents.Row(t, o.Orgaan, o.WelDoneren ? L["Value_Ja"].Value : L["Value_Nee"].Value);
                    });

                if (!string.IsNullOrEmpty(donor?.BeslisserNaam))
                    PdfComponents.Section(col, L["Section_Beslisser"].Value, t =>
                    {
                        PdfComponents.Row(t, L["Label_Naam"].Value, donor!.BeslisserNaam!);
                        if (!string.IsNullOrEmpty(donor.BeslisserRelatie))
                            PdfComponents.Row(t, L["Label_Relatie"].Value, donor.BeslisserRelatie);
                        if (!string.IsNullOrEmpty(donor.BeslisserTelefoon))
                            PdfComponents.Row(t, L["Label_Telefoon"].Value, donor.BeslisserTelefoon);
                    });
            });
            page.Footer().Element(PdfComponents.RenderFooter);
        });
    }
}
