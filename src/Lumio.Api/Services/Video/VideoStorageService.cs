using Microsoft.Extensions.Configuration;

namespace Lumio.Api.Services.Video;

/// <summary>
/// Handles writing, reading, and deleting video files on disk.
/// Files are stored in {DataDir}/videos/{guid}{extension}.
/// </summary>
public class VideoStorageService(IConfiguration configuration)
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

    /// <summary>
    /// Derives the file extension from a MIME type, e.g. "video/webm" → ".webm".
    /// Falls back to ".bin" for unknown types.
    /// </summary>
    public static string ExtensieVanContentType(string contentType) =>
        contentType.ToLowerInvariant() switch
        {
            "video/webm"  => ".webm",
            "video/mp4"   => ".mp4",
            "video/ogg"   => ".ogv",
            "video/quicktime" => ".mov",
            "video/x-msvideo" => ".avi",
            _ => Path.GetExtension(contentType).TrimStart('.') is { Length: > 0 } ext
                     ? "." + ext
                     : ".bin",
        };
}
