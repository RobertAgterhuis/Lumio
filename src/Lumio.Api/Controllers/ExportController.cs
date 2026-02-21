using Lumio.Api.Services.Pdf;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private readonly ILumioPdfService _pdfService;

    public ExportController(ILumioPdfService pdfService)
    {
        _pdfService = pdfService;
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
}
