using System.Text.Json;
using RulesEngine.Models;

namespace Lumio.Api.Rules.Engine;

/// <summary>
/// Wraps Microsoft.RulesEngine voor het evalueren van workflow-regels.
/// Biedt een vereenvoudigde API en handelt fouten af met fallback-ondersteuning.
/// </summary>
public interface IRuleEngineService
{
    /// <summary>Geeft aan of de rule engine beschikbaar is (workflows geladen).</summary>
    bool IsAvailable { get; }

    /// <summary>
    /// Evalueert alle regels in een workflow tegen de opgegeven facts.
    /// Retourneert alleen de regels die succesvol zijn (conditie is voldaan).
    /// </summary>
    Task<List<RuleResultTree>> EvalueerAsync(string workflowName, params RuleParameter[] parameters);

    /// <summary>
    /// Evalueert een workflow en retourneert de SuccessEvent JSON-strings
    /// van alle succesvol geëvalueerde regels.
    /// </summary>
    Task<List<string>> EvalueerSuccessEventsAsync(string workflowName, params RuleParameter[] parameters);

    /// <summary>
    /// Evalueert een workflow en deserialiseert de SuccessEvent-strings naar het opgegeven type.
    /// </summary>
    Task<List<T>> EvalueerAsync<T>(string workflowName, params RuleParameter[] parameters) where T : class;
}

public class RuleEngineService : IRuleEngineService
{
    private readonly RulesEngine.RulesEngine? _engine;
    private readonly ILogger<RuleEngineService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public RuleEngineService(IWorkflowLoader loader, ILogger<RuleEngineService> logger)
    {
        _logger = logger;

        var workflows = loader.Workflows;
        if (workflows is not null)
        {
            var settings = new ReSettings
            {
                CustomTypes = [typeof(string), typeof(DateTime), typeof(Math), typeof(Enumerable)]
            };
            _engine = new RulesEngine.RulesEngine(workflows, settings);
            _logger.LogInformation("RuleEngine geïnitialiseerd met {Aantal} workflow(s)", workflows.Length);
        }
    }

    public bool IsAvailable => _engine is not null;

    public async Task<List<RuleResultTree>> EvalueerAsync(string workflowName, params RuleParameter[] parameters)
    {
        if (_engine is null)
            return [];

        var results = await _engine.ExecuteAllRulesAsync(workflowName, parameters);
        return results.Where(r => r.IsSuccess).ToList();
    }

    public async Task<List<string>> EvalueerSuccessEventsAsync(string workflowName, params RuleParameter[] parameters)
    {
        var results = await EvalueerAsync(workflowName, parameters);
        return results
            .Where(r => !string.IsNullOrEmpty(r.Rule.SuccessEvent))
            .Select(r => r.Rule.SuccessEvent)
            .ToList();
    }

    public async Task<List<T>> EvalueerAsync<T>(string workflowName, params RuleParameter[] parameters) where T : class
    {
        var events = await EvalueerSuccessEventsAsync(workflowName, parameters);
        var items = new List<T>();

        foreach (var json in events)
        {
            try
            {
                var item = JsonSerializer.Deserialize<T>(json, JsonOptions);
                if (item is not null)
                    items.Add(item);
            }
            catch (JsonException ex)
            {
                _logger.LogWarning(ex, "Kon SuccessEvent niet deserialiseren naar {Type}: {Json}", typeof(T).Name, json);
            }
        }

        return items;
    }
}
