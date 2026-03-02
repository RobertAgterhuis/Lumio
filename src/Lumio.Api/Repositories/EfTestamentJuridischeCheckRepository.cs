using Lumio.Api.Data;
using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.Testament;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Repositories;

public sealed class EfTestamentJuridischeCheckRepository : ITestamentJuridischeCheckRepository
{
    private readonly LumioDbContext _db;
    public EfTestamentJuridischeCheckRepository(LumioDbContext db) => _db = db;

    public async Task<TestamentCheckData> GetCheckDataAsync()
    {
        var eigenaar  = await _db.Eigenaren.FirstOrDefaultAsync();
        var testament = await _db.Testamenten.FirstOrDefaultAsync();

        var begunstigden = testament is not null
            ? await _db.Begunstigden.Where(b => b.TestamentInfoId == testament.Id).ToListAsync()
            : [];

        var executeurs = testament is not null
            ? await _db.Executeurs.Where(e => e.TestamentInfoId == testament.Id).ToListAsync()
            : [];

        var erfgenamen = eigenaar is not null
            ? await _db.Erfgenamen.Where(e => e.EigenaarId == eigenaar.Id).ToListAsync()
            : [];

        var bezittingen = eigenaar is not null
            ? await _db.FysiekeBezittingen.Where(b => b.EigenaarId == eigenaar.Id).ToListAsync()
            : [];

        return new TestamentCheckData
        {
            Eigenaar           = eigenaar,
            Testament          = testament,
            Begunstigden       = begunstigden,
            Executeurs         = executeurs,
            Erfgenamen         = erfgenamen,
            FysiekeBezittingen = bezittingen,
        };
    }
}
