namespace Lumio.Api.Services.Export;

/// <summary>Generates HTML documents for sharing estate information with heirs.</summary>
public interface IHtmlExportService
{
    /// <summary>
    /// Builds the heir-overview HTML for the given erfgenaam.
    /// Returns (htmlBytes, veiligNaam) or null if eigenaar/erfgenaam not found.
    /// </summary>
    Task<(byte[] bytes, string veiligNaam)?> BuildErfgenaamHtmlAsync(Guid erfgenaamId);
}
