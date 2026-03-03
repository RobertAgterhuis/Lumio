using Lumio.Api.Domain.Common;
using Lumio.Api.Services.Security;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Logging;

namespace Lumio.Api.Tests.Services;

/// <summary>
/// Unit / integration tests for <see cref="MasterPasswordService"/> logging — SP-8-R003.
///
/// AC: MasterPasswordService.UnlockAsync logt KDF-migratiefout via ILogger.LogWarning.
/// AC: Tests verifiëren dat de log-call wordt gedaan wanneer een exceptie optreedt.
///
/// Note: The outer unlock path requires a real SQLCipher database connection.
/// The KDF migration path is isolated via a protected virtual override (testability seam).
/// </summary>
[Collection("SqlCipher")] // Serialize with SqlCipherKdfServiceTests — prevents ClearAllPools / PRAGMA interference
public class MasterPasswordServiceLoggingTests
{
    private const string TestPassword = "lumio-logging-test-pw";

    // ── KDF migration exception → LogWarning ─────────────────────────────────

    [Fact]
    public async Task UnlockAsync_WhenKdfMigrationThrows_LogsWarningAndReturnsTrue()
    {
        var dbPath = Path.Combine(Path.GetTempPath(), $"lumio-logging-test-{Guid.NewGuid()}.db");
        try
        {
            // Arrange: create a real SQLCipher database
            CreateTestDatabase(dbPath, TestPassword);

            var profileSvc = new FixedPathProfileService(dbPath);
            var kdfSvc = new NoOpKdfService(); // never called — override bypasses it
            var logger = new CapturingLogger<MasterPasswordService>();
            var kdfException = new InvalidOperationException("Gesimuleerde KDF-fout");

            // TestableMasterPasswordService overrides ExecuteKdfMigrationAsync to throw
            var svc = new TestableMasterPasswordService(profileSvc, kdfSvc, logger, kdfException);

            // Act
            var result = await svc.UnlockAsync(TestPassword);

            // Assert: unlock succeeded despite the KDF failure
            Assert.True(result, "UnlockAsync moet true retourneren, ook bij een KDF-fout.");

            // Assert: one warning logged that contains the db path and the original exception
            var warning = Assert.Single(logger.Warnings);
            Assert.Contains(dbPath, warning.Message);
            Assert.Same(kdfException, warning.Exception);
        }
        finally
        {
            SqliteConnection.ClearAllPools();
            if (File.Exists(dbPath)) File.Delete(dbPath);
        }
    }

    [Fact]
    public async Task UnlockAsync_WhenKdfMigrationSucceeds_DoesNotLogWarning()
    {
        var dbPath = Path.Combine(Path.GetTempPath(), $"lumio-logging-noop-{Guid.NewGuid()}.db");
        try
        {
            CreateTestDatabase(dbPath, TestPassword);

            var profileSvc = new FixedPathProfileService(dbPath);
            var kdfSvc = new NoOpKdfService();
            var logger = new CapturingLogger<MasterPasswordService>();

            // Use a subclass where ExecuteKdfMigrationAsync succeeds silently
            var svc = new TestableMasterPasswordService(profileSvc, kdfSvc, logger, kdfException: null);

            await svc.UnlockAsync(TestPassword);

            Assert.Empty(logger.Warnings);
        }
        finally
        {
            SqliteConnection.ClearAllPools();
            if (File.Exists(dbPath)) File.Delete(dbPath);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Testable subclass: overrides <see cref="MasterPasswordService.ExecuteKdfMigrationAsync"/>
    /// so the KDF path can be tested without running a real migration.
    /// When <paramref name="kdfException"/> is non-null, the override throws it.
    /// </summary>
    private sealed class TestableMasterPasswordService : MasterPasswordService
    {
        private readonly Exception? _kdfException;

        public TestableMasterPasswordService(
            IProfileService profileService,
            ISqlCipherKdfService kdfService,
            ILogger<MasterPasswordService> logger,
            Exception? kdfException)
            : base(profileService, kdfService, logger)
        {
            _kdfException = kdfException;
        }

        protected override Task ExecuteKdfMigrationAsync(string dbPath, string password)
        {
            if (_kdfException is not null)
                throw _kdfException;
            return Task.CompletedTask;
        }
    }

    /// <summary>
    /// <see cref="IProfileService"/> stub that returns a fixed database path.
    /// </summary>
    private sealed class FixedPathProfileService : IProfileService
    {
        private readonly string _dbPath;

        public FixedPathProfileService(string dbPath)
        {
            _dbPath = dbPath;
        }

        public Profile? ActiveProfile => new() { Naam = "Test", Relatie = "test" };
        public string? ActiveDbPath => _dbPath;
        public string? ActiveSaltPath => null;
        public bool IsFirstRun => false;
        public bool ActiveProfileDbExists => true;

        public List<Profile> GetProfiles() => [];
        public Profile? GetProfile(Guid id) => null;
        public void SelectProfile(Guid profileId) { }
        public void DeselectProfile() { }
        public Profile CreateProfile(string naam, string relatie) => new() { Naam = naam, Relatie = relatie };
        public void DeleteProfile(Guid profileId) { }
        public void UpdateActiveProfileThumbnail(string? base64Thumbnail) { }
        public void UpdateShamirDrempel(Guid profileId, int drempel) { }
    }

    /// <summary>
    /// <see cref="ISqlCipherKdfService"/> stub that performs no operations.
    /// In the <see cref="TestableMasterPasswordService"/> this is never called — the override
    /// bypasses it — but DI / constructor requires a non-null instance.
    /// </summary>
    private sealed class NoOpKdfService : ISqlCipherKdfService
    {
        public int TargetKdfIterations => 310_000;
        public string TargetKdfAlgorithm => "PBKDF2-HMAC-SHA512";

        public Task<KdfMigrationResult> EnsureTargetKdfAsync(string dbPath, string password)
            => Task.FromResult(new KdfMigrationResult(false, 310_000, 310_000));

        public Task<int> ReadKdfIterAsync(string dbPath, string password)
            => Task.FromResult(310_000);
    }

    /// <summary>Creates a minimal real SQLCipher database at <paramref name="dbPath"/>.</summary>
    private static void CreateTestDatabase(string dbPath, string password)
    {
        SQLitePCL.Batteries_V2.Init();

        var connStr = new SqliteConnectionStringBuilder
        {
            DataSource = dbPath,
            Mode = SqliteOpenMode.ReadWriteCreate,
            Password = password,
        }.ToString();

        using var conn = new SqliteConnection(connStr);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "CREATE TABLE IF NOT EXISTS logging_test (id INTEGER PRIMARY KEY);";
        cmd.ExecuteNonQuery();
    }
}
