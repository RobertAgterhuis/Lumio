namespace Lumio.Api.Services.Video;

/// <summary>
/// T-006: Interface for video file storage operations.
/// Extracted to enable compensating-transaction testing:
/// the Delete controller can inject a mock that throws, verifying DB rollback behaviour.
/// </summary>
public interface IVideoStorageService
{
    /// <summary>Writes the stream to disk and returns the absolute file path.</summary>
    Task<string> OpslaanAsync(Guid id, Stream inhoud, string extensie);

    /// <summary>Opens the file for reading. Returns null if the file does not exist.</summary>
    FileStream? Openen(string pad);

    /// <summary>
    /// Deletes the video file from disk.
    /// In the atomic-delete flow this is called BEFORE the DB transaction is committed;
    /// if this throws the DB transaction will be rolled back.
    /// </summary>
    void Verwijderen(string pad);

    /// <summary>Saves an in-progress recording to temp storage and returns the absolute path.</summary>
    Task<string> OpslaanTempAsync(Guid id, Stream inhoud, string extensie);

    /// <summary>Finds a temp file by ID, trying common video extensions. Returns null if not found.</summary>
    string? VindTempBestand(Guid id);
}
