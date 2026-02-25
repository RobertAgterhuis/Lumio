namespace Lumio.Api.Rules.Configuration;

/// <summary>
/// Applicatie-brede limieten en drempels.
/// </summary>
public class LimietenOptions
{
    public int MaxProfielen { get; set; } = 5;
    public int WachtwoordMinLengte { get; set; } = 8;
    public int ShamirMinDrempel { get; set; } = 2;
    public int BackupVerouderdDagen { get; set; } = 30;
    public int DocumentVerlooptWaarschuwingDagen { get; set; } = 30;
    public int ActualisatieIntervalDagen { get; set; } = 90;
    public int AuditLogStandaardLimiet { get; set; } = 200;
    public int ZoekenMinQueryLengte { get; set; } = 2;
    public long FotoMaxBytes { get; set; } = 10_485_760;    // 10 MB
    public long DocumentMaxBytes { get; set; } = 52_428_800; // 50 MB
    public long VideoMaxBytes { get; set; } = 104_857_600;   // 100 MB
    public int VideoMaxAantal { get; set; } = 10;
}
