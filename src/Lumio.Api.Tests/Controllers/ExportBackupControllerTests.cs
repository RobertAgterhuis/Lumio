using Lumio.Api.Controllers;
using Lumio.Api.Services;
using Lumio.Api.Services.Export;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Tests.Controllers;

// ── Inline fake ─────────────────────────────────────────────────────────────

sealed class FakeEncryptedBackupService : IEncryptedBackupService
{
    public bool HasProfile { get; set; } = true;

    /// <summary>Minimal fake encrypted backup: 41-byte header + 16 bytes of fake payload.</summary>
    private static readonly byte[] FakeBackupBytes = new byte[57];

    static FakeEncryptedBackupService()
    {
        // Write LUMIO_BK magic + version byte
        System.Text.Encoding.ASCII.GetBytes("LUMIO_BK").CopyTo(FakeBackupBytes, 0);
        FakeBackupBytes[8] = 0x01; // version
    }

    public Task<byte[]?> CreateEncryptedBackupAsync(string password)
        => Task.FromResult(HasProfile ? (byte[]?)FakeBackupBytes : null);
}

// ── Tests ────────────────────────────────────────────────────────────────────

public class ExportBackupControllerTests
{
    private static ExportBackupController CreateController(FakeEncryptedBackupService? backupSvc = null)
        => new(backupSvc ?? new FakeEncryptedBackupService(), new FakeAuditService());

    // ── DownloadEncryptedBackup ─────────────────────────────────────────────

    [Fact]
    public async Task DownloadEncryptedBackup_ReturnsFile_WithLumikMagicHeader()
    {
        var ctrl = CreateController();
        var request = new EncryptedBackupRequest("SuperGeheim123!");

        var result = await ctrl.DownloadEncryptedBackup(request);

        var file = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/octet-stream", file.ContentType);
        Assert.StartsWith("lumio-backup-", file.FileDownloadName);
        Assert.EndsWith(".lumio", file.FileDownloadName);
        // LUMIO_BK magic
        Assert.Equal("LUMIO_BK", System.Text.Encoding.ASCII.GetString(file.FileContents, 0, 8));
        Assert.Equal(0x01, file.FileContents[8]); // version byte
    }

    [Fact]
    public async Task DownloadEncryptedBackup_FileDownloadName_ContainsTodayDate()
    {
        var ctrl = CreateController();
        var result = await ctrl.DownloadEncryptedBackup(new EncryptedBackupRequest("pass"));

        var file = Assert.IsType<FileContentResult>(result);
        Assert.Contains(DateTime.Now.ToString("yyyy-MM-dd"), file.FileDownloadName);
    }

    [Fact]
    public async Task DownloadEncryptedBackup_ReturnsBadRequest_WhenPasswordIsEmpty()
    {
        var ctrl = CreateController();
        var request = new EncryptedBackupRequest("");

        var result = await ctrl.DownloadEncryptedBackup(request);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task DownloadEncryptedBackup_ReturnsBadRequest_WhenPasswordIsWhitespace()
    {
        var ctrl = CreateController();
        var result = await ctrl.DownloadEncryptedBackup(new EncryptedBackupRequest("   "));

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task DownloadEncryptedBackup_ReturnsNotFound_WhenNoProfileExists()
    {
        var backupSvc = new FakeEncryptedBackupService { HasProfile = false };
        var ctrl = CreateController(backupSvc);

        var result = await ctrl.DownloadEncryptedBackup(new EncryptedBackupRequest("wachtwoord"));

        Assert.IsType<NotFoundObjectResult>(result);
    }
}
