using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Extensions;

/// <summary>
/// Extension methods for returning RFC 9457 ProblemDetails from controllers.
/// </summary>
public static class ProblemDetailsExtensions
{
    /// <summary>
    /// Returns a BadRequest (400) with ProblemDetails response.
    /// </summary>
    public static BadRequestObjectResult BadRequestProblem(this ControllerBase controller, string detail, string? title = null)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://httpstatuses.com/400",
            Title = title ?? "Ongeldige aanvraag",
            Status = StatusCodes.Status400BadRequest,
            Detail = detail,
            Instance = controller.HttpContext.Request.Path
        };
        return new BadRequestObjectResult(problemDetails)
        {
            ContentTypes = { "application/problem+json" }
        };
    }

    /// <summary>
    /// Returns a NotFound (404) with ProblemDetails response.
    /// </summary>
    public static NotFoundObjectResult NotFoundProblem(this ControllerBase controller, string detail, string? title = null)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://httpstatuses.com/404",
            Title = title ?? "Niet gevonden",
            Status = StatusCodes.Status404NotFound,
            Detail = detail,
            Instance = controller.HttpContext.Request.Path
        };
        return new NotFoundObjectResult(problemDetails)
        {
            ContentTypes = { "application/problem+json" }
        };
    }

    /// <summary>
    /// Returns an Unauthorized (401) with ProblemDetails response.
    /// </summary>
    public static UnauthorizedObjectResult UnauthorizedProblem(this ControllerBase controller, string detail, string? title = null)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://httpstatuses.com/401",
            Title = title ?? "Niet geautoriseerd",
            Status = StatusCodes.Status401Unauthorized,
            Detail = detail,
            Instance = controller.HttpContext.Request.Path
        };
        return new UnauthorizedObjectResult(problemDetails)
        {
            ContentTypes = { "application/problem+json" }
        };
    }

    /// <summary>
    /// Returns a Conflict (409) with ProblemDetails response.
    /// </summary>
    public static ConflictObjectResult ConflictProblem(this ControllerBase controller, string detail, string? title = null)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://httpstatuses.com/409",
            Title = title ?? "Conflict",
            Status = StatusCodes.Status409Conflict,
            Detail = detail,
            Instance = controller.HttpContext.Request.Path
        };
        return new ConflictObjectResult(problemDetails)
        {
            ContentTypes = { "application/problem+json" }
        };
    }
}
