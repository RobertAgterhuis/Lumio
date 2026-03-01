using Lumio.Api.Rules.Facts;

namespace Lumio.Api.Services;

/// <summary>
/// Builds facts POCO objects for the rules-engine by querying the database.
/// Extracted from StatusController to keep the controller thin and the logic testable.
/// </summary>
public interface IStatusFactsBuilder
{
    Task<CompleetFacts> BuildCompleetFactsAsync();
    Task<MeldingFacts> BuildMeldingFactsAsync();
    Task<SuggestieFacts> BuildSuggestieFactsAsync();
}
