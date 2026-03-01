using System.Text;
using Lumio.Api.Data;
using Lumio.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/export/csv")]
public class ExportCsvController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly IAuditService _audit;

    public ExportCsvController(LumioDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    // ── CSV exports ──────────────────────────────────────────────────────

    [HttpGet("erfgenamen")]
    public async Task<IActionResult> ExportErfgenamen()
    {
        var items = await _db.Erfgenamen
            .OrderBy(e => e.Achternaam).ThenBy(e => e.Voornaam)
            .ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("Voornaam,Tussenvoegsel,Achternaam,Relatie,Telefoon,Email,Adres,Postcode,Woonplaats,Geboortedatum,BSN,LegitimatieSoort,LegitimatieNummer");
        foreach (var e in items)
        {
            sb.AppendLine(string.Join(",",
                Esc(e.Voornaam), Esc(e.Tussenvoegsel), Esc(e.Achternaam),
                Esc(e.Relatie), Esc(e.Telefoon), Esc(e.Email),
                Esc(e.Adres), Esc(e.Postcode), Esc(e.Woonplaats),
                Esc(e.Geboortedatum?.ToString("yyyy-MM-dd")),
                Esc(e.BSN), Esc(e.LegitimatieSoort.ToString()), Esc(e.LegitimatieNummer)));
        }

        await _audit.LogAsync("Export", "csv-export", null, "erfgenamen");
        return CsvResult(sb, "lumio-erfgenamen");
    }

    [HttpGet("bezittingen")]
    public async Task<IActionResult> ExportBezittingen()
    {
        var items = await _db.FysiekeBezittingen
            .Include(b => b.BestemdeErfgenaam)
            .OrderBy(b => b.Categorie).ThenBy(b => b.Omschrijving)
            .ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("Categorie,Omschrijving,GeschatteWaarde,Locatie,VermogensSoort,BestemdeErfgenaam,KadastraalNummer,Kenteken,KvKNummer,Notities");
        foreach (var b in items)
        {
            var erfNaam = b.BestemdeErfgenaam is null ? null
                : $"{b.BestemdeErfgenaam.Voornaam} {b.BestemdeErfgenaam.Achternaam}".Trim();
            sb.AppendLine(string.Join(",",
                Esc(b.Categorie), Esc(b.Omschrijving),
                Esc(b.GeschatteWaarde?.ToString("F2")),
                Esc(b.Locatie), Esc(b.VermogensSoort.ToString()), Esc(erfNaam),
                Esc(b.KadastraalNummer), Esc(b.Kenteken), Esc(b.KvKNummer), Esc(b.Notities)));
        }

        await _audit.LogAsync("Export", "csv-export", null, "bezittingen");
        return CsvResult(sb, "lumio-bezittingen");
    }

    [HttpGet("bankrekeningen")]
    public async Task<IActionResult> ExportBankrekeningen()
    {
        var items = await _db.Bankrekeningen
            .OrderBy(r => r.BankNaam)
            .ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("BankNaam,IBAN,RekeningType,Saldo,VermogensSoort,Notities");
        foreach (var r in items)
        {
            sb.AppendLine(string.Join(",",
                Esc(r.BankNaam), Esc(r.IBAN), Esc(r.RekeningType),
                Esc(r.Saldo?.ToString("F2")),
                Esc(r.VermogensSoort.ToString()), Esc(r.Notities)));
        }

        await _audit.LogAsync("Export", "csv-export", null, "bankrekeningen");
        return CsvResult(sb, "lumio-bankrekeningen");
    }

    [HttpGet("verzekeringen")]
    public async Task<IActionResult> ExportVerzekeringen()
    {
        var items = await _db.Verzekeringen
            .OrderBy(v => v.Type).ThenBy(v => v.Verzekeraar)
            .ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("Verzekeraar,PolisNummer,Type,VerzekerdBedrag,Begunstigde,VermogensSoort,VerzekeraarTelefoon,VerzekeraarEmail,Notities");
        foreach (var v in items)
        {
            sb.AppendLine(string.Join(",",
                Esc(v.Verzekeraar), Esc(v.PolisNummer), Esc(v.Type),
                Esc(v.VerzekerdBedrag?.ToString("F2")),
                Esc(v.Begunstigde), Esc(v.VermogensSoort.ToString()),
                Esc(v.VerzekeraarTelefoon), Esc(v.VerzekeraarEmail), Esc(v.Notities)));
        }

        await _audit.LogAsync("Export", "csv-export", null, "verzekeringen");
        return CsvResult(sb, "lumio-verzekeringen");
    }

    [HttpGet("schulden")]
    public async Task<IActionResult> ExportSchulden()
    {
        var items = await _db.Schulden
            .OrderBy(s => s.Type).ThenBy(s => s.Schuldeiser)
            .ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("Schuldeiser,Type,Bedrag,MaandelijkseAflossing,Referentie,VermogensSoort,Rentepercentage,HypotheekVorm,Einddatum,SchuldeiserTelefoon,SchuldeiserEmail,Notities");
        foreach (var s in items)
        {
            sb.AppendLine(string.Join(",",
                Esc(s.Schuldeiser), Esc(s.Type),
                Esc(s.Bedrag.ToString("F2")),
                Esc(s.MaandelijkseAflossing?.ToString("F2")),
                Esc(s.Referentie), Esc(s.VermogensSoort.ToString()),
                Esc(s.Rentepercentage?.ToString("F3")),
                Esc(s.HypotheekVorm),
                Esc(s.Einddatum?.ToString("yyyy-MM-dd")),
                Esc(s.SchuldeiserTelefoon), Esc(s.SchuldeiserEmail), Esc(s.Notities)));
        }

        await _audit.LogAsync("Export", "csv-export", null, "schulden");
        return CsvResult(sb, "lumio-schulden");
    }

    [HttpGet("noodcontacten")]
    public async Task<IActionResult> ExportNoodcontacten()
    {
        var items = await _db.Noodcontacten
            .OrderBy(n => n.Prioriteit).ThenBy(n => n.Naam)
            .ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("Naam,Relatie,Rol,Prioriteit,Telefoon,Email,Adres,Postcode,Woonplaats,BedrijfsNaam,Functie,IsGedeeld,Instructies");
        foreach (var n in items)
        {
            sb.AppendLine(string.Join(",",
                Esc(n.Naam), Esc(n.Relatie), Esc(n.Rol),
                Esc(n.Prioriteit.ToString()),
                Esc(n.Telefoon), Esc(n.Email),
                Esc(n.Adres), Esc(n.Postcode), Esc(n.Woonplaats),
                Esc(n.BedrijfsNaam), Esc(n.Functie),
                Esc(n.IsGedeeld ? "ja" : "nee"),
                Esc(n.Instructies)));
        }

        await _audit.LogAsync("Export", "csv-export", null, "noodcontacten");
        return CsvResult(sb, "lumio-noodcontacten");
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private static string Esc(string? s)
    {
        if (s is null) return string.Empty;
        if (s.Contains(',') || s.Contains('"') || s.Contains('\n'))
            return $"\"{s.Replace("\"", "\"\"")}\"";
        return s;
    }

    private static FileContentResult CsvResult(StringBuilder sb, string baseName)
    {
        var bytes = Encoding.UTF8.GetPreamble().Concat(
            Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
        return new FileContentResult(bytes, "text/csv")
        {
            FileDownloadName = $"{baseName}-{DateTime.Now:yyyy-MM-dd}.csv"
        };
    }
}
