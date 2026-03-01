namespace Lumio.Api.Services.Export;

/// <summary>Creates a ZIP archive containing all PDFs and uploaded documents.</summary>
public interface IZipExportService
{
    Task<byte[]> CreateAllesZipAsync();
}
