using Lumio.Api.Domain.Common;

namespace Lumio.Api.Repositories;

/// <summary>Data bundle returned by <see cref="IStatusDataRepository.GetSnapshotDataAsync"/>.</summary>
public sealed class StatusSnapshotData
{
    public Eigenaar? Eigenaar { get; init; }
    public object? Erfgenamen { get; init; }
    public object? Testament { get; init; }
    public object? Wilsverklaring { get; init; }
    public object? Donor { get; init; }
    public object? Uitvaart { get; init; }
    public int Bezittingen { get; init; }
    public int Bankrekeningen { get; init; }
    public int Verzekeringen { get; init; }
    public int Schulden { get; init; }
    public int Documenten { get; init; }
    public int DigitaleAccounts { get; init; }
    public int Noodcontacten { get; init; }
}

/// <summary>
/// Repository interface for backup status and data snapshot.
/// Introduced in SP-14-003.
/// </summary>
public interface IStatusDataRepository
{
    Task<AuditLogEntry?> FindLatestBackupAsync();
    Task BevestigBackupAsync(DateTime tijdstip);
    Task<StatusSnapshotData> GetSnapshotDataAsync();
}
