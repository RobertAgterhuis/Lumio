namespace Lumio.Api.Services.Security;

public interface IEncryptionService
{
    string Encrypt(string plaintext);
    string Decrypt(string ciphertext);

    /// <summary>Encrypt raw binary data (e.g., file contents). Returns nonce+tag+ciphertext bytes.</summary>
    byte[] EncryptBytes(byte[] data);

    /// <summary>Decrypt bytes previously encrypted with <see cref="EncryptBytes"/>.</summary>
    byte[] DecryptBytes(byte[] encryptedData);
}
