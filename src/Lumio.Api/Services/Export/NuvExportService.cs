using Lumio.Api.Data;
using Lumio.Api.Domain.AssetRegistry;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace Lumio.Api.Services.Export;

/// <inheritdoc/>
public sealed class NuvExportService : INuvExportService
{
    private readonly LumioDbContext _db;
    public NuvExportService(LumioDbContext db) => _db = db;

    public async Task<byte[]> BuildNuvXmlAsync()
    {
        var eigenaar = await _db.Eigenaren.FirstOrDefaultAsync()
            ?? throw new InvalidOperationException("Geen eigenaar profiel gevonden.");

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

        sb.AppendLine("  <Overledene>");
        sb.AppendLine($"    <Voornaam>{X(eigenaar.Voornaam)}</Voornaam>");
        if (!string.IsNullOrWhiteSpace(eigenaar.Tussenvoegsel))
            sb.AppendLine($"    <Tussenvoegsel>{X(eigenaar.Tussenvoegsel)}</Tussenvoegsel>");
        sb.AppendLine($"    <Achternaam>{X(eigenaar.Achternaam)}</Achternaam>");
        sb.AppendLine($"    <Geboortedatum>{eigenaar.Geboortedatum:yyyy-MM-dd}</Geboortedatum>");
        if (!string.IsNullOrWhiteSpace(eigenaar.BSN))
            sb.AppendLine($"    <BSN>{X(eigenaar.BSN)}</BSN>");
        if (!string.IsNullOrWhiteSpace(eigenaar.Adres))
            sb.AppendLine($"    <Adres>{X(eigenaar.Adres)}</Adres>");
        if (!string.IsNullOrWhiteSpace(eigenaar.Postcode))
            sb.AppendLine($"    <Postcode>{X(eigenaar.Postcode)}</Postcode>");
        if (!string.IsNullOrWhiteSpace(eigenaar.Woonplaats))
            sb.AppendLine($"    <Woonplaats>{X(eigenaar.Woonplaats)}</Woonplaats>");
        sb.AppendLine($"    <BurgerlijkeStaat>{eigenaar.BurgerlijkeStaat}</BurgerlijkeStaat>");
        sb.AppendLine("  </Overledene>");

        if (uitvaart != null)
        {
            sb.AppendLine("  <Uitvaartwensen>");
            sb.AppendLine($"    <VoorkeurType>{X(uitvaart.VoorkeurType)}</VoorkeurType>");
            if (!string.IsNullOrWhiteSpace(uitvaart.Begraafplaats))
                sb.AppendLine($"    <Begraafplaats>{X(uitvaart.Begraafplaats)}</Begraafplaats>");
            if (!string.IsNullOrWhiteSpace(uitvaart.CeremonieSoort))
                sb.AppendLine($"    <CeremonieSoort>{X(uitvaart.CeremonieSoort)}</CeremonieSoort>");
            if (!string.IsNullOrWhiteSpace(uitvaart.CeremonieLocatie))
                sb.AppendLine($"    <CeremonieLocatie>{X(uitvaart.CeremonieLocatie)}</CeremonieLocatie>");
            if (!string.IsNullOrWhiteSpace(uitvaart.Muziekwensen))
                sb.AppendLine($"    <Muziekwensen>{X(uitvaart.Muziekwensen)}</Muziekwensen>");
            if (!string.IsNullOrWhiteSpace(uitvaart.Sprekers))
                sb.AppendLine($"    <Sprekers>{X(uitvaart.Sprekers)}</Sprekers>");
            if (!string.IsNullOrWhiteSpace(uitvaart.Bloemen))
                sb.AppendLine($"    <Bloemen>{X(uitvaart.Bloemen)}</Bloemen>");
            if (!string.IsNullOrWhiteSpace(uitvaart.Kledingwensen))
                sb.AppendLine($"    <Kledingwensen>{X(uitvaart.Kledingwensen)}</Kledingwensen>");
            if (!string.IsNullOrWhiteSpace(uitvaart.RouwkaartTekst))
                sb.AppendLine($"    <RouwkaartTekst>{X(uitvaart.RouwkaartTekst)}</RouwkaartTekst>");
            if (!string.IsNullOrWhiteSpace(uitvaart.RouwadvertentieTekst))
                sb.AppendLine($"    <RouwadvertentieTekst>{X(uitvaart.RouwadvertentieTekst)}</RouwadvertentieTekst>");
            if (!string.IsNullOrWhiteSpace(uitvaart.Condoleance))
                sb.AppendLine($"    <Condoleance>{X(uitvaart.Condoleance)}</Condoleance>");
            if (!string.IsNullOrWhiteSpace(uitvaart.OverigeWensen))
                sb.AppendLine($"    <OverigeWensen>{X(uitvaart.OverigeWensen)}</OverigeWensen>");
            sb.AppendLine($"    <HeeftUitvaartVerzekering>{uitvaart.HeeftUitvaartVerzekering.ToString().ToLower()}</HeeftUitvaartVerzekering>");
            if (!string.IsNullOrWhiteSpace(uitvaart.UitvaartVerzekeringDetails))
                sb.AppendLine($"    <UitvaartVerzekeringDetails>{X(uitvaart.UitvaartVerzekeringDetails)}</UitvaartVerzekeringDetails>");
            if (!string.IsNullOrWhiteSpace(uitvaart.BudgetRichting))
                sb.AppendLine($"    <BudgetRichting>{X(uitvaart.BudgetRichting)}</BudgetRichting>");

            if (!string.IsNullOrWhiteSpace(uitvaart.VoorkeurBegraafplaatsNaam))
            {
                sb.AppendLine("    <VoorkeurBegraafplaats>");
                sb.AppendLine($"      <Naam>{X(uitvaart.VoorkeurBegraafplaatsNaam)}</Naam>");
                if (!string.IsNullOrWhiteSpace(uitvaart.VoorkeurBegraafplaatsAdres))
                    sb.AppendLine($"      <Adres>{X(uitvaart.VoorkeurBegraafplaatsAdres)}</Adres>");
                sb.AppendLine("    </VoorkeurBegraafplaats>");
            }
            if (!string.IsNullOrWhiteSpace(uitvaart.VoorkeurCrematoriumnaam))
            {
                sb.AppendLine("    <VoorkeurCrematorium>");
                sb.AppendLine($"      <Naam>{X(uitvaart.VoorkeurCrematoriumnaam)}</Naam>");
                if (!string.IsNullOrWhiteSpace(uitvaart.VoorkeurCrematoriumAdres))
                    sb.AppendLine($"      <Adres>{X(uitvaart.VoorkeurCrematoriumAdres)}</Adres>");
                sb.AppendLine("    </VoorkeurCrematorium>");
            }
            if (!string.IsNullOrWhiteSpace(uitvaart.VoorkeurAulaNaam))
            {
                sb.AppendLine("    <VoorkeurAula>");
                sb.AppendLine($"      <Naam>{X(uitvaart.VoorkeurAulaNaam)}</Naam>");
                if (!string.IsNullOrWhiteSpace(uitvaart.VoorkeurAulaAdres))
                    sb.AppendLine($"      <Adres>{X(uitvaart.VoorkeurAulaAdres)}</Adres>");
                sb.AppendLine("    </VoorkeurAula>");
            }

            if (uitvaart.CeremonieDetails.Count > 0)
            {
                sb.AppendLine("    <CeremonieDetails>");
                foreach (var d in uitvaart.CeremonieDetails)
                {
                    sb.AppendLine("      <Detail>");
                    sb.AppendLine($"        <Volgorde>{d.Volgorde}</Volgorde>");
                    sb.AppendLine($"        <Onderdeel>{X(d.Onderdeel)}</Onderdeel>");
                    if (!string.IsNullOrWhiteSpace(d.Beschrijving))
                        sb.AppendLine($"        <Beschrijving>{X(d.Beschrijving)}</Beschrijving>");
                    if (!string.IsNullOrWhiteSpace(d.Muziek))
                        sb.AppendLine($"        <Muziek>{X(d.Muziek)}</Muziek>");
                    if (!string.IsNullOrWhiteSpace(d.Spreker))
                        sb.AppendLine($"        <Spreker>{X(d.Spreker)}</Spreker>");
                    if (!string.IsNullOrWhiteSpace(d.Tekstlezing))
                        sb.AppendLine($"        <Tekstlezing>{X(d.Tekstlezing)}</Tekstlezing>");
                    if (!string.IsNullOrWhiteSpace(d.Dresscode))
                        sb.AppendLine($"        <Dresscode>{X(d.Dresscode)}</Dresscode>");
                    sb.AppendLine("      </Detail>");
                }
                sb.AppendLine("    </CeremonieDetails>");
            }

            if (uitvaart.Genodigden.Count > 0)
            {
                sb.AppendLine("    <Genodigden>");
                foreach (var g in uitvaart.Genodigden)
                {
                    sb.AppendLine("      <Genodigde>");
                    sb.AppendLine($"        <Naam>{X(g.Naam)}</Naam>");
                    if (!string.IsNullOrWhiteSpace(g.Relatie))
                        sb.AppendLine($"        <Relatie>{X(g.Relatie)}</Relatie>");
                    if (!string.IsNullOrWhiteSpace(g.Telefoon))
                        sb.AppendLine($"        <Telefoon>{X(g.Telefoon)}</Telefoon>");
                    if (!string.IsNullOrWhiteSpace(g.Email))
                        sb.AppendLine($"        <Email>{X(g.Email)}</Email>");
                    sb.AppendLine("      </Genodigde>");
                }
                sb.AppendLine("    </Genodigden>");
            }

            sb.AppendLine("  </Uitvaartwensen>");
        }

        if (uitvaart != null && !string.IsNullOrWhiteSpace(uitvaart.UitvaartOndernemerContact?.Naam))
        {
            sb.AppendLine("  <Uitvaartondernemer>");
            sb.AppendLine($"    <Naam>{X(uitvaart.UitvaartOndernemerContact?.Naam)}</Naam>");
            if (!string.IsNullOrWhiteSpace(uitvaart.UitvaartOndernemerContact?.Telefoon))
                sb.AppendLine($"    <Telefoon>{X(uitvaart.UitvaartOndernemerContact?.Telefoon)}</Telefoon>");
            if (!string.IsNullOrWhiteSpace(uitvaart.UitvaartOndernemerContact?.Email))
                sb.AppendLine($"    <Email>{X(uitvaart.UitvaartOndernemerContact?.Email)}</Email>");
            if (!string.IsNullOrWhiteSpace(uitvaart.UitvaartOndernemerContact?.Adres))
                sb.AppendLine($"    <Adres>{X(uitvaart.UitvaartOndernemerContact?.Adres)}</Adres>");
            if (!string.IsNullOrWhiteSpace(uitvaart.UitvaartOndernemerContact?.Postcode))
                sb.AppendLine($"    <Postcode>{X(uitvaart.UitvaartOndernemerContact?.Postcode)}</Postcode>");
            if (!string.IsNullOrWhiteSpace(uitvaart.UitvaartOndernemerContact?.Woonplaats))
                sb.AppendLine($"    <Plaats>{X(uitvaart.UitvaartOndernemerContact?.Woonplaats)}</Plaats>");
            sb.AppendLine("  </Uitvaartondernemer>");
        }

        if (noodcontacten.Count > 0)
        {
            sb.AppendLine("  <Contactpersonen>");
            foreach (var n in noodcontacten)
            {
                sb.AppendLine("    <Contact>");
                sb.AppendLine($"      <Naam>{X(n.Naam)}</Naam>");
                sb.AppendLine($"      <Rol>{X(n.Rol)}</Rol>");
                sb.AppendLine($"      <Relatie>{X(n.Relatie)}</Relatie>");
                if (!string.IsNullOrWhiteSpace(n.Telefoon))
                    sb.AppendLine($"      <Telefoon>{X(n.Telefoon)}</Telefoon>");
                if (!string.IsNullOrWhiteSpace(n.Email))
                    sb.AppendLine($"      <Email>{X(n.Email)}</Email>");
                sb.AppendLine("    </Contact>");
            }
            sb.AppendLine("  </Contactpersonen>");
        }

        if (erfgenamen.Count > 0)
        {
            sb.AppendLine("  <Nabestaanden>");
            foreach (var e in erfgenamen)
            {
                sb.AppendLine("    <Nabestaande>");
                sb.AppendLine($"      <Voornaam>{X(e.Voornaam)}</Voornaam>");
                if (!string.IsNullOrWhiteSpace(e.Tussenvoegsel))
                    sb.AppendLine($"      <Tussenvoegsel>{X(e.Tussenvoegsel)}</Tussenvoegsel>");
                sb.AppendLine($"      <Achternaam>{X(e.Achternaam)}</Achternaam>");
                sb.AppendLine($"      <Relatie>{X(e.Relatie)}</Relatie>");
                if (!string.IsNullOrWhiteSpace(e.Telefoon))
                    sb.AppendLine($"      <Telefoon>{X(e.Telefoon)}</Telefoon>");
                if (!string.IsNullOrWhiteSpace(e.Email))
                    sb.AppendLine($"      <Email>{X(e.Email)}</Email>");
                sb.AppendLine("    </Nabestaande>");
            }
            sb.AppendLine("  </Nabestaanden>");
        }

        var uitvaartVerzekeringen = verzekeringen
            .Where(v => NuvVerzekeringTypen.IsNuvType(v.Type)).ToList();
        if (uitvaartVerzekeringen.Count > 0)
        {
            sb.AppendLine("  <Verzekeringen>");
            foreach (var v in uitvaartVerzekeringen)
            {
                sb.AppendLine("    <Verzekering>");
                sb.AppendLine($"      <Verzekeraar>{X(v.Verzekeraar)}</Verzekeraar>");
                sb.AppendLine($"      <PolisNummer>{X(v.PolisNummer)}</PolisNummer>");
                if (v.VerzekerdBedrag.HasValue)
                    sb.AppendLine($"      <VerzekerdBedrag>{v.VerzekerdBedrag:F2}</VerzekerdBedrag>");
                if (!string.IsNullOrWhiteSpace(v.VerzekeraarTelefoon))
                    sb.AppendLine($"      <Telefoon>{X(v.VerzekeraarTelefoon)}</Telefoon>");
                sb.AppendLine("    </Verzekering>");
            }
            sb.AppendLine("  </Verzekeringen>");
        }

        sb.AppendLine("</NUV_Uitvaart>");

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static string X(string? value) =>
        string.IsNullOrWhiteSpace(value) ? "" :
        value.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;")
            .Replace("\"", "&quot;").Replace("'", "&apos;");
}
