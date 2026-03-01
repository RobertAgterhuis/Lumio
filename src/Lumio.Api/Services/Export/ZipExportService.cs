using Lumio.Api.Data;
using Lumio.Api.Services.Pdf;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using System.IO.Compression;
using System.Text;

namespace Lumio.Api.Services.Export;

/// <inheritdoc/>
public sealed class ZipExportService : IZipExportService
{
    private readonly ILumioPdfService _pdfService;
    private readonly LumioDbContext _db;
    private readonly IStringLocalizer<ExportResources> L;

    public ZipExportService(ILumioPdfService pdfService, LumioDbContext db, IStringLocalizer<ExportResources> localizer)
    {
        _pdfService = pdfService;
        _db = db;
        L = localizer;
    }

    public async Task<byte[]> CreateAllesZipAsync()
    {
        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, leaveOpen: true))
        {
            var pdfTasks = new (string naam, Func<Task<byte[]>> generator)[]
            {
                ("pdf/lumio-compleet.pdf",            _pdfService.GenerateCompleetPdf),
                ("pdf/lumio-testament.pdf",           _pdfService.GenerateTestamentPdf),
                ("pdf/lumio-euthanasie.pdf",          _pdfService.GenerateEuthanasiePdf),
                ("pdf/lumio-donor.pdf",               _pdfService.GenerateDonorPdf),
                ("pdf/lumio-digitaal-bezit.pdf",      _pdfService.GenerateDigitaalBezitPdf),
                ("pdf/lumio-boedel.pdf",              _pdfService.GenerateBoedelPdf),
                ("pdf/lumio-uitvaart.pdf",            _pdfService.GenerateUitvaartPdf),
                ("pdf/lumio-documenten.pdf",          _pdfService.GenerateDocumentenOverzichtPdf),
                ("pdf/lumio-noodkaart.pdf",           _pdfService.GenerateNoodkaartPdf),
                ("pdf/lumio-testament-concept.pdf",   _pdfService.GenerateTestamentConceptPdf),
                ("pdf/lumio-wilsverklaring.pdf",      _pdfService.GenerateWilsverklaringPdf),
                ("pdf/lumio-noodprocedure.pdf",       _pdfService.GenerateNoodprocedurePdf),
                ("pdf/lumio-boedelbeschrijving.pdf",  _pdfService.GenerateBoedelbeschrijvingPdf),
                ("pdf/lumio-executeur-rapport.pdf",   _pdfService.GenerateExecuteurRapportPdf),
            };

            var pdfFouten = new List<string>();

            foreach (var (naam, generator) in pdfTasks)
            {
                try
                {
                    var pdfBytes = await generator();
                    var entry = archive.CreateEntry(naam, CompressionLevel.Optimal);
                    using var entryStream = entry.Open();
                    await entryStream.WriteAsync(pdfBytes);
                }
                catch (Exception ex)
                {
                    pdfFouten.Add($"{naam}: {ex.Message}");
                }
            }

            if (pdfFouten.Count > 0)
            {
                var foutEntry = archive.CreateEntry("FOUTEN.txt", CompressionLevel.Optimal);
                using var foutStream = foutEntry.Open();
                var foutTekst = new StringBuilder();
                foutTekst.AppendLine("De volgende PDF-bestanden konden niet worden gegenereerd:");
                foutTekst.AppendLine(new string('-', 50));
                foreach (var fout in pdfFouten)
                    foutTekst.AppendLine($"- {fout}");
                await foutStream.WriteAsync(Encoding.UTF8.GetBytes(foutTekst.ToString()));
            }

            var documenten = await _db.Documenten.ToListAsync();
            foreach (var doc in documenten)
            {
                if (doc.BestandsInhoud is not { Length: > 0 }) continue;

                var veiligNaam = string.Join("_", doc.BestandsNaam.Split(Path.GetInvalidFileNameChars()));
                var entryNaam = $"documenten/{veiligNaam}";

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

            // INHOUD.txt index
            var sb = new StringBuilder();
            sb.AppendLine(L["ExportPackageTitle"]);
            sb.AppendLine(L["GeneratedOn", DateTime.Now.ToString("dd-MM-yyyy HH:mm")]);
            sb.AppendLine(new string('=', 50));
            sb.AppendLine();
            sb.AppendLine(L["ContentsLabel"]);
            sb.AppendLine();
            sb.AppendLine("pdf/");
            sb.AppendLine($"  {L["PdfDescription"]}");
            sb.AppendLine();
            if (documenten.Count > 0)
            {
                sb.AppendLine("documenten/");
                sb.AppendLine($"  {L["UploadedDocsDescription"]}");
                sb.AppendLine($"  {L["FileCount", documenten.Count]}");
                sb.AppendLine();
            }
            sb.AppendLine(L["InstructionsTitle"]);
            sb.AppendLine($"  {L["Instruction1"]}");
            sb.AppendLine($"  {L["Instruction2"]}");
            sb.AppendLine($"  {L["Instruction3"]}");
            sb.AppendLine($"  {L["Instruction4"]}");

            var inhoudEntry = archive.CreateEntry("INHOUD.txt", CompressionLevel.Optimal);
            using var inhoudStream = inhoudEntry.Open();
            await inhoudStream.WriteAsync(Encoding.UTF8.GetBytes(sb.ToString()));
        }

        memoryStream.Position = 0;
        return memoryStream.ToArray();
    }
}
