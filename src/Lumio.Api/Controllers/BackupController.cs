using System.IO.Compression;
using Lumio.Api.Dtos.Backup;
using Lumio.Api.Services;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/backup")]
public class BackupController : ControllerBase
{
    private readonly IMasterPasswordService _passwordService;
    private readonly IProfileService _profileService;
    private readonly IAuditService _audit;

    public BackupController(IMasterPasswordService passwordService, IProfileService profileService, IAuditService audit)
    {
        _passwordService = passwordService;
        _profileService = profileService;
        _audit = audit;
    }

    /// <summary>
    /// Download a backup ZIP containing the encrypted database and salt file for the active profile.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> DownloadBackup()
    {
        if (!_passwordService.IsUnlocked)
            return StatusCode(423, new { error = "Database is vergrendeld." });

        var dbPath = _profileService.ActiveDbPath;
        if (dbPath == null || !System.IO.File.Exists(dbPath))
            return NotFound(new { error = "Geen database gevonden." });

        var profileName = _profileService.ActiveProfile?.Naam ?? "lumio";

        var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, leaveOpen: true))
        {
            // Add the database file
            var dbEntry = archive.CreateEntry("lumio.db", CompressionLevel.SmallestSize);
            using (var entryStream = dbEntry.Open())
            using (var dbStream = new FileStream(dbPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            {
                dbStream.CopyTo(entryStream);
            }

            // Add the salt file if it exists
            var saltPath = _profileService.ActiveSaltPath;
            if (saltPath != null && System.IO.File.Exists(saltPath))
            {
                var saltEntry = archive.CreateEntry("lumio.salt", CompressionLevel.SmallestSize);
                using var entryStream = saltEntry.Open();
                using var saltStream = new FileStream(saltPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                saltStream.CopyTo(entryStream);
            }
        }

        memoryStream.Position = 0;
        var filename = $"lumio-backup-{profileName}-{DateTime.Now:yyyy-MM-dd-HHmm}.zip";

        // S2-08: Log the backup download
        await _audit.LogAsync("Backup", "database", null, profileName);

        return File(memoryStream, "application/zip", filename);
    }

    /// <summary>
    /// Restore a backup ZIP. Requires the password that was used to encrypt the backup database.
    /// Locks the database after restore — user must re-authenticate.
    /// </summary>
    [HttpPost("restore")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> RestoreBackup([FromForm] RestoreBackupRequest request)
    {
        var wachtwoord = request.Wachtwoord;
        var bestand = request.Bestand;
        if (string.IsNullOrWhiteSpace(wachtwoord))
            return BadRequest(new { error = "Wachtwoord is verplicht." });

        if (bestand == null || bestand.Length == 0)
            return BadRequest(new { error = "Geen bestand geüpload." });

        if (!bestand.FileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { error = "Alleen ZIP-bestanden worden geaccepteerd." });

        // Extract to temp directory
        var tempDir = Path.Combine(Path.GetTempPath(), $"lumio-restore-{Guid.NewGuid():N}");
        Directory.CreateDirectory(tempDir);

        try
        {
            // Extract ZIP
            using (var zipStream = bestand.OpenReadStream())
            using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Read))
            {
                foreach (var entry in archive.Entries)
                {
                    // Only allow expected files
                    if (entry.Name is not ("lumio.db" or "lumio.salt"))
                        continue;

                    var destPath = Path.Combine(tempDir, entry.Name);
                    entry.ExtractToFile(destPath, overwrite: true);
                }
            }

            var tempDbPath = Path.Combine(tempDir, "lumio.db");
            if (!System.IO.File.Exists(tempDbPath))
                return BadRequest(new { error = "ZIP bevat geen lumio.db bestand." });

            // Validate the backup database can be opened with the provided password
            var connStr = new SqliteConnectionStringBuilder
            {
                DataSource = tempDbPath,
                Mode = SqliteOpenMode.ReadOnly,
                Password = wachtwoord
            }.ToString();

            using (var conn = new SqliteConnection(connStr))
            {
                try
                {
                    await conn.OpenAsync();
                    using var cmd = conn.CreateCommand();
                    cmd.CommandText = "SELECT count(*) FROM sqlite_master;";
                    await cmd.ExecuteScalarAsync();
                }
                catch
                {
                    return BadRequest(new { error = "Ongeldig wachtwoord voor het backup-bestand, of het bestand is beschadigd." });
                }
            }

            // Lock the current database before replacing files
            _passwordService.Lock();

            // Replace database file for the active profile
            var activeDbPath = _profileService.ActiveDbPath!;
            System.IO.File.Copy(tempDbPath, activeDbPath, overwrite: true);

            // Replace salt file if present in backup
            var tempSaltPath = Path.Combine(tempDir, "lumio.salt");
            var saltPath = _profileService.ActiveSaltPath!;
            if (System.IO.File.Exists(tempSaltPath))
            {
                System.IO.File.Copy(tempSaltPath, saltPath, overwrite: true);
            }
            else if (System.IO.File.Exists(saltPath))
            {
                // Backup has no salt file — remove current salt to use legacy fallback
                System.IO.File.Delete(saltPath);
            }

            return Ok(new { bericht = "Backup hersteld. Ontgrendel de database met het wachtwoord van de backup." });
        }
        finally
        {
            // Clean up temp directory
            try { Directory.Delete(tempDir, recursive: true); }
            catch { /* ignore cleanup errors */ }
        }
    }
}
