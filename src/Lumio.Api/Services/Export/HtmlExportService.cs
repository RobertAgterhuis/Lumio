using Lumio.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using System.Globalization;
using System.Text;

namespace Lumio.Api.Services.Export;

/// <inheritdoc/>
public sealed class HtmlExportService : IHtmlExportService
{
    private readonly LumioDbContext _db;
    private readonly IStringLocalizer<ExportResources> L;

    public HtmlExportService(LumioDbContext db, IStringLocalizer<ExportResources> localizer)
    {
        _db = db;
        L = localizer;
    }

    public async Task<(byte[] bytes, string veiligNaam)?> BuildErfgenaamHtmlAsync(Guid erfgenaamId)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return null;

        var erfgenaam = await _db.Erfgenamen.FindAsync(erfgenaamId);
        if (erfgenaam is null) return null;

        var noodcontacten = await _db.Noodcontacten
            .Where(n => n.EigenaarId == eigenaar.Id).OrderBy(n => n.Naam).ToListAsync();
        var testament = await _db.Testamenten.FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id);
        var toewijzingen = await _db.ErfgenaamToewijzingen
            .Where(t => t.ErfgenaamId == erfgenaamId).ToListAsync();

        var bezitIds = toewijzingen.Where(t => t.EntityType == "FysiekBezit").Select(t => t.EntityId).ToList();
        var bankIds = toewijzingen.Where(t => t.EntityType == "Bankrekening").Select(t => t.EntityId).ToList();
        var verzekeringIds = toewijzingen.Where(t => t.EntityType == "Verzekering").Select(t => t.EntityId).ToList();
        var accountIds = toewijzingen.Where(t => t.EntityType == "DigitaalAccount").Select(t => t.EntityId).ToList();

        var bezittingen = bezitIds.Count > 0 ? await _db.FysiekeBezittingen.Where(b => bezitIds.Contains(b.Id)).ToListAsync() : new();
        var bankrekeningen = bankIds.Count > 0 ? await _db.Bankrekeningen.Where(b => bankIds.Contains(b.Id)).ToListAsync() : new();
        var verzekeringen2 = verzekeringIds.Count > 0 ? await _db.Verzekeringen.Where(v => verzekeringIds.Contains(v.Id)).ToListAsync() : new();
        var accounts = accountIds.Count > 0 ? await _db.DigitaleAccounts.Where(a => accountIds.Contains(a.Id)).ToListAsync() : new();

        var erflater = $"{eigenaar.Voornaam} {(string.IsNullOrWhiteSpace(eigenaar.Tussenvoegsel) ? "" : eigenaar.Tussenvoegsel + " ")}{eigenaar.Achternaam}";
        var erfgenaamNaam = string.IsNullOrWhiteSpace(erfgenaam.Tussenvoegsel)
            ? $"{erfgenaam.Voornaam} {erfgenaam.Achternaam}"
            : $"{erfgenaam.Voornaam} {erfgenaam.Tussenvoegsel} {erfgenaam.Achternaam}";
        var datum = DateTime.Now.ToString("dd-MM-yyyy HH:mm");

        var sb = new StringBuilder();
        sb.AppendLine("<!DOCTYPE html>");
        sb.AppendLine($"<html lang=\"{CultureInfo.CurrentUICulture.TwoLetterISOLanguageName}\"><head><meta charset=\"UTF-8\">");
        sb.AppendLine($"<title>{L["HeirOverviewTitle"]} — {H(erfgenaamNaam)}</title>");
        sb.AppendLine("<style>");
        sb.AppendLine("body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:0 auto;padding:20px;color:#1e293b;background:#fafafa}");
        sb.AppendLine("h1{color:#1e3a5f;border-bottom:2px solid #1e3a5f;padding-bottom:8px}");
        sb.AppendLine("h2{color:#2563eb;margin-top:24px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}");
        sb.AppendLine("table{width:100%;border-collapse:collapse;margin:12px 0}");
        sb.AppendLine("th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #e2e8f0}");
        sb.AppendLine("th{background:#f1f5f9;font-weight:600;font-size:0.9em;color:#475569}");
        sb.AppendLine(".info{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin:12px 0}");
        sb.AppendLine(".disclaimer{background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;margin-top:24px;font-size:0.85em}");
        sb.AppendLine(".footer{margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:0.8em;color:#94a3b8}");
        sb.AppendLine("</style></head><body>");

        sb.AppendLine($"<h1>{L["HeirOverviewTitle"]}</h1>");
        sb.AppendLine("<div class=\"info\">");
        sb.AppendLine($"<strong>{L["RegardingEstateOf"]}</strong> {H(erflater)}<br>");
        sb.AppendLine($"<strong>{L["HeirLabel"]}</strong> {H(erfgenaamNaam)} ({H(erfgenaam.Relatie)})<br>");
        if (!string.IsNullOrWhiteSpace(erfgenaam.Telefoon))
            sb.AppendLine($"<strong>{L["PhoneLabel"]}</strong> {H(erfgenaam.Telefoon)}<br>");
        if (!string.IsNullOrWhiteSpace(erfgenaam.Email))
            sb.AppendLine($"<strong>{L["EmailLabel"]}</strong> {H(erfgenaam.Email)}<br>");
        sb.AppendLine("</div>");

        if (noodcontacten.Count > 0)
        {
            sb.AppendLine($"<h2>{L["ImportantContacts"]}</h2>");
            sb.AppendLine($"<table><tr><th>{L["NameHeader"]}</th><th>{L["RoleHeader"]}</th><th>{L["PhoneLabel"]}</th><th>{L["EmailLabel"]}</th></tr>");
            foreach (var n in noodcontacten)
                sb.AppendLine($"<tr><td>{H(n.Naam)}</td><td>{H(n.Rol)}</td><td>{H(n.Telefoon ?? "—")}</td><td>{H(n.Email ?? "—")}</td></tr>");
            sb.AppendLine("</table>");
        }

        if (testament != null)
        {
            sb.AppendLine($"<h2>{L["TestamentaryInformation"]}</h2>");
            sb.AppendLine("<table>");
            if (!string.IsNullOrWhiteSpace(testament.TestamentType))
                sb.AppendLine($"<tr><th>{L["TypeLabel"]}</th><td>{H(testament.TestamentType)}</td></tr>");
            if (!string.IsNullOrWhiteSpace(testament.NotarisContact?.Naam))
                sb.AppendLine($"<tr><th>{L["NotaryLabel"]}</th><td>{H(testament.NotarisContact?.Naam)} — {H(testament.NotarisContact?.BedrijfsNaam ?? "")}</td></tr>");
            if (testament.DatumTestament.HasValue)
                sb.AppendLine($"<tr><th>{L["DateLabel"]}</th><td>{testament.DatumTestament:dd-MM-yyyy}</td></tr>");
            if (!string.IsNullOrWhiteSpace(testament.CTR_Nummer))
                sb.AppendLine($"<tr><th>{L["CtrNumberLabel"]}</th><td>{H(testament.CTR_Nummer)}</td></tr>");
            if (!string.IsNullOrWhiteSpace(testament.TestamentLocatie))
                sb.AppendLine($"<tr><th>{L["LocationLabel"]}</th><td>{H(testament.TestamentLocatie)}</td></tr>");
            sb.AppendLine("</table>");
        }

        if (toewijzingen.Count > 0)
        {
            sb.AppendLine($"<h2>{L["ItemsAssignedToYou"]}</h2>");
            sb.AppendLine($"<table><tr><th>{L["TypeLabel"]}</th><th>{L["DescriptionHeader"]}</th><th>{L["InstructionsHeader"]}</th></tr>");
            foreach (var b in bezittingen)
            {
                var instr = toewijzingen.FirstOrDefault(t => t.EntityId == b.Id)?.Instructies ?? "—";
                sb.AppendLine($"<tr><td>{L["AssetType"]}</td><td>{H(b.Omschrijving)}</td><td>{H(instr)}</td></tr>");
            }
            foreach (var b in bankrekeningen)
            {
                var instr = toewijzingen.FirstOrDefault(t => t.EntityId == b.Id)?.Instructies ?? "—";
                sb.AppendLine($"<tr><td>{L["BankAccountType"]}</td><td>{H(b.BankNaam)} — {H(b.IBAN)}</td><td>{H(instr)}</td></tr>");
            }
            foreach (var v in verzekeringen2)
            {
                var instr = toewijzingen.FirstOrDefault(t => t.EntityId == v.Id)?.Instructies ?? "—";
                sb.AppendLine($"<tr><td>{L["InsuranceType"]}</td><td>{H(v.Verzekeraar)} — {H(v.PolisNummer)}</td><td>{H(instr)}</td></tr>");
            }
            foreach (var a in accounts)
            {
                var instr = toewijzingen.FirstOrDefault(t => t.EntityId == a.Id)?.Instructies ?? "—";
                sb.AppendLine($"<tr><td>{L["DigitalAccountType"]}</td><td>{H(a.PlatformNaam)}</td><td>{H(instr)}</td></tr>");
            }
            sb.AppendLine("</table>");
        }

        sb.AppendLine("<div class=\"disclaimer\">");
        sb.AppendLine($"<strong>{L["DisclaimerTitle"]}</strong> {L["DisclaimerText"]}");
        sb.AppendLine("</div>");

        sb.AppendLine($"<div class=\"footer\">{L["GeneratedByLumioOn", datum]} ");
        sb.AppendLine($"{L["DocumentIntendedForCoHeirs"]}</div>");
        sb.AppendLine("</body></html>");

        var veiligNaam = erfgenaam.Voornaam.ToLowerInvariant().Replace(" ", "-");
        return (Encoding.UTF8.GetBytes(sb.ToString()), veiligNaam);
    }

    private static string H(string? value) =>
        string.IsNullOrWhiteSpace(value) ? "" :
        value.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;");
}
