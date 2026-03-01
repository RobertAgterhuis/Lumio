namespace Lumio.Api.Services.Export;

/// <summary>Generates NUV-standard XML export for funeral sector interoperability.</summary>
public interface INuvExportService
{
    /// <summary>Returns UTF-8 XML bytes conforming to NUV_Uitvaart schema 1.0.</summary>
    Task<byte[]> BuildNuvXmlAsync();
}
