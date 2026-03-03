using Lumio.Api.Services.Security;

namespace Lumio.Api.Middleware;

public class DatabaseUnlockMiddleware
{
    private readonly RequestDelegate _next;

    private static readonly string[] AllowedPrefixes =
    [
        "/api/v1/auth/",
        "/api/v1/profielen",
        "/api/v1/backup/restore",
        "/swagger",
        // SP-10-COR-001: endpoint is openbaar — erfgenamen moeten de drempel weten vóór ontgrendeling
        "/api/v1/shamir/drempel",
        // BUG-SHAMIR-001 fix: het ontgrendelingsendpoint moet bereikbaar zijn VOORDAT de DB ontgrendeld is —
        // de erfgenaam kan per definitie niet inloggen als de middleware al een 423 retourneert.
        // Veilig: het endpoint valideert de ingevoerde shares zelf via Shamir-reconstructie + PBKDF2-vergelijking.
        "/api/v1/shamir/reconstrueer-en-ontgrendel"
    ];

    /// <summary>
    /// Prefixes that are allowed even in read-only (Shamir/erfgenaam) mode.
    /// Exports and auth actions remain accessible.
    /// </summary>
    private static readonly string[] ReadOnlyAllowedPrefixes =
    [
        "/api/v1/auth/",
        "/api/v1/export/",
        "/api/v1/status",
        "/api/v1/afhandeling",
        "/api/v1/profielen",
        "/api/v1/backup/restore",
        "/swagger"
    ];

    /// <summary>
    /// HTTP methods that are considered mutating (write) operations.
    /// </summary>
    private static readonly string[] WriteMethods = ["POST", "PUT", "PATCH", "DELETE"];

    public DatabaseUnlockMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IMasterPasswordService passwordService, IProfileService profileService)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";

        // Only apply lock check to /api/ endpoints (not static frontend files)
        if (!path.StartsWith("/api/"))
        {
            await _next(context);
            return;
        }

        if (AllowedPrefixes.Any(prefix => path.StartsWith(prefix)))
        {
            await _next(context);
            return;
        }

        // Check if a profile is selected
        if (profileService.ActiveProfile == null)
        {
            context.Response.StatusCode = 423; // Locked
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Geen profiel geselecteerd. Selecteer eerst een profiel."
            });
            return;
        }

        if (!passwordService.IsUnlocked)
        {
            context.Response.StatusCode = 423; // Locked
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Database is vergrendeld. Ontgrendel eerst met uw wachtwoord."
            });
            return;
        }

        // Read-only mode: block mutating requests unless on the allow-list
        if (passwordService.IsReadOnly
            && WriteMethods.Contains(context.Request.Method, StringComparer.OrdinalIgnoreCase)
            && !ReadOnlyAllowedPrefixes.Any(prefix => path.StartsWith(prefix)))
        {
            context.Response.StatusCode = 403; // Forbidden
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Database is geopend in alleen-lezen modus (erfgenaam-toegang). Wijzigingen zijn niet toegestaan."
            });
            return;
        }

        await _next(context);
    }
}
