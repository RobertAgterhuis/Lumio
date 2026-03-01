namespace Lumio.Api.Services.Export;

/// <summary>
/// Checks which export modules have any data — used by the frontend to show/hide "Geen data" warnings.
/// </summary>
public interface IExportStatusService
{
    /// <summary>Returns a flag per export module indicating whether that module has data.</summary>
    Task<Dictionary<string, bool>> GetExportStatusAsync();
}
