namespace Lumio.Api.Repositories;

/// <summary>Data bundle returned by <see cref="IStatistiekenRepository.GetAsync"/>.</summary>
public sealed class StatistiekenData
{
    public int     Erfgenamen               { get; init; }
    public int     Noodcontacten            { get; init; }
    public int     Documenten               { get; init; }
    public int     Accounts                 { get; init; }
    public int     Wachtwoorden             { get; init; }
    public int     Wallets                  { get; init; }
    public int     Bezittingen              { get; init; }
    public int     Bankrekeningen           { get; init; }
    public int     Verzekeringen            { get; init; }
    public int     Schulden                 { get; init; }
    public decimal TotaalBezittingen        { get; init; }
    public decimal TotaalSaldi              { get; init; }
    public decimal TotaalVerzekeringen      { get; init; }
    public decimal TotaalVerzekeringenMetBegunstigde { get; init; }
    public decimal TotaalSchulden           { get; init; }
}

/// <summary>
/// Repository interface for status statistics.
/// Introduced in SP-14-003.
/// </summary>
public interface IStatistiekenRepository
{
    Task<StatistiekenData> GetAsync();
}
