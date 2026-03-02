using Lumio.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfStatistiekenRepository : IStatistiekenRepository
{
    private readonly LumioDbContext _db;
    public EfStatistiekenRepository(LumioDbContext db) => _db = db;

    public async Task<StatistiekenData> GetAsync() => new StatistiekenData
    {
        Erfgenamen          = await _db.Erfgenamen.CountAsync(),
        Noodcontacten       = await _db.Noodcontacten.CountAsync(),
        Documenten          = await _db.Documenten.CountAsync(),
        Accounts            = await _db.DigitaleAccounts.CountAsync(),
        Wachtwoorden        = await _db.Wachtwoorden.CountAsync(),
        Wallets             = await _db.CryptoWallets.CountAsync(),
        Bezittingen         = await _db.FysiekeBezittingen.CountAsync(),
        Bankrekeningen      = await _db.Bankrekeningen.CountAsync(),
        Verzekeringen       = await _db.Verzekeringen.CountAsync(),
        Schulden            = await _db.Schulden.CountAsync(),
        TotaalBezittingen   = await _db.FysiekeBezittingen.SumAsync(f => f.GeschatteWaarde ?? 0m),
        TotaalSaldi         = await _db.Bankrekeningen.SumAsync(b => b.Saldo ?? 0m),
        TotaalVerzekeringen = await _db.Verzekeringen.SumAsync(v => v.VerzekerdBedrag ?? 0m),
        TotaalVerzekeringenMetBegunstigde = await _db.Verzekeringen
            .Where(v => !string.IsNullOrEmpty(v.Begunstigde))
            .SumAsync(v => v.VerzekerdBedrag ?? 0m),
        TotaalSchulden = await _db.Schulden.SumAsync(s => s.Bedrag),
    };
}
