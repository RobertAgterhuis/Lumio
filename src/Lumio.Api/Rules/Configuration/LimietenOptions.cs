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

    /// <summary>S8-12: Per-domein actualisatie-intervallen (overschrijven de globale waarde).</summary>
    public ActualisatieIntervallen ActualisatieIntervallen { get; set; } = new();
}

/// <summary>
/// S8-12: Domein-specifieke actualisatie-intervallen in dagen.
/// Domeinen die hier niet zijn opgenomen gebruiken <see cref="LimietenOptions.ActualisatieIntervalDagen"/>.
/// </summary>
public class ActualisatieIntervallen
{
    public int Standaard { get; set; } = 90;
    public int Testament { get; set; } = 365;
    public int Wilsverklaring { get; set; } = 730;
    public int Donor { get; set; } = 365;
    public int Uitvaartwensen { get; set; } = 365;
    public int Eigenaar { get; set; } = 180;

    /// <summary>Geeft de interval in dagen voor het opgegeven domein (lowercase naam).</summary>
    public int VoorDomein(string domein) => domein switch
    {
        "testament"         => Testament,
        "euthanasie"        => Wilsverklaring,
        "donor"             => Donor,
        "uitvaart"          => Uitvaartwensen,
        "eigenaar"          => Eigenaar,
        _                   => Standaard,
    };
}
