using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Middleware;

/// <summary>
/// Exception handling middleware that returns RFC 9457 ProblemDetails responses.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Ongeldige bewerking: {Message}", ex.Message);
            await WriteProblemDetailsAsync(context, HttpStatusCode.BadRequest, "Ongeldige bewerking", ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            await WriteProblemDetailsAsync(context, HttpStatusCode.NotFound, "Niet gevonden", ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Onverwachte fout: {Message}", ex.Message);
            await WriteProblemDetailsAsync(context, HttpStatusCode.InternalServerError, "Serverfout", "Er is een onverwachte fout opgetreden.");
        }
    }

    private static async Task WriteProblemDetailsAsync(HttpContext context, HttpStatusCode statusCode, string title, string detail)
    {
        var problemDetails = new ProblemDetails
        {
            Type = $"https://httpstatuses.com/{(int)statusCode}",
            Title = title,
            Status = (int)statusCode,
            Detail = detail,
            Instance = context.Request.Path
        };

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(problemDetails);
    }
}
