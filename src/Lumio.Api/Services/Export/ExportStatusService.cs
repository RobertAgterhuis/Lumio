using Lumio.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Services.Export;

/// <inheritdoc/>
public sealed class ExportStatusService : IExportStatusService
{
    private readonly LumioDbContext _db;
    public ExportStatusService(LumioDbContext db) => _db = db;

    public async Task<Dictionary<string, bool>> GetExportStatusAsync()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return new Dictionary<string, bool>
            {
                ["testament"] = false, ["euthanasie"] = false, ["donor"] = false,
                ["digitaal-bezit"] = false, ["boedel"] = false, ["uitvaart"] = false,
                ["documenten"] = false, ["noodkaart"] = false, ["testament-concept"] = false,
                ["wilsverklaring"] = false, ["noodprocedure"] = false, ["boedelbeschrijving"] = false,
                ["executeur-rapport"] = false, ["notaris"] = false,
            };

        var eid = eigenaar.Id;

        var testamentTask      = _db.Testamenten.AnyAsync(t => t.EigenaarId == eid);
        var wilsverklaringTask = _db.Wilsverklaringen.AnyAsync(w => w.EigenaarId == eid);
        var donorTask          = _db.DonorRegistraties.AnyAsync(d => d.EigenaarId == eid);
        var accountsTask       = _db.DigitaleAccounts.AnyAsync(a => a.EigenaarId == eid);
        var cryptoTask         = _db.CryptoWallets.AnyAsync(c => c.EigenaarId == eid);
        var wachtwoordenTask   = _db.Wachtwoorden.AnyAsync(w => w.EigenaarId == eid);
        var fysiekTask         = _db.FysiekeBezittingen.AnyAsync(f => f.EigenaarId == eid);
        var bankrekeningTask   = _db.Bankrekeningen.AnyAsync(b => b.EigenaarId == eid);
        var verzekeringTask    = _db.Verzekeringen.AnyAsync(v => v.EigenaarId == eid);
        var schuldenTask       = _db.Schulden.AnyAsync(s => s.EigenaarId == eid);
        var uitvaartTask       = _db.UitvaartWensen.AnyAsync(u => u.EigenaarId == eid);
        var documentenTask     = _db.Documenten.AnyAsync(d => d.EigenaarId == eid);
        var noodcontactenTask  = _db.Noodcontacten.AnyAsync(n => n.EigenaarId == eid);
        var executeursTask     = _db.Executeurs.AnyAsync(e =>
            _db.Testamenten.Where(t => t.EigenaarId == eid).Select(t => t.Id).Contains(e.TestamentInfoId));

        await Task.WhenAll(
            testamentTask, wilsverklaringTask, donorTask,
            accountsTask, cryptoTask, wachtwoordenTask,
            fysiekTask, bankrekeningTask, verzekeringTask, schuldenTask,
            uitvaartTask, documentenTask, noodcontactenTask, executeursTask);

        var heeftTestament      = testamentTask.Result;
        var heeftWilsverklaring = wilsverklaringTask.Result;
        var heeftBoedel         = fysiekTask.Result || bankrekeningTask.Result
                                  || verzekeringTask.Result || schuldenTask.Result;
        var heeftDigitaalBezit  = accountsTask.Result || cryptoTask.Result || wachtwoordenTask.Result;

        return new Dictionary<string, bool>
        {
            ["testament"]          = heeftTestament,
            ["euthanasie"]         = heeftWilsverklaring,
            ["donor"]              = donorTask.Result,
            ["digitaal-bezit"]     = heeftDigitaalBezit,
            ["boedel"]             = heeftBoedel,
            ["uitvaart"]           = uitvaartTask.Result,
            ["documenten"]         = documentenTask.Result,
            ["noodkaart"]          = noodcontactenTask.Result,
            ["testament-concept"]  = heeftTestament,
            ["wilsverklaring"]     = heeftWilsverklaring,
            ["noodprocedure"]      = noodcontactenTask.Result,
            ["boedelbeschrijving"] = heeftBoedel,
            ["executeur-rapport"]  = executeursTask.Result,
            ["notaris"]            = heeftTestament,
        };
    }
}
