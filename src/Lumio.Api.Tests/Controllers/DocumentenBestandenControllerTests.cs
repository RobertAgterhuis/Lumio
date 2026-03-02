using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Documents;
using Lumio.Api.Repositories;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Integration tests for <see cref="DocumentenBestandenController"/> — Upload, Download.
/// SP-14-004 Controller-tests batch 4.
/// </summary>
public sealed class DocumentenBestandenControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static DocumentenBestandenController MakeController(Lumio.Api.Data.LumioDbContext? db = null) =>
        new(new EfDocumentBestandRepository(db ?? TestDbFactory.Create()),
            Options.Create(new LimietenOptions()),
            new FakeAuditService());

    private static async Task<Eigenaar> SeedEigenaar(Lumio.Api.Data.LumioDbContext db)
    {
        var eigenaar = new Eigenaar { Id = Guid.NewGuid(), Voornaam = "Jan", Achternaam = "Test", Geboortedatum = new DateOnly(1970, 1, 1) };
        db.Eigenaren.Add(eigenaar);
        await db.SaveChangesAsync();
        return eigenaar;
    }

    private static IFormFile MakeFormFile(string name = "test.pdf", string contentType = "application/pdf")
    {
        var content = "dummy file content"u8.ToArray();
        var stream = new MemoryStream(content);
        return new FormFile(stream, 0, content.Length, "Bestand", name)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType,
        };
    }

    // ── Upload ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Upload_Returns400_WanneerGeenBestand()
    {
        var ctrl = MakeController();
        var request = new DocumentUploadRequest { Naam = "PassportNL", Categorie = "Identiteit", Bestand = null };

        var result = await ctrl.Upload(request, new FakeEncryptionServiceForDocumenten());

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Upload_Returns400_ZonderEigenaar()
    {
        var ctrl = MakeController();
        var request = new DocumentUploadRequest
        {
            Naam = "Contract",
            Categorie = "Contract",
            Bestand = MakeFormFile(),
        };

        var result = await ctrl.Upload(request, new FakeEncryptionServiceForDocumenten());

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Upload_Returns201_MetEigenaar()
    {
        var db = TestDbFactory.Create();
        await SeedEigenaar(db);
        var ctrl = new DocumentenBestandenController(
            new EfDocumentBestandRepository(db),
            Options.Create(new LimietenOptions { DocumentMaxBytes = 10_485_760 }),
            new FakeAuditService());

        var request = new DocumentUploadRequest
        {
            Naam = "Contract",
            Categorie = "Contract",
            Bestand = MakeFormFile(),
        };

        var result = await ctrl.Upload(request, new FakeEncryptionServiceForDocumenten());

        Assert.IsType<CreatedResult>(result.Result);
    }

    // ── Download ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task Download_Returns404_WanneerNietGevonden()
    {
        var ctrl = MakeController();

        var result = await ctrl.Download(Guid.NewGuid(), new FakeEncryptionServiceForDocumenten());

        Assert.IsType<NotFoundResult>(result);
    }
}

// ── Fake ───────────────────────────────────────────────────────────────────────

/// <summary>Passthrough encryption for tests — no actual encryption.</summary>
sealed class FakeEncryptionServiceForDocumenten : IEncryptionService
{
    public string Encrypt(string plaintext) => plaintext;
    public string Decrypt(string ciphertext) => ciphertext;
    public byte[] EncryptBytes(byte[] data) => data;
    public byte[] DecryptBytes(byte[] encryptedData) => encryptedData;
}
