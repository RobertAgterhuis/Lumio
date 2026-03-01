namespace Lumio.Api.Services.Security;

/// <summary>
/// Result of an <see cref="ISqlCipherKdfService.EnsureTargetKdfAsync"/> operation.
/// </summary>
/// <param name="WasMigrated">True when the database was re-encrypted with the target KDF.</param>
/// <param name="PreviousIterations">The kdf_iter value that was in effect before migration.</param>
/// <param name="CurrentIterations">The kdf_iter value that is now in effect.</param>
public record KdfMigrationResult(bool WasMigrated, int PreviousIterations, int CurrentIterations);

/// <summary>
/// Manages SQLCipher key-derivation function (KDF) configuration for Lumio databases.
/// Ensures all databases meet the minimum security requirement of PBKDF2-HMAC-SHA512
/// with at least <see cref="TargetKdfIterations"/> iterations (GAP-SEC-01).
/// </summary>
public interface ISqlCipherKdfService
{
    /// <summary>
    /// PBKDF2-HMAC-SHA512 iterations that all Lumio databases MUST use.
    /// Exceeds the NIST SP 800-132 recommendation of 310 000 for PBKDF2-SHA-512.
    /// </summary>
    int TargetKdfIterations { get; }

    /// <summary>The KDF algorithm all Lumio databases MUST use.</summary>
    string TargetKdfAlgorithm { get; }

    /// <summary>
    /// Opens <paramref name="dbPath"/> with <paramref name="password"/> and ensures the
    /// database uses the target KDF configuration. If the current kdf_iter is lower than
    /// <see cref="TargetKdfIterations"/>, the database is re-encrypted (PRAGMA rekey) with
    /// the target settings. The password does not change.
    /// </summary>
    Task<KdfMigrationResult> EnsureTargetKdfAsync(string dbPath, string password);

    /// <summary>
    /// Reads the current kdf_iter pragma value from an already-open connection.
    /// Used by tests and diagnostics to verify a database's KDF configuration.
    /// </summary>
    Task<int> ReadKdfIterAsync(string dbPath, string password);
}
