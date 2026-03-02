using Lumio.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Services;

/// <summary>
/// AVG art. 5(1)(e) — opslagbeperking: AuditLog-entries ouder dan 90 dagen worden dagelijks verwijderd.
/// DEC-104 / GUARD-SEC-004: de retentietermijn is instelbaar via appsettings (AuditLog:RetentieDagen).
/// </summary>
public class AuditLogRotatieService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AuditLogRotatieService> _logger;
    private readonly int _retentieDagen;

    // Rotatie-interval: dagelijks om ~03:00 (willekeurige spread van 0-30 min om clock-burst te voorkomen)
    private static readonly TimeSpan Interval = TimeSpan.FromDays(1);

    public AuditLogRotatieService(
        IServiceProvider serviceProvider,
        ILogger<AuditLogRotatieService> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _retentieDagen = configuration.GetValue<int>("AuditLog:RetentieDagen", 90);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "AuditLogRotatieService gestart — retentie {Dagen} dagen, interval {Interval}",
            _retentieDagen, Interval);

        // Wacht even bij opstart zodat andere services (EF/SQLCipher) klaar zijn
        await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            await VerwijderVerlopenEntriesAsync(stoppingToken);

            try
            {
                await Task.Delay(Interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Normale afsluiting — geen exception gooien
                break;
            }
        }

        _logger.LogInformation("AuditLogRotatieService gestopt.");
    }

    private async Task VerwijderVerlopenEntriesAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<LumioDbContext>();

            var grens = DateTime.UtcNow.AddDays(-_retentieDagen);

            // ExecuteDeleteAsync: één DELETE-statement zonder de rijen in geheugen te laden (EF 7+)
            var verwijderd = await db.AuditLog
                .Where(e => e.Tijdstip < grens)
                .ExecuteDeleteAsync(cancellationToken);

            if (verwijderd > 0)
            {
                _logger.LogInformation(
                    "AuditLog-rotatie: {Aantal} entries verwijderd (ouder dan {Grens:yyyy-MM-dd}, retentie {Dagen} dagen).",
                    verwijderd, grens, _retentieDagen);
            }
            else
            {
                _logger.LogDebug("AuditLog-rotatie: geen verlopen entries gevonden.");
            }
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            // DB kan tijdelijk vergrendeld zijn (SQLCipher) — logt en probeert morgen opnieuw
            _logger.LogWarning(ex, "AuditLog-rotatie mislukt — wordt morgen opnieuw geprobeerd.");
        }
    }
}
