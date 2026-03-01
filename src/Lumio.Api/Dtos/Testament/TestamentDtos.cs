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
    bool? UitsluitingsClausule,
    string? Legaten,
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
    string? BijzondereBepalingen,
    bool? UitsluitingsClausule,
    string? Legaten);

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
    bool IsLegitiemePortie,
    Guid? ErfgenaamId,
    Guid? NoodcontactId);

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
    bool IsLegitiemePortie,
    Guid? ErfgenaamId = null,
    Guid? NoodcontactId = null);

public record ExecuteurResponse(
    Guid Id,
    string Naam,
    string? Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Bevoegdheden,
    Guid? ErfgenaamId,
    Guid? NoodcontactId);

public record ExecuteurUpsertRequest(
    string Naam,
    string? Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Bevoegdheden,
    Guid? ErfgenaamId = null,
    Guid? NoodcontactId = null);

// --- Legitimaire portie check ---

public record LegitimairePortieCheckResult(
    bool HeeftWaarschuwing,
    int AantalKinderen,
    bool HeeftPartner,
    decimal MinimumPercentagePerKind,
    List<LegitimairePortieWaarschuwing> Waarschuwingen);

public record LegitimairePortieWaarschuwing(
    string Naam,
    decimal? ToegewezenPercentage,
    decimal MinimumPercentage);

// --- Snapshots (concept-vergelijking) ---

public record TestamentSnapshotResponse(
    Guid Id,
    int Versie,
    DateTime SnapshotDatum,
    string? Notitie);

public record TestamentSnapshotCreateRequest(
    string? Notitie);

public record TestamentSnapshotDetailResponse(
    Guid Id,
    int Versie,
    DateTime SnapshotDatum,
    string? Notitie,
    string SnapshotJson);

public record TestamentVergelijkingResponse(
    TestamentSnapshotDetailResponse Versie1,
    TestamentSnapshotDetailResponse Versie2,
    List<TestamentVerschil> Verschillen);

public record TestamentVerschil(
    string Veld,
    string? WaardeVersie1,
    string? WaardeVersie2);
