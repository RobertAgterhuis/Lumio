using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Lumio.Api.Services.Export;

/// <inheritdoc/>
public sealed class EncryptedBackupService : IEncryptedBackupService
{
    // File header: ASCII "LUMIO_BK" + version byte 0x01
    private static readonly byte[] Magic = Encoding.ASCII.GetBytes("LUMIO_BK");
    private const byte Version = 0x01;
    private const int SaltSize = 16;
    private const int IvSize = 16;
    private const int KeySize = 32;   // AES-256
    private const int Pbkdf2Iterations = 100_000;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        WriteIndented = false,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private readonly IExportDataService _exportData;

    public EncryptedBackupService(IExportDataService exportData) => _exportData = exportData;

    /// <inheritdoc/>
    public async Task<byte[]?> CreateEncryptedBackupAsync(string password)
    {
        var data = await _exportData.BuildExportDataAsync();
        if (data is null) return null;

        var json = JsonSerializer.Serialize(data, _jsonOptions);
        var plaintext = Encoding.UTF8.GetBytes(json);

        // Generate random salt and IV
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var iv = RandomNumberGenerator.GetBytes(IvSize);

        // Derive 256-bit key with PBKDF2-SHA256
        var key = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password), salt, Pbkdf2Iterations,
            HashAlgorithmName.SHA256, KeySize);

        // Encrypt with AES-256-CBC (PKCS7 padding is the default)
        byte[] ciphertext;
        using (var aes = Aes.Create())
        {
            aes.Key = key;
            aes.IV = iv;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;
            using var encryptor = aes.CreateEncryptor();
            ciphertext = encryptor.TransformFinalBlock(plaintext, 0, plaintext.Length);
        }

        // Compose final file: magic + version + salt + IV + ciphertext
        var result = new byte[Magic.Length + 1 + SaltSize + IvSize + ciphertext.Length];
        var offset = 0;
        Buffer.BlockCopy(Magic, 0, result, offset, Magic.Length); offset += Magic.Length;
        result[offset++] = Version;
        Buffer.BlockCopy(salt, 0, result, offset, SaltSize); offset += SaltSize;
        Buffer.BlockCopy(iv, 0, result, offset, IvSize); offset += IvSize;
        Buffer.BlockCopy(ciphertext, 0, result, offset, ciphertext.Length);

        return result;
    }
}
