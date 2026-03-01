using Microsoft.Data.Sqlite;

namespace Lumio.Api.Services.Security;

/// <summary>
/// Manages SQLCipher key-derivation function (KDF) configuration for Lumio databases.
///
/// Implements GAP-SEC-01: migrates any database whose kdf_iter is below
/// <see cref="TargetKdfIterations"/> (312 000 ≥ 310 000 audit requirement) to
/// PBKDF2-HMAC-SHA512 + 312 000 iterations by running PRAGMA rekey with the same
/// password but upgraded cipher settings.
///
/// The default SQLCipher 4 settings (256 000 HMAC-SHA-512) are already strong;
/// this service brings all Lumio databases to 312 000 to satisfy the audit requirement.
/// </summary>
public sealed class SqlCipherKdfService : ISqlCipherKdfService
{
    /// <inheritdoc />
    public int TargetKdfIterations => TargetKdfIterationsConst;

    /// <inheritdoc />
    public string TargetKdfAlgorithm => TargetKdfAlgorithmConst;

    // ── Internal constants ────────────────────────────────────────────────────

    /// <summary>
    /// PBKDF2-HMAC-SHA512 iterations — must be ≥ 310 000 (audit GAP-SEC-01).
    /// Set to 312 000 to exceed the minimum by a comfortable margin.
    /// </summary>
    internal const int TargetKdfIterationsConst = 312_000;

    /// <summary>KDF algorithm — PBKDF2-HMAC-SHA512 (SQLCipher 4 default).</summary>
    internal const string TargetKdfAlgorithmConst = "HMAC_SHA512";

    // ── Public API ────────────────────────────────────────────────────────────

    /// <inheritdoc />
    public async Task<KdfMigrationResult> EnsureTargetKdfAsync(string dbPath, string password)
    {
        if (string.IsNullOrEmpty(dbPath)) throw new ArgumentException("dbPath mag niet leeg zijn.", nameof(dbPath));
        if (string.IsNullOrEmpty(password)) throw new ArgumentException("password mag niet leeg zijn.", nameof(password));

        using var conn = OpenConnection(dbPath, password);
        await conn.OpenAsync();

        var currentIter = await ReadKdfIterFromConnectionAsync(conn);

        if (currentIter >= TargetKdfIterationsConst)
            return new KdfMigrationResult(false, currentIter, currentIter);

        // Apply target KDF settings — these take effect for the next PRAGMA rekey.
        await ExecuteNonQueryAsync(conn, $"PRAGMA kdf_iter = {TargetKdfIterationsConst}");
        await ExecuteNonQueryAsync(conn, $"PRAGMA cipher_kdf_algorithm = {TargetKdfAlgorithmConst}");

        // PRAGMA rekey re-encrypts the database with the same password under the new KDF.
        // Use parameterized quote() to safely escape any special characters in the password.
        using var quoteCmd = conn.CreateCommand();
        quoteCmd.CommandText = "SELECT quote($pw)";
        quoteCmd.Parameters.AddWithValue("$pw", password);
        var quoted = (string?)await quoteCmd.ExecuteScalarAsync()
            ?? throw new InvalidOperationException("SQLCipher quote() retourneerde null.");

        using var rekeyCmd = conn.CreateCommand();
        rekeyCmd.CommandText = $"PRAGMA rekey = {quoted}";
        await rekeyCmd.ExecuteNonQueryAsync();

        return new KdfMigrationResult(WasMigrated: true, PreviousIterations: currentIter, CurrentIterations: TargetKdfIterationsConst);
    }

    /// <inheritdoc />
    public async Task<int> ReadKdfIterAsync(string dbPath, string password)
    {
        using var conn = OpenConnection(dbPath, password);
        await conn.OpenAsync();
        return await ReadKdfIterFromConnectionAsync(conn);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static SqliteConnection OpenConnection(string dbPath, string password)
    {
        var connStr = new SqliteConnectionStringBuilder
        {
            DataSource = dbPath,
            Mode = SqliteOpenMode.ReadWrite,
            Password = password,
        }.ToString();
        return new SqliteConnection(connStr);
    }

    private static async Task<int> ReadKdfIterFromConnectionAsync(SqliteConnection conn)
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "PRAGMA kdf_iter";
        var result = await cmd.ExecuteScalarAsync();
        return result is long l ? (int)l : Convert.ToInt32(result);
    }

    private static async Task ExecuteNonQueryAsync(SqliteConnection conn, string sql)
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        await cmd.ExecuteNonQueryAsync();
    }
}
