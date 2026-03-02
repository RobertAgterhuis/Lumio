using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.DigitalEstate;
using Lumio.Api.Domain.Documents;

namespace Lumio.Api.Repositories;

/// <summary>Data bundle returned by <see cref="IZoekenRepository.LaadAlleDataAsync"/>.</summary>
public sealed class ZoekDataSet
{
    public List<Erfgenaam>          Erfgenamen          { get; init; } = [];
    public List<Noodcontact>        Noodcontacten       { get; init; } = [];
    public List<DigitaalAccount>    DigitaleAccounts    { get; init; } = [];
    public List<WachtwoordEntry>    Wachtwoorden        { get; init; } = [];
    public List<CryptoWallet>       CryptoWallets       { get; init; } = [];
    public List<FysiekBezit>        FysiekeBezittingen  { get; init; } = [];
    public List<Bankrekening>       Bankrekeningen      { get; init; } = [];
    public List<Verzekering>        Verzekeringen       { get; init; } = [];
    public List<Schuld>             Schulden            { get; init; } = [];
    public List<PersoonlijkDocument> Documenten         { get; init; } = [];
}

/// <summary>
/// Repository interface for full-text search across all data entities.
/// Introduced in SP-14-003.
/// </summary>
public interface IZoekenRepository
{
    /// <summary>Loads a capped snapshot of all searchable entities from the database.</summary>
    Task<ZoekDataSet> LaadAlleDataAsync(int take);
}
