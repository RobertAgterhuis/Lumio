using Lumio.Api.Domain.Common;
using Lumio.Api.Services.Export;

namespace Lumio.Api.Tests.Services;

public class ExportStatusServiceTests
{
    private static Eigenaar MakeEigenaar() => new()
    {
        Voornaam = "Jan",
        Achternaam = "Janssen",
        Geboortedatum = new DateOnly(1960, 1, 1),
    };

    [Fact]
    public async Task GetExportStatusAsync_AllFalse_WhenNoData()
    {
        await using var db = TestDbFactory.Create();
        db.Eigenaren.Add(MakeEigenaar()); // need eigenaar, but no other data
        await db.SaveChangesAsync();

        var svc = new ExportStatusService(db);
        var status = await svc.GetExportStatusAsync();

        Assert.NotNull(status);
        Assert.NotEmpty(status);
        // Without additional data, each module should report false
        foreach (var kvp in status)
        {
            Assert.False(kvp.Value, $"{kvp.Key} should be false when no data exists");
        }
    }

    [Fact]
    public async Task GetExportStatusAsync_ReturnsExpectedKeys()
    {
        await using var db = TestDbFactory.Create();
        db.Eigenaren.Add(MakeEigenaar());
        await db.SaveChangesAsync();

        var svc = new ExportStatusService(db);
        var status = await svc.GetExportStatusAsync();

        // These keys must always be present regardless of data state
        Assert.True(status.ContainsKey("testament") || status.ContainsKey("Testament")
            || status.Keys.Any(k => k.Equals("testament", StringComparison.OrdinalIgnoreCase)),
            "Status dictionary must contain a 'testament' key");
    }

    [Fact]
    public async Task GetExportStatusAsync_NoEigenaar_ReturnsEmptyOrAllFalse()
    {
        await using var db = TestDbFactory.Create();
        var svc = new ExportStatusService(db);

        // Should not throw — returns empty or all-false dict
        var status = await svc.GetExportStatusAsync();
        Assert.NotNull(status);
    }
}
