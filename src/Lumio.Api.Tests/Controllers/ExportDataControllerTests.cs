using Lumio.Api.Controllers;
using Lumio.Api.Dtos.Export;
using Lumio.Api.Services;
using Lumio.Api.Services.Export;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace Lumio.Api.Tests.Controllers;

// ── Inline fakes ────────────────────────────────────────────────────────────

sealed class FakeExportDataService : IExportDataService
{
    public bool HasData { get; set; } = true;
    private readonly byte[] _json = Encoding.UTF8.GetBytes("{\"version\":\"1.0\",\"eigenaar\":null}");
    private readonly byte[] _xml  = Encoding.UTF8.GetBytes("<?xml version=\"1.0\"?><LumioExport />");

    public Task<LumioExportData?> BuildExportDataAsync()
        => Task.FromResult<LumioExportData?>(null); // not called by the tested endpoints

    public Task<byte[]?> BuildJsonExportAsync()
        => Task.FromResult(HasData ? (byte[]?)_json : null);

    public Task<byte[]?> BuildXmlExportAsync()
        => Task.FromResult(HasData ? (byte[]?)_xml : null);
}

sealed class FakeNuvExportService : INuvExportService
{
    public bool HasData { get; set; } = true;
    private readonly byte[] _xml = Encoding.UTF8.GetBytes("<?xml version=\"1.0\"?><NUV_Uitvaart />");
    private readonly byte[] _nullBytes = Array.Empty<byte>();

    public Task<byte[]> BuildNuvXmlAsync()
        => Task.FromResult(HasData ? _xml : _nullBytes);
}

// ── Tests ────────────────────────────────────────────────────────────────────

public class ExportDataControllerTests
{
    private static ExportDataController CreateController(
        FakeExportDataService? dataSvc = null,
        FakeNuvExportService? nuvSvc = null)
        => new(
            dataSvc ?? new FakeExportDataService(),
            nuvSvc  ?? new FakeNuvExportService(),
            new FakeAuditService());

    // ── ExportJson ─────────────────────────────────────────────────────────

    [Fact]
    public async Task ExportJson_ReturnsJsonFile_WhenDataExists()
    {
        var ctrl = CreateController();
        var result = await ctrl.ExportJson();

        var file = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/json", file.ContentType);
        Assert.StartsWith("lumio-export-", file.FileDownloadName);
        Assert.EndsWith(".json", file.FileDownloadName);
        var json = Encoding.UTF8.GetString(file.FileContents);
        Assert.Contains("version", json);
    }

    [Fact]
    public async Task ExportJson_ReturnsProblem_WhenNoDataExists()
    {
        var dataSvc = new FakeExportDataService { HasData = false };
        var ctrl = CreateController(dataSvc);

        var result = await ctrl.ExportJson();
        Assert.IsType<ObjectResult>(result);
        var obj = (ObjectResult)result;
        Assert.Equal(500, obj.StatusCode);
    }

    // ── ExportXml ─────────────────────────────────────────────────────────

    [Fact]
    public async Task ExportXml_ReturnsXmlFile_WhenDataExists()
    {
        var ctrl = CreateController();
        var result = await ctrl.ExportXml();

        var file = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/xml", file.ContentType);
        Assert.StartsWith("lumio-export-", file.FileDownloadName);
        Assert.EndsWith(".xml", file.FileDownloadName);
        var xml = Encoding.UTF8.GetString(file.FileContents);
        Assert.Contains("xml", xml);
    }

    [Fact]
    public async Task ExportXml_ReturnsProblem_WhenNoDataExists()
    {
        var dataSvc = new FakeExportDataService { HasData = false };
        var ctrl = CreateController(dataSvc);

        var result = await ctrl.ExportXml();
        Assert.IsType<ObjectResult>(result);
        var obj = (ObjectResult)result;
        Assert.Equal(500, obj.StatusCode);
    }

    // ── ExportNuv ─────────────────────────────────────────────────────────

    [Fact]
    public async Task ExportNuv_ReturnsXmlFile_WithNuvContent()
    {
        var ctrl = CreateController();
        var result = await ctrl.ExportNuv();

        var file = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/xml", file.ContentType);
        Assert.StartsWith("lumio-nuv-", file.FileDownloadName);
        Assert.EndsWith(".xml", file.FileDownloadName);
        var xml = Encoding.UTF8.GetString(file.FileContents);
        Assert.Contains("NUV_Uitvaart", xml);
    }

    [Fact]
    public async Task ExportNuv_ReturnsXmlFile_WhenServiceReturnsEmptyBytes()
    {
        // INuvExportService returns byte[] (never null) — controller returns FileResult
        // even when there is no profile data yet (empty XML is valid per NUV schema).
        var nuvSvc = new FakeNuvExportService { HasData = false };
        var ctrl = CreateController(nuvSvc: nuvSvc);

        var result = await ctrl.ExportNuv();
        var file = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/xml", file.ContentType);
        Assert.Empty(file.FileContents); // empty bytes, not null — no error
    }

    [Fact]
    public async Task ExportXml_FileDownloadName_ContainsTodayDate()
    {
        var ctrl = CreateController();
        var result = await ctrl.ExportXml();

        var file = Assert.IsType<FileContentResult>(result);
        Assert.Contains(DateTime.Now.ToString("yyyy-MM-dd"), file.FileDownloadName);
    }
}
