using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.DigitalEstate;
using Lumio.Api.Services.Pdf.Data;

namespace Lumio.Api.Tests.Services;

/// <summary>
/// T-005: Verifies that PdfDataLoader NEVER loads EncryptedWachtwoord or Gebruikersnaam
/// into the PDF data context (AVG Art.9 — no credentials in any export).
/// </summary>
public class PdfDataLoaderTests
{
    private static Eigenaar MakeEigenaar() => new()
    {
        Voornaam = "Test",
        Achternaam = "Eigenaar",
        Geboortedatum = new DateOnly(1970, 1, 1),
    };

    // ── T-005: Safe PDF wachtwoord projection ──────────────────────────

    [Fact]
    public async Task Wachtwoorden_AreProjectedToSafePdf_NotFullWachtwoordEntry()
    {
        // Arrange: eigenaar met twee wachtwoord-entries in de DB
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        db.Wachtwoorden.AddRange(
            new WachtwoordEntry
            {
                EigenaarId = eigenaar.Id,
                Naam = "Github",
                Gebruikersnaam = "jan@example.com",
                EncryptedWachtwoord = "ENCRYPTED_SECRET_1",
                Url = "https://github.com",
            },
            new WachtwoordEntry
            {
                EigenaarId = eigenaar.Id,
                Naam = "DigiD",
                Gebruikersnaam = "janssen123",
                EncryptedWachtwoord = "ENCRYPTED_SECRET_2",
            });
        await db.SaveChangesAsync();

        var loader = new PdfDataLoader(db);

        // Act
        var ctx = await loader.LoadAllAsync();

        // Assert: type is WachtwoordEntrySafePdf (T-005 safe projection)
        Assert.Equal(2, ctx.Wachtwoorden.Count);
        Assert.All(ctx.Wachtwoorden, w => Assert.IsType<WachtwoordEntrySafePdf>(w));

        // Assert: namen worden meegegeven (geen dataverlies voor metadata)
        var namen = ctx.Wachtwoorden.Select(w => w.Naam).ToHashSet();
        Assert.Contains("Github", namen);
        Assert.Contains("DigiD", namen);
    }

    [Fact]
    public async Task Wachtwoorden_SafePdf_DoesNotExposeCredentialFields()
    {
        // Arrange
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        db.Wachtwoorden.Add(new WachtwoordEntry
        {
            EigenaarId = eigenaar.Id,
            Naam = "SensitiveVault",
            Gebruikersnaam = "geheim_user",
            EncryptedWachtwoord = "TOP_SECRET_CIPHER",
        });
        await db.SaveChangesAsync();

        var loader = new PdfDataLoader(db);

        // Act
        var ctx = await loader.LoadAllAsync();

        // Assert: WachtwoordEntrySafePdf heeft GEEN EncryptedWachtwoord veld
        var safe = ctx.Wachtwoorden.Single();
        Assert.Equal("SensitiveVault", safe.Naam);

        // Reflectie-check: verifieer dat het type GEEN 'EncryptedWachtwoord' property heeft
        var props = typeof(WachtwoordEntrySafePdf).GetProperties().Select(p => p.Name).ToHashSet();
        Assert.DoesNotContain("EncryptedWachtwoord", props);
        Assert.DoesNotContain("Gebruikersnaam", props);
    }

    [Fact]
    public async Task Wachtwoorden_EmptyList_WhenNoneExist()
    {
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        await db.SaveChangesAsync();

        var loader = new PdfDataLoader(db);
        var ctx = await loader.LoadAllAsync();

        Assert.Empty(ctx.Wachtwoorden);
    }

    [Fact]
    public async Task Wachtwoorden_GewijzigdOp_IsAvailable_ForTimestampHeader()
    {
        // GewijzigdOp is NOT a credential — DigitaalBezitGenerator uses it for "last updated" header
        await using var db = TestDbFactory.Create();
        var eigenaar = MakeEigenaar();
        db.Eigenaren.Add(eigenaar);
        var expected = new DateTime(2026, 3, 1, 10, 0, 0, DateTimeKind.Utc);
        db.Wachtwoorden.Add(new WachtwoordEntry
        {
            EigenaarId = eigenaar.Id,
            Naam = "TestEntry",
            EncryptedWachtwoord = "cipher",
            GewijzigdOp = expected,
        });
        await db.SaveChangesAsync();

        var loader = new PdfDataLoader(db);
        var ctx = await loader.LoadAllAsync();

        Assert.Equal(expected, ctx.Wachtwoorden.Single().GewijzigdOp);
    }
}
