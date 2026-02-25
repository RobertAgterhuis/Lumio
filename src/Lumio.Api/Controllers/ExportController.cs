using Lumio.Api.Services.Pdf;
using Lumio.Api.Services;
using Lumio.Api.Data;
using Lumio.Api.Dtos.Export;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO.Compression;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Xml.Serialization;
using System.Xml.Linq;
using Microsoft.Extensions.Localization;
using System.Globalization;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private readonly ILumioPdfService _pdfService;
    private readonly LumioDbContext _db;
    private readonly IStringLocalizer<ExportController> L;
    private readonly IAuditService _audit;

    public ExportController(ILumioPdfService pdfService, LumioDbContext db, IStringLocalizer<ExportController> localizer, IAuditService audit)
    {
        _pdfService = pdfService;
        _db = db;
        L = localizer;
        _audit = audit;
    }

    [HttpPost("testament")]
    public async Task<IActionResult> ExportTestament()
    {
        var pdf = await _pdfService.GenerateTestamentPdf();
        await _audit.LogAsync("Export", "export", null, "testament");
        return File(pdf, "application/pdf", "lumio-testament.pdf");
    }

    [HttpPost("euthanasie")]
    public async Task<IActionResult> ExportEuthanasie()
    {
        var pdf = await _pdfService.GenerateEuthanasiePdf();
        await _audit.LogAsync("Export", "export", null, "euthanasie");
        return File(pdf, "application/pdf", "lumio-euthanasie.pdf");
    }

    [HttpPost("donor")]
    public async Task<IActionResult> ExportDonor()
    {
        var pdf = await _pdfService.GenerateDonorPdf();
        await _audit.LogAsync("Export", "export", null, "donor");
        return File(pdf, "application/pdf", "lumio-donor.pdf");
    }

    [HttpPost("digitaal-bezit")]
    public async Task<IActionResult> ExportDigitaalBezit()
    {
        var pdf = await _pdfService.GenerateDigitaalBezitPdf();
        await _audit.LogAsync("Export", "export", null, "digitaal-bezit");
        return File(pdf, "application/pdf", "lumio-digitaal-bezit.pdf");
    }

    [HttpPost("boedel")]
    public async Task<IActionResult> ExportBoedel()
    {
        var pdf = await _pdfService.GenerateBoedelPdf();
        await _audit.LogAsync("Export", "export", null, "boedel");
        return File(pdf, "application/pdf", "lumio-boedel.pdf");
    }

    [HttpPost("uitvaart")]
    public async Task<IActionResult> ExportUitvaart()
    {
        var pdf = await _pdfService.GenerateUitvaartPdf();
        await _audit.LogAsync("Export", "export", null, "uitvaart");
        return File(pdf, "application/pdf", "lumio-uitvaart.pdf");
    }

    [HttpPost("documenten")]
    public async Task<IActionResult> ExportDocumenten()
    {
        var pdf = await _pdfService.GenerateDocumentenOverzichtPdf();
        await _audit.LogAsync("Export", "export", null, "documenten");
        return File(pdf, "application/pdf", "lumio-documenten.pdf");
    }

    [HttpPost("compleet")]
    public async Task<IActionResult> ExportCompleet()
    {
        var pdf = await _pdfService.GenerateCompleetPdf();
        await _audit.LogAsync("Export", "export", null, "compleet");
        return File(pdf, "application/pdf", "lumio-compleet.pdf");
    }

    [HttpPost("noodkaart")]
    public async Task<IActionResult> ExportNoodkaart()
    {
        var pdf = await _pdfService.GenerateNoodkaartPdf();
        await _audit.LogAsync("Export", "export", null, "noodkaart");
        return File(pdf, "application/pdf", "lumio-noodkaart.pdf");
    }

    [HttpPost("testament-concept")]
    public async Task<IActionResult> ExportTestamentConcept()
    {
        var pdf = await _pdfService.GenerateTestamentConceptPdf();
        await _audit.LogAsync("Export", "export", null, "testament-concept");
        return File(pdf, "application/pdf", "lumio-testament-concept.pdf");
    }

    [HttpPost("wilsverklaring")]
    public async Task<IActionResult> ExportWilsverklaring()
    {
        var pdf = await _pdfService.GenerateWilsverklaringPdf();
        await _audit.LogAsync("Export", "export", null, "wilsverklaring");
        return File(pdf, "application/pdf", "lumio-wilsverklaring.pdf");
    }

    [HttpPost("noodprocedure")]
    public async Task<IActionResult> ExportNoodprocedure()
    {
        var pdf = await _pdfService.GenerateNoodprocedurePdf();
        await _audit.LogAsync("Export", "export", null, "noodprocedure");
        return File(pdf, "application/pdf", "lumio-noodprocedure.pdf");
    }

    [HttpPost("boedelbeschrijving")]
    public async Task<IActionResult> ExportBoedelbeschrijving()
    {
        var pdf = await _pdfService.GenerateBoedelbeschrijvingPdf();
        await _audit.LogAsync("Export", "export", null, "boedelbeschrijving");
        return File(pdf, "application/pdf", "lumio-boedelbeschrijving.pdf");
    }

    [HttpPost("executeur-rapport")]
    public async Task<IActionResult> ExportExecuteurRapport()
    {
        var pdf = await _pdfService.GenerateExecuteurRapportPdf();
        await _audit.LogAsync("Export", "export", null, "executeur-rapport");
        return File(pdf, "application/pdf", "lumio-executeur-rapport.pdf");
    }

    [HttpPost("notaris")]
    public async Task<IActionResult> ExportNotaris()
    {
        var pdf = await _pdfService.GenerateNotarisPdf();
        await _audit.LogAsync("Export", "export", null, "notaris");
        return File(pdf, "application/pdf", "lumio-notaris-dossier.pdf");
    }

    [HttpPost("erfgenaam/{erfgenaamId:guid}")]
    public async Task<IActionResult> ExportErfgenaam(Guid erfgenaamId)
    {
        var erfgenaam = await _db.Erfgenamen.FindAsync(erfgenaamId);
        if (erfgenaam is null)
            return NotFound(new { error = "Erfgenaam niet gevonden." });

        var pdf = await _pdfService.GenerateErfgenaamPdf(erfgenaamId);
        var veiligNaam = erfgenaam.Voornaam.ToLowerInvariant().Replace(" ", "-");
        await _audit.LogAsync("Export", "export", erfgenaamId, "erfgenaam");
        return File(pdf, "application/pdf", $"lumio-erfgenaam-{veiligNaam}.pdf");
    }

    // ── P-C13: Delen met mede-erfgenamen (HTML export) ────────────────

    [HttpGet("delen/{erfgenaamId:guid}")]
    public async Task<IActionResult> DeelMetErfgenaam(Guid erfgenaamId)
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return NotFound(new { error = "Geen eigenaar profiel gevonden." });

        var erfgenaam = await _db.Erfgenamen.FindAsync(erfgenaamId);
        if (erfgenaam is null)
            return NotFound(new { error = "Erfgenaam niet gevonden." });

        var noodcontacten = await _db.Noodcontacten
            .Where(n => n.EigenaarId == eigenaar.Id).OrderBy(n => n.Naam).ToListAsync();
        var testament = await _db.Testamenten.FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id);
        var toewijzingen = await _db.ErfgenaamToewijzingen
            .Where(t => t.ErfgenaamId == erfgenaamId).ToListAsync();

        // Resolve toewijzing descriptions
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
        sb.AppendLine($"<div class=\"info\">");
        sb.AppendLine($"<strong>{L["RegardingEstateOf"]}</strong> {H(erflater)}<br>");
        sb.AppendLine($"<strong>{L["HeirLabel"]}</strong> {H(erfgenaamNaam)} ({H(erfgenaam.Relatie)})<br>");
        if (!string.IsNullOrWhiteSpace(erfgenaam.Telefoon))
            sb.AppendLine($"<strong>{L["PhoneLabel"]}</strong> {H(erfgenaam.Telefoon)}<br>");
        if (!string.IsNullOrWhiteSpace(erfgenaam.Email))
            sb.AppendLine($"<strong>{L["EmailLabel"]}</strong> {H(erfgenaam.Email)}<br>");
        sb.AppendLine("</div>");

        // Noodcontacten
        if (noodcontacten.Count > 0)
        {
            sb.AppendLine($"<h2>{L["ImportantContacts"]}</h2>");
            sb.AppendLine($"<table><tr><th>{L["NameHeader"]}</th><th>{L["RoleHeader"]}</th><th>{L["PhoneLabel"]}</th><th>{L["EmailLabel"]}</th></tr>");
            foreach (var n in noodcontacten)
                sb.AppendLine($"<tr><td>{H(n.Naam)}</td><td>{H(n.Rol)}</td><td>{H(n.Telefoon ?? "—")}</td><td>{H(n.Email ?? "—")}</td></tr>");
            sb.AppendLine("</table>");
        }

        // Testament info
        if (testament != null)
        {
            sb.AppendLine($"<h2>{L["TestamentaryInformation"]}</h2>");
            sb.AppendLine("<table>");
            if (!string.IsNullOrWhiteSpace(testament.TestamentType))
                sb.AppendLine($"<tr><th>{L["TypeLabel"]}</th><td>{H(testament.TestamentType)}</td></tr>");
            if (!string.IsNullOrWhiteSpace(testament.NotarisNaam))
                sb.AppendLine($"<tr><th>{L["NotaryLabel"]}</th><td>{H(testament.NotarisNaam)} — {H(testament.NotarisKantoor ?? "")}</td></tr>");
            if (testament.DatumTestament.HasValue)
                sb.AppendLine($"<tr><th>{L["DateLabel"]}</th><td>{testament.DatumTestament:dd-MM-yyyy}</td></tr>");
            if (!string.IsNullOrWhiteSpace(testament.CTR_Nummer))
                sb.AppendLine($"<tr><th>{L["CtrNumberLabel"]}</th><td>{H(testament.CTR_Nummer)}</td></tr>");
            if (!string.IsNullOrWhiteSpace(testament.TestamentLocatie))
                sb.AppendLine($"<tr><th>{L["LocationLabel"]}</th><td>{H(testament.TestamentLocatie)}</td></tr>");
            sb.AppendLine("</table>");
        }

        // Toewijzingen
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

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        var veiligNaam = erfgenaam.Voornaam.ToLowerInvariant().Replace(" ", "-");
        return File(bytes, "text/html", $"lumio-erfgenaam-{veiligNaam}.html");
    }

    private static string H(string? value) =>
        string.IsNullOrWhiteSpace(value) ? "" :
        value.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;");

    [HttpPost("alles")]
    public async Task<IActionResult> ExportAlles()
    {
        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, leaveOpen: true))
        {
            // Generate all PDFs
            var pdfTasks = new (string naam, Func<Task<byte[]>> generator)[]
            {
                ("pdf/lumio-compleet.pdf", _pdfService.GenerateCompleetPdf),
                ("pdf/lumio-testament.pdf", _pdfService.GenerateTestamentPdf),
                ("pdf/lumio-euthanasie.pdf", _pdfService.GenerateEuthanasiePdf),
                ("pdf/lumio-donor.pdf", _pdfService.GenerateDonorPdf),
                ("pdf/lumio-digitaal-bezit.pdf", _pdfService.GenerateDigitaalBezitPdf),
                ("pdf/lumio-boedel.pdf", _pdfService.GenerateBoedelPdf),
                ("pdf/lumio-uitvaart.pdf", _pdfService.GenerateUitvaartPdf),
                ("pdf/lumio-documenten.pdf", _pdfService.GenerateDocumentenOverzichtPdf),
                ("pdf/lumio-noodkaart.pdf", _pdfService.GenerateNoodkaartPdf),
                ("pdf/lumio-testament-concept.pdf", _pdfService.GenerateTestamentConceptPdf),
                ("pdf/lumio-wilsverklaring.pdf", _pdfService.GenerateWilsverklaringPdf),
                ("pdf/lumio-noodprocedure.pdf", _pdfService.GenerateNoodprocedurePdf),
                ("pdf/lumio-boedelbeschrijving.pdf", _pdfService.GenerateBoedelbeschrijvingPdf),
                ("pdf/lumio-executeur-rapport.pdf", _pdfService.GenerateExecuteurRapportPdf),
            };

            foreach (var (naam, generator) in pdfTasks)
            {
                try
                {
                    var pdfBytes = await generator();
                    var entry = archive.CreateEntry(naam, CompressionLevel.Optimal);
                    using var entryStream = entry.Open();
                    await entryStream.WriteAsync(pdfBytes);
                }
                catch
                {
                    // Skip PDFs that fail (e.g. no data)
                }
            }

            // Add uploaded documents
            var documenten = await _db.Documenten.ToListAsync();
            foreach (var doc in documenten)
            {
                if (doc.BestandsInhoud is not { Length: > 0 }) continue;

                var veiligNaam = string.Join("_", doc.BestandsNaam.Split(Path.GetInvalidFileNameChars()));
                var entryNaam = $"documenten/{veiligNaam}";

                // Avoid duplicate names
                var counter = 1;
                var basisNaam = Path.GetFileNameWithoutExtension(veiligNaam);
                var extensie = Path.GetExtension(veiligNaam);
                while (archive.GetEntry(entryNaam) != null)
                {
                    entryNaam = $"documenten/{basisNaam}_{counter}{extensie}";
                    counter++;
                }

                var entry = archive.CreateEntry(entryNaam, CompressionLevel.Optimal);
                using var entryStream = entry.Open();
                await entryStream.WriteAsync(doc.BestandsInhoud);
            }

            // Add INHOUD.txt index file
            var sb = new StringBuilder();
            sb.AppendLine(L["ExportPackageTitle"]);
            sb.AppendLine(L["GeneratedOn", DateTime.Now.ToString("dd-MM-yyyy HH:mm")]);
            sb.AppendLine(new string('=', 50));
            sb.AppendLine();
            sb.AppendLine(L["ContentsLabel"]);
            sb.AppendLine();
            sb.AppendLine("pdf/");
            sb.AppendLine($"  {L["PdfDescription"]}");
            sb.AppendLine();
            if (documenten.Count > 0)
            {
                sb.AppendLine("documenten/");
                sb.AppendLine($"  {L["UploadedDocsDescription"]}");
                sb.AppendLine($"  {L["FileCount", documenten.Count]}");
                sb.AppendLine();
            }
            sb.AppendLine(L["InstructionsTitle"]);
            sb.AppendLine($"  {L["Instruction1"]}");
            sb.AppendLine($"  {L["Instruction2"]}");
            sb.AppendLine($"  {L["Instruction3"]}");
            sb.AppendLine($"  {L["Instruction4"]}");

            var inhoudEntry = archive.CreateEntry("INHOUD.txt", CompressionLevel.Optimal);
            using var inhoudStream = inhoudEntry.Open();
            var inhoudBytes = Encoding.UTF8.GetBytes(sb.ToString());
            await inhoudStream.WriteAsync(inhoudBytes);
        }

        memoryStream.Position = 0;
        await _audit.LogAsync("Export", "export", null, "alles");
        return File(memoryStream.ToArray(), "application/zip", $"lumio-export-{DateTime.Now:yyyy-MM-dd}.zip");
    }

    // ── P-M13: Structured export (JSON / XML) ────────────────

    [HttpGet("json")]
    [Produces("application/json")]
    public async Task<ActionResult<LumioExportData>> ExportJson()
    {
        var data = await BuildExportData();
        if (data is null)
            return NotFound(new { error = "Geen eigenaar profiel gevonden." });

        var options = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        var json = JsonSerializer.Serialize(data, options);
        var bytes = Encoding.UTF8.GetBytes(json);
        return File(bytes, "application/json", $"lumio-export-{DateTime.Now:yyyy-MM-dd}.json");
    }

    [HttpGet("xml")]
    [Produces("application/xml")]
    public async Task<IActionResult> ExportXml()
    {
        var data = await BuildExportData();
        if (data is null)
            return NotFound(new { error = "Geen eigenaar profiel gevonden." });

        // Serialize to JSON first (supports positional records), then convert to XML
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };
        var json = JsonSerializer.Serialize(data, jsonOptions);
        using var jsonDoc = JsonDocument.Parse(json);
        var xml = new XDocument(new XDeclaration("1.0", "utf-8", null),
            JsonToXml(jsonDoc.RootElement, "LumioExport"));
        using var ms = new MemoryStream();
        using var writer = new StreamWriter(ms, new UTF8Encoding(false));
        xml.Save(writer);
        return File(ms.ToArray(), "application/xml", $"lumio-export-{DateTime.Now:yyyy-MM-dd}.xml");
    }

    private static XElement JsonToXml(JsonElement element, string name)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                var obj = new XElement(name);
                foreach (var prop in element.EnumerateObject())
                    obj.Add(JsonToXml(prop.Value, prop.Name));
                return obj;
            case JsonValueKind.Array:
                var arr = new XElement(name);
                var itemName = name.EndsWith("en", StringComparison.Ordinal) ? name[..^2] :
                               name.EndsWith("s", StringComparison.Ordinal) ? name[..^1] : "item";
                foreach (var item in element.EnumerateArray())
                    arr.Add(JsonToXml(item, itemName));
                return arr;
            default:
                return new XElement(name, element.ToString());
        }
    }

    // ── P-C6: CSV export ────────────────

    // ── P-C12: NUV-standaard export ────────────────

    [HttpGet("nuv")]
    [Produces("application/xml")]
    public async Task<IActionResult> ExportNuv()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null)
            return NotFound(new { error = "Geen eigenaar profiel gevonden." });

        var uitvaart = await _db.UitvaartWensen
            .Include(u => u.CeremonieDetails.OrderBy(c => c.Volgorde))
            .Include(u => u.Genodigden.OrderBy(g => g.Naam))
            .FirstOrDefaultAsync();
        var noodcontacten = await _db.Noodcontacten
            .Where(n => n.EigenaarId == eigenaar.Id).OrderBy(n => n.Naam).ToListAsync();
        var verzekeringen = await _db.Verzekeringen
            .Where(v => v.EigenaarId == eigenaar.Id).ToListAsync();
        var erfgenamen = await _db.Erfgenamen
            .Where(e => e.EigenaarId == eigenaar.Id).OrderBy(e => e.Achternaam).ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        sb.AppendLine("<NUV_Uitvaart xmlns=\"urn:nuv:uitvaart:1.0\" versie=\"1.0\">");
        sb.AppendLine($"  <ExportDatum>{DateTime.Now:yyyy-MM-ddTHH:mm:ss}</ExportDatum>");
        sb.AppendLine($"  <BronSysteem>Lumio</BronSysteem>");

        // Overledene
        sb.AppendLine("  <Overledene>");
        sb.AppendLine($"    <Voornaam>{Xml(eigenaar.Voornaam)}</Voornaam>");
        if (!string.IsNullOrWhiteSpace(eigenaar.Tussenvoegsel))
            sb.AppendLine($"    <Tussenvoegsel>{Xml(eigenaar.Tussenvoegsel)}</Tussenvoegsel>");
        sb.AppendLine($"    <Achternaam>{Xml(eigenaar.Achternaam)}</Achternaam>");
        sb.AppendLine($"    <Geboortedatum>{eigenaar.Geboortedatum:yyyy-MM-dd}</Geboortedatum>");
        if (!string.IsNullOrWhiteSpace(eigenaar.BSN))
            sb.AppendLine($"    <BSN>{Xml(eigenaar.BSN)}</BSN>");
        if (!string.IsNullOrWhiteSpace(eigenaar.Adres))
            sb.AppendLine($"    <Adres>{Xml(eigenaar.Adres)}</Adres>");
        if (!string.IsNullOrWhiteSpace(eigenaar.Postcode))
            sb.AppendLine($"    <Postcode>{Xml(eigenaar.Postcode)}</Postcode>");
        if (!string.IsNullOrWhiteSpace(eigenaar.Woonplaats))
            sb.AppendLine($"    <Woonplaats>{Xml(eigenaar.Woonplaats)}</Woonplaats>");
        sb.AppendLine($"    <BurgerlijkeStaat>{eigenaar.BurgerlijkeStaat}</BurgerlijkeStaat>");
        sb.AppendLine("  </Overledene>");

        // Uitvaartwensen
        if (uitvaart != null)
        {
            sb.AppendLine("  <Uitvaartwensen>");
            sb.AppendLine($"    <VoorkeurType>{Xml(uitvaart.VoorkeurType)}</VoorkeurType>");
            if (!string.IsNullOrWhiteSpace(uitvaart.Begraafplaats))
                sb.AppendLine($"    <Begraafplaats>{Xml(uitvaart.Begraafplaats)}</Begraafplaats>");
            if (!string.IsNullOrWhiteSpace(uitvaart.CeremonieSoort))
                sb.AppendLine($"    <CeremonieSoort>{Xml(uitvaart.CeremonieSoort)}</CeremonieSoort>");
            if (!string.IsNullOrWhiteSpace(uitvaart.CeremonieLocatie))
                sb.AppendLine($"    <CeremonieLocatie>{Xml(uitvaart.CeremonieLocatie)}</CeremonieLocatie>");
            if (!string.IsNullOrWhiteSpace(uitvaart.Muziekwensen))
                sb.AppendLine($"    <Muziekwensen>{Xml(uitvaart.Muziekwensen)}</Muziekwensen>");
            if (!string.IsNullOrWhiteSpace(uitvaart.Sprekers))
                sb.AppendLine($"    <Sprekers>{Xml(uitvaart.Sprekers)}</Sprekers>");
            if (!string.IsNullOrWhiteSpace(uitvaart.Bloemen))
                sb.AppendLine($"    <Bloemen>{Xml(uitvaart.Bloemen)}</Bloemen>");
            if (!string.IsNullOrWhiteSpace(uitvaart.Kledingwensen))
                sb.AppendLine($"    <Kledingwensen>{Xml(uitvaart.Kledingwensen)}</Kledingwensen>");
            if (!string.IsNullOrWhiteSpace(uitvaart.RouwkaartTekst))
                sb.AppendLine($"    <RouwkaartTekst>{Xml(uitvaart.RouwkaartTekst)}</RouwkaartTekst>");
            if (!string.IsNullOrWhiteSpace(uitvaart.RouwadvertentieTekst))
                sb.AppendLine($"    <RouwadvertentieTekst>{Xml(uitvaart.RouwadvertentieTekst)}</RouwadvertentieTekst>");
            if (!string.IsNullOrWhiteSpace(uitvaart.Condoleance))
                sb.AppendLine($"    <Condoleance>{Xml(uitvaart.Condoleance)}</Condoleance>");
            if (!string.IsNullOrWhiteSpace(uitvaart.OverigeWensen))
                sb.AppendLine($"    <OverigeWensen>{Xml(uitvaart.OverigeWensen)}</OverigeWensen>");
            sb.AppendLine($"    <HeeftUitvaartVerzekering>{uitvaart.HeeftUitvaartVerzekering.ToString().ToLower()}</HeeftUitvaartVerzekering>");
            if (!string.IsNullOrWhiteSpace(uitvaart.UitvaartVerzekeringDetails))
                sb.AppendLine($"    <UitvaartVerzekeringDetails>{Xml(uitvaart.UitvaartVerzekeringDetails)}</UitvaartVerzekeringDetails>");
            if (!string.IsNullOrWhiteSpace(uitvaart.BudgetRichting))
                sb.AppendLine($"    <BudgetRichting>{Xml(uitvaart.BudgetRichting)}</BudgetRichting>");

            // Voorkeurlocaties
            if (!string.IsNullOrWhiteSpace(uitvaart.VoorkeurBegraafplaatsNaam))
            {
                sb.AppendLine("    <VoorkeurBegraafplaats>");
                sb.AppendLine($"      <Naam>{Xml(uitvaart.VoorkeurBegraafplaatsNaam)}</Naam>");
                if (!string.IsNullOrWhiteSpace(uitvaart.VoorkeurBegraafplaatsAdres))
                    sb.AppendLine($"      <Adres>{Xml(uitvaart.VoorkeurBegraafplaatsAdres)}</Adres>");
                sb.AppendLine("    </VoorkeurBegraafplaats>");
            }
            if (!string.IsNullOrWhiteSpace(uitvaart.VoorkeurCrematoriumnaam))
            {
                sb.AppendLine("    <VoorkeurCrematorium>");
                sb.AppendLine($"      <Naam>{Xml(uitvaart.VoorkeurCrematoriumnaam)}</Naam>");
                if (!string.IsNullOrWhiteSpace(uitvaart.VoorkeurCrematoriumAdres))
                    sb.AppendLine($"      <Adres>{Xml(uitvaart.VoorkeurCrematoriumAdres)}</Adres>");
                sb.AppendLine("    </VoorkeurCrematorium>");
            }
            if (!string.IsNullOrWhiteSpace(uitvaart.VoorkeurAulaNaam))
            {
                sb.AppendLine("    <VoorkeurAula>");
                sb.AppendLine($"      <Naam>{Xml(uitvaart.VoorkeurAulaNaam)}</Naam>");
                if (!string.IsNullOrWhiteSpace(uitvaart.VoorkeurAulaAdres))
                    sb.AppendLine($"      <Adres>{Xml(uitvaart.VoorkeurAulaAdres)}</Adres>");
                sb.AppendLine("    </VoorkeurAula>");
            }

            // Ceremonie details
            if (uitvaart.CeremonieDetails.Count > 0)
            {
                sb.AppendLine("    <CeremonieDetails>");
                foreach (var d in uitvaart.CeremonieDetails)
                {
                    sb.AppendLine("      <Detail>");
                    sb.AppendLine($"        <Volgorde>{d.Volgorde}</Volgorde>");
                    sb.AppendLine($"        <Onderdeel>{Xml(d.Onderdeel)}</Onderdeel>");
                    if (!string.IsNullOrWhiteSpace(d.Beschrijving))
                        sb.AppendLine($"        <Beschrijving>{Xml(d.Beschrijving)}</Beschrijving>");
                    if (!string.IsNullOrWhiteSpace(d.Muziek))
                        sb.AppendLine($"        <Muziek>{Xml(d.Muziek)}</Muziek>");
                    if (!string.IsNullOrWhiteSpace(d.Spreker))
                        sb.AppendLine($"        <Spreker>{Xml(d.Spreker)}</Spreker>");
                    if (!string.IsNullOrWhiteSpace(d.Tekstlezing))
                        sb.AppendLine($"        <Tekstlezing>{Xml(d.Tekstlezing)}</Tekstlezing>");
                    if (!string.IsNullOrWhiteSpace(d.Dresscode))
                        sb.AppendLine($"        <Dresscode>{Xml(d.Dresscode)}</Dresscode>");
                    sb.AppendLine("      </Detail>");
                }
                sb.AppendLine("    </CeremonieDetails>");
            }

            // Genodigden
            if (uitvaart.Genodigden.Count > 0)
            {
                sb.AppendLine("    <Genodigden>");
                foreach (var g in uitvaart.Genodigden)
                {
                    sb.AppendLine("      <Genodigde>");
                    sb.AppendLine($"        <Naam>{Xml(g.Naam)}</Naam>");
                    if (!string.IsNullOrWhiteSpace(g.Relatie))
                        sb.AppendLine($"        <Relatie>{Xml(g.Relatie)}</Relatie>");
                    if (!string.IsNullOrWhiteSpace(g.Telefoon))
                        sb.AppendLine($"        <Telefoon>{Xml(g.Telefoon)}</Telefoon>");
                    if (!string.IsNullOrWhiteSpace(g.Email))
                        sb.AppendLine($"        <Email>{Xml(g.Email)}</Email>");
                    sb.AppendLine("      </Genodigde>");
                }
                sb.AppendLine("    </Genodigden>");
            }

            sb.AppendLine("  </Uitvaartwensen>");
        }

        // Uitvaartondernemer
        if (uitvaart != null && !string.IsNullOrWhiteSpace(uitvaart.UitvaartOndernemer))
        {
            sb.AppendLine("  <Uitvaartondernemer>");
            sb.AppendLine($"    <Naam>{Xml(uitvaart.UitvaartOndernemer)}</Naam>");
            if (!string.IsNullOrWhiteSpace(uitvaart.UitvaartOndernemerTelefoon))
                sb.AppendLine($"    <Telefoon>{Xml(uitvaart.UitvaartOndernemerTelefoon)}</Telefoon>");
            if (!string.IsNullOrWhiteSpace(uitvaart.UitvaartOndernemerEmail))
                sb.AppendLine($"    <Email>{Xml(uitvaart.UitvaartOndernemerEmail)}</Email>");
            if (!string.IsNullOrWhiteSpace(uitvaart.UitvaartOndernemerAdres))
                sb.AppendLine($"    <Adres>{Xml(uitvaart.UitvaartOndernemerAdres)}</Adres>");
            if (!string.IsNullOrWhiteSpace(uitvaart.UitvaartOndernemerPostcode))
                sb.AppendLine($"    <Postcode>{Xml(uitvaart.UitvaartOndernemerPostcode)}</Postcode>");
            if (!string.IsNullOrWhiteSpace(uitvaart.UitvaartOndernemerPlaats))
                sb.AppendLine($"    <Plaats>{Xml(uitvaart.UitvaartOndernemerPlaats)}</Plaats>");
            sb.AppendLine("  </Uitvaartondernemer>");
        }

        // Contactpersonen
        if (noodcontacten.Count > 0)
        {
            sb.AppendLine("  <Contactpersonen>");
            foreach (var n in noodcontacten)
            {
                sb.AppendLine("    <Contact>");
                sb.AppendLine($"      <Naam>{Xml(n.Naam)}</Naam>");
                sb.AppendLine($"      <Rol>{Xml(n.Rol)}</Rol>");
                sb.AppendLine($"      <Relatie>{Xml(n.Relatie)}</Relatie>");
                if (!string.IsNullOrWhiteSpace(n.Telefoon))
                    sb.AppendLine($"      <Telefoon>{Xml(n.Telefoon)}</Telefoon>");
                if (!string.IsNullOrWhiteSpace(n.Email))
                    sb.AppendLine($"      <Email>{Xml(n.Email)}</Email>");
                sb.AppendLine("    </Contact>");
            }
            sb.AppendLine("  </Contactpersonen>");
        }

        // Nabestaanden/erfgenamen
        if (erfgenamen.Count > 0)
        {
            sb.AppendLine("  <Nabestaanden>");
            foreach (var e in erfgenamen)
            {
                sb.AppendLine("    <Nabestaande>");
                sb.AppendLine($"      <Voornaam>{Xml(e.Voornaam)}</Voornaam>");
                if (!string.IsNullOrWhiteSpace(e.Tussenvoegsel))
                    sb.AppendLine($"      <Tussenvoegsel>{Xml(e.Tussenvoegsel)}</Tussenvoegsel>");
                sb.AppendLine($"      <Achternaam>{Xml(e.Achternaam)}</Achternaam>");
                sb.AppendLine($"      <Relatie>{Xml(e.Relatie)}</Relatie>");
                if (!string.IsNullOrWhiteSpace(e.Telefoon))
                    sb.AppendLine($"      <Telefoon>{Xml(e.Telefoon)}</Telefoon>");
                if (!string.IsNullOrWhiteSpace(e.Email))
                    sb.AppendLine($"      <Email>{Xml(e.Email)}</Email>");
                sb.AppendLine("    </Nabestaande>");
            }
            sb.AppendLine("  </Nabestaanden>");
        }

        // Verzekeringen
        var uitvaartVerzekeringen = verzekeringen
            .Where(v => (v.Type ?? "").ToLowerInvariant().Contains("uitvaart") ||
                        (v.Type ?? "").ToLowerInvariant().Contains("begrafenis") ||
                        (v.Type ?? "").ToLowerInvariant().Contains("overlijden")).ToList();
        if (uitvaartVerzekeringen.Count > 0)
        {
            sb.AppendLine("  <Verzekeringen>");
            foreach (var v in uitvaartVerzekeringen)
            {
                sb.AppendLine("    <Verzekering>");
                sb.AppendLine($"      <Verzekeraar>{Xml(v.Verzekeraar)}</Verzekeraar>");
                sb.AppendLine($"      <PolisNummer>{Xml(v.PolisNummer)}</PolisNummer>");
                if (v.VerzekerdBedrag.HasValue)
                    sb.AppendLine($"      <VerzekerdBedrag>{v.VerzekerdBedrag:F2}</VerzekerdBedrag>");
                if (!string.IsNullOrWhiteSpace(v.VerzekeraarTelefoon))
                    sb.AppendLine($"      <Telefoon>{Xml(v.VerzekeraarTelefoon)}</Telefoon>");
                sb.AppendLine("    </Verzekering>");
            }
            sb.AppendLine("  </Verzekeringen>");
        }

        sb.AppendLine("</NUV_Uitvaart>");

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "application/xml", $"lumio-nuv-export-{DateTime.Now:yyyy-MM-dd}.xml");
    }

    private static string Xml(string? value) =>
        string.IsNullOrWhiteSpace(value) ? "" :
        value.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;")
            .Replace("\"", "&quot;").Replace("'", "&apos;");

    [HttpGet("csv/erfgenamen")]
    public async Task<IActionResult> ExportErfgenamenCsv()
    {
        var items = await _db.Erfgenamen.OrderBy(e => e.Achternaam).ToListAsync();
        var csv = new StringBuilder();
        csv.AppendLine("Voornaam;Tussenvoegsel;Achternaam;Relatie;Telefoon;Email;Adres;Postcode;Woonplaats;Geboortedatum;BSN");
        foreach (var e in items)
            csv.AppendLine($"{Esc(e.Voornaam)};{Esc(e.Tussenvoegsel)};{Esc(e.Achternaam)};{Esc(e.Relatie)};{Esc(e.Telefoon)};{Esc(e.Email)};{Esc(e.Adres)};{Esc(e.Postcode)};{Esc(e.Woonplaats)};{e.Geboortedatum?.ToString("yyyy-MM-dd")};{Esc(e.BSN)}");
        return CsvResult(csv, "erfgenamen");
    }

    [HttpGet("csv/bezittingen")]
    public async Task<IActionResult> ExportBezittingenCsv()
    {
        var items = await _db.FysiekeBezittingen.ToListAsync();
        var csv = new StringBuilder();
        csv.AppendLine("Categorie;Omschrijving;Geschatte Waarde;Locatie;Bestemde Erfgenaam;Vermogenssoort;Notities;Kadastraal Nummer;Kenteken;KvK Nummer");
        foreach (var b in items)
            csv.AppendLine($"{Esc(b.Categorie)};{Esc(b.Omschrijving)};{b.GeschatteWaarde};{Esc(b.Locatie)};{Esc(b.BestemdeErfgenaam)};{b.VermogensSoort};{Esc(b.Notities)};{Esc(b.KadastraalNummer)};{Esc(b.Kenteken)};{Esc(b.KvKNummer)}");
        return CsvResult(csv, "bezittingen");
    }

    [HttpGet("csv/bankrekeningen")]
    public async Task<IActionResult> ExportBankrekeningenCsv()
    {
        var items = await _db.Bankrekeningen.ToListAsync();
        var csv = new StringBuilder();
        csv.AppendLine("Bank;IBAN;Rekeningtype;Saldo;Vermogenssoort;Notities");
        foreach (var b in items)
            csv.AppendLine($"{Esc(b.BankNaam)};{Esc(b.IBAN)};{Esc(b.RekeningType)};{b.Saldo};{b.VermogensSoort};{Esc(b.Notities)}");
        return CsvResult(csv, "bankrekeningen");
    }

    [HttpGet("csv/verzekeringen")]
    public async Task<IActionResult> ExportVerzekeringenCsv()
    {
        var items = await _db.Verzekeringen.ToListAsync();
        var csv = new StringBuilder();
        csv.AppendLine("Verzekeraar;Polisnummer;Type;Verzekerd Bedrag;Begunstigde;Vermogenssoort;Notities");
        foreach (var v in items)
            csv.AppendLine($"{Esc(v.Verzekeraar)};{Esc(v.PolisNummer)};{Esc(v.Type)};{v.VerzekerdBedrag};{Esc(v.Begunstigde)};{v.VermogensSoort};{Esc(v.Notities)}");
        return CsvResult(csv, "verzekeringen");
    }

    [HttpGet("csv/schulden")]
    public async Task<IActionResult> ExportSchuldenCsv()
    {
        var items = await _db.Schulden.ToListAsync();
        var csv = new StringBuilder();
        csv.AppendLine("Schuldeiser;Type;Bedrag;Maandelijkse Aflossing;Referentie;Vermogenssoort;Notities");
        foreach (var s in items)
            csv.AppendLine($"{Esc(s.Schuldeiser)};{Esc(s.Type)};{s.Bedrag};{s.MaandelijkseAflossing};{Esc(s.Referentie)};{s.VermogensSoort};{Esc(s.Notities)}");
        return CsvResult(csv, "schulden");
    }

    [HttpGet("csv/noodcontacten")]
    public async Task<IActionResult> ExportNoodcontactenCsv()
    {
        var items = await _db.Noodcontacten.OrderBy(n => n.Naam).ToListAsync();
        var csv = new StringBuilder();
        csv.AppendLine("Naam;Relatie;Rol;Telefoon;Email;Adres;Postcode;Woonplaats;Instructies");
        foreach (var n in items)
            csv.AppendLine($"{Esc(n.Naam)};{Esc(n.Relatie)};{Esc(n.Rol)};{Esc(n.Telefoon)};{Esc(n.Email)};{Esc(n.Adres)};{Esc(n.Postcode)};{Esc(n.Woonplaats)};{Esc(n.Instructies)}");
        return CsvResult(csv, "noodcontacten");
    }

    private static string Esc(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "";
        if (value.Contains(';') || value.Contains('"') || value.Contains('\n'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }

    private FileContentResult CsvResult(StringBuilder csv, string naam)
    {
        // BOM + UTF-8 for Excel compatibility
        var bom = new byte[] { 0xEF, 0xBB, 0xBF };
        var csvBytes = Encoding.UTF8.GetBytes(csv.ToString());
        var result = new byte[bom.Length + csvBytes.Length];
        bom.CopyTo(result, 0);
        csvBytes.CopyTo(result, bom.Length);
        return File(result, "text/csv", $"lumio-{naam}-{DateTime.Now:yyyy-MM-dd}.csv");
    }

    private async Task<LumioExportData?> BuildExportData()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return null;

        var erfgenamen = await _db.Erfgenamen
            .Where(e => e.EigenaarId == eigenaar.Id).ToListAsync();
        var noodcontacten = await _db.Noodcontacten
            .Where(n => n.EigenaarId == eigenaar.Id).ToListAsync();

        // Testament
        var testament = await _db.Testamenten
            .Include(t => t.Begunstigden).Include(t => t.Executeurs)
            .FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id);

        // Euthanasie
        var wilsverklaring = await _db.Wilsverklaringen
            .Include(w => w.Voorwaarden)
            .FirstOrDefaultAsync(w => w.EigenaarId == eigenaar.Id);

        // Donor
        var donor = await _db.DonorRegistraties
            .Include(d => d.OrgaanKeuzes)
            .FirstOrDefaultAsync(d => d.EigenaarId == eigenaar.Id);

        // Uitvaart
        var uitvaart = await _db.UitvaartWensen
            .Include(u => u.CeremonieDetails)
            .FirstOrDefaultAsync(u => u.EigenaarId == eigenaar.Id);

        // Boedel
        var bezittingen = await _db.FysiekeBezittingen
            .Where(b => b.EigenaarId == eigenaar.Id).ToListAsync();
        var bankrekeningen = await _db.Bankrekeningen
            .Where(b => b.EigenaarId == eigenaar.Id).ToListAsync();
        var verzekeringen = await _db.Verzekeringen
            .Where(v => v.EigenaarId == eigenaar.Id).ToListAsync();
        var schulden = await _db.Schulden
            .Where(s => s.EigenaarId == eigenaar.Id).ToListAsync();

        // Digitale accounts (exclusief wachtwoorden & crypto wallets)
        var digitaleAccounts = await _db.DigitaleAccounts
            .Where(d => d.EigenaarId == eigenaar.Id).ToListAsync();

        // Documenten (metadata only)
        var documenten = await _db.Documenten
            .Where(d => d.EigenaarId == eigenaar.Id)
            .OrderBy(d => d.Categorie).ThenBy(d => d.Naam)
            .ToListAsync();

        return new LumioExportData
        {
            Eigenaar = new EigenaarExport(
                eigenaar.Voornaam, eigenaar.Achternaam, eigenaar.Tussenvoegsel,
                eigenaar.Geboortedatum.ToString("yyyy-MM-dd"),
                eigenaar.BSN, eigenaar.Adres, eigenaar.Postcode, eigenaar.Woonplaats,
                eigenaar.Telefoon, eigenaar.Email,
                eigenaar.Notaris, eigenaar.NotarisKantoor, eigenaar.NotarisTelefoon,
                eigenaar.NotarisEmail, eigenaar.NotarisAdres, eigenaar.NotarisPostcode, eigenaar.NotarisPlaats,
                eigenaar.BurgerlijkeStaat.ToString(), eigenaar.HuwelijksVoorwaarden.ToString(),
                eigenaar.DatumHuwelijk?.ToString("yyyy-MM-dd"),
                eigenaar.LegitimatieSoort.ToString(), eigenaar.LegitimatieNummer,
                eigenaar.LegitimatieDatumAfgifte?.ToString("yyyy-MM-dd"),
                eigenaar.LegitimatieGeldigTot?.ToString("yyyy-MM-dd")),

            Erfgenamen = erfgenamen.Select(e => new ErfgenaamExport(
                e.Voornaam, e.Achternaam, e.Tussenvoegsel, e.Relatie,
                e.Telefoon, e.Email, e.Adres, e.Postcode, e.Woonplaats,
                e.Geboortedatum?.ToString("yyyy-MM-dd"), e.BSN,
                e.LegitimatieSoort.ToString(), e.LegitimatieNummer,
                e.LegitimatieDatumAfgifte?.ToString("yyyy-MM-dd"),
                e.LegitimatieGeldigTot?.ToString("yyyy-MM-dd"))).ToList(),

            Noodcontacten = noodcontacten.Select(n => new NoodcontactExport(
                n.Naam, n.Relatie, n.Rol,
                n.Telefoon, n.Email, n.Adres, n.Postcode, n.Woonplaats, n.Instructies)).ToList(),

            Testament = testament is null ? null : new TestamentExport(
                testament.TestamentType, testament.NotarisNaam, testament.NotarisKantoor,
                testament.DatumTestament?.ToString("yyyy-MM-dd"),
                testament.TestamentLocatie, testament.CTR_Nummer,
                testament.AlgemeneWensen, testament.BijzondereBepalingen,
                testament.UitsluitingsClausule, testament.Legaten,
                testament.Begunstigden.Select(b => new BegunstigdeExport(
                    b.Naam, b.Relatie, b.Telefoon, b.Email, b.Omschrijving,
                    b.Percentage, b.IsLegitiemePortie)).ToList(),
                testament.Executeurs.Select(e => new ExecuteurExport(
                    e.Naam, e.Relatie, e.Telefoon, e.Email, e.Bevoegdheden)).ToList()),

            Euthanasie = wilsverklaring is null ? null : new EuthanasieExport(
                wilsverklaring.DatumOndertekening?.ToString("yyyy-MM-dd"),
                wilsverklaring.WilEuthanasie, wilsverklaring.SituatieBeschrijving,
                wilsverklaring.Huisarts, wilsverklaring.HuisartsPraktijk,
                wilsverklaring.HuisartsTelefoon,
                wilsverklaring.VertegenwoordigerNaam, wilsverklaring.VertegenwoordigerRelatie,
                wilsverklaring.VertegenwoordigerTelefoon,
                wilsverklaring.AanvullendeWensen,
                wilsverklaring.DementieClausule, wilsverklaring.DementieClausuleToelichting,
                wilsverklaring.BehandelVerbod,
                wilsverklaring.Voorwaarden.Select(v => new VoorwaardeExport(
                    v.Voorwaarde, v.Toelichting)).ToList()),

            DonorRegistratie = donor is null ? null : new DonorExport(
                donor.Keuze, donor.IsGeregistreerdBijDonorregister,
                donor.DonorregisterReferentie, donor.Toelichting,
                donor.OrgaanKeuzes.Select(o => new OrgaanKeuzeExport(
                    o.Orgaan, o.WelDoneren, o.Toelichting)).ToList()),

            Uitvaart = uitvaart is null ? null : new UitvaartExport(
                uitvaart.VoorkeurType, uitvaart.Begraafplaats,
                uitvaart.UitvaartOndernemer, uitvaart.UitvaartOndernemerTelefoon,
                uitvaart.UitvaartOndernemerEmail,
                uitvaart.HeeftUitvaartVerzekering, uitvaart.UitvaartVerzekeringDetails,
                uitvaart.CeremonieSoort, uitvaart.CeremonieLocatie,
                uitvaart.Muziekwensen, uitvaart.Sprekers, uitvaart.Bloemen,
                uitvaart.Kledingwensen, uitvaart.RouwkaartTekst, uitvaart.RouwadvertentieTekst,
                uitvaart.Condoleance, uitvaart.OverigeWensen,
                uitvaart.VoorkeurBegraafplaatsNaam, uitvaart.VoorkeurBegraafplaatsAdres,
                uitvaart.VoorkeurCrematoriumnaam, uitvaart.VoorkeurCrematoriumAdres,
                uitvaart.VoorkeurAulaNaam, uitvaart.VoorkeurAulaAdres,
                uitvaart.BudgetRichting,
                uitvaart.CeremonieDetails.OrderBy(c => c.Volgorde).Select(c => new CeremonieDetailExport(
                    c.Onderdeel, c.Beschrijving, c.Volgorde,
                    c.Muziek, c.Spreker, c.Tekstlezing, c.Dresscode)).ToList()),

            Boedel = new BoedelExport
            {
                FysiekeBezittingen = bezittingen.Select(b => new FysiekBezitExport(
                    b.Categorie, b.Omschrijving, b.GeschatteWaarde,
                    b.Locatie, b.BestemdeErfgenaam, b.VermogensSoort.ToString(), b.Notities,
                    b.KadastraalNummer, b.Kenteken, b.KvKNummer)).ToList(),
                Bankrekeningen = bankrekeningen.Select(b => new BankrekeningExport(
                    b.BankNaam, b.IBAN, b.RekeningType,
                    b.Saldo, b.VermogensSoort.ToString(), b.Notities)).ToList(),
                Verzekeringen = verzekeringen.Select(v => new VerzekeringExport(
                    v.Verzekeraar, v.PolisNummer, v.Type,
                    v.VerzekeraarTelefoon, v.VerzekeraarEmail, v.VerzekerdBedrag,
                    v.Begunstigde, v.VermogensSoort.ToString(), v.Notities)).ToList(),
                Schulden = schulden.Select(s => new SchuldExport(
                    s.Schuldeiser, s.Type, s.Bedrag,
                    s.MaandelijkseAflossing, s.Referentie,
                    s.VermogensSoort.ToString(), s.Notities,
                    s.HypotheekVorm, s.Rentepercentage,
                    s.MaandelijkseRente, s.Einddatum,
                    s.Restschuld)).ToList(),
            },

            DigitaleAccounts = digitaleAccounts.Select(d => new DigitaalAccountExport(
                d.PlatformNaam, d.Categorie, d.Gebruikersnaam,
                d.EmailAdres, d.Url, d.GewensteActie,
                d.OverdrachtAan, d.Notities)).ToList(),

            Documenten = documenten.Select(d => new DocumentExport(
                d.Naam, d.Categorie, d.BestandsNaam, d.ContentType,
                d.BestandsGrootte, d.Notities,
                d.VerlooptOp?.ToString("yyyy-MM-dd"),
                d.Versie, d.AangemaaktOp.ToString("yyyy-MM-dd HH:mm"))).ToList(),
        };
    }
}
