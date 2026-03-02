using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.Testament;

namespace Lumio.Api.Repositories;

/// <summary>Data bundle returned by <see cref="ITestamentJuridischeCheckRepository.GetCheckDataAsync"/>.</summary>
public sealed class TestamentCheckData
{
    public Eigenaar?            Eigenaar            { get; init; }
    public TestamentInfo?       Testament           { get; init; }
    public List<Begunstigde>    Begunstigden        { get; init; } = [];
    public List<Executeur>      Executeurs          { get; init; } = [];
    public List<Erfgenaam>      Erfgenamen          { get; init; } = [];
    public List<FysiekBezit>    FysiekeBezittingen  { get; init; } = [];
}

/// <summary>
/// Repository interface for the juridical check on testament data.
/// Introduced in SP-14-003.
/// </summary>
public interface ITestamentJuridischeCheckRepository
{
    Task<TestamentCheckData> GetCheckDataAsync();
}
