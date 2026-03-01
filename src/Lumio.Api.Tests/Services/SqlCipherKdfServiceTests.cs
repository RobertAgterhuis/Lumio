using Lumio.Api.Services.Security;
using Microsoft.Data.Sqlite;

namespace Lumio.Api.Tests.Services;

/// <summary>
/// Unit tests for <see cref="SqlCipherKdfService"/> — GAP-SEC-01.
///
/// AC: Unit test bewijst dat KDF-parameters correct geconfigureerd zijn.
///
/// Note: Integration tests that open a real SQLCipher file are included in the
/// KdfIntegration region below. They require write access to Temp and the native
/// SQLCipher library (available via SQLitePCLRaw.bundle_e_sqlcipher transitive dep).
/// </summary>
public class SqlCipherKdfServiceTests
{
    // ── Constants verification ────────────────────────────────────────────────

    [Fact]
    public void TargetKdfIterations_MeetsAuditRequirement()
    {
        // GAP-SEC-01: ≥310 000 iterations required
        Assert.True(
            SqlCipherKdfService.TargetKdfIterationsConst >= 310_000,
            $"TargetKdfIterations ({SqlCipherKdfService.TargetKdfIterationsConst}) moet ≥ 310 000 zijn.");
    }

    [Fact]
    public void TargetKdfAlgorithm_IsPbkdf2HmacSha512()
    {
        Assert.Equal("HMAC_SHA512", SqlCipherKdfService.TargetKdfAlgorithmConst);
    }

    [Fact]
    public void Interface_TargetKdfIterations_MatchesConst()
    {
        ISqlCipherKdfService svc = new SqlCipherKdfService();
        Assert.Equal(SqlCipherKdfService.TargetKdfIterationsConst, svc.TargetKdfIterations);
    }

    [Fact]
    public void Interface_TargetKdfAlgorithm_MatchesConst()
    {
        ISqlCipherKdfService svc = new SqlCipherKdfService();
        Assert.Equal(SqlCipherKdfService.TargetKdfAlgorithmConst, svc.TargetKdfAlgorithm);
    }

    // ── Guard: invalid input ──────────────────────────────────────────────────

    [Fact]
    public async Task EnsureTargetKdfAsync_EmptyDbPath_ThrowsArgumentException()
    {
        var svc = new SqlCipherKdfService();
        await Assert.ThrowsAsync<ArgumentException>(() =>
            svc.EnsureTargetKdfAsync(string.Empty, "pw"));
    }

    [Fact]
    public async Task EnsureTargetKdfAsync_EmptyPassword_ThrowsArgumentException()
    {
        var svc = new SqlCipherKdfService();
        await Assert.ThrowsAsync<ArgumentException>(() =>
            svc.EnsureTargetKdfAsync("/tmp/test.db", string.Empty));
    }

    // ── Integration: real SQLCipher database ─────────────────────────────────

    [Fact]
    public async Task ReadKdfIterAsync_NewDatabase_ReturnsNonZeroValue()
    {
        // Arrange: create a real SQLCipher database in a temp file
        var dbPath = Path.Combine(Path.GetTempPath(), $"lumio-kdf-test-{Guid.NewGuid()}.db");
        try
        {
            CreateTestDatabase(dbPath, "testpassword");
            var svc = new SqlCipherKdfService();

            // Act
            var kdfIter = await svc.ReadKdfIterAsync(dbPath, "testpassword");

            // Assert: SQLCipher 4.x default is 256 000; any positive non-zero is valid here
            Assert.True(kdfIter > 0, $"kdf_iter was {kdfIter} — verwacht positief getal.");
        }
        finally
        {
            // ClearAllPools releases the pooled connection's file handle before we delete the temp file.
            SqliteConnection.ClearAllPools();
            if (File.Exists(dbPath)) File.Delete(dbPath);
        }
    }

    [Fact]
    public async Task EnsureTargetKdfAsync_NewDatabase_ReturnsCurrentIterationsWhenAlreadyMet()
    {
        // Arrange: first run EnsureTargetKdf (migrates to target), then run again.
        var dbPath = Path.Combine(Path.GetTempPath(), $"lumio-kdf-idempotent-{Guid.NewGuid()}.db");
        try
        {
            CreateTestDatabase(dbPath, "idempotentpw");
            var svc = new SqlCipherKdfService();

            // First call — performs migration if needed
            var first = await svc.EnsureTargetKdfAsync(dbPath, "idempotentpw");

            // Second call — should NOT migrate again (idempotent)
            var second = await svc.EnsureTargetKdfAsync(dbPath, "idempotentpw");

            Assert.False(second.WasMigrated, "Tweede aanroep mag de database niet opnieuw migreren.");
            Assert.Equal(SqlCipherKdfService.TargetKdfIterationsConst, second.CurrentIterations);
        }
        finally
        {
            SqliteConnection.ClearAllPools();
            if (File.Exists(dbPath)) File.Delete(dbPath);
        }
    }

    [Fact]
    public async Task EnsureTargetKdfAsync_AfterMigration_ReadKdfIterReturnsTarget()
    {
        // Arrange
        var dbPath = Path.Combine(Path.GetTempPath(), $"lumio-kdf-verify-{Guid.NewGuid()}.db");
        try
        {
            CreateTestDatabase(dbPath, "verifypw");
            var svc = new SqlCipherKdfService();

            // Act
            await svc.EnsureTargetKdfAsync(dbPath, "verifypw");
            var kdfIterAfter = await svc.ReadKdfIterAsync(dbPath, "verifypw");

            // Assert — after migration, kdf_iter must equal target
            Assert.Equal(SqlCipherKdfService.TargetKdfIterationsConst, kdfIterAfter);
        }
        finally
        {
            SqliteConnection.ClearAllPools();
            if (File.Exists(dbPath)) File.Delete(dbPath);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Creates a minimal SQLCipher database at <paramref name="dbPath"/> so tests have
    /// a real encrypted file to work with.
    /// </summary>
    private static void CreateTestDatabase(string dbPath, string password)
    {
        SQLitePCL.Batteries_V2.Init();

        var connStr = new Microsoft.Data.Sqlite.SqliteConnectionStringBuilder
        {
            DataSource = dbPath,
            Mode = Microsoft.Data.Sqlite.SqliteOpenMode.ReadWriteCreate,
            Password = password,
        }.ToString();

        using var conn = new Microsoft.Data.Sqlite.SqliteConnection(connStr);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "CREATE TABLE IF NOT EXISTS kdf_test (id INTEGER PRIMARY KEY);";
        cmd.ExecuteNonQuery();
    }
}
