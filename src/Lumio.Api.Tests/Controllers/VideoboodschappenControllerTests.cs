using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.VideoMessages;
using Lumio.Api.Rules.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// T-006: Atomaire videoverwijdering — compensating transaction patroon.
///
/// Test-matrix:
///   TC-01  Succes           → 204 NoContent, DB-record weg, bestand verwijderd
///   TC-02  Video niet gevonden → 404 NotFound
///   TC-03  Eigenaar ontbreekt  → 404 NotFound
///   TC-04  File-delete faalt   → exception propagateert (DB-rollback bij echte DB)
///
/// Noot over transactie-semantiek:
/// De InMemory-provider ondersteunt geen echte transacties; RollbackAsync() is een no-op.
/// TC-04 verifieert dat de exception WEL propagateert (→ HTTP 500 in productie).
/// De guarantee dat het DB-record intact blijft bij file-fout wordt geboden door de
/// compensating-transaction code zelf en is geverifiëerd via code-review (zie comments in controller).
/// </summary>
public class VideoboodschappenControllerTests
{
    private static Eigenaar MakeEigenaar() => new()
    {
        Voornaam = "Jan",
        Achternaam = "Janssen",
        Geboortedatum = new DateOnly(1960, 1, 1),
    };

    private static VideoboodschappenController CreateController(
        Lumio.Api.Data.LumioDbContext db,
        FakeVideoStorageService? storage = null)
    {
        storage ??= new FakeVideoStorageService();
        var limieten = Options.Create(new LimietenOptions());
        return new VideoboodschappenController(db, limieten, storage);
    }

    // ── TC-01: Succes ───────────────────────────────────────────────────

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenVideoExists()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        var video = new Videoboodschap
        {
            EigenaarId = eigenaar.Id,
            Titel = "Mijn videoboodschap",
            BestandsNaam = "video.webm",
            ContentType = "video/webm",
            BestandsGrootte = 1024,
        };
        db.Videoboodschappen.Add(video);
        await db.SaveChangesAsync();

        var ctrl = CreateController(db);

        var result = await ctrl.Delete(video.Id);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_RemovesRecord_FromDatabase()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        var video = new Videoboodschap
        {
            EigenaarId = eigenaar.Id,
            Titel = "Te verwijderen video",
            BestandsNaam = "vid.webm",
            ContentType = "video/webm",
            BestandsGrootte = 512,
        };
        db.Videoboodschappen.Add(video);
        await db.SaveChangesAsync();

        var ctrl = CreateController(db);
        await ctrl.Delete(video.Id);

        var remaining = db.Videoboodschappen.Any(v => v.Id == video.Id);
        Assert.False(remaining);
    }

    [Fact]
    public async Task Delete_CallsVerwijderen_WhenBestandsPadIsSet()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        var video = new Videoboodschap
        {
            EigenaarId = eigenaar.Id,
            Titel = "Video met bestand",
            BestandsNaam = "vid.webm",
            ContentType = "video/webm",
            BestandsGrootte = 1024,
            BestandsPad = "/data/videos/vid.webm",
        };
        db.Videoboodschappen.Add(video);
        await db.SaveChangesAsync();

        var storage = new FakeVideoStorageService();
        var ctrl = CreateController(db, storage);
        await ctrl.Delete(video.Id);

        Assert.Contains("/data/videos/vid.webm", storage.VerwijderdePaden);
    }

    [Fact]
    public async Task Delete_DoesNotCallVerwijderen_WhenBestandsPadIsNull()
    {
        // Legacy records met BestandsPad == null (blob-storage path)
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        var video = new Videoboodschap
        {
            EigenaarId = eigenaar.Id,
            Titel = "Legacy video",
            BestandsNaam = "legacy.webm",
            ContentType = "video/webm",
            BestandsGrootte = 256,
            BestandsPad = null, // legacy blob
        };
        db.Videoboodschappen.Add(video);
        await db.SaveChangesAsync();

        var storage = new FakeVideoStorageService();
        var ctrl = CreateController(db, storage);
        await ctrl.Delete(video.Id);

        Assert.Empty(storage.VerwijderdePaden);
    }

    // ── TC-02: Video niet gevonden ──────────────────────────────────────

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenVideoDoesNotExist()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        await db.SaveChangesAsync();

        var ctrl = CreateController(db);
        var result = await ctrl.Delete(Guid.NewGuid()); // willekeurig, onbekend id

        Assert.IsType<NotFoundResult>(result);
    }

    // ── TC-03: Eigenaar ontbreekt ───────────────────────────────────────

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenEigenaarMissing()
    {
        await using var db = TestDbFactory.Create();
        // Geen eigenaar in DB

        var ctrl = CreateController(db);
        var result = await ctrl.Delete(Guid.NewGuid());

        Assert.IsType<NotFoundResult>(result);
    }

    // ── TC-04: File-delete faalt (compensating-transaction pad) ────────

    [Fact]
    public async Task Delete_ThrowsException_WhenFileDeleteFails()
    {
        // Arrange: video met bestandspad, storage gooit een IOException
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        var video = new Videoboodschap
        {
            EigenaarId = eigenaar.Id,
            Titel = "Fout-video",
            BestandsNaam = "err.webm",
            ContentType = "video/webm",
            BestandsGrootte = 512,
            BestandsPad = "/data/videos/err.webm",
        };
        db.Videoboodschappen.Add(video);
        await db.SaveChangesAsync();

        var storage = new FakeVideoStorageService { ThrowOnVerwijderen = true };
        var ctrl = CreateController(db, storage);

        // Act + Assert: exception propagateert uit de controller
        // (bij echte DB → DB-transactie wordt teruggedraaid via tx.RollbackAsync())
        await Assert.ThrowsAsync<IOException>(() => ctrl.Delete(video.Id));
    }
}
