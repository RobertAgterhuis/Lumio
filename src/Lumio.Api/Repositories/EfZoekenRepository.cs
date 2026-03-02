using Lumio.Api.Data;
using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.DigitalEstate;
using Lumio.Api.Domain.Documents;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfZoekenRepository : IZoekenRepository
{
    private readonly LumioDbContext _db;
    public EfZoekenRepository(LumioDbContext db) => _db = db;

    public async Task<ZoekDataSet> LaadAlleDataAsync(int take) => new ZoekDataSet
    {
        Erfgenamen         = await _db.Erfgenamen.Take(take).ToListAsync(),
        Noodcontacten      = await _db.Noodcontacten.Take(take).ToListAsync(),
        DigitaleAccounts   = await _db.DigitaleAccounts.Take(take).ToListAsync(),
        Wachtwoorden       = await _db.Wachtwoorden.Take(take).ToListAsync(),
        CryptoWallets      = await _db.CryptoWallets.Take(take).ToListAsync(),
        FysiekeBezittingen = await _db.FysiekeBezittingen.Take(take).ToListAsync(),
        Bankrekeningen     = await _db.Bankrekeningen.Take(take).ToListAsync(),
        Verzekeringen      = await _db.Verzekeringen.Take(take).ToListAsync(),
        Schulden           = await _db.Schulden.Take(take).ToListAsync(),
        Documenten         = await _db.Documenten.Take(take).ToListAsync(),
    };
}
