using System.Security.Cryptography;
using System.Text;

namespace Lumio.Api.Services.Security;

/// <summary>
/// Field-level AES-256-GCM encryption for extra-sensitive fields (BSN, seed phrases, passwords).
/// Uses a key derived from the master password with a per-database random salt.
/// </summary>
public class EncryptionService : IEncryptionService
{
    private readonly byte[] _key;

    public EncryptionService(IMasterPasswordService passwordService, IConfiguration config)
    {
        if (!passwordService.IsUnlocked || passwordService.CurrentPassword is null)
            throw new InvalidOperationException("Database moet ontgrendeld zijn voor veldversleuteling.");

        var dbPath = config["DatabasePath"]
            ?? throw new InvalidOperationException("DatabasePath is not configured.");

        var salt = GetOrCreateSalt(dbPath);
        _key = DeriveKey(passwordService.CurrentPassword, salt);
    }

    public string Encrypt(string plaintext)
    {
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var nonce = new byte[12];
        RandomNumberGenerator.Fill(nonce);

        var ciphertext = new byte[plaintextBytes.Length];
        var tag = new byte[16];

        using var aes = new AesGcm(_key, 16);
        aes.Encrypt(nonce, plaintextBytes, ciphertext, tag);

        // Format: base64(nonce + tag + ciphertext)
        var result = new byte[nonce.Length + tag.Length + ciphertext.Length];
        nonce.CopyTo(result, 0);
        tag.CopyTo(result, nonce.Length);
        ciphertext.CopyTo(result, nonce.Length + tag.Length);

        return Convert.ToBase64String(result);
    }

    public string Decrypt(string encoded)
    {
        var data = Convert.FromBase64String(encoded);

        var nonce = data[..12];
        var tag = data[12..28];
        var ciphertext = data[28..];
        var plaintext = new byte[ciphertext.Length];

        using var aes = new AesGcm(_key, 16);
        aes.Decrypt(nonce, ciphertext, tag, plaintext);

        return Encoding.UTF8.GetString(plaintext);
    }

    /// <summary>
    /// Gets the per-database salt from a .salt file next to the DB, or creates one on first use.
    /// Falls back to the legacy fixed salt if the .salt file doesn't exist and the DB already does
    /// (backwards compatibility with existing encrypted data).
    /// </summary>
    private static byte[] GetOrCreateSalt(string dbPath)
    {
        var saltPath = Path.ChangeExtension(dbPath, ".salt");

        if (File.Exists(saltPath))
        {
            return File.ReadAllBytes(saltPath);
        }

        if (File.Exists(dbPath))
        {
            // Existing database without salt file — use legacy fixed salt for compatibility
            return "Lumio.FieldEncryption.v1"u8.ToArray();
        }

        // New database: generate a random 32-byte salt
        var salt = new byte[32];
        RandomNumberGenerator.Fill(salt);
        File.WriteAllBytes(saltPath, salt);
        return salt;
    }

    private static byte[] DeriveKey(string password, byte[] salt)
    {
        return Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            iterations: 100_000,
            HashAlgorithmName.SHA256,
            outputLength: 32);
    }
}
