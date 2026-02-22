using Lumio.Api.Services.Pdf;
using Lumio.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO.Compression;
using System.Text;

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
}
