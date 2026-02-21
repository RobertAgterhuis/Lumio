using System.Text.RegularExpressions;

namespace Lumio.Api.Middleware;

/// <summary>
/// Rewrites Next.js RSC request paths that use dots as separators
/// to forward-slash subdirectories, fixing 404s for route group segments.
/// e.g. /__next.ABC.eigenaar.txt → /__next.ABC/eigenaar.txt
/// e.g. /__next.ABC.eigenaar.__PAGE__.txt → /__next.ABC/eigenaar/__PAGE__.txt
/// </summary>
public partial class RscRewriteMiddleware
{
    private readonly RequestDelegate _next;

    public RscRewriteMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value;
        if (path != null)
        {
            var match = RscPattern().Match(path);
            if (match.Success)
            {
                // Group 1 = hash (no dots), Group 2 = dot-separated segments ending in .txt
                // Replace all dots in group 2 with slashes, EXCEPT the last .txt extension
                var hash = match.Groups[1].Value;
                var rest = match.Groups[2].Value; // e.g. "erfgenamen.__PAGE__.txt"

                // Split off the .txt extension, replace dots with slashes in the remainder
                var withoutExt = rest[..^4]; // strip ".txt"
                var segments = withoutExt.Replace('.', '/');

                var newPath = path[..match.Index]
                    + "/__next." + hash
                    + "/" + segments + ".txt";
                context.Request.Path = newPath;
            }
        }
        await _next(context);
    }

    // Match: /__next.HASH.rest.txt where HASH contains no dots
    [GeneratedRegex(@"/__next\.([^./]+)\.(.+\.txt)$", RegexOptions.Compiled)]
    private static partial Regex RscPattern();
}
