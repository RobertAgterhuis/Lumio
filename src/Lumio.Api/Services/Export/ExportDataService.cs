using Lumio.Api.Data;
using Lumio.Api.Dtos.Export;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace Lumio.Api.Services.Export;

/// <inheritdoc/>
public sealed class ExportDataService : IExportDataService
{
    private readonly LumioDbContext _db;
    public ExportDataService(LumioDbContext db) => _db = db;

    public async Task<LumioExportData?> BuildExportDataAsync()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync();
        if (eigenaar is null) return null;

        var erfgenamen = await _db.Erfgenamen
            .Where(e => e.EigenaarId == eigenaar.Id).ToListAsync();
        var noodcontacten = await _db.Noodcontacten
            .Where(n => n.EigenaarId == eigenaar.Id).ToListAsync();

        var testament = await _db.Testamenten
            .Include(t => t.Begunstigden).Include(t => t.Executeurs)
            .FirstOrDefaultAsync(t => t.EigenaarId == eigenaar.Id);

        var wilsverklaring = await _db.Wilsverklaringen
            .Include(w => w.Voorwaarden)
            .FirstOrDefaultAsync(w => w.EigenaarId == eigenaar.Id);

        var donor = await _db.DonorRegistraties
            .Include(d => d.OrgaanKeuzes)
            .FirstOrDefaultAsync(d => d.EigenaarId == eigenaar.Id);

        var uitvaart = await _db.UitvaartWensen
            .Include(u => u.CeremonieDetails)
            .FirstOrDefaultAsync(u => u.EigenaarId == eigenaar.Id);

        var bezittingen = await _db.FysiekeBezittingen
            .Include(b => b.BestemdeErfgenaam)
            .Where(b => b.EigenaarId == eigenaar.Id).ToListAsync();
        var bankrekeningen = await _db.Bankrekeningen
            .Where(b => b.EigenaarId == eigenaar.Id).ToListAsync();
        var verzekeringen = await _db.Verzekeringen
            .Where(v => v.EigenaarId == eigenaar.Id).ToListAsync();
        var schulden = await _db.Schulden
            .Where(s => s.EigenaarId == eigenaar.Id).ToListAsync();

        var digitaleAccounts = await _db.DigitaleAccounts
            .Where(d => d.EigenaarId == eigenaar.Id).ToListAsync();

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
                FysiekeBezittingen = bezittingen.Select(b =>
                {
                    var bestemdeNaam = b.BestemdeErfgenaam != null
                        ? $"{b.BestemdeErfgenaam.Voornaam} {b.BestemdeErfgenaam.Tussenvoegsel} {b.BestemdeErfgenaam.Achternaam}".Replace("  ", " ").Trim()
                        : null;
                    return new FysiekBezitExport(
                        b.Categorie, b.Omschrijving, b.GeschatteWaarde,
                        b.Locatie, bestemdeNaam, b.VermogensSoort.ToString(), b.Notities,
                        b.KadastraalNummer, b.Kenteken, b.KvKNummer);
                }).ToList(),
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
                d.Naam, d.Categorie.ToString(), d.BestandsNaam, d.ContentType,
                d.BestandsGrootte, d.Notities,
                d.VerlooptOp?.ToString("yyyy-MM-dd"),
                d.Versie, d.AangemaaktOp.ToString("yyyy-MM-dd HH:mm"))).ToList(),
        };
    }

    public async Task<byte[]?> BuildJsonExportAsync()
    {
        var data = await BuildExportDataAsync();
        if (data is null) return null;

        var options = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };
        return Encoding.UTF8.GetBytes(JsonSerializer.Serialize(data, options));
    }

    public async Task<byte[]?> BuildXmlExportAsync()
    {
        var data = await BuildExportDataAsync();
        if (data is null) return null;

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };
        var json = JsonSerializer.Serialize(data, jsonOptions);
        using var jsonDoc = System.Text.Json.JsonDocument.Parse(json);
        var xml = new XDocument(
            new XDeclaration("1.0", "utf-8", null),
            JsonToXml(jsonDoc.RootElement, "LumioExport"));
        using var ms = new MemoryStream();
        using var writer = new StreamWriter(ms, new UTF8Encoding(false));
        xml.Save(writer);
        return ms.ToArray();
    }

    private static XElement JsonToXml(System.Text.Json.JsonElement element, string name)
    {
        switch (element.ValueKind)
        {
            case System.Text.Json.JsonValueKind.Object:
                var obj = new XElement(name);
                foreach (var prop in element.EnumerateObject())
                    obj.Add(JsonToXml(prop.Value, prop.Name));
                return obj;
            case System.Text.Json.JsonValueKind.Array:
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
}
