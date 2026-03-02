using Lumio.Api.Data;
using Lumio.Api.Rules.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/zoeken")]
public class ZoekenController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly LimietenOptions _limieten;

    public ZoekenController(LumioDbContext db, IOptions<LimietenOptions> limieten)
    {
        _db = db;
        _limieten = limieten.Value;
    }

    [HttpGet]
    public async Task<ActionResult<ZoekResultaat>> Zoeken([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < _limieten.ZoekenMinQueryLengte)
            return Ok(new ZoekResultaat());

        var query = q.ToLowerInvariant();

        var resultaat = new ZoekResultaat();

        // Erfgenamen
        // SP-9: Defensieve cap — voorkomt memory-issue bij grote datasets (DEV-001)
        var erfgenamen = await _db.Erfgenamen.Take(500).ToListAsync();
        resultaat.Erfgenamen = erfgenamen
            .Where(e => Contains(e.Voornaam, query) || Contains(e.Achternaam, query) ||
                        Contains(e.Relatie, query) || Contains(e.Email, query) ||
                        Contains(e.Telefoon, query))
            .Select(e => new ZoekItem(e.Id, $"{e.Voornaam} {(e.Tussenvoegsel != null ? e.Tussenvoegsel + " " : "")}{e.Achternaam}", "Erfgenaam", $"Relatie: {e.Relatie}", "/erfgenamen"))
            .ToList();

        // Noodcontacten
        var noodcontacten = await _db.Noodcontacten.Take(500).ToListAsync();
        resultaat.Noodcontacten = noodcontacten
            .Where(n => Contains(n.Naam, query) || Contains(n.Rol, query) ||
                        Contains(n.Telefoon, query) || Contains(n.Email, query) ||
                        Contains(n.Instructies, query))
            .Select(n => new ZoekItem(n.Id, n.Naam, "Noodcontact", $"{n.Rol} — {n.Relatie}", "/noodcontacten"))
            .ToList();

        // Digitale accounts
        var accounts = await _db.DigitaleAccounts.Take(500).ToListAsync();
        resultaat.DigitaleAccounts = accounts
            .Where(a => Contains(a.PlatformNaam, query) || Contains(a.Gebruikersnaam, query) ||
                        Contains(a.EmailAdres, query) || Contains(a.Url, query) ||
                        Contains(a.Categorie, query) || Contains(a.Notities, query))
            .Select(a => new ZoekItem(a.Id, a.PlatformNaam, "Digitaal Account",
                a.Categorie ?? a.GewensteActie, "/digitaal-bezit"))
            .ToList();

        // Wachtwoorden (zoek NIET op het wachtwoord zelf)
        var wachtwoorden = await _db.Wachtwoorden.Take(500).ToListAsync();
        resultaat.Wachtwoorden = wachtwoorden
            .Where(w => Contains(w.Naam, query) || Contains(w.Gebruikersnaam, query) ||
                        Contains(w.Url, query) || Contains(w.Notities, query))
            .Select(w => new ZoekItem(w.Id, w.Naam, "Wachtwoord",
                w.Gebruikersnaam ?? w.Url ?? "", "/digitaal-bezit"))
            .ToList();

        // Crypto wallets
        var crypto = await _db.CryptoWallets.Take(500).ToListAsync();
        resultaat.CryptoWallets = crypto
            .Where(c => Contains(c.WalletNaam, query) || Contains(c.CryptoType, query) ||
                        Contains(c.Exchange, query) || Contains(c.WalletAdres, query) ||
                        Contains(c.Notities, query))
            .Select(c => new ZoekItem(c.Id, c.WalletNaam, "Crypto Wallet",
                $"{c.CryptoType}{(c.Exchange != null ? $" — {c.Exchange}" : "")}", "/digitaal-bezit"))
            .ToList();

        // Bezittingen
        var bezittingen = await _db.FysiekeBezittingen.Take(500).ToListAsync();
        resultaat.Bezittingen = bezittingen
            .Where(b => Contains(b.Omschrijving, query) || Contains(b.Categorie, query) ||
                        Contains(b.Locatie, query) || Contains(b.Notities, query))
            .Select(b => new ZoekItem(b.Id, b.Omschrijving, "Bezitting",
                $"{b.Categorie}{(b.GeschatteWaarde.HasValue ? $" — € {b.GeschatteWaarde:N0}" : "")}", "/boedel"))
            .ToList();

        // Bankrekeningen
        var bankrekeningen = await _db.Bankrekeningen.Take(500).ToListAsync();
        resultaat.Bankrekeningen = bankrekeningen
            .Where(b => Contains(b.BankNaam, query) || Contains(b.IBAN, query) ||
                        Contains(b.RekeningType, query) || Contains(b.Notities, query))
            .Select(b => new ZoekItem(b.Id, $"{b.BankNaam} — {b.IBAN}", "Bankrekening",
                b.RekeningType, "/boedel"))
            .ToList();

        // Verzekeringen
        var verzekeringen = await _db.Verzekeringen.Take(500).ToListAsync();
        resultaat.Verzekeringen = verzekeringen
            .Where(v => Contains(v.Verzekeraar, query) || Contains(v.PolisNummer, query) ||
                        Contains(v.Type, query) || Contains(v.Notities, query))
            .Select(v => new ZoekItem(v.Id, $"{v.Verzekeraar} — {v.PolisNummer}", "Verzekering",
                v.Type, "/boedel"))
            .ToList();

        // Schulden
        var schulden = await _db.Schulden.Take(500).ToListAsync();
        resultaat.Schulden = schulden
            .Where(s => Contains(s.Schuldeiser, query) || Contains(s.Type, query) ||
                        Contains(s.Referentie, query) || Contains(s.Notities, query))
            .Select(s => new ZoekItem(s.Id, s.Schuldeiser, "Schuld",
                $"{s.Type} — € {s.Bedrag:N0}", "/boedel"))
            .ToList();

        // Documenten
        var documenten = await _db.Documenten.Take(500).ToListAsync();
        resultaat.Documenten = documenten
            .Where(d => Contains(d.Naam, query) || Contains(d.Categorie.ToString(), query) ||
                        Contains(d.BestandsNaam, query) || Contains(d.Notities, query))
            .Select(d => new ZoekItem(d.Id, d.Naam, "Document",
                d.Categorie.ToString(), "/documenten"))
            .ToList();

        return Ok(resultaat);
    }

    private static bool Contains(string? value, string query) =>
        value != null && value.Contains(query, StringComparison.OrdinalIgnoreCase);
}

public record ZoekItem(Guid Id, string Titel, string Type, string Beschrijving, string Link);

public class ZoekResultaat
{
    public List<ZoekItem> Erfgenamen { get; set; } = [];
    public List<ZoekItem> Noodcontacten { get; set; } = [];
    public List<ZoekItem> DigitaleAccounts { get; set; } = [];
    public List<ZoekItem> Wachtwoorden { get; set; } = [];
    public List<ZoekItem> CryptoWallets { get; set; } = [];
    public List<ZoekItem> Bezittingen { get; set; } = [];
    public List<ZoekItem> Bankrekeningen { get; set; } = [];
    public List<ZoekItem> Verzekeringen { get; set; } = [];
    public List<ZoekItem> Schulden { get; set; } = [];
    public List<ZoekItem> Documenten { get; set; } = [];
}
