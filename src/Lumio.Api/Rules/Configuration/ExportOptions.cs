namespace Lumio.Api.Rules.Configuration;

/// <summary>
/// Export/PDF gerelateerde configuratie.
/// </summary>
public class ExportOptions
{
    public string StandaardPapierformaat { get; set; } = "A4";
    public int PdfMarginPt { get; set; } = 40;
    public string[] ToegestaneBestandstypes { get; set; } = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
}
