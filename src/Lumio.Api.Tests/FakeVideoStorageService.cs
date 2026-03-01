using Lumio.Api.Services.Video;

namespace Lumio.Api.Tests;

/// <summary>
/// T-006: Configurable fake for IVideoStorageService.
/// Set ThrowOnVerwijderen = true to simulate a file-delete failure.
/// </summary>
public sealed class FakeVideoStorageService : IVideoStorageService
{
    public bool ThrowOnVerwijderen { get; set; }
    public List<string> VerwijderdePaden { get; } = [];

    public Task<string> OpslaanAsync(Guid id, Stream inhoud, string extensie)
        => Task.FromResult(Path.Combine("data", "videos", $"{id}.bin"));

    public FileStream? Openen(string pad) => null;

    public void Verwijderen(string pad)
    {
        if (ThrowOnVerwijderen)
            throw new IOException("Gesimuleerde file-delete fout (T-006 test).");
        VerwijderdePaden.Add(pad);
    }

    public Task<string> OpslaanTempAsync(Guid id, Stream inhoud, string extensie)
        => Task.FromResult(Path.Combine("data", "videos", "temp", $"{id}.bin"));

    public string? VindTempBestand(Guid id) => null;
}
