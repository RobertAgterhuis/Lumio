using Lumio.Api.Domain.Common;
using Lumio.Api.Services.Export;
using System.Text;

namespace Lumio.Api.Tests.Services;

/// <summary>
/// Tests for <see cref="EncryptedBackupService"/> (Maand 11 – Backup + Data governance).
/// </summary>
public class EncryptedBackupServiceTests
{
    private static async Task<EncryptedBackupService> CreateService(bool withEigenaar)
    {
        var db = TestDbFactory.Create();

        if (withEigenaar)
        {
            db.Eigenaren.Add(new Eigenaar
            {
                Voornaam = "Jan",
                Achternaam = "Janssen",
                Geboortedatum = new DateOnly(1960, 1, 1),
            });
            await db.SaveChangesAsync();
        }

        var exportDataSvc = new ExportDataService(db);
        return new EncryptedBackupService(exportDataSvc);
    }

    // ── Null when no eigenaar ─────────────────────────────────────────────

    [Fact]
    public async Task CreateEncryptedBackup_ReturnsNull_WhenGeenEigenaar()
    {
        var svc = await CreateService(withEigenaar: false);

        var result = await svc.CreateEncryptedBackupAsync("geheim123");

        Assert.Null(result);
    }

    // ── Returns bytes when eigenaar exists ───────────────────────────────

    [Fact]
    public async Task CreateEncryptedBackup_ReturnsByteArray_WhenEigenaarAanwezig()
    {
        var svc = await CreateService(withEigenaar: true);

        var result = await svc.CreateEncryptedBackupAsync("geheim123");

        Assert.NotNull(result);
        Assert.True(result.Length > 0);
    }

    // ── Header magic ─────────────────────────────────────────────────────

    [Fact]
    public async Task CreateEncryptedBackup_StartsMetLumioMagic()
    {
        var svc = await CreateService(withEigenaar: true);
        var expected = Encoding.ASCII.GetBytes("LUMIO_BK");

        var result = await svc.CreateEncryptedBackupAsync("geheim123");

        Assert.NotNull(result);
        Assert.True(result.Length >= expected.Length + 1 + 16 + 16,
            "Output moet minstens magic(8) + version(1) + salt(16) + IV(16) bytes bevatten.");
        Assert.Equal(expected, result.Take(8).ToArray());
    }

    // ── Version byte ─────────────────────────────────────────────────────

    [Fact]
    public async Task CreateEncryptedBackup_HeeftVersionByte_0x01()
    {
        var svc = await CreateService(withEigenaar: true);

        var result = await svc.CreateEncryptedBackupAsync("geheim123");

        Assert.NotNull(result);
        Assert.Equal(0x01, result[8]);   // byte directly after magic
    }

    // ── Randomness: two calls produce different ciphertext ───────────────

    [Fact]
    public async Task CreateEncryptedBackup_TweeAanroepen_GegenereerdeVerschillendeSaltOfIv()
    {
        var svc = await CreateService(withEigenaar: true);

        var first = await svc.CreateEncryptedBackupAsync("geheim123");
        var second = await svc.CreateEncryptedBackupAsync("geheim123");

        Assert.NotNull(first);
        Assert.NotNull(second);
        // With random salt+IV the full outputs will virtually never be identical
        Assert.False(first.SequenceEqual(second),
            "Twee versleutelde backups met hetzelfde wachtwoord mogen niet byte-voor-byte gelijk zijn (random salt/IV vereist).");
    }

    // ── Different passwords produce different ciphertext ─────────────────

    [Fact]
    public async Task CreateEncryptedBackup_VerschillendWachtwoord_GeeftVerschillendeOutput()
    {
        var svc = await CreateService(withEigenaar: true);

        var withPw1 = await svc.CreateEncryptedBackupAsync("wachtwoord1");
        var withPw2 = await svc.CreateEncryptedBackupAsync("wachtwoord2");

        Assert.NotNull(withPw1);
        Assert.NotNull(withPw2);
        Assert.False(withPw1.SequenceEqual(withPw2));
    }
}
