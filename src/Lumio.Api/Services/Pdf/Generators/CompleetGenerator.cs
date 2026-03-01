using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

/// <summary>
/// Generates the complete multi-section "all sections" PDF dossier.
/// Delegates to individual generators for full data parity with single-document exports.
/// </summary>
public class CompleetGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    private readonly TestamentGenerator _testament;
    private readonly EuthanasieGenerator _euthanasie;
    private readonly DonorGenerator _donor;
    private readonly DigitaalBezitGenerator _digitaalBezit;
    private readonly BoedelGenerator _boedel;
    private readonly UitvaartGenerator _uitvaart;
    private readonly DocumentenGenerator _documenten;
    private readonly NoodkaartGenerator _noodkaart;
    private readonly NoodprocedureGenerator _noodprocedure;

    public CompleetGenerator(
        IStringLocalizer<LumioPdfService> localizer,
        TestamentGenerator testament,
        EuthanasieGenerator euthanasie,
        DonorGenerator donor,
        DigitaalBezitGenerator digitaalBezit,
        BoedelGenerator boedel,
        UitvaartGenerator uitvaart,
        DocumentenGenerator documenten,
        NoodkaartGenerator noodkaart,
        NoodprocedureGenerator noodprocedure)
    {
        L = localizer;
        _testament = testament;
        _euthanasie = euthanasie;
        _donor = donor;
        _digitaalBezit = digitaalBezit;
        _boedel = boedel;
        _uitvaart = uitvaart;
        _documenten = documenten;
        _noodkaart = noodkaart;
        _noodprocedure = noodprocedure;
    }

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var eigenaar = data.Eigenaar;
        var eigenaarNaam = eigenaar != null
            ? $"{eigenaar.Voornaam} {eigenaar.Tussenvoegsel} {eigenaar.Achternaam}".Trim()
            : null;

        // ── Cover ──────────────────────────────────────────────────────────────
        PdfComponents.RenderCoverPage(container, L["CoverTitle_CompleetDossier"].Value, eigenaarNaam);

        // ── Erfgenamen overzicht (lijst — geen aparte generator) ───────────────
        if (data.Erfgenamen.Count > 0)
            PdfComponents.AddPage(container, L["Page_Erfgenamen"].Value, col =>
            {
                PdfComponents.Section(col, L["Section_Erfgenamen"].Value, t =>
                {
                    foreach (var e in data.Erfgenamen)
                        PdfComponents.Row(t,
                            $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}".Trim(),
                            e.Relatie);
                });
            });

        // ── Delegate to individual generators (complete data parity) ───────────
        if (data.Testament != null || data.Begunstigden.Count > 0 || data.Executeurs.Count > 0)
            _testament.AddPages(container, data);

        if (data.Wilsverklaring != null)
            _euthanasie.AddPages(container, data);

        if (data.Donor != null)
            _donor.AddPages(container, data);

        if (data.DigitaleAccounts.Count > 0 || data.CryptoWallets.Count > 0 || data.Wachtwoorden.Count > 0)
            _digitaalBezit.AddPages(container, data);

        if (data.FysiekeBezittingen.Count > 0 || data.Bankrekeningen.Count > 0
            || data.Verzekeringen.Count > 0 || data.Schulden.Count > 0)
            _boedel.AddPages(container, data);

        if (data.Uitvaart != null)
            _uitvaart.AddPages(container, data);

        if (data.Documenten.Count > 0)
            _documenten.AddPages(container, data);

        _noodkaart.AddPages(container, data);
        _noodprocedure.AddPages(container, data);
    }
}

