using Lumio.Api.Domain.Common;

namespace Lumio.Api.Dtos.Common;

public record EigenaarResponse(
    Guid Id,
    string Voornaam,
    string Achternaam,
    string? Tussenvoegsel,
    DateOnly Geboortedatum,
    string? BSN,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Telefoon,
    string? Email,
    string? Notaris,
    string? NotarisKantoor,
    string? NotarisTelefoon,
    string? NotarisEmail,
    string? NotarisAdres,
    string? NotarisPostcode,
    string? NotarisPlaats,
    BurgerlijkeStaat BurgerlijkeStaat,
    HuwelijksVoorwaarden HuwelijksVoorwaarden,
    DateOnly? DatumHuwelijk,
    LegitimatieSoort LegitimatieSoort,
    string? LegitimatieNummer,
    DateOnly? LegitimatieDatumAfgifte,
    DateOnly? LegitimatieGeldigTot,
    bool HeeftProfielFoto,
    DateTime AangemaaktOp,
    DateTime GewijzigdOp);

public record EigenaarUpsertRequest(
    string Voornaam,
    string Achternaam,
    string? Tussenvoegsel,
    DateOnly Geboortedatum,
    string? BSN,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Telefoon,
    string? Email,
    string? Notaris,
    string? NotarisKantoor,
    string? NotarisTelefoon,
    string? NotarisEmail,
    string? NotarisAdres,
    string? NotarisPostcode,
    string? NotarisPlaats,
    BurgerlijkeStaat BurgerlijkeStaat,
    HuwelijksVoorwaarden HuwelijksVoorwaarden,
    DateOnly? DatumHuwelijk,
    LegitimatieSoort LegitimatieSoort,
    string? LegitimatieNummer,
    DateOnly? LegitimatieDatumAfgifte,
    DateOnly? LegitimatieGeldigTot);

/// <summary>
/// Single-file multipart form model.
/// Wrapper required so Swashbuckle can generate IFormFile schema (Swashbuckle v10+).
/// </summary>
public class BestandUploadRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    public IFormFile Bestand { get; set; } = null!;
}
