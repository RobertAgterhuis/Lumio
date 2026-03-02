using Lumio.Api.Controllers;
using Lumio.Api.Repositories;
using Lumio.Api.Rules.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Integration tests for <see cref="AuditLogController"/> — GetAll, LogActie.
/// SP-14-004 Controller-tests batch 4.
/// </summary>
public sealed class AuditLogControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static AuditLogController MakeController(Lumio.Api.Data.LumioDbContext? db = null) =>
        new(new EfAuditLogRepository(db ?? TestDbFactory.Create()),
            Options.Create(new LimietenOptions()));

    // ── GetAll ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAll_Returns200_MetLeegeLijstZonderEntries()
    {
        var ctrl = MakeController();

        var result = await ctrl.GetAll(null, null, null, null, null, null);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<AuditLogPagedResult>(ok.Value);
        Assert.Empty(paged.Items);
        Assert.False(paged.HeeftMeer);
    }

    [Fact]
    public async Task GetAll_Returns200_MetEntries_WanneerAanwezig()
    {
        var db = TestDbFactory.Create();
        var ctrl = new AuditLogController(new EfAuditLogRepository(db), Options.Create(new LimietenOptions()));

        await ctrl.LogActie(new AuditLogCreateDto { Actie = "TestActie", EntityType = "Test", EntityId = null });

        var result = await ctrl.GetAll(null, null, null, null, null, null);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<AuditLogPagedResult>(ok.Value);
        Assert.Single(paged.Items);
        Assert.Equal("TestActie", paged.Items[0].Actie);
    }

    // ── LogActie ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task LogActie_Returns204_EnVoegtEntryToe()
    {
        var db = TestDbFactory.Create();
        var ctrl = new AuditLogController(new EfAuditLogRepository(db), Options.Create(new LimietenOptions()));

        var result = await ctrl.LogActie(new AuditLogCreateDto
        {
            Actie = "Aangemaakt",
            EntityType = "Werkgever",
            EntityId = Guid.NewGuid(),
            Details = "Test entry",
        });

        Assert.IsType<NoContentResult>(result);

        var verify = await ctrl.GetAll(null, null, null, null, null, null);
        var paged = (AuditLogPagedResult)((OkObjectResult)verify.Result!).Value!;
        Assert.Single(paged.Items);
    }

    [Fact]
    public async Task GetAll_FiltertOpActie_WanneerActieOpgegeven()
    {
        var db = TestDbFactory.Create();
        var ctrl = new AuditLogController(new EfAuditLogRepository(db), Options.Create(new LimietenOptions()));

        await ctrl.LogActie(new AuditLogCreateDto { Actie = "Aangemaakt", EntityType = "Test" });
        await ctrl.LogActie(new AuditLogCreateDto { Actie = "Verwijderd", EntityType = "Test" });

        var result = await ctrl.GetAll(null, "Aangemaakt", null, null, null, null);

        var paged = (AuditLogPagedResult)((OkObjectResult)result.Result!).Value!;
        Assert.Single(paged.Items);
        Assert.Equal("Aangemaakt", paged.Items[0].Actie);
    }
}
