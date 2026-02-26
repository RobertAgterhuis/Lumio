using Lumio.Api.Data;
using Lumio.Api.Domain.DigitalEstate;
using Lumio.Api.Dtos.DigitalEstate;
using Lumio.Api.Services;
using Lumio.Api.Services.Security;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/digitaal-bezit")]
public class DigitaalBezitController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly IAuditService _audit;

    public DigitaalBezitController(LumioDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    // --- Accounts ---

    [HttpGet("accounts")]
    public async Task<ActionResult<List<DigitaalAccountResponse>>> GetAccounts()
    {
        var items = await _db.DigitaleAccounts.OrderBy(a => a.PlatformNaam).ToListAsync();
        return Ok(items.Adapt<List<DigitaalAccountResponse>>());
    }

    [HttpPost("accounts")]
    public async Task<ActionResult<DigitaalAccountResponse>> CreateAccount([FromBody] DigitaalAccountUpsertRequest request)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = request.Adapt<DigitaalAccount>();
        item.EigenaarId = eigenaar.Id;
        _db.DigitaleAccounts.Add(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Aangemaakt", "DigitaalAccount", item.Id);
        return Created($"/api/digitaal-bezit/accounts/{item.Id}", item.Adapt<DigitaalAccountResponse>());
    }

    [HttpPut("accounts/{id:guid}")]
    public async Task<ActionResult<DigitaalAccountResponse>> UpdateAccount(Guid id, [FromBody] DigitaalAccountUpsertRequest request)
    {
        var item = await _db.DigitaleAccounts.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "DigitaalAccount", id);
        return Ok(item.Adapt<DigitaalAccountResponse>());
    }

    [HttpDelete("accounts/{id:guid}")]
    public async Task<IActionResult> DeleteAccount(Guid id)
    {
        var item = await _db.DigitaleAccounts.FindAsync(id);
        if (item is null) return NotFound();

        _db.DigitaleAccounts.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "DigitaalAccount", id);
        return NoContent();
    }

    // --- Wachtwoorden ---

    [HttpGet("wachtwoorden")]
    public async Task<ActionResult<List<WachtwoordEntryResponse>>> GetWachtwoorden()
    {
        var items = await _db.Wachtwoorden.OrderBy(w => w.Naam).ToListAsync();
        var result = items.Select(item => new WachtwoordEntryResponse(
            item.Id,
            item.Naam,
            item.Gebruikersnaam,
            item.Url,
            item.Notities,
            HasPassword: !string.IsNullOrEmpty(item.EncryptedWachtwoord)
        )).ToList();
        return Ok(result);
    }

    [HttpPost("wachtwoorden")]
    public async Task<ActionResult<WachtwoordEntryResponse>> CreateWachtwoord(
        [FromBody] WachtwoordEntryCreateRequest request,
        [FromServices] IEncryptionService encryption)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = new WachtwoordEntry
        {
            EigenaarId = eigenaar.Id,
            Naam = request.Naam,
            Gebruikersnaam = request.Gebruikersnaam,
            EncryptedWachtwoord = encryption.Encrypt(request.Wachtwoord),
            Url = request.Url,
            Notities = request.Notities
        };

        _db.Wachtwoorden.Add(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Aangemaakt", "Wachtwoord", item.Id);
        return Created($"/api/digitaal-bezit/wachtwoorden/{item.Id}", item.Adapt<WachtwoordEntryResponse>());
    }

    [HttpGet("wachtwoorden/{id:guid}/ontsluitel")]
    public async Task<ActionResult<WachtwoordOntsluitelResponse>> OntsluitelWachtwoord(
        Guid id,
        [FromServices] IEncryptionService encryption)
    {
        var item = await _db.Wachtwoorden.FindAsync(id);
        if (item is null) return NotFound();

        var decrypted = encryption.Decrypt(item.EncryptedWachtwoord);
        await _audit.LogAsync("WachtwoordOntsluitel", "Wachtwoord", id);
        return Ok(new WachtwoordOntsluitelResponse(
            item.Id, item.Naam, item.Gebruikersnaam,
            decrypted, item.Url, item.Notities));
    }

    [HttpPut("wachtwoorden/{id:guid}")]
    public async Task<ActionResult<WachtwoordEntryResponse>> UpdateWachtwoord(
        Guid id,
        [FromBody] WachtwoordEntryUpdateRequest request,
        [FromServices] IEncryptionService encryption)
    {
        var item = await _db.Wachtwoorden.FindAsync(id);
        if (item is null) return NotFound();

        item.Naam = request.Naam;
        item.Gebruikersnaam = request.Gebruikersnaam;
        item.Url = request.Url;
        item.Notities = request.Notities;

        if (!string.IsNullOrEmpty(request.NieuwWachtwoord))
            item.EncryptedWachtwoord = encryption.Encrypt(request.NieuwWachtwoord);

        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "Wachtwoord", id);
        return Ok(item.Adapt<WachtwoordEntryResponse>());
    }

    [HttpDelete("wachtwoorden/{id:guid}")]
    public async Task<IActionResult> DeleteWachtwoord(Guid id)
    {
        var item = await _db.Wachtwoorden.FindAsync(id);
        if (item is null) return NotFound();

        _db.Wachtwoorden.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "Wachtwoord", id);
        return NoContent();
    }

    [RequestSizeLimit(5_242_880)] // S7-08: max 5 MB
    [HttpPost("wachtwoorden/importeren")]
    public async Task<IActionResult> ImporterenWachtwoorden(
        IFormFile bestand,
        [FromServices] IEncryptionService encryption)
    {
        if (bestand is null || bestand.Length == 0)
            return BadRequest(new { error = "Geen bestand geüpload." });

        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        using var reader = new StreamReader(bestand.OpenReadStream());
        var headerLine = await reader.ReadLineAsync();
        if (string.IsNullOrWhiteSpace(headerLine))
            return BadRequest(new { error = "CSV-bestand is leeg." });

        // Parse header — normalize to lowercase
        var headers = ParseCsvLine(headerLine).Select(h => h.Trim().ToLowerInvariant()).ToList();

        // Auto-detect column mapping (supports 1Password, Bitwarden, LastPass, KeePass, Chrome)
        int ColIndex(params string[] candidates) =>
            candidates.Select(c => headers.IndexOf(c)).FirstOrDefault(i => i >= 0, -1);

        var naamIdx = ColIndex("name", "naam", "title", "login_label", "group");
        var userIdx = ColIndex("username", "gebruikersnaam", "login_username", "login", "user");
        var passIdx = ColIndex("password", "wachtwoord", "login_password", "pass");
        var urlIdx = ColIndex("url", "login_uri", "urls", "website", "web site");
        var notesIdx = ColIndex("notes", "notities", "login_notes", "extra", "comments");

        if (passIdx < 0)
            return BadRequest(new { error = "Kan geen 'password' kolom vinden in het CSV-bestand." });

        var imported = 0;
        var errors = new List<string>();
        var lineNumber = 1;
        string? line;

        while ((line = await reader.ReadLineAsync()) is not null)
        {
            lineNumber++;
            if (string.IsNullOrWhiteSpace(line)) continue;

            try
            {
                var fields = ParseCsvLine(line);
                var naam = GetField(fields, naamIdx) ?? $"Import #{lineNumber}";
                var user = GetField(fields, userIdx);
                var pass = GetField(fields, passIdx);
                var url = GetField(fields, urlIdx);
                var notes = GetField(fields, notesIdx);

                if (string.IsNullOrWhiteSpace(pass)) continue; // Skip empty passwords

                var entry = new WachtwoordEntry
                {
                    EigenaarId = eigenaar.Id,
                    Naam = naam,
                    Gebruikersnaam = user,
                    EncryptedWachtwoord = encryption.Encrypt(pass),
                    Url = url,
                    Notities = notes
                };

                _db.Wachtwoorden.Add(entry);
                imported++;
            }
            catch
            {
                errors.Add($"Regel {lineNumber} kon niet worden verwerkt.");
            }
        }

        if (imported > 0)
            await _db.SaveChangesAsync();

        return Ok(new { geimporteerd = imported, fouten = errors.Count, details = errors.Take(10) });
    }

    private static string? GetField(List<string> fields, int index)
        => index >= 0 && index < fields.Count ? (string.IsNullOrWhiteSpace(fields[index]) ? null : fields[index].Trim()) : null;

    private static List<string> ParseCsvLine(string line)
    {
        var fields = new List<string>();
        var current = new System.Text.StringBuilder();
        var inQuotes = false;

        for (int i = 0; i < line.Length; i++)
        {
            var c = line[i];
            if (inQuotes)
            {
                if (c == '"')
                {
                    if (i + 1 < line.Length && line[i + 1] == '"')
                    {
                        current.Append('"');
                        i++; // skip escaped quote
                    }
                    else
                    {
                        inQuotes = false;
                    }
                }
                else
                {
                    current.Append(c);
                }
            }
            else
            {
                if (c == '"')
                {
                    inQuotes = true;
                }
                else if (c == ',')
                {
                    fields.Add(current.ToString());
                    current.Clear();
                }
                else
                {
                    current.Append(c);
                }
            }
        }
        fields.Add(current.ToString());
        return fields;
    }

    // --- Crypto Wallets ---

    [HttpGet("crypto")]
    public async Task<ActionResult<List<CryptoWalletResponse>>> GetCryptoWallets()
    {
        var items = await _db.CryptoWallets.OrderBy(c => c.WalletNaam).ToListAsync();
        return Ok(items.Adapt<List<CryptoWalletResponse>>());
    }

    [HttpPost("crypto")]
    public async Task<ActionResult<CryptoWalletResponse>> CreateCryptoWallet(
        [FromBody] CryptoWalletUpsertRequest request,
        [FromServices] IEncryptionService encryption)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return BadRequest(new { error = "Maak eerst een eigenaar profiel aan." });

        var item = new CryptoWallet
        {
            EigenaarId = eigenaar.Id,
            WalletNaam = request.WalletNaam,
            CryptoType = request.CryptoType,
            WalletAdres = request.WalletAdres,
            EncryptedSeedPhrase = request.SeedPhrase is not null ? encryption.Encrypt(request.SeedPhrase) : null,
            Exchange = request.Exchange,
            Notities = request.Notities
        };

        _db.CryptoWallets.Add(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Aangemaakt", "CryptoWallet", item.Id);
        return Created($"/api/digitaal-bezit/crypto/{item.Id}", item.Adapt<CryptoWalletResponse>());
    }

    [HttpPut("crypto/{id:guid}")]
    public async Task<ActionResult<CryptoWalletResponse>> UpdateCryptoWallet(
        Guid id,
        [FromBody] CryptoWalletUpsertRequest request,
        [FromServices] IEncryptionService encryption)
    {
        var item = await _db.CryptoWallets.FindAsync(id);
        if (item is null) return NotFound();

        item.WalletNaam = request.WalletNaam;
        item.CryptoType = request.CryptoType;
        item.WalletAdres = request.WalletAdres;
        item.Exchange = request.Exchange;
        item.Notities = request.Notities;

        if (!string.IsNullOrEmpty(request.SeedPhrase))
            item.EncryptedSeedPhrase = encryption.Encrypt(request.SeedPhrase);

        await _db.SaveChangesAsync();
        await _audit.LogAsync("Gewijzigd", "CryptoWallet", id);
        return Ok(item.Adapt<CryptoWalletResponse>());
    }

    [HttpGet("crypto/{id:guid}/ontsluitel")]
    public async Task<ActionResult<CryptoWalletOntsluitelResponse>> OntsluitelCrypto(
        Guid id,
        [FromServices] IEncryptionService encryption)
    {
        var item = await _db.CryptoWallets.FindAsync(id);
        if (item is null) return NotFound();
        if (item.EncryptedSeedPhrase is null)
            return BadRequest(new { error = "Geen seed phrase opgeslagen voor deze wallet." });
        var decrypted = encryption.Decrypt(item.EncryptedSeedPhrase);
        await _audit.LogAsync("CryptoOntsluitel", "CryptoWallet", id);
        return Ok(new CryptoWalletOntsluitelResponse(
            item.Id, item.WalletNaam, item.CryptoType, decrypted, item.WalletAdres));
    }

    [HttpDelete("crypto/{id:guid}")]
    public async Task<IActionResult> DeleteCryptoWallet(Guid id)
    {
        var item = await _db.CryptoWallets.FindAsync(id);
        if (item is null) return NotFound();

        _db.CryptoWallets.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Verwijderd", "CryptoWallet", id);
        return NoContent();
    }
}
