using Lumio.Api.Dtos.Export;

namespace Lumio.Api.Services.Export;

/// <summary>
/// Structures all profile data into portable export formats (JSON, XML, DTO).
/// </summary>
public interface IExportDataService
{
    /// <summary>Loads and assembles all profile data into the export DTO. Returns null if no eigenaar exists.</summary>
    Task<LumioExportData?> BuildExportDataAsync();

    /// <summary>Returns UTF-8 JSON bytes for the full export.</summary>
    Task<byte[]?> BuildJsonExportAsync();

    /// <summary>Returns UTF-8 XML bytes for the full export.</summary>
    Task<byte[]?> BuildXmlExportAsync();
}
