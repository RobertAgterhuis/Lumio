using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Components;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Theme;
using Microsoft.Extensions.Localization;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

/// <summary>
/// Notaris dossier template — branded but retains the wide left margin
/// for handwritten annotations (uses PdfBrandTheme.MarginNotaris).
/// </summary>
public class NotarisGenerator : IPdfPageGenerator
{
    private readonly IStringLocalizer<LumioPdfService> L;
    public NotarisGenerator(IStringLocalizer<LumioPdfService> localizer) => L = localizer;

    public void AddPages(IDocumentContainer container, PdfDataContext data)
    {
        var eigenaar = data.Eigenaar;
        var testament = data.Testament;
        var begunstigden = data.Begunstigden.OrderBy(b => b.Naam).ToList();
        var executeurs = data.Executeurs.OrderBy(e => e.Naam).ToList();
        var erfgenamen = data.Erfgenamen;
        var noodcontacten = data.Noodcontacten;
        var nu = DateTime.Now;

        var naam = eigenaar != null
            ? $"{eigenaar.Voornaam} {(string.IsNullOrWhiteSpace(eigenaar.Tussenvoegsel) ? "" : eigenaar.Tussenvoegsel + " ")}{eigenaar.Achternaam}"
            : L["Value_Onbekend"].Value;

        PdfComponents.RenderCoverPage(container, "NOTARIEEL DOSSIER", naam);

        container.Page(page =>
        {
            page.Size(PdfBrandTheme.PageSize);
            page.MarginTop(30);
            page.MarginBottom(30);
            page.MarginLeft(PdfBrandTheme.MarginNotaris); // extra wide for annotations
            page.MarginRight(PdfBrandTheme.MarginDefault);
            page.Background().Background(PdfBrandTheme.Background);
            page.DefaultTextStyle(x => x
                .FontFamily(PdfBrandTheme.FontFamily)
                .FontSize(PdfBrandTheme.FontBody + 1)
                .FontColor(PdfBrandTheme.TextPrimary));

            // ── Header ────────────────────────────────────────────────────
            page.Header().Column(col =>
            {
                col.Item().Row(row =>
                {
                    row.RelativeItem().Column(left =>
                    {
                        left.Item().Text(L["Page_NotarieelDossier"].Value)
                            .FontSize(PdfBrandTheme.FontSection + 2).Bold().FontColor(PdfBrandTheme.Primary);
                        left.Item().PaddingTop(3)
                            .Text(L["Header_LumioDigitaleNalatenschap"].Value)
                            .FontSize(PdfBrandTheme.FontCaption + 1).FontColor(PdfBrandTheme.TextMuted);
                    });
                    row.ConstantItem(200).AlignRight().Column(right =>
                    {
                        right.Item().Text($"{L["Label_Datum"].Value}: {nu:dd-MM-yyyy}").FontSize(PdfBrandTheme.FontCaption + 1);
                        right.Item().Text(string.Format(L["Header_Tijdstip"].Value, nu.ToString("HH:mm")))
                            .FontSize(PdfBrandTheme.FontCaption + 1);
                    });
                });
                col.Item().PaddingTop(5).LineHorizontal(1f).LineColor(PdfBrandTheme.Primary);

                // Reference block
                col.Item().PaddingTop(10)
                    .Background(PdfBrandTheme.Card).Border(0.5f).BorderColor(PdfBrandTheme.Border).Padding(8)
                    .Column(ref_ =>
                    {
                        ref_.Item().Text(L["Header_Referentiegegevens"].Value)
                            .FontSize(PdfBrandTheme.FontCaption + 1).Bold().FontColor(PdfBrandTheme.PrimaryMid);
                        void RefRow(string label, string value) => ref_.Item().PaddingTop(2).Row(row =>
                        {
                            row.ConstantItem(120).Text(label).FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                            row.RelativeItem().Text(value).FontSize(PdfBrandTheme.FontBody);
                        });
                        RefRow(L["Label_Dossiernaam"].Value + ":", string.Format(L["Header_NalatenschapPrefix"].Value, naam));
                        RefRow(L["Label_ErflaterColon"].Value, naam);
                        if (eigenaar?.Geboortedatum != default)
                            RefRow(L["Label_Geboortedatum"].Value + ":", eigenaar!.Geboortedatum.ToString("dd-MM-yyyy"));
                        if (!string.IsNullOrWhiteSpace(eigenaar?.BSN))
                            RefRow(L["Label_BSN"].Value + ":", eigenaar!.BSN);
                        if (!string.IsNullOrWhiteSpace(eigenaar?.Woonplaats))
                            RefRow(L["Label_Woonplaats"].Value + ":", eigenaar!.Woonplaats);
                        RefRow(L["Label_Dossiernummer"].Value + ":", "________________________________");
                    });

                col.Item().PaddingBottom(10);
            });

            // ── Content ───────────────────────────────────────────────────
            page.Content().Column(col =>
            {
                col.Spacing(PdfBrandTheme.SectionSpacing);

                // 1. Testament
                if (testament != null)
                    PdfComponents.Section(col, L["Section_1TestamentaireGegevens"].Value, t =>
                    {
                        PdfComponents.Row(t, L["Label_TypeTestament"].Value, testament.TestamentType ?? L["Value_NietOpgegeven"].Value);
                        PdfComponents.Row(t, L["Label_DatumTestament"].Value, testament.DatumTestament?.ToString("dd-MM-yyyy") ?? "—");
                        PdfComponents.Row(t, L["Label_CTRNummer"].Value, testament.CTR_Nummer ?? "—");
                        PdfComponents.Row(t, L["Label_LocatieColon"].Value, testament.TestamentLocatie ?? "—");
                        PdfComponents.Row(t, L["Label_Notaris"].Value, testament.NotarisContact?.Naam ?? "—");
                        PdfComponents.Row(t, L["Label_Kantoor"].Value, testament.NotarisContact?.BedrijfsNaam ?? "—");
                        PdfComponents.Row(t, L["Label_Uitsluitingsclausule"].Value,
                            testament.UitsluitingsClausule == true ? L["Value_Ja"].Value :
                            testament.UitsluitingsClausule == false ? L["Value_Nee"].Value : "—");
                        if (!string.IsNullOrWhiteSpace(testament.AlgemeneWensen))
                            PdfComponents.Row(t, L["Label_AlgemeneWensen"].Value, testament.AlgemeneWensen);
                        if (!string.IsNullOrWhiteSpace(testament.BijzondereBepalingen))
                            PdfComponents.Row(t, L["Label_BijzondereBepalingen"].Value, testament.BijzondereBepalingen);
                        if (!string.IsNullOrWhiteSpace(testament.Legaten))
                            PdfComponents.Row(t, L["Label_Legaten"].Value, testament.Legaten);

                        // Annotation space
                        t.Item().PaddingTop(5).Text(L["Label_AantekeningenNotaris"].Value)
                            .FontSize(PdfBrandTheme.FontCaption + 1).Italic().FontColor(PdfBrandTheme.TextMuted);
                        t.Item().PaddingTop(3).MinHeight(40)
                            .Background(PdfBrandTheme.Card).Border(0.3f).BorderColor(PdfBrandTheme.Border)
                            .Padding(5).Text(" ").FontSize(PdfBrandTheme.FontCaption + 1);
                    });

                // 2. Erfgenamen
                if (erfgenamen.Count > 0)
                    PdfComponents.Section(col, L["Section_N2Erfgenamen"].Value, t =>
                    {
                        foreach (var e in erfgenamen)
                        {
                            var volleNaam = string.IsNullOrWhiteSpace(e.Tussenvoegsel)
                                ? $"{e.Voornaam} {e.Achternaam}"
                                : $"{e.Voornaam} {e.Tussenvoegsel} {e.Achternaam}";
                            t.Item().PaddingTop(2).Row(row =>
                            {
                                row.ConstantItem(150).Text(volleNaam).FontSize(PdfBrandTheme.FontBody);
                                row.ConstantItem(100).Text(e.Relatie).FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                                row.RelativeItem().Text(e.Telefoon ?? "").FontSize(PdfBrandTheme.FontBody);
                            });
                        }
                    });

                // 3. Begunstigden
                if (begunstigden.Count > 0)
                    PdfComponents.Section(col, L["Section_3Begunstigden"].Value, t =>
                    {
                        foreach (var b in begunstigden)
                            t.Item().PaddingTop(2).Row(row =>
                            {
                                row.ConstantItem(150).Text(b.Naam).FontSize(PdfBrandTheme.FontBody);
                                row.ConstantItem(100).Text(b.Relatie).FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                                row.RelativeItem().Text(b.Percentage.HasValue ? $"{b.Percentage}%" : "—").FontSize(PdfBrandTheme.FontBody);
                            });
                    });

                // 4. Executeurs
                if (executeurs.Count > 0)
                    PdfComponents.Section(col, L["Section_4Executeurs"].Value, t =>
                    {
                        foreach (var ex in executeurs)
                            t.Item().PaddingTop(2).Row(row =>
                            {
                                row.ConstantItem(150).Text(ex.Naam).FontSize(PdfBrandTheme.FontBody);
                                row.ConstantItem(100).Text(ex.Relatie ?? "").FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                                row.RelativeItem().Text(ex.Bevoegdheden ?? "—").FontSize(PdfBrandTheme.FontBody);
                            });
                    });

                // 5. Noodcontacten
                if (noodcontacten.Count > 0)
                    PdfComponents.Section(col, L["Section_5Contactpersonen"].Value, t =>
                    {
                        foreach (var n in noodcontacten)
                            t.Item().PaddingTop(2).Row(row =>
                            {
                                row.ConstantItem(120).Text(n.Naam).FontSize(PdfBrandTheme.FontBody);
                                row.ConstantItem(80).Text(n.Rol).FontSize(PdfBrandTheme.FontBody).FontColor(PdfBrandTheme.TextMuted);
                                row.ConstantItem(100).Text(n.Telefoon ?? "").FontSize(PdfBrandTheme.FontBody);
                                row.RelativeItem().Text(n.Email ?? "").FontSize(PdfBrandTheme.FontBody);
                            });
                    });

                // Signing block
                col.Item().PaddingTop(30).Column(sig =>
                {
                    sig.Item().Text(L["Signing_Ondertekening"].Value)
                        .FontSize(PdfBrandTheme.FontBody + 2).Bold().FontColor(PdfBrandTheme.Primary);
                    sig.Item().PaddingTop(5).LineHorizontal(0.3f).LineColor(PdfBrandTheme.Border);

                    void SignatureBlock(string label)
                    {
                        sig.Item().PaddingTop(15).Text(label).FontSize(PdfBrandTheme.FontBody).SemiBold();
                        sig.Item().PaddingTop(5).Row(row =>
                        {
                            row.ConstantItem(250).Text(L["Signing_Naam"].Value).FontSize(PdfBrandTheme.FontBody);
                            row.RelativeItem().Text(L["Signing_Datum"].Value).FontSize(PdfBrandTheme.FontBody);
                        });
                        sig.Item().PaddingTop(5).Text(L["Signing_Handtekening"].Value).FontSize(PdfBrandTheme.FontBody);
                    }

                    SignatureBlock(L["Signing_ErflaterTestateur"].Value);
                    SignatureBlock(L["Signing_Notaris"].Value);
                    sig.Item().PaddingTop(5).Text(L["Signing_StempelKantoor"].Value).FontSize(PdfBrandTheme.FontBody);
                    SignatureBlock(L["Signing_Getuige1"].Value);
                    SignatureBlock(L["Signing_Getuige2"].Value);
                });
            });

            // ── Footer ────────────────────────────────────────────────────
            page.Footer().Column(col =>
            {
                col.Item().LineHorizontal(0.5f).LineColor(PdfBrandTheme.Primary);
                col.Item().PaddingTop(3)
                    .Text(L["Legal_NotarisWerkdocument"].Value)
                    .FontSize(PdfBrandTheme.FontCaption).Italic().FontColor(PdfBrandTheme.TextMuted);
                col.Item().PaddingTop(3).Row(row =>
                {
                    row.RelativeItem().Text(t =>
                    {
                        t.Span(L["Footer_GegenereerOp"].Value).FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);
                        t.Span(nu.ToString("dd-MM-yyyy HH:mm")).FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);
                    });
                    row.RelativeItem().AlignRight().Text(t =>
                    {
                        t.Span(L["Footer_Pagina"].Value).FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);
                        t.CurrentPageNumber().FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);
                        t.Span(L["Footer_Slash"].Value).FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);
                        t.TotalPages().FontSize(PdfBrandTheme.FontCaption).FontColor(PdfBrandTheme.TextMuted);
                    });
                });
            });
        });
    }
}
