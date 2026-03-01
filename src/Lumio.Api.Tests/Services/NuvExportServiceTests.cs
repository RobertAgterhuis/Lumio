using Lumio.Api.Domain.Common;
using Lumio.Api.Services.Export;

namespace Lumio.Api.Tests.Services;

public class NuvExportServiceTests
{
    private static Eigenaar MakeEigenaar() => new()
    {
        Voornaam = "Jan",
        Achternaam = "Janssen",
        Geboortedatum = new DateOnly(1960, 1, 1),
    };

    [Fact]
    public async Task BuildNuvXmlAsync_Throws_WhenNoEigenaar()
    {
        await using var db = TestDbFactory.Create();
        var svc = new NuvExportService(db);

        await Assert.ThrowsAsync<InvalidOperationException>(() => svc.BuildNuvXmlAsync());
    }

    [Fact]
    public async Task BuildNuvXmlAsync_ReturnsValidXml_WhenEigenaarExists()
    {
        await using var db = TestDbFactory.Create();
        db.Eigenaren.Add(MakeEigenaar());
        await db.SaveChangesAsync();

        var svc = new NuvExportService(db);
        var bytes = await svc.BuildNuvXmlAsync();

        Assert.NotEmpty(bytes);
        var xml = System.Text.Encoding.UTF8.GetString(bytes);
        Assert.Contains("<?xml version=\"1.0\"", xml);
        Assert.Contains("NUV_Uitvaart", xml);
    }

    [Fact]
    public async Task BuildNuvXmlAsync_ContainsEigenaarName()
    {
        await using var db = TestDbFactory.Create();
        db.Eigenaren.Add(MakeEigenaar());
        await db.SaveChangesAsync();

        var svc = new NuvExportService(db);
        var bytes = await svc.BuildNuvXmlAsync();
        var xml = System.Text.Encoding.UTF8.GetString(bytes);

        Assert.Contains("Jan", xml);
        Assert.Contains("Janssen", xml);
    }

    [Fact]
    public async Task BuildNuvXmlAsync_IncludesNoodcontacten_WhenPresent()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        db.Noodcontacten.Add(new Noodcontact
            { EigenaarId = eigenaar.Id, Naam = "Partner", Relatie = "partner", Rol = "vertrouwenspersoon" });
        await db.SaveChangesAsync();

        var svc = new NuvExportService(db);
        var bytes = await svc.BuildNuvXmlAsync();
        var xml = System.Text.Encoding.UTF8.GetString(bytes);

        Assert.Contains("Partner", xml);
    }

    [Fact]
    public async Task BuildNuvXmlAsync_EscapesSpecialCharacters()
    {
        await using var db = TestDbFactory.Create();
        db.Eigenaren.Add(new Eigenaar
        {
            Voornaam = "Diederik <> \"&\"",
            Achternaam = "Van 't Veld",
            Geboortedatum = new DateOnly(1970, 6, 15),
        });
        await db.SaveChangesAsync();

        var svc = new NuvExportService(db);
        var bytes = await svc.BuildNuvXmlAsync();
        var xml = System.Text.Encoding.UTF8.GetString(bytes);

        // The raw unescaped < or > should NOT appear inside element values
        // (they should be entity-escaped)
        Assert.DoesNotContain("<Voornaam>Diederik <></Voornaam>", xml);
    }
}
