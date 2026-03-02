using Lumio.Api.Services.Security;

namespace Lumio.Api.Tests;

/// <summary>
/// In-memory no-op fake for <see cref="ISqlCipherKdfService"/> for use in controller unit tests.
/// Always reports no migration needed.
/// </summary>
public sealed class FakeSqlCipherKdfService : ISqlCipherKdfService
{
    public int TargetKdfIterations => 312_000;
    public string TargetKdfAlgorithm => "PBKDF2-SHA512";

    public Task<KdfMigrationResult> EnsureTargetKdfAsync(string dbPath, string password) =>
        Task.FromResult(new KdfMigrationResult(
            WasMigrated: false,
            PreviousIterations: TargetKdfIterations,
            CurrentIterations: TargetKdfIterations));

    public Task<int> ReadKdfIterAsync(string dbPath, string password) =>
        Task.FromResult(TargetKdfIterations);
}
