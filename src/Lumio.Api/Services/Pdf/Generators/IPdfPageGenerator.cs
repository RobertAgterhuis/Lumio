using Lumio.Api.Services.Pdf.Data;
using QuestPDF.Infrastructure;

namespace Lumio.Api.Services.Pdf.Generators;

/// <summary>
/// Contract for all Lumio PDF page generators.
/// Each implementation adds one or more pages to the document for a specific topic.
/// </summary>
public interface IPdfPageGenerator
{
    /// <summary>
    /// Adds all pages relevant to this generator into the supplied document container.
    /// </summary>
    void AddPages(IDocumentContainer container, PdfDataContext data);
}
