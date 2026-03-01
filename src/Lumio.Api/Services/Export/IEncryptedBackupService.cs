namespace Lumio.Api.Services.Export;

/// <summary>
/// Produces an AES-256-CBC encrypted backup of all user data.
/// Format: [8-byte magic "LUMIO_BK"][1-byte version 0x01][16-byte PBKDF2 salt][16-byte AES IV][encrypted JSON payload].
/// Key derivation: PBKDF2-SHA256, 100 000 iterations, 32-byte output key.
/// </summary>
public interface IEncryptedBackupService
{
    /// <summary>
    /// Builds the complete export data, serialises it to JSON, and encrypts it with the supplied password.
    /// Returns <c>null</c> when no profile exists yet.
    /// </summary>
    Task<byte[]?> CreateEncryptedBackupAsync(string password);
}
