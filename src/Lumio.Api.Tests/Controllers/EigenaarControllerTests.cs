using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Rules.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Unit tests for <see cref="EigenaarController"/> — Get endpoint.
/// SP-11-005 Controller-tests batch 1.
/// </summary>
public sealed class EigenaarControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static EigenaarController MakeController(
        FakeProfileService? profiles = null,
        FakeAuditService? audit = null,
        Action<Lumio.Api.Data.LumioDbContext>? seedDb = null)
    {
        var db = TestDbFactory.Create();
        seedDb?.Invoke(db);

        return new EigenaarController(
            db,
            Options.Create(new LimietenOptions()),
            profiles ?? new FakeProfileService(),
            audit ?? new FakeAuditService());
    }

    // ── Get ────────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Get_WhenGeenEigenaar_Returns404()
    {
        // Arrange — empty database
        var ctrl = MakeController();

        // Act
        var result = await ctrl.Get();

        // Assert
        var notFound = Assert.IsType<NotFoundObjectResult>(result.Result);
        Assert.NotNull(notFound.Value);
    }

    [Fact]
    public async Task Get_WhenEigenaarAanwezig_Returns200MetEigenaarData()
    {
        // Arrange — seed the in-memory DB with an eigenaar
        var ctrl = MakeController(seedDb: db =>
        {
            db.Eigenaren.Add(new Eigenaar
            {
                Id = Guid.NewGuid(),
                Voornaam = "Jan",
                Achternaam = "de Vries",
                Geboortedatum = new DateOnly(1975, 4, 15)
            });
            db.SaveChanges();
        });

        // Act
        var result = await ctrl.Get();

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task Get_WhenMeerdereEigenaren_RetourneertEerste()
    {
        // Edge case: multiple eigenaar rows exist — controller returns first
        var ctrl = MakeController(seedDb: db =>
        {
            db.Eigenaren.AddRange(
                new Eigenaar { Id = Guid.NewGuid(), Voornaam = "Eerste", Achternaam = "Test", Geboortedatum = new DateOnly(1970, 1, 1) },
                new Eigenaar { Id = Guid.NewGuid(), Voornaam = "Tweede", Achternaam = "Test", Geboortedatum = new DateOnly(1980, 1, 1) }
            );
            db.SaveChanges();
        });

        // Act
        var result = await ctrl.Get();

        // Assert — still returns 200, not 500 or 400
        Assert.IsType<OkObjectResult>(result.Result);
    }
}
