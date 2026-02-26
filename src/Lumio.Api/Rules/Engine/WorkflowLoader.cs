using System.Text.Json;
using System.Text.Json.Serialization;
using RulesEngine.Models;

namespace Lumio.Api.Rules.Engine;

/// <summary>
/// Laadt en cacht workflow-definities uit lumio-workflows.json.
/// Als het bestand ontbreekt, werkt de applicatie door op fallback-logica in de domain services.
/// </summary>
public interface IWorkflowLoader
{
    /// <summary>Geeft de geladen workflows, of null als het bestand ontbreekt.</summary>
    Workflow[]? Workflows { get; }

    /// <summary>Geeft aan of workflows beschikbaar zijn.</summary>
    bool IsAvailable { get; }
}

public class WorkflowLoader : IWorkflowLoader
{
    private readonly Workflow[]? _workflows;
    private readonly ILogger<WorkflowLoader> _logger;

    public WorkflowLoader(ILogger<WorkflowLoader> logger)
    {
        _logger = logger;
        var path = Path.Combine(AppContext.BaseDirectory, "rules", "lumio-workflows.json");

        if (!File.Exists(path))
        {
            _logger.LogWarning(
                "Workflow-bestand niet gevonden: {Path}. Rule engine is uitgeschakeld, fallback naar domain services.",
                path);
            return;
        }

        try
        {
            var json = File.ReadAllText(path);
            _workflows = JsonSerializer.Deserialize<Workflow[]>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            });

            if (_workflows is null || _workflows.Length == 0)
            {
                _logger.LogWarning("Workflow-bestand is leeg of ongeldig: {Path}", path);
                _workflows = null;
            }
            else
            {
                _logger.LogInformation(
                    "Lumio workflows geladen: {Aantal} workflow(s) uit {Path}",
                    _workflows.Length, path);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fout bij laden van workflow-bestand: {Path}", path);
            _workflows = null;
        }
    }

    public Workflow[]? Workflows => _workflows;
    public bool IsAvailable => _workflows is not null;
}
