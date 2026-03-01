using Lumio.Api.Controllers;
using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Domain.Common;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace Lumio.Api.Tests.Controllers;

public class ExportCsvControllerTests
{
    private static Eigenaar MakeEigenaar() => new()
    {
        Voornaam = "Jan",
        Achternaam = "Janssen",
        Geboortedatum = new DateOnly(1960, 1, 1),
    };

    private static ExportCsvController CreateController(Lumio.Api.Data.LumioDbContext db)
        => new(db, new FakeAuditService());

    // ── Erfgenamen CSV ──────────────────────────────────────────────────

    [Fact]
    public async Task ExportErfgenamen_ReturnsCsv_WithHeaderRow()
    {
        await using var db = TestDbFactory.Create();
        var ctrl = CreateController(db);

        var result = await ctrl.ExportErfgenamen();

        var file = Assert.IsType<FileContentResult>(result);
        Assert.Equal("text/csv", file.ContentType);
        var csv = Encoding.UTF8.GetString(file.FileContents).TrimStart('\xFEFF');
        var firstLine = csv.Split('\n')[0].Trim();
        Assert.Contains("Voornaam", firstLine);
        Assert.Contains("Achternaam", firstLine);
        Assert.Contains("Relatie", firstLine);
    }

    [Fact]
    public async Task ExportErfgenamen_ContainsData_WhenErfgenamenExist()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        db.Erfgenamen.Add(new Erfgenaam
            { EigenaarId = eigenaar.Id, Voornaam = "Kind", Achternaam = "Janssen", Relatie = "kind" });
        await db.SaveChangesAsync();

        var ctrl = CreateController(db);
        var result = await ctrl.ExportErfgenamen();

        var file = Assert.IsType<FileContentResult>(result);
        var csv = Encoding.UTF8.GetString(file.FileContents);
        Assert.Contains("Kind", csv);
        Assert.Contains("Janssen", csv);
    }

    [Fact]
    public async Task ExportErfgenamen_ReturnsHeaderOnly_WhenEmpty()
    {
        await using var db = TestDbFactory.Create();
        var ctrl = CreateController(db);

        var result = await ctrl.ExportErfgenamen();
        var file = Assert.IsType<FileContentResult>(result);
        var lines = Encoding.UTF8.GetString(file.FileContents).TrimStart('\xFEFF')
            .Split('\n', StringSplitOptions.RemoveEmptyEntries);
        Assert.Single(lines); // only header
    }

    // ── Bankrekeningen CSV ──────────────────────────────────────────────

    [Fact]
    public async Task ExportBankrekeningen_ReturnsCsv_WithHeaderRow()
    {
        await using var db = TestDbFactory.Create();
        var ctrl = CreateController(db);

        var result = await ctrl.ExportBankrekeningen();
        var file = Assert.IsType<FileContentResult>(result);
        var csv = Encoding.UTF8.GetString(file.FileContents).TrimStart('\xFEFF');
        Assert.Contains("BankNaam", csv.Split('\n')[0]);
        Assert.Contains("IBAN", csv.Split('\n')[0]);
    }

    [Fact]
    public async Task ExportBankrekeningen_ContainsData_WhenBankrekeningenExist()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        db.Bankrekeningen.Add(new Bankrekening
            { EigenaarId = eigenaar.Id, BankNaam = "ABN AMRO", IBAN = "NL01TEST123", RekeningType = "betaalrekening" });
        await db.SaveChangesAsync();

        var ctrl = CreateController(db);
        var result = await ctrl.ExportBankrekeningen();
        var file = Assert.IsType<FileContentResult>(result);
        var csv = Encoding.UTF8.GetString(file.FileContents);
        Assert.Contains("ABN AMRO", csv);
        Assert.Contains("NL01TEST123", csv);
    }

    // ── Bezittingen CSV ─────────────────────────────────────────────────

    [Fact]
    public async Task ExportBezittingen_ReturnsCsv_WithHeaderRow()
    {
        await using var db = TestDbFactory.Create();
        var ctrl = CreateController(db);

        var result = await ctrl.ExportBezittingen();
        var file = Assert.IsType<FileContentResult>(result);
        var csv = Encoding.UTF8.GetString(file.FileContents).TrimStart('\xFEFF');
        Assert.Contains("Categorie", csv.Split('\n')[0]);
        Assert.Contains("Omschrijving", csv.Split('\n')[0]);
    }

    // ── Verzekeringen CSV ───────────────────────────────────────────────

    [Fact]
    public async Task ExportVerzekeringen_ReturnsCsv_WithHeaderRow()
    {
        await using var db = TestDbFactory.Create();
        var ctrl = CreateController(db);

        var result = await ctrl.ExportVerzekeringen();
        var file = Assert.IsType<FileContentResult>(result);
        var csv = Encoding.UTF8.GetString(file.FileContents).TrimStart('\xFEFF');
        Assert.Contains("Verzekeraar", csv.Split('\n')[0]);
        Assert.Contains("PolisNummer", csv.Split('\n')[0]);
    }

    [Fact]
    public async Task ExportVerzekeringen_ContainsData_WhenVerzekeringenExist()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        db.Verzekeringen.Add(new Verzekering
            { EigenaarId = eigenaar.Id, Verzekeraar = "Centraal Beheer", PolisNummer = "POL-001", Type = "overlijden" });
        await db.SaveChangesAsync();

        var ctrl = CreateController(db);
        var result = await ctrl.ExportVerzekeringen();
        var file = Assert.IsType<FileContentResult>(result);
        var csv = Encoding.UTF8.GetString(file.FileContents);
        Assert.Contains("Centraal Beheer", csv);
        Assert.Contains("POL-001", csv);
    }

    // ── Schulden CSV ────────────────────────────────────────────────────

    [Fact]
    public async Task ExportSchulden_ReturnsCsv_WithHeaderRow()
    {
        await using var db = TestDbFactory.Create();
        var ctrl = CreateController(db);

        var result = await ctrl.ExportSchulden();
        var file = Assert.IsType<FileContentResult>(result);
        var csv = Encoding.UTF8.GetString(file.FileContents).TrimStart('\xFEFF');
        Assert.Contains("Schuldeiser", csv.Split('\n')[0]);
        Assert.Contains("Bedrag", csv.Split('\n')[0]);
    }

    // ── Noodcontacten CSV ───────────────────────────────────────────────

    [Fact]
    public async Task ExportNoodcontacten_ReturnsCsv_WithHeaderRow()
    {
        await using var db = TestDbFactory.Create();
        var ctrl = CreateController(db);

        var result = await ctrl.ExportNoodcontacten();
        var file = Assert.IsType<FileContentResult>(result);
        var csv = Encoding.UTF8.GetString(file.FileContents).TrimStart('\xFEFF');
        Assert.Contains("Naam", csv.Split('\n')[0]);
        Assert.Contains("Rol", csv.Split('\n')[0]);
    }

    [Fact]
    public async Task ExportNoodcontacten_ContainsData_WhenNoodcontactenExist()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        db.Noodcontacten.Add(new Noodcontact
            { EigenaarId = eigenaar.Id, Naam = "Dr. Huisarts", Relatie = "arts", Rol = "huisarts" });
        await db.SaveChangesAsync();

        var ctrl = CreateController(db);
        var result = await ctrl.ExportNoodcontacten();
        var file = Assert.IsType<FileContentResult>(result);
        var csv = Encoding.UTF8.GetString(file.FileContents);
        Assert.Contains("Dr. Huisarts", csv);
        Assert.Contains("huisarts", csv);
    }

    // ── CSV escaping ────────────────────────────────────────────────────

    [Fact]
    public async Task ExportErfgenamen_ProperlyEscapesCommasInValues()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        db.Erfgenamen.Add(new Erfgenaam
        {
            EigenaarId = eigenaar.Id,
            Voornaam = "Jan, Jr.",  // contains comma
            Achternaam = "Janssen",
            Relatie = "kind"
        });
        await db.SaveChangesAsync();

        var ctrl = CreateController(db);
        var result = await ctrl.ExportErfgenamen();
        var file = Assert.IsType<FileContentResult>(result);
        var csv = Encoding.UTF8.GetString(file.FileContents);
        // Comma-containing value should be wrapped in quotes
        Assert.Contains("\"Jan, Jr.\"", csv);
    }
}
