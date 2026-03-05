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

public partial class LumioDbContext
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Decimal precision configurations ──

        // Bankrekening
        modelBuilder.Entity<Bankrekening>()
            .Property(b => b.Saldo)
            .HasColumnType("decimal(18,2)");

        // FysiekBezit
        modelBuilder.Entity<FysiekBezit>()
            .Property(f => f.GeschatteWaarde)
            .HasColumnType("decimal(18,2)");

        // Schuld
        modelBuilder.Entity<Schuld>(entity =>
        {
            entity.Property(s => s.Bedrag).HasColumnType("decimal(18,2)");
            entity.Property(s => s.Restschuld).HasColumnType("decimal(18,2)");
            entity.Property(s => s.Rentepercentage).HasColumnType("decimal(5,2)");
            entity.Property(s => s.MaandelijkseAflossing).HasColumnType("decimal(18,2)");
            entity.Property(s => s.MaandelijkseRente).HasColumnType("decimal(18,2)");
        });

        // Verzekering
        modelBuilder.Entity<Verzekering>()
            .Property(v => v.VerzekerdBedrag)
            .HasColumnType("decimal(18,2)");

        // Begunstigde
        modelBuilder.Entity<Begunstigde>()
            .Property(b => b.Percentage)
            .HasColumnType("decimal(5,2)");

        // ── Relationships ──

        // AssetRegistry → Eigenaar (no navigation on Eigenaar side)
        modelBuilder.Entity<Bankrekening>()
            .HasOne<Eigenaar>()
            .WithMany()
            .HasForeignKey(b => b.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // FysiekBezit → Eigenaar
        modelBuilder.Entity<FysiekBezit>()
            .HasOne<Eigenaar>()
            .WithMany()
            .HasForeignKey(f => f.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // FysiekBezit → BestemdeErfgenaam (optional FK to Erfgenaam)
        modelBuilder.Entity<FysiekBezit>()
            .HasOne(f => f.BestemdeErfgenaam)
            .WithMany()
            .HasForeignKey(f => f.BestemdeErfgenaamId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        modelBuilder.Entity<Schuld>()
            .HasOne<Eigenaar>()
            .WithMany()
            .HasForeignKey(s => s.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // Schuld → FysiekBezit (optionele koppeling, cascade delete)
        modelBuilder.Entity<Schuld>()
            .HasOne(s => s.Bezit)
            .WithMany(b => b.LinkedSchulden)
            .HasForeignKey(s => s.BezitId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Verzekering>()
            .HasOne<Eigenaar>()
            .WithMany()
            .HasForeignKey(v => v.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // ErfgenaamToewijzing → Eigenaar + Erfgenaam
        modelBuilder.Entity<ErfgenaamToewijzing>(entity =>
        {
            entity.HasOne<Eigenaar>()
                .WithMany()
                .HasForeignKey(t => t.EigenaarId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(t => t.Erfgenaam)
                .WithMany()
                .HasForeignKey(t => t.ErfgenaamId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Erfgenaam → Eigenaar (with navigation)
        modelBuilder.Entity<Erfgenaam>()
            .HasOne(e => e.Eigenaar)
            .WithMany()
            .HasForeignKey(e => e.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // Noodcontact → Eigenaar
        modelBuilder.Entity<Noodcontact>()
            .HasOne<Eigenaar>()
            .WithMany()
            .HasForeignKey(n => n.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // SectieNotitie → Eigenaar
        modelBuilder.Entity<SectieNotitie>()
            .HasOne<Eigenaar>()
            .WithMany()
            .HasForeignKey(s => s.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // SharedContact → Eigenaar
        modelBuilder.Entity<SharedContact>()
            .HasOne(c => c.Eigenaar)
            .WithMany()
            .HasForeignKey(c => c.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // Eigenaar → SharedContact (Notaris) - Optional FK
        modelBuilder.Entity<Eigenaar>()
            .HasOne(e => e.NotarisContact)
            .WithMany()
            .HasForeignKey(e => e.NotarisContactId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // Eigenaar → SharedContact (Huisarts) - Optional FK
        modelBuilder.Entity<Eigenaar>()
            .HasOne(e => e.HuisartsContact)
            .WithMany()
            .HasForeignKey(e => e.HuisartsContactId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // Eigenaar → SharedContact (UitvaartOndernemer) - Optional FK
        modelBuilder.Entity<Eigenaar>()
            .HasOne(e => e.UitvaartOndernemerContact)
            .WithMany()
            .HasForeignKey(e => e.UitvaartOndernemerContactId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // TestamentInfo → SharedContact (Notaris) - Optional FK
        modelBuilder.Entity<TestamentInfo>()
            .HasOne(t => t.NotarisContact)
            .WithMany()
            .HasForeignKey(t => t.NotarisContactId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // UitvaartWensen → SharedContact (UitvaartOndernemer) - Optional FK
        modelBuilder.Entity<UitvaartWensen>()
            .HasOne(u => u.UitvaartOndernemerContact)
            .WithMany()
            .HasForeignKey(u => u.UitvaartOndernemerContactId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // WilsverklaringEuthanasie → SharedContact (Huisarts) - Optional FK
        modelBuilder.Entity<WilsverklaringEuthanasie>()
            .HasOne(w => w.HuisartsContact)
            .WithMany()
            .HasForeignKey(w => w.HuisartsContactId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // WilsverklaringEuthanasie → SharedContact (Vertegenwoordiger) - Optional FK
        modelBuilder.Entity<WilsverklaringEuthanasie>()
            .HasOne(w => w.VertegenwoordigerContact)
            .WithMany()
            .HasForeignKey(w => w.VertegenwoordigerContactId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // WilsverklaringEuthanasie → SharedContact (Vertegenwoordiger2) - Optional FK
        modelBuilder.Entity<WilsverklaringEuthanasie>()
            .HasOne(w => w.Vertegenwoordiger2Contact)
            .WithMany()
            .HasForeignKey(w => w.Vertegenwoordiger2ContactId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // DigitalEstate → Eigenaar
        modelBuilder.Entity<DigitaalAccount>()
            .HasOne<Eigenaar>()
            .WithMany()
            .HasForeignKey(d => d.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CryptoWallet>()
            .HasOne<Eigenaar>()
            .WithMany()
            .HasForeignKey(c => c.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WachtwoordEntry>()
            .HasOne<Eigenaar>()
            .WithMany()
            .HasForeignKey(w => w.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // Documents → Eigenaar
        modelBuilder.Entity<PersoonlijkDocument>()
            .HasOne<Eigenaar>()
            .WithMany()
            .HasForeignKey(d => d.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // PersoonlijkDocument.Categorie stored as TEXT string
        modelBuilder.Entity<PersoonlijkDocument>()
            .Property(d => d.Categorie)
            .HasConversion<string>()
            .HasColumnType("TEXT");

        // DonorRegistratie → Eigenaar (with navigation)
        modelBuilder.Entity<DonorRegistratie>()
            .HasOne(d => d.Eigenaar)
            .WithMany()
            .HasForeignKey(d => d.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // OrgaanKeuze → DonorRegistratie (with navigations both sides)
        modelBuilder.Entity<OrgaanKeuze>()
            .HasOne(o => o.DonorRegistratie)
            .WithMany(d => d.OrgaanKeuzes)
            .HasForeignKey(o => o.DonorRegistratieId)
            .OnDelete(DeleteBehavior.Cascade);

        // WilsverklaringEuthanasie → Eigenaar (with navigation)
        modelBuilder.Entity<WilsverklaringEuthanasie>()
            .HasOne(w => w.Eigenaar)
            .WithMany()
            .HasForeignKey(w => w.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // EuthanasieVoorwaarde → WilsverklaringEuthanasie (with navigations both sides)
        modelBuilder.Entity<EuthanasieVoorwaarde>()
            .HasOne(v => v.Wilsverklaring)
            .WithMany(w => w.Voorwaarden)
            .HasForeignKey(v => v.WilsverklaringId)
            .OnDelete(DeleteBehavior.Cascade);

        // UitvaartWensen → Eigenaar (with navigation)
        modelBuilder.Entity<UitvaartWensen>()
            .HasOne(u => u.Eigenaar)
            .WithMany()
            .HasForeignKey(u => u.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // CeremonieDetail → UitvaartWensen (with navigations both sides)
        modelBuilder.Entity<CeremonieDetail>()
            .HasOne(c => c.UitvaartWensen)
            .WithMany(u => u.CeremonieDetails)
            .HasForeignKey(c => c.UitvaartWensenId)
            .OnDelete(DeleteBehavior.Cascade);

        // UitvaartGenodigde → UitvaartWensen (with navigations both sides)
        modelBuilder.Entity<UitvaartGenodigde>()
            .HasOne(g => g.UitvaartWensen)
            .WithMany(u => u.Genodigden)
            .HasForeignKey(g => g.UitvaartWensenId)
            .OnDelete(DeleteBehavior.Cascade);

        // TestamentInfo → Eigenaar (with navigation)
        modelBuilder.Entity<TestamentInfo>()
            .HasOne(t => t.Eigenaar)
            .WithMany()
            .HasForeignKey(t => t.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // Begunstigde → TestamentInfo (with navigations both sides)
        modelBuilder.Entity<Begunstigde>()
            .HasOne(b => b.TestamentInfo)
            .WithMany(t => t.Begunstigden)
            .HasForeignKey(b => b.TestamentInfoId)
            .OnDelete(DeleteBehavior.Cascade);

        // Executeur → TestamentInfo (with navigations both sides)
        modelBuilder.Entity<Executeur>()
            .HasOne(e => e.TestamentInfo)
            .WithMany(t => t.Executeurs)
            .HasForeignKey(e => e.TestamentInfoId)
            .OnDelete(DeleteBehavior.Cascade);

        // TestamentSnapshot → TestamentInfo (with navigations both sides)
        modelBuilder.Entity<TestamentSnapshot>()
            .HasOne(s => s.TestamentInfo)
            .WithMany(t => t.Snapshots)
            .HasForeignKey(s => s.TestamentInfoId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Video Messages ──

        // Videoboodschap → Eigenaar
        modelBuilder.Entity<Videoboodschap>()
            .HasOne<Eigenaar>()
            .WithMany()
            .HasForeignKey(v => v.EigenaarId)
            .OnDelete(DeleteBehavior.Cascade);

        // VideoboodschapBlob → Videoboodschap (1-to-1, blob in separate table)
        modelBuilder.Entity<VideoboodschapBlob>()
            .HasKey(b => b.VideoboodschapId);

        modelBuilder.Entity<Videoboodschap>()
            .HasOne(v => v.Blob)
            .WithOne()
            .HasForeignKey<VideoboodschapBlob>(b => b.VideoboodschapId)
            .OnDelete(DeleteBehavior.Cascade);

        // VideoboodschapOntvanger → Videoboodschap
        modelBuilder.Entity<VideoboodschapOntvanger>()
            .HasOne(o => o.Videoboodschap)
            .WithMany(v => v.Ontvangers)
            .HasForeignKey(o => o.VideoboodschapId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
