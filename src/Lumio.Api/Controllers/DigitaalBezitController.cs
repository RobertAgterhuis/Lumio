using Lumio.Api.Data;
using Lumio.Api.Domain.DigitalEstate;
using Lumio.Api.Dtos.DigitalEstate;
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

    public DigitaalBezitController(LumioDbContext db) => _db = db;

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
        return Created($"/api/digitaal-bezit/accounts/{item.Id}", item.Adapt<DigitaalAccountResponse>());
    }

    [HttpPut("accounts/{id:guid}")]
    public async Task<ActionResult<DigitaalAccountResponse>> UpdateAccount(Guid id, [FromBody] DigitaalAccountUpsertRequest request)
    {
        var item = await _db.DigitaleAccounts.FindAsync(id);
        if (item is null) return NotFound();

        request.Adapt(item);
        await _db.SaveChangesAsync();
        return Ok(item.Adapt<DigitaalAccountResponse>());
    }

    [HttpDelete("accounts/{id:guid}")]
    public async Task<IActionResult> DeleteAccount(Guid id)
    {
        var item = await _db.DigitaleAccounts.FindAsync(id);
        if (item is null) return NotFound();

        _db.DigitaleAccounts.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // --- Wachtwoorden ---

    [HttpGet("wachtwoorden")]
    public async Task<ActionResult<List<WachtwoordEntryResponse>>> GetWachtwoorden()
    {
        var items = await _db.Wachtwoorden.OrderBy(w => w.Naam).ToListAsync();
        return Ok(items.Adapt<List<WachtwoordEntryResponse>>());
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
        return Ok(item.Adapt<WachtwoordEntryResponse>());
    }

    [HttpDelete("wachtwoorden/{id:guid}")]
    public async Task<IActionResult> DeleteWachtwoord(Guid id)
    {
        var item = await _db.Wachtwoorden.FindAsync(id);
        if (item is null) return NotFound();

        _db.Wachtwoorden.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
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
        return Ok(item.Adapt<CryptoWalletResponse>());
    }

    [HttpDelete("crypto/{id:guid}")]
    public async Task<IActionResult> DeleteCryptoWallet(Guid id)
    {
        var item = await _db.CryptoWallets.FindAsync(id);
        if (item is null) return NotFound();

        _db.CryptoWallets.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
