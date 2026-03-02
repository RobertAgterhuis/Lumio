using Lumio.Api.Services;
using Lumio.Api.Services.Export;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/export")]
public class ExportDataController : ControllerBase
{
    private readonly IExportDataService _exportData;
    private readonly INuvExportService _nuv;
    private readonly IAuditService _audit;

    public ExportDataController(
        IExportDataService exportData,
        INuvExportService nuv,
        IAuditService audit)
    {
        _exportData = exportData;
        _nuv = nuv;
        _audit = audit;
    }

    /// <summary>Export complete profile as a JSON file.</summary>
    [HttpGet("json")]
    public async Task<IActionResult> ExportJson()
    {
        var bytes = await _exportData.BuildJsonExportAsync();
        if (bytes is null) return Problem("Export failed: could not generate JSON export.", statusCode: 500);
        await _audit.LogAsync("Export", "export", null, "json");
        return File(bytes, "application/json", $"lumio-export-{DateTime.Now:yyyy-MM-dd}.json");
    }

    /// <summary>Export complete profile as an XML file.</summary>
    [HttpGet("xml")]
    public async Task<IActionResult> ExportXml()
    {
        var bytes = await _exportData.BuildXmlExportAsync();
        if (bytes is null) return Problem("Export failed: could not generate XML export.", statusCode: 500);
        await _audit.LogAsync("Export", "export", null, "xml");
        return File(bytes, "application/xml", $"lumio-export-{DateTime.Now:yyyy-MM-dd}.xml");
    }

    /// <summary>Export NUV-compliant XML for funeral sector interoperability.</summary>
    [HttpGet("nuv")]
    public async Task<IActionResult> ExportNuv()
    {
        var bytes = await _nuv.BuildNuvXmlAsync();
        if (bytes is null) return Problem("Export failed: could not generate NUV XML export.", statusCode: 500);
        await _audit.LogAsync("Export", "export", null, "nuv");
        return File(bytes, "application/xml", $"lumio-nuv-{DateTime.Now:yyyy-MM-dd}.xml");
    }
}
