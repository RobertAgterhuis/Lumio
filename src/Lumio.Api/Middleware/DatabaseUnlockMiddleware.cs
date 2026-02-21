using Lumio.Api.Services.Security;

namespace Lumio.Api.Middleware;

public class DatabaseUnlockMiddleware
{
    private readonly RequestDelegate _next;

    private static readonly string[] AllowedPrefixes =
    [
        "/api/auth/",
        "/api/profielen",
        "/api/status",
        "/api/backup/restore",
        "/swagger"
    ];

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

        await _next(context);
    }
}
