namespace Lumio.Api.Rules.Configuration;

/// <summary>
/// Veldversleuteling parameters. Wijzig alleen bij nieuwe installaties.
/// </summary>
public class EncryptieOptions
{
    public int Pbkdf2Iteraties { get; set; } = 100_000;
    public int SaltLengteBytes { get; set; } = 32;
    public int NonceLengteBytes { get; set; } = 12;
    public int TagLengteBytes { get; set; } = 16;
    public int KeyLengteBytes { get; set; } = 32;
}
