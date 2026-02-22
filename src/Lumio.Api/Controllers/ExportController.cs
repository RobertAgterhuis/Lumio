using Lumio.Api.Services.Pdf;
using Lumio.Api.Data;
using Lumio.Api.Dtos.Export;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO.Compression;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Xml.Serialization;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private readonly ILumioPdfService _pdfService;
    private readonly LumioDbContext _db;

    public ExportController(ILumioPdfService pdfService, LumioDbContext db)
    {
        _pdfService = pdfService;
        _db = db;
    }

    [HttpPost("testament")]
    public async Task<IActionResult> ExportTestament()
    {
        var pdf = await _pdfService.GenerateTestamentPdf();
        return File(pdf, "application/pdf", "lumio-testament.pdf");
    }

    [HttpPost("euthanasie")]
    public async Task<IActionResult> ExportEuthanasie()
    {
        var pdf = await _pdfService.GenerateEuthanasiePdf();
        return File(pdf, "application/pdf", "lumio-euthanasie.pdf");
    }

    [HttpPost("donor")]
    public async Task<IActionResult> ExportDonor()
    {
        var pdf = await _pdfService.GenerateDonorPdf();
        return File(pdf, "application/pdf", "lumio-donor.pdf");
    }

    [HttpPost("digitaal-bezit")]
    public async Task<IActionResult> ExportDigitaalBezit()
    {
        var pdf = await _pdfService.GenerateDigitaalBezitPdf();
        return File(pdf, "application/pdf", "lumio-digitaal-bezit.pdf");
    }

    [HttpPost("boedel")]
    public async Task<IActionResult> ExportBoedel()
    {
        var pdf = await _pdfService.GenerateBoedelPdf();
        return File(pdf, "application/pdf", "lumio-boedel.pdf");
    }

    [HttpPost("uitvaart")]
    public async Task<IActionResult> ExportUitvaart()
    {
        var pdf = await _pdfService.GenerateUitvaartPdf();
        return File(pdf, "application/pdf", "lumio-uitvaart.pdf");
    }

    [HttpPost("documenten")]
    public async Task<IActionResult> ExportDocumenten()
    {
        var pdf = await _pdfService.GenerateDocumentenOverzichtPdf();
        return File(pdf, "application/pdf", "lumio-documenten.pdf");
    }

    [HttpPost("compleet")]
    public async Task<IActionResult> ExportCompleet()
    {
        var pdf = await _pdfService.GenerateCompleetPdf();
        return File(pdf, "application/pdf", "lumio-compleet.pdf");
    }

    [HttpPost("noodkaart")]
    public async Task<IActionResult> ExportNoodkaart()
    {
        var pdf = await _pdfService.GenerateNoodkaartPdf();
        return File(pdf, "application/pdf", "lumio-noodkaart.pdf");
    }

    [HttpPost("testament-concept")]
    public async Task<IActionResult> ExportTestamentConcept()
    {
        var pdf = await _pdfService.GenerateTestamentConceptPdf();
        return File(pdf, "application/pdf", "lumio-testament-concept.pdf");
    }

    [HttpPost("wilsverklaring")]
    public async Task<IActionResult> ExportWilsverklaring()
    {
        var pdf = await _pdfService.GenerateWilsverklaringPdf();
        return File(pdf, "application/pdf", "lumio-wilsverklaring.pdf");
    }

    [HttpPost("noodprocedure")]
    public async Task<IActionResult> ExportNoodprocedure()
    {
        var pdf = await _pdfService.GenerateNoodprocedurePdf();
        return File(pdf, "application/pdf", "lumio-noodprocedure.pdf");
    }

    [HttpPost("boedelbeschrijving")]
    public async Task<IActionResult> ExportBoedelbeschrijving()
    {
        var pdf = await _pdfService.GenerateBoedelbeschrijvingPdf();
        return File(pdf, "application/pdf", "lumio-boedelbeschrijving.pdf");
    }

    [HttpPost("executeur-rapport")]
    public async Task<IActionResult> ExportExecuteurRapport()
    {
        var pdf = await _pdfService.GenerateExecuteurRapportPdf();
        return File(pdf, "application/pdf", "lumio-executeur-rapport.pdf");
    }

    [HttpPost("erfgenaam/{erfgenaamId:guid}")]
    public async Task<IActionResult> ExportErfgenaam(Guid erfgenaamId)
    {
        var erfgenaam = await _db.Erfgenamen.FindAsync(erfgenaamId);
        if (erfgenaam is null)
            return NotFound(new { error = "Erfgenaam niet gevonden." });

        var pdf = await _pdfService.GenerateErfgenaamPdf(erfgenaamId);
        var veiligNaam = erfgenaam.Voornaam.ToLowerInvariant().Replace(" ", "-");
        return File(pdf, "application/pdf", $"lumio-erfgenaam-{veiligNaam}.pdf");
    }

    [HttpPost("alles")]
    public async Task<IActionResult> ExportAlles()
    {
        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, leaveOpen: true))
        {
            // Generate all PDFs
            var pdfTasks = new (string naam, Func<Task<byte[]>> generator)[]
            {
                ("pdf/lumio-compleet.pdf", _pdfService.GenerateCompleetPdf),
                ("pdf/lumio-testament.pdf", _pdfService.GenerateTestamentPdf),
                ("pdf/lumio-euthanasie.pdf", _pdfService.GenerateEuthanasiePdf),
                ("pdf/lumio-donor.pdf", _pdfService.GenerateDonorPdf),
                ("pdf/lumio-digitaal-bezit.pdf", _pdfService.GenerateDigitaalBezitPdf),
                ("pdf/lumio-boedel.pdf", _pdfService.GenerateBoedelPdf),
                ("pdf/lumio-uitvaart.pdf", _pdfService.GenerateUitvaartPdf),
                ("pdf/lumio-documenten.pdf", _pdfService.GenerateDocumentenOverzichtPdf),
                ("pdf/lumio-noodkaart.pdf", _pdfService.GenerateNoodkaartPdf),
                ("pdf/lumio-testament-concept.pdf", _pdfService.GenerateTestamentConceptPdf),
                ("pdf/lumio-wilsverklaring.pdf", _pdfService.GenerateWilsverklaringPdf),
                ("pdf/lumio-noodprocedure.pdf", _pdfService.GenerateNoodprocedurePdf),
                ("pdf/lumio-boedelbeschrijving.pdf", _pdfService.GenerateBoedelbeschrijvingPdf),
                ("pdf/lumio-executeur-rapport.pdf", _pdfService.GenerateExecuteurRapportPdf),
            };

            foreach (var (naam, generator) in pdfTasks)
            {
                try
                {
                    var pdfBytes = await generator();
                    var entry = archive.CreateEntry(naam, CompressionLevel.Optimal);
                    using var entryStream = entry.Open();
                    await entryStream.WriteAsync(pdfBytes);
                }
                catch
                {
                    // Skip PDFs that fail (e.g. no data)
                }
            }

            // Add uploaded documents
            var documenten = await _db.Documenten.ToListAsync();
            foreach (var doc in documenten)
            {
                if (doc.BestandsInhoud is not { Length: > 0 }) continue;

                var veiligNaam = string.Join("_", doc.BestandsNaam.Split(Path.GetInvalidFileNameChars()));
                var entryNaam = $"documenten/{veiligNaam}";

                // Avoid duplicate names
                var counter = 1;
                var basisNaam = Path.GetFileNameWithoutExtension(veiligNaam);
                var extensie = Path.GetExtension(veiligNaam);
                while (archive.GetEntry(entryNaam) != null)
                {
                    entryNaam = $"documenten/{basisNaam}_{counter}{extensie}";
                    counter++;
                }

                var entry = archive.CreateEntry(entryNaam, CompressionLevel.Optimal);
                using var entryStream = entry.Open();
                await entryStream.WriteAsync(doc.BestandsInhoud);
            }

            // Add INHOUD.txt index file
            var sb = new StringBuilder();
            sb.AppendLine("LUMIO — COMPLEET EXPORT-PAKKET");
            sb.AppendLine($"Gegenereerd op: {DateTime.Now:dd-MM-yyyy HH:mm}");
            sb.AppendLine(new string('=', 50));
            sb.AppendLine();
            sb.AppendLine("INHOUD:");
            sb.AppendLine();
            sb.AppendLine("pdf/");
            sb.AppendLine("  Alle PDF-documenten met uw vastgelegde gegevens.");
            sb.AppendLine();
            if (documenten.Count > 0)
            {
                sb.AppendLine("documenten/");
                sb.AppendLine("  Uw geüploade documenten (ID-bewijs, polissen, aktes, etc.).");
                sb.AppendLine($"  Aantal: {documenten.Count}");
                sb.AppendLine();
            }
            sb.AppendLine("INSTRUCTIES:");
            sb.AppendLine("  1. Open de PDF-bestanden in de map 'pdf/' voor een overzicht.");
            sb.AppendLine("  2. Het bestand 'lumio-compleet.pdf' bevat alle informatie in één document.");
            sb.AppendLine("  3. Het bestand 'lumio-noodprocedure.pdf' bevat stappen voor nabestaanden.");
            sb.AppendLine("  4. Bewaar dit pakket op een veilige locatie.");

            var inhoudEntry = archive.CreateEntry("INHOUD.txt", CompressionLevel.Optimal);
            using var inhoudStream = inhoudEntry.Open();
            var inhoudBytes = Encoding.UTF8.GetBytes(sb.ToString());
            await inhoudStream.WriteAsync(inhoudBytes);
        }

        memoryStream.Position = 0;
        return File(memoryStream.ToArray(), "application/zip", $"lumio-export-{DateTime.Now:yyyy-MM-dd}.zip");
    }

    // ── P-M13: Structured export (JSON / XML) ────────────────

    [HttpGet("json")]
    [Produces("application/json")]
    public async Task<ActionResult<LumioExportData>> ExportJson()
    {
        var data = await BuildExportData();
        if (data is null)
            return NotFound(new { error = "Geen eigenaar profiel gevonden." });

        var options = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        var json = JsonSerializer.Serialize(data, options);
        var bytes = Encoding.UTF8.GetBytes(json);
        return File(bytes, "application/json", $"lumio-export-{DateTime.Now:yyyy-MM-dd}.json");
    }

    [HttpGet("xml")]
    [Produces("application/xml")]
    public async Task<IActionResult> ExportXml()
    {
        var data = await BuildExportData();
        if (data is null)
            return NotFound(new { error = "Geen eigenaar profiel gevonden." });

        var serializer = new XmlSerializer(typeof(LumioExportData));
        using var ms = new MemoryStream();
        using var writer = new StreamWriter(ms, Encoding.UTF8);
        serializer.Serialize(writer, data);
        return File(ms.ToArray(), "application/xml", $"lumio-export-{DateTime.Now:yyyy-MM-dd}.xml");
    }

    private async Task<LumioExportData?> BuildExportData()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return null;

        var erfgenamen = await _db.Erfgenamen
            .Where(e => e.EigenaarId == eigenaar.Id).ToListAsync();
        var noodcontacten = await _db.Noodcontacten
            .Where(n => n.EigenaarId == eigenaar.Id).ToListAsync();

        // Testament
        var testament = await _db.Testamenten
            .Include(t => t.Begunstigden).Include(t => t.Executeurs)
            .FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id);

        // Euthanasie
        var wilsverklaring = await _db.Wilsverklaringen
            .Include(w => w.Voorwaarden)
            .FirstOrDefaultAsync(w => w.EigenaarId == eigenaar.Id);

        // Donor
        var donor = await _db.DonorRegistraties
            .Include(d => d.OrgaanKeuzes)
            .FirstOrDefaultAsync(d => d.EigenaarId == eigenaar.Id);

        // Uitvaart
        var uitvaart = await _db.UitvaartWensen
            .Include(u => u.CeremonieDetails)
            .FirstOrDefaultAsync(u => u.EigenaarId == eigenaar.Id);

        // Boedel
        var bezittingen = await _db.FysiekeBezittingen
            .Where(b => b.EigenaarId == eigenaar.Id).ToListAsync();
        var bankrekeningen = await _db.Bankrekeningen
            .Where(b => b.EigenaarId == eigenaar.Id).ToListAsync();
        var verzekeringen = await _db.Verzekeringen
            .Where(v => v.EigenaarId == eigenaar.Id).ToListAsync();
        var schulden = await _db.Schulden
            .Where(s => s.EigenaarId == eigenaar.Id).ToListAsync();

        // Digitale accounts (exclusief wachtwoorden & crypto wallets)
        var digitaleAccounts = await _db.DigitaleAccounts
            .Where(d => d.EigenaarId == eigenaar.Id).ToListAsync();

        // Documenten (metadata only)
        var documenten = await _db.Documenten
            .Where(d => d.EigenaarId == eigenaar.Id)
            .OrderBy(d => d.Categorie).ThenBy(d => d.Naam)
            .ToListAsync();

        return new LumioExportData
        {
            Eigenaar = new EigenaarExport(
                eigenaar.Voornaam, eigenaar.Achternaam, eigenaar.Tussenvoegsel,
                eigenaar.Geboortedatum.ToString("yyyy-MM-dd"),
                eigenaar.BSN, eigenaar.Adres, eigenaar.Postcode, eigenaar.Woonplaats,
                eigenaar.Telefoon, eigenaar.Email,
                eigenaar.Notaris, eigenaar.NotarisKantoor, eigenaar.NotarisTelefoon,
                eigenaar.NotarisEmail, eigenaar.NotarisAdres, eigenaar.NotarisPostcode, eigenaar.NotarisPlaats,
                eigenaar.BurgerlijkeStaat.ToString(), eigenaar.HuwelijksVoorwaarden.ToString(),
                eigenaar.DatumHuwelijk?.ToString("yyyy-MM-dd"),
                eigenaar.LegitimatieSoort.ToString(), eigenaar.LegitimatieNummer,
                eigenaar.LegitimatieDatumAfgifte?.ToString("yyyy-MM-dd"),
                eigenaar.LegitimatieGeldigTot?.ToString("yyyy-MM-dd")),

            Erfgenamen = erfgenamen.Select(e => new ErfgenaamExport(
                e.Voornaam, e.Achternaam, e.Tussenvoegsel, e.Relatie,
                e.Telefoon, e.Email, e.Adres, e.Postcode, e.Woonplaats,
                e.Geboortedatum?.ToString("yyyy-MM-dd"), e.BSN,
                e.LegitimatieSoort.ToString(), e.LegitimatieNummer,
                e.LegitimatieDatumAfgifte?.ToString("yyyy-MM-dd"),
                e.LegitimatieGeldigTot?.ToString("yyyy-MM-dd"))).ToList(),

            Noodcontacten = noodcontacten.Select(n => new NoodcontactExport(
                n.Naam, n.Relatie, n.Rol,
                n.Telefoon, n.Email, n.Adres, n.Postcode, n.Woonplaats, n.Instructies)).ToList(),

            Testament = testament is null ? null : new TestamentExport(
                testament.TestamentType, testament.NotarisNaam, testament.NotarisKantoor,
                testament.DatumTestament?.ToString("yyyy-MM-dd"),
                testament.TestamentLocatie, testament.CTR_Nummer,
                testament.AlgemeneWensen, testament.BijzondereBepalingen,
                testament.UitsluitingsClausule, testament.Legaten,
                testament.Begunstigden.Select(b => new BegunstigdeExport(
                    b.Naam, b.Relatie, b.Telefoon, b.Email, b.Omschrijving,
                    b.Percentage, b.IsLegitiemePortie)).ToList(),
                testament.Executeurs.Select(e => new ExecuteurExport(
                    e.Naam, e.Relatie, e.Telefoon, e.Email, e.Bevoegdheden)).ToList()),

            Euthanasie = wilsverklaring is null ? null : new EuthanasieExport(
                wilsverklaring.DatumOndertekening?.ToString("yyyy-MM-dd"),
                wilsverklaring.WilEuthanasie, wilsverklaring.SituatieBeschrijving,
                wilsverklaring.Huisarts, wilsverklaring.HuisartsPraktijk,
                wilsverklaring.HuisartsTelefoon,
                wilsverklaring.VertegenwoordigerNaam, wilsverklaring.VertegenwoordigerRelatie,
                wilsverklaring.VertegenwoordigerTelefoon,
                wilsverklaring.AanvullendeWensen,
                wilsverklaring.DementieClausule, wilsverklaring.DementieClausuleToelichting,
                wilsverklaring.BehandelVerbod,
                wilsverklaring.Voorwaarden.Select(v => new VoorwaardeExport(
                    v.Voorwaarde, v.Toelichting)).ToList()),

            DonorRegistratie = donor is null ? null : new DonorExport(
                donor.Keuze, donor.IsGeregistreerdBijDonorregister,
                donor.DonorregisterReferentie, donor.Toelichting,
                donor.OrgaanKeuzes.Select(o => new OrgaanKeuzeExport(
                    o.Orgaan, o.WelDoneren, o.Toelichting)).ToList()),

            Uitvaart = uitvaart is null ? null : new UitvaartExport(
                uitvaart.VoorkeurType, uitvaart.Begraafplaats,
                uitvaart.UitvaartOndernemer, uitvaart.UitvaartOndernemerTelefoon,
                uitvaart.UitvaartOndernemerEmail,
                uitvaart.HeeftUitvaartVerzekering, uitvaart.UitvaartVerzekeringDetails,
                uitvaart.CeremonieSoort, uitvaart.CeremonieLocatie,
                uitvaart.Muziekwensen, uitvaart.Sprekers, uitvaart.Bloemen,
                uitvaart.Kledingwensen, uitvaart.RouwkaartTekst, uitvaart.RouwadvertentieTekst,
                uitvaart.Condoleance, uitvaart.OverigeWensen,
                uitvaart.VoorkeurBegraafplaatsNaam, uitvaart.VoorkeurBegraafplaatsAdres,
                uitvaart.VoorkeurCrematoriumnaam, uitvaart.VoorkeurCrematoriumAdres,
                uitvaart.VoorkeurAulaNaam, uitvaart.VoorkeurAulaAdres,
                uitvaart.BudgetRichting,
                uitvaart.CeremonieDetails.OrderBy(c => c.Volgorde).Select(c => new CeremonieDetailExport(
                    c.Onderdeel, c.Beschrijving, c.Volgorde,
                    c.Muziek, c.Spreker, c.Tekstlezing, c.Dresscode)).ToList()),

            Boedel = new BoedelExport
            {
                FysiekeBezittingen = bezittingen.Select(b => new FysiekBezitExport(
                    b.Categorie, b.Omschrijving, b.GeschatteWaarde,
                    b.Locatie, b.BestemdeErfgenaam, b.VermogensSoort.ToString(), b.Notities,
                    b.KadastraalNummer, b.Kenteken, b.KvKNummer)).ToList(),
                Bankrekeningen = bankrekeningen.Select(b => new BankrekeningExport(
                    b.BankNaam, b.IBAN, b.RekeningType,
                    b.Saldo, b.VermogensSoort.ToString(), b.Notities)).ToList(),
                Verzekeringen = verzekeringen.Select(v => new VerzekeringExport(
                    v.Verzekeraar, v.PolisNummer, v.Type,
                    v.VerzekeraarTelefoon, v.VerzekeraarEmail, v.VerzekerdBedrag,
                    v.Begunstigde, v.VermogensSoort.ToString(), v.Notities)).ToList(),
                Schulden = schulden.Select(s => new SchuldExport(
                    s.Schuldeiser, s.Type, s.Bedrag,
                    s.MaandelijkseAflossing, s.Referentie,
                    s.VermogensSoort.ToString(), s.Notities)).ToList(),
            },

            DigitaleAccounts = digitaleAccounts.Select(d => new DigitaalAccountExport(
                d.PlatformNaam, d.Categorie, d.Gebruikersnaam,
                d.EmailAdres, d.Url, d.GewensteActie,
                d.OverdrachtAan, d.Notities)).ToList(),

            Documenten = documenten.Select(d => new DocumentExport(
                d.Naam, d.Categorie, d.BestandsNaam, d.ContentType,
                d.BestandsGrootte, d.Notities,
                d.VerlooptOp?.ToString("yyyy-MM-dd"),
                d.Versie, d.AangemaaktOp.ToString("yyyy-MM-dd HH:mm"))).ToList(),
        };
    }
}
