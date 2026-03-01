using Lumio.Api.Data;
using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.DigitalEstate;
using Lumio.Api.Domain.Documents;
using Lumio.Api.Domain.DonorRegistration;
using Lumio.Api.Domain.EuthanasiaDirective;
using Lumio.Api.Domain.FuneralWishes;
using Lumio.Api.Domain.Testament;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Services.Pdf.Data;

/// <summary>
/// Loads all data required for any PDF generator in a single, single-trip
/// (parallel where possible) round-trip to the database.
/// Inject as Scoped — one loader per HTTP request.
/// </summary>
public class PdfDataLoader
{
    private readonly LumioDbContext _db;

    public PdfDataLoader(LumioDbContext db) => _db = db;

    /// <summary>
    /// Loads the full data context needed by every generator except ErfgenaamPdf.
    /// </summary>
    public async Task<PdfDataContext> LoadAllAsync()
    {
        // ── 1. Eigenaar (root entity) ─────────────────────────────────────
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        var eid = eigenaar?.Id ?? Guid.Empty;

        // ── 2. Testament ──────────────────────────────────────────────────
        var testament = eigenaar != null
            ? await _db.Testamenten.FirstOrDefaultAsync(t => t.EigenaarId == eid)
            : null;

        // ── 3. Wilsverklaring ─────────────────────────────────────────────
        var wilsverklaring = eigenaar != null
            ? await _db.Wilsverklaringen.FirstOrDefaultAsync(w => w.EigenaarId == eid)
            : null;

        // ── 4. Donor ──────────────────────────────────────────────────────
        var donor = eigenaar != null
            ? await _db.DonorRegistraties.FirstOrDefaultAsync(d => d.EigenaarId == eid)
            : null;

        // ── 5. Uitvaart ───────────────────────────────────────────────────
        var uitvaart = eigenaar != null
            ? await _db.UitvaartWensen.FirstOrDefaultAsync(u => u.EigenaarId == eid)
            : null;

        // ── 6. Parallel collection loads ──────────────────────────────────
        // Group independent ToListAsync() calls to reduce latency.
        var begunstigdenTask = testament != null
            ? _db.Begunstigden.Where(b => b.TestamentInfoId == testament.Id).ToListAsync()
            : Task.FromResult<List<Begunstigde>>([]);

        var executeursTask = testament != null
            ? _db.Executeurs.Where(e => e.TestamentInfoId == testament.Id).ToListAsync()
            : Task.FromResult<List<Executeur>>([]);

        var voorwaardenTask = wilsverklaring != null
            ? _db.EuthanasieVoorwaarden.Where(v => v.WilsverklaringId == wilsverklaring.Id).ToListAsync()
            : Task.FromResult<List<EuthanasieVoorwaarde>>([]);

        var orgaanKeuzesTask = donor != null
            ? _db.OrgaanKeuzes.Where(o => o.DonorRegistratieId == donor.Id).ToListAsync()
            : Task.FromResult<List<OrgaanKeuze>>([]);

        var ceremonieDetailsTask = uitvaart != null
            ? _db.CeremonieDetails.Where(c => c.UitvaartWensenId == uitvaart.Id).OrderBy(c => c.Volgorde).ToListAsync()
            : Task.FromResult<List<CeremonieDetail>>([]);

        var digitaleAccountsTask = _db.DigitaleAccounts.Where(a => a.EigenaarId == eid).ToListAsync();
        var cryptoWalletsTask    = _db.CryptoWallets.Where(c => c.EigenaarId == eid).ToListAsync();
        // T-005: Project naar WachtwoordEntrySafePdf — NOOIT EncryptedWachtwoord of Gebruikersnaam laden (AVG Art.9)
        var wachtwoordenTask     = _db.Wachtwoorden
            .Where(w => w.EigenaarId == eid)
            .Select(w => new WachtwoordEntrySafePdf(w.Id, w.Naam, w.Url, w.Notities, w.GewijzigdOp))
            .ToListAsync();

        var fysiekTask        = _db.FysiekeBezittingen.Where(f => f.EigenaarId == eid).ToListAsync();
        var bankrekeningenTask = _db.Bankrekeningen.Where(b => b.EigenaarId == eid).ToListAsync();
        var verzekeringenTask  = _db.Verzekeringen.Where(v => v.EigenaarId == eid).ToListAsync();
        var schuldenTask       = _db.Schulden.Where(s => s.EigenaarId == eid).ToListAsync();
        var toewijzingenTask   = _db.ErfgenaamToewijzingen.Where(t => t.EigenaarId == eid).ToListAsync();

        var documentenTask   = _db.Documenten.Where(d => d.EigenaarId == eid).ToListAsync();
        var erfgenamenTask   = _db.Erfgenamen.Where(e => e.EigenaarId == eid).OrderBy(e => e.Achternaam).ToListAsync();
        var noodcontactenTask = _db.Noodcontacten.Where(n => n.EigenaarId == eid).OrderBy(n => n.Naam).ToListAsync();

        await Task.WhenAll(
            begunstigdenTask, executeursTask, voorwaardenTask, orgaanKeuzesTask, ceremonieDetailsTask,
            digitaleAccountsTask, cryptoWalletsTask, wachtwoordenTask,
            fysiekTask, bankrekeningenTask, verzekeringenTask, schuldenTask, toewijzingenTask,
            documentenTask, erfgenamenTask, noodcontactenTask);

        return new PdfDataContext(
            Eigenaar:           eigenaar,
            Testament:          testament,
            Begunstigden:       await begunstigdenTask,
            Executeurs:         await executeursTask,
            Wilsverklaring:     wilsverklaring,
            Voorwaarden:        await voorwaardenTask,
            Donor:              donor,
            OrgaanKeuzes:       await orgaanKeuzesTask,
            DigitaleAccounts:   await digitaleAccountsTask,
            CryptoWallets:      await cryptoWalletsTask,
            Wachtwoorden:       await wachtwoordenTask,
            FysiekeBezittingen: await fysiekTask,
            Bankrekeningen:     await bankrekeningenTask,
            Verzekeringen:      await verzekeringenTask,
            Schulden:           await schuldenTask,
            ErfgenaamToewijzingen: await toewijzingenTask,
            Uitvaart:           uitvaart,
            CeremonieDetails:   await ceremonieDetailsTask,
            Documenten:         await documentenTask,
            Erfgenamen:         await erfgenamenTask,
            Noodcontacten:      await noodcontactenTask
        );
    }

    /// <summary>
    /// Loads data for the ErfgenaamPdf of a single specific heir.
    /// Reuses LoadAllAsync and sets the TargetErfgenaam field.
    /// </summary>
    public async Task<PdfDataContext?> LoadForErfgenaamAsync(Guid erfgenaamId)
    {
        var erfgenaam = await _db.Erfgenamen.FindAsync(erfgenaamId);
        if (erfgenaam == null) return null;

        var base_ = await LoadAllAsync();
        return base_ with { TargetErfgenaam = erfgenaam };
    }
}
