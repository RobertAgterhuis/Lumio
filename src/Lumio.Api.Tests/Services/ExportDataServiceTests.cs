using Lumio.Api.Domain.Common;
using Lumio.Api.Services.Export;
using System.Text.Json;
using System.Xml.Linq;

namespace Lumio.Api.Tests.Services;

public class ExportDataServiceTests
{
    private static Eigenaar MakeEigenaar() => new()
    {
        Voornaam = "Jan",
        Achternaam = "Janssen",
        Geboortedatum = new DateOnly(1960, 1, 1),
    };

    // ── BuildExportDataAsync ────────────────────────────────────────────

    [Fact]
    public async Task BuildExportDataAsync_ReturnsNull_WhenNoEigenaar()
    {
        await using var db = TestDbFactory.Create();
        var svc = new ExportDataService(db);

        var result = await svc.BuildExportDataAsync();

        Assert.Null(result);
    }

    [Fact]
    public async Task BuildExportDataAsync_ReturnsData_WhenEigenaarExists()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        await db.SaveChangesAsync();

        var svc = new ExportDataService(db);
        var result = await svc.BuildExportDataAsync();

        Assert.NotNull(result);
        Assert.NotNull(result.Eigenaar);
        Assert.Equal("Jan", result.Eigenaar!.Voornaam);
        Assert.Equal("Janssen", result.Eigenaar.Achternaam);
    }

    [Fact]
    public async Task BuildExportDataAsync_ReturnsLists_WithMultipleEntities()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        db.Erfgenamen.AddRange(
            new Domain.Common.Erfgenaam { EigenaarId = eigenaar.Id, Voornaam = "Kind", Achternaam = "A", Relatie = "kind" },
            new Domain.Common.Erfgenaam { EigenaarId = eigenaar.Id, Voornaam = "Kind", Achternaam = "B", Relatie = "kind" });
        db.Noodcontacten.Add(new Domain.Common.Noodcontact
            { EigenaarId = eigenaar.Id, Naam = "Huisarts", Relatie = "arts", Rol = "huisarts" });
        await db.SaveChangesAsync();

        var svc = new ExportDataService(db);
        var result = await svc.BuildExportDataAsync();

        Assert.NotNull(result);
        Assert.Equal(2, result.Erfgenamen.Count);
        Assert.Single(result.Noodcontacten);
    }

    // ── BuildJsonExportAsync ────────────────────────────────────────────

    [Fact]
    public async Task BuildJsonExportAsync_ReturnsNull_WhenNoEigenaar()
    {
        await using var db = TestDbFactory.Create();
        var svc = new ExportDataService(db);

        var bytes = await svc.BuildJsonExportAsync();

        Assert.Null(bytes);
    }

    [Fact]
    public async Task BuildJsonExportAsync_ContainsEigenaarSection_WhenEigenaarExists()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        await db.SaveChangesAsync();

        var svc = new ExportDataService(db);
        var bytes = await svc.BuildJsonExportAsync();

        Assert.NotNull(bytes);
        var json = System.Text.Encoding.UTF8.GetString(bytes!);
        Assert.Contains("\"voornaam\"", json, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("Jan", json);
    }

    // ── BuildXmlExportAsync ─────────────────────────────────────────────

    [Fact]
    public async Task BuildXmlExportAsync_ReturnsNull_WhenNoEigenaar()
    {
        await using var db = TestDbFactory.Create();
        var svc = new ExportDataService(db);

        var bytes = await svc.BuildXmlExportAsync();

        Assert.Null(bytes);
    }

    [Fact]
    public async Task BuildXmlExportAsync_ReturnsValidXml_WhenEigenaarExists()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        await db.SaveChangesAsync();

        var svc = new ExportDataService(db);
        var bytes = await svc.BuildXmlExportAsync();

        Assert.NotNull(bytes);
        // Should be parseable as XML
        var xml = System.Text.Encoding.UTF8.GetString(bytes!);
        var doc = XDocument.Parse(xml); // throws if invalid
        Assert.NotNull(doc.Root);
    }

    [Fact]
    public async Task BuildXmlExportAsync_ContainsLumioExportRoot()
    {
        await using var db = TestDbFactory.Create();
        db.Eigenaren.Add(MakeEigenaar());
        await db.SaveChangesAsync();

        var svc = new ExportDataService(db);
        var bytes = await svc.BuildXmlExportAsync();

        Assert.NotNull(bytes);
        var xml = System.Text.Encoding.UTF8.GetString(bytes!);
        Assert.Contains("<LumioExport", xml);
    }
}
