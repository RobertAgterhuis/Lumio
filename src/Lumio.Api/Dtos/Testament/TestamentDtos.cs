namespace Lumio.Api.Dtos.Testament;

public record TestamentInfoResponse(
    Guid Id,
    Guid EigenaarId,
    string? TestamentType,
    string? NotarisNaam,
    string? NotarisKantoor,
    string? NotarisTelefoon,
    string? NotarisEmail,
    string? NotarisAdres,
    string? NotarisPostcode,
    string? NotarisPlaats,
    DateOnly? DatumTestament,
    string? TestamentLocatie,
    string? CTR_Nummer,
    string? AlgemeneWensen,
    string? BijzondereBepalingen,
    DateTime AangemaaktOp,
    DateTime GewijzigdOp);

public record TestamentInfoUpsertRequest(
    string? TestamentType,
    string? NotarisNaam,
    string? NotarisKantoor,
    string? NotarisTelefoon,
    string? NotarisEmail,
    string? NotarisAdres,
    string? NotarisPostcode,
    string? NotarisPlaats,
    DateOnly? DatumTestament,
    string? TestamentLocatie,
    string? CTR_Nummer,
    string? AlgemeneWensen,
    string? BijzondereBepalingen);

public record BegunstigdeResponse(
    Guid Id,
    string Naam,
    string Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Omschrijving,
    decimal? Percentage,
    bool IsLegitiemePortie);

public record BegunstigdeUpsertRequest(
    string Naam,
    string Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Omschrijving,
    decimal? Percentage,
    bool IsLegitiemePortie);

public record ExecuteurResponse(
    Guid Id,
    string Naam,
    string? Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Bevoegdheden);

public record ExecuteurUpsertRequest(
    string Naam,
    string? Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Bevoegdheden);
