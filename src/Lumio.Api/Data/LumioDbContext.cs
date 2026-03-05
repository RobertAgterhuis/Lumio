using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.DigitalEstate;
using Lumio.Api.Domain.Documents;
using Lumio.Api.Domain.DonorRegistration;
using Lumio.Api.Domain.EuthanasiaDirective;
using Lumio.Api.Domain.FuneralWishes;
using Lumio.Api.Domain.Testament;
using Lumio.Api.Domain.VideoMessages;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Data;

public partial class LumioDbContext : DbContext
{
    public LumioDbContext(DbContextOptions<LumioDbContext> options) : base(options) { }

    // ── Common ──
    public DbSet<Eigenaar> Eigenaren => Set<Eigenaar>();
    public DbSet<Erfgenaam> Erfgenamen => Set<Erfgenaam>();
    public DbSet<Noodcontact> Noodcontacten => Set<Noodcontact>();
    public DbSet<Werkgever> Werkgevers => Set<Werkgever>();
    public DbSet<SharedContact> SharedContacts => Set<SharedContact>();
    public DbSet<AuditLogEntry> AuditLog => Set<AuditLogEntry>();
    public DbSet<AfhandelingsItem> AfhandelingsItems => Set<AfhandelingsItem>();
    public DbSet<ActualisatieBevestiging> ActualisatieBevestigingen => Set<ActualisatieBevestiging>();
    public DbSet<SectieNotitie> SectieNotities => Set<SectieNotitie>();

    // ── Asset Registry (Boedel) ──
    public DbSet<FysiekBezit> FysiekeBezittingen => Set<FysiekBezit>();
    public DbSet<Bankrekening> Bankrekeningen => Set<Bankrekening>();
    public DbSet<Verzekering> Verzekeringen => Set<Verzekering>();
    public DbSet<Schuld> Schulden => Set<Schuld>();
    public DbSet<ErfgenaamToewijzing> ErfgenaamToewijzingen => Set<ErfgenaamToewijzing>();

    // ── Digital Estate (Digitaal Bezit) ──
    public DbSet<DigitaalAccount> DigitaleAccounts => Set<DigitaalAccount>();
    public DbSet<CryptoWallet> CryptoWallets => Set<CryptoWallet>();
    public DbSet<WachtwoordEntry> Wachtwoorden => Set<WachtwoordEntry>();

    // ── Documents ──
    public DbSet<PersoonlijkDocument> Documenten => Set<PersoonlijkDocument>();

    // ── Donor Registration ──
    public DbSet<DonorRegistratie> DonorRegistraties => Set<DonorRegistratie>();
    public DbSet<OrgaanKeuze> OrgaanKeuzes => Set<OrgaanKeuze>();

    // ── Euthanasia Directive (Wilsverklaring) ──
    public DbSet<WilsverklaringEuthanasie> Wilsverklaringen => Set<WilsverklaringEuthanasie>();
    public DbSet<EuthanasieVoorwaarde> EuthanasieVoorwaarden => Set<EuthanasieVoorwaarde>();

    // ── Funeral Wishes (Uitvaartwensen) ──
    public DbSet<UitvaartWensen> UitvaartWensen => Set<UitvaartWensen>();
    public DbSet<CeremonieDetail> CeremonieDetails => Set<CeremonieDetail>();
    public DbSet<UitvaartGenodigde> UitvaartGenodigden => Set<UitvaartGenodigde>();

    // ── Testament ──
    public DbSet<TestamentInfo> Testamenten => Set<TestamentInfo>();
    public DbSet<Begunstigde> Begunstigden => Set<Begunstigde>();
    public DbSet<Executeur> Executeurs => Set<Executeur>();
    public DbSet<TestamentSnapshot> TestamentSnapshots => Set<TestamentSnapshot>();

    // ── Video Messages ──
    public DbSet<Videoboodschap> Videoboodschappen => Set<Videoboodschap>();
    public DbSet<VideoboodschapBlob> VideoboodschapBlobs => Set<VideoboodschapBlob>();
    public DbSet<VideoboodschapOntvanger> VideoboodschapOntvangers => Set<VideoboodschapOntvanger>();
}
