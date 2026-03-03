using Lumio.Api.Controllers;
using Lumio.Api.Services;
using Lumio.Api.Services.Export;
using Lumio.Api.Services.Pdf;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Tests.Controllers;

// ── Inline fakes (scope: this file only) ───────────────────────────────────

sealed class FakePdfService : ILumioPdfService
{
    public Task<byte[]> GenerateTestamentPdf()           => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateEuthanasiePdf()          => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateDonorPdf()               => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateDigitaalBezitPdf()       => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateBoedelPdf()              => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateUitvaartPdf()            => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateDocumentenOverzichtPdf() => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateCompleetPdf()            => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateNoodkaartPdf()           => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateTestamentConceptPdf()    => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateWilsverklaringPdf()      => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateNoodprocedurePdf()       => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateBoedelbeschrijvingPdf()  => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateErfgenaamPdf(Guid id)   => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateExecuteurRapportPdf()    => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateNotarisPdf()             => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
    public Task<byte[]> GenerateNabestaandenInstructiePdf() => Task.FromResult(new byte[] { 0x25, 0x50, 0x44, 0x46 });
}

sealed class FakeExportStatusService : IExportStatusService
{
    public Dictionary<string, bool>? Result { get; set; }
    public Task<Dictionary<string, bool>> GetExportStatusAsync()
        => Task.FromResult(Result ?? new Dictionary<string, bool> { ["testament"] = true, ["donor"] = false });
}

sealed class FakeHtmlExportService : IHtmlExportService
{
    public Task<(byte[] bytes, string veiligNaam)?> BuildErfgenaamHtmlAsync(Guid erfgenaamId)
        => Task.FromResult<(byte[], string)?>(null);
}

sealed class FakeZipExportService : IZipExportService
{
    public byte[] ZipBytes { get; set; } = new byte[] { 0x50, 0x4B, 0x03, 0x04 }; // PK magic
    public Task<byte[]> CreateAllesZipAsync() => Task.FromResult(ZipBytes);
}

// ── Tests ───────────────────────────────────────────────────────────────────

public class ExportControllerTests
{
    private static ExportController CreateController(
        FakeExportStatusService? statusSvc = null,
        FakeZipExportService? zipSvc = null)
        => new(
            new FakePdfService(),
            new FakeAuditService(),
            statusSvc ?? new FakeExportStatusService(),
            new FakeHtmlExportService(),
            zipSvc ?? new FakeZipExportService());

    // ── GetExportStatus ────────────────────────────────────────────────────

    [Fact]
    public async Task GetExportStatus_ReturnsOk_WithStatusDictionary()
    {
        var statusSvc = new FakeExportStatusService
        {
            Result = new Dictionary<string, bool>
            {
                ["testament"] = true,
                ["donor"]     = false,
                ["boedel"]    = true,
            },
        };

        var ctrl = CreateController(statusSvc);
        var result = await ctrl.GetExportStatus();

        var ok = Assert.IsType<OkObjectResult>(result);
        var dict = Assert.IsType<Dictionary<string, bool>>(ok.Value);
        Assert.True(dict["testament"]);
        Assert.False(dict["donor"]);
    }

    [Fact]
    public async Task GetExportStatus_ReturnsEmptyDictionary_WhenNoModulesHaveData()
    {
        var statusSvc = new FakeExportStatusService
        {
            Result = new Dictionary<string, bool>(),
        };

        var ctrl = CreateController(statusSvc);
        var result = await ctrl.GetExportStatus();

        var ok = Assert.IsType<OkObjectResult>(result);
        var dict = Assert.IsType<Dictionary<string, bool>>(ok.Value);
        Assert.Empty(dict);
    }

    // ── ExportAlles (ZIP) ──────────────────────────────────────────────────

    [Fact]
    public async Task ExportAlles_ReturnsZipFile_WithPkMagicBytes()
    {
        var zipSvc = new FakeZipExportService
        {
            ZipBytes = new byte[] { 0x50, 0x4B, 0x03, 0x04, 0x00, 0x00 },
        };

        var ctrl = CreateController(zipSvc: zipSvc);
        var result = await ctrl.ExportAlles();

        var file = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/zip", file.ContentType);
        Assert.StartsWith("lumio-export-", file.FileDownloadName);
        Assert.EndsWith(".zip", file.FileDownloadName);
        // ZIP magic bytes: PK\x03\x04
        Assert.Equal(0x50, file.FileContents[0]);
        Assert.Equal(0x4B, file.FileContents[1]);
    }

    [Fact]
    public async Task ExportAlles_FileDownloadName_ContainsTodayDate()
    {
        var ctrl = CreateController();
        var result = await ctrl.ExportAlles();

        var file = Assert.IsType<FileContentResult>(result);
        Assert.Contains(DateTime.Now.ToString("yyyy-MM-dd"), file.FileDownloadName);
    }
}
