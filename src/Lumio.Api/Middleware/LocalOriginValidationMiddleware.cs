namespace Lumio.Api.Middleware;

/// <summary>
/// Validates the <c>Origin</c> and <c>Referer</c> headers on all <c>/api/</c> requests
/// and rejects non-localhost origins with HTTP 403.
///
/// Implements GAP-ARC-01: only the Electron renderer (or a local dev browser) may call
/// the Lumio API. Cross-origin requests from external domains are blocked.
///
/// Allowed origins:
/// - No Origin header (e.g. direct Electron IPC calls, curl, local tools)
/// - <c>app://lumio</c>       — Electron custom protocol
/// - <c>http://localhost*</c> — local development / testing
/// - <c>http://127.0.0.1*</c> — loopback IPv4
/// - <c>http://[::1]*</c>     — loopback IPv6
/// - <c>file://</c>           — file-based renderer (legacy Electron mode)
///
/// ADR: devdocs/adr-004-localhost-api-boundary.md
/// </summary>
public sealed class LocalOriginValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LocalOriginValidationMiddleware> _logger;

    public LocalOriginValidationMiddleware(
        RequestDelegate next,
        ILogger<LocalOriginValidationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Only validate API routes — Swagger UI, static assets etc. are not restricted.
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            var origin = context.Request.Headers["Origin"].FirstOrDefault()
                      ?? context.Request.Headers["Referer"].FirstOrDefault();

            if (origin is not null && !IsAllowedOrigin(origin))
            {
                _logger.LogWarning(
                    "LocalOriginValidation: verzoek geweigerd — onbekende origin {Origin} voor {Path}",
                    origin,
                    context.Request.Path);

                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new
                {
                    error  = "Toegang geweigerd: alleen lokale origins zijn toegestaan.",
                    origin = "[GEREDACTEERD]"
                });
                return;
            }
        }

        await _next(context);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    internal static bool IsAllowedOrigin(string origin)
    {
        if (string.IsNullOrWhiteSpace(origin)) return true;

        return origin.StartsWith("app://lumio", StringComparison.OrdinalIgnoreCase)
            || origin.StartsWith("file://", StringComparison.OrdinalIgnoreCase)
            || origin.StartsWith("http://localhost", StringComparison.OrdinalIgnoreCase)
            || origin.StartsWith("http://127.0.0.1", StringComparison.OrdinalIgnoreCase)
            || origin.StartsWith("http://[::1]", StringComparison.OrdinalIgnoreCase)
            || origin.StartsWith("https://localhost", StringComparison.OrdinalIgnoreCase);
    }
}
