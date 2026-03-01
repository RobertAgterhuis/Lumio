using Lumio.Api.Services;
using Lumio.Api.Services.Export;
using Lumio.Api.Services.Pdf;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private readonly ILumioPdfService _pdfService;
    private readonly IAuditService _audit;
    private readonly IExportStatusService _exportStatus;
    private readonly IHtmlExportService _html;
    private readonly IZipExportService _zip;

    public ExportController(
        ILumioPdfService pdfService,
        IAuditService audit,
        IExportStatusService exportStatus,
        IHtmlExportService html,
        IZipExportService zip)
    {
        _pdfService = pdfService;
        _audit = audit;
        _exportStatus = exportStatus;
        _html = html;
        _zip = zip;
    }

    /// <summary>Returns a boolean flag per export module indicating whether that module has data.</summary>
    [HttpGet("status")]
    public async Task<IActionResult> GetExportStatus()
    {
        var result = await _exportStatus.GetExportStatusAsync();
        return Ok(result);
    }

    // ── PDF downloads ───────────────────────────────────────────────────

    [HttpGet("testament")]
    public async Task<IActionResult> ExportTestament()
    {
        var pdf = await _pdfService.GenerateTestamentPdf();
        await _audit.LogAsync("Export", "export", null, "testament");
        return File(pdf, "application/pdf", "lumio-testament.pdf");
    }

    [HttpGet("euthanasie")]
    public async Task<IActionResult> ExportEuthanasie()
    {
        var pdf = await _pdfService.GenerateEuthanasiePdf();
        await _audit.LogAsync("Export", "export", null, "euthanasie");
        return File(pdf, "application/pdf", "lumio-euthanasie.pdf");
    }

    [HttpGet("donor")]
    public async Task<IActionResult> ExportDonor()
    {
        var pdf = await _pdfService.GenerateDonorPdf();
        await _audit.LogAsync("Export", "export", null, "donor");
        return File(pdf, "application/pdf", "lumio-donor.pdf");
    }

    [HttpGet("digitaal-bezit")]
    public async Task<IActionResult> ExportDigitaalBezit()
    {
        var pdf = await _pdfService.GenerateDigitaalBezitPdf();
        await _audit.LogAsync("Export", "export", null, "digitaal-bezit");
        return File(pdf, "application/pdf", "lumio-digitaal-bezit.pdf");
    }

    [HttpGet("boedel")]
    public async Task<IActionResult> ExportBoedel()
    {
        var pdf = await _pdfService.GenerateBoedelPdf();
        await _audit.LogAsync("Export", "export", null, "boedel");
        return File(pdf, "application/pdf", "lumio-boedel.pdf");
    }

    [HttpGet("uitvaart")]
    public async Task<IActionResult> ExportUitvaart()
    {
        var pdf = await _pdfService.GenerateUitvaartPdf();
        await _audit.LogAsync("Export", "export", null, "uitvaart");
        return File(pdf, "application/pdf", "lumio-uitvaart.pdf");
    }

    [HttpGet("documenten")]
    public async Task<IActionResult> ExportDocumenten()
    {
        var pdf = await _pdfService.GenerateDocumentenOverzichtPdf();
        await _audit.LogAsync("Export", "export", null, "documenten");
        return File(pdf, "application/pdf", "lumio-documenten.pdf");
    }

    [HttpGet("compleet")]
    public async Task<IActionResult> ExportCompleet()
    {
        var pdf = await _pdfService.GenerateCompleetPdf();
        await _audit.LogAsync("Export", "export", null, "compleet");
        return File(pdf, "application/pdf", "lumio-compleet.pdf");
    }

    [HttpGet("noodkaart")]
    public async Task<IActionResult> ExportNoodkaart()
    {
        var pdf = await _pdfService.GenerateNoodkaartPdf();
        await _audit.LogAsync("Export", "export", null, "noodkaart");
        return File(pdf, "application/pdf", "lumio-noodkaart.pdf");
    }

    [HttpGet("testament-concept")]
    public async Task<IActionResult> ExportTestamentConcept()
    {
        var pdf = await _pdfService.GenerateTestamentConceptPdf();
        await _audit.LogAsync("Export", "export", null, "testament-concept");
        return File(pdf, "application/pdf", "lumio-testament-concept.pdf");
    }

    [HttpGet("wilsverklaring")]
    public async Task<IActionResult> ExportWilsverklaring()
    {
        var pdf = await _pdfService.GenerateWilsverklaringPdf();
        await _audit.LogAsync("Export", "export", null, "wilsverklaring");
        return File(pdf, "application/pdf", "lumio-wilsverklaring.pdf");
    }

    [HttpGet("noodprocedure")]
    public async Task<IActionResult> ExportNoodprocedure()
    {
        var pdf = await _pdfService.GenerateNoodprocedurePdf();
        await _audit.LogAsync("Export", "export", null, "noodprocedure");
        return File(pdf, "application/pdf", "lumio-noodprocedure.pdf");
    }

    [HttpGet("boedelbeschrijving")]
    public async Task<IActionResult> ExportBoedelbeschrijving()
    {
        var pdf = await _pdfService.GenerateBoedelbeschrijvingPdf();
        await _audit.LogAsync("Export", "export", null, "boedelbeschrijving");
        return File(pdf, "application/pdf", "lumio-boedelbeschrijving.pdf");
    }

    [HttpGet("executeur-rapport")]
    public async Task<IActionResult> ExportExecuteurRapport()
    {
        var pdf = await _pdfService.GenerateExecuteurRapportPdf();
        await _audit.LogAsync("Export", "export", null, "executeur-rapport");
        return File(pdf, "application/pdf", "lumio-executeur-rapport.pdf");
    }

    [HttpGet("notaris")]
    public async Task<IActionResult> ExportNotaris()
    {
        var pdf = await _pdfService.GenerateNotarisPdf();
        await _audit.LogAsync("Export", "export", null, "notaris");
        return File(pdf, "application/pdf", "lumio-notaris-dossier.pdf");
    }

    [HttpGet("erfgenaam/{erfgenaamId:guid}")]
    public async Task<IActionResult> ExportErfgenaam(Guid erfgenaamId, [FromServices] Data.LumioDbContext db)
    {
        var erfgenaam = await db.Erfgenamen.FindAsync(erfgenaamId);
        if (erfgenaam is null)
            return NotFound(new { error = "Erfgenaam niet gevonden." });

        var pdf = await _pdfService.GenerateErfgenaamPdf(erfgenaamId);
        var veiligNaam = erfgenaam.Voornaam.ToLowerInvariant().Replace(" ", "-");
        await _audit.LogAsync("Export", "export", erfgenaamId, "erfgenaam");
        return File(pdf, "application/pdf", $"lumio-erfgenaam-{veiligNaam}.pdf");
    }

    // ── P-C13: Delen met mede-erfgenamen (HTML export) ──────────────────

    [HttpGet("delen/{erfgenaamId:guid}")]
    public async Task<IActionResult> DeelMetErfgenaam(Guid erfgenaamId)
    {
        var result = await _html.BuildErfgenaamHtmlAsync(erfgenaamId);
        if (result is null)
            return NotFound(new { error = "Eigenaar of erfgenaam niet gevonden." });

        var (bytes, veiligNaam) = result.Value;
        return File(bytes, "text/html", $"lumio-erfgenaam-{veiligNaam}.html");
    }

    // ── P-M13: Compleet export pakket (ZIP) ─────────────────────────────

    [HttpPost("alles")]
    public async Task<IActionResult> ExportAlles()
    {
        var zipBytes = await _zip.CreateAllesZipAsync();
        await _audit.LogAsync("Export", "export", null, "alles");
        return File(zipBytes, "application/zip", $"lumio-export-{DateTime.Now:yyyy-MM-dd}.zip");
    }
}
