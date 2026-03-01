using Microsoft.Extensions.Configuration;

namespace Lumio.Api.Services.Video;

/// <summary>
/// Handles writing, reading, and deleting video files on disk.
/// Files are stored in {DataDir}/videos/{guid}{extension}.
/// </summary>
public class VideoStorageService(IConfiguration configuration) : IVideoStorageService
{
    private string VideoDir
    {
        get
        {
            var dataDir = configuration["DataDir"]
                ?? Path.Combine(AppContext.BaseDirectory, "..", "data");
            return Path.Combine(dataDir, "videos");
        }
    }

    /// <summary>
    /// Writes the stream to disk and returns the absolute file path.
    /// </summary>
    public async Task<string> OpslaanAsync(Guid id, Stream inhoud, string extensie)
    {
        Directory.CreateDirectory(VideoDir);
        // Normalise extension: ensure it starts with a dot, strip query strings
        var ext = extensie.Split('?')[0];
        if (!ext.StartsWith('.'))
            ext = "." + ext;

        var pad = Path.Combine(VideoDir, $"{id}{ext}");
        await using var fs = new FileStream(pad, FileMode.Create, FileAccess.Write,
            FileShare.None, bufferSize: 81_920, useAsync: true);
        await inhoud.CopyToAsync(fs);
        return pad;
    }

    /// <summary>
    /// Opens the file for reading (streaming). Returns null if the file does not exist.
    /// </summary>
    public FileStream? Openen(string pad)
    {
        if (!File.Exists(pad)) return null;
        return new FileStream(pad, FileMode.Open, FileAccess.Read,
            FileShare.Read, bufferSize: 81_920, useAsync: true);
    }

    /// <summary>
    /// Deletes the file from disk. No-op if the file no longer exists.
    /// </summary>
    public void Verwijderen(string pad)
    {
        if (File.Exists(pad))
            File.Delete(pad);
    }

    // ── Temp preview storage ───────────────────────────────────────────────
    // Previews live under {VideoDir}/temp/ and are cleaned up after the user
    // accepts or retries a recording.

    private string TempDir => Path.Combine(VideoDir, "temp");

    /// <summary>
    /// Saves an in-progress recording to the temp folder and returns the absolute path.
    /// </summary>
    public async Task<string> OpslaanTempAsync(Guid id, Stream inhoud, string extensie)
    {
        Directory.CreateDirectory(TempDir);
        var ext = extensie.Split('?')[0];
        if (!ext.StartsWith('.'))
            ext = "." + ext;

        var pad = Path.Combine(TempDir, $"{id}{ext}");
        await using var fs = new FileStream(pad, FileMode.Create, FileAccess.Write,
            FileShare.None, bufferSize: 81_920, useAsync: true);
        await inhoud.CopyToAsync(fs);
        return pad;
    }

    /// <summary>
    /// Finds a temp file by ID, trying common video extensions.
    /// Returns null if the file does not exist.
    /// </summary>
    public string? VindTempBestand(Guid id)
    {
        foreach (var ext in new[] { ".webm", ".mp4", ".ogv", ".mov", ".bin" })
        {
            var pad = Path.Combine(TempDir, $"{id}{ext}");
            if (File.Exists(pad)) return pad;
        }
        return null;
    }

    /// <summary>
    /// Derives the file extension from a MIME type, e.g. "video/webm" → ".webm".
    /// Strips codec parameters (e.g. "video/webm;codecs=vp9,opus" → "video/webm") before matching.
    /// Falls back to ".bin" for unknown types.
    /// </summary>
    public static string ExtensieVanContentType(string contentType)
    {
        // Strip codec/parameter suffix: "video/webm;codecs=vp9,opus" → "video/webm"
        var baseType = contentType.Split(';')[0].Trim().ToLowerInvariant();
        return baseType switch
        {
            "video/webm"       => ".webm",
            "video/mp4"        => ".mp4",
            "video/ogg"        => ".ogv",
            "video/quicktime"  => ".mov",
            "video/x-msvideo" => ".avi",
            _                  => ".bin",
        };
    }
}
