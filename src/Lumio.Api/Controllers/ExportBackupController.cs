using Lumio.Api.Services;
using Lumio.Api.Services.Export;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Controllers;

/// <summary>
/// Encrypted-backup endpoints (S4-07 – Maand 11 – Backup + Data governance).
/// </summary>
[ApiController]
[Route("api/export/backup")]
public sealed class ExportBackupController : ControllerBase
{
    private readonly IEncryptedBackupService _backup;
    private readonly IAuditService _audit;

    public ExportBackupController(IEncryptedBackupService backup, IAuditService audit)
    {
        _backup = backup;
        _audit = audit;
    }

    /// <summary>
    /// Creates an AES-256-CBC encrypted backup of all profile data and returns it as a downloadable .lumio file.
    /// The file can only be decrypted with the same password.
    /// Format: LUMIO_BK v1 header + PBKDF2-SHA256 key derivation (100 000 iterations).
    /// </summary>
    /// <remarks>
    /// Request body: { "password": "..." }
    /// </remarks>
    [HttpPost("encrypted")]
    public async Task<IActionResult> DownloadEncryptedBackup([FromBody] EncryptedBackupRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { error = "Wachtwoord mag niet leeg zijn." });

        var bytes = await _backup.CreateEncryptedBackupAsync(request.Password);
        if (bytes is null)
            return NotFound(new { error = "Geen profiel gevonden om te exporteren." });

        await _audit.LogAsync("Backup", "export", null, "encrypted-backup");

        var filename = $"lumio-backup-{DateTime.Now:yyyy-MM-dd}.lumio";
        return File(bytes, "application/octet-stream", filename);
    }
}

/// <summary>Request body for <see cref="ExportBackupController.DownloadEncryptedBackup"/>.</summary>
public sealed record EncryptedBackupRequest(string Password);
