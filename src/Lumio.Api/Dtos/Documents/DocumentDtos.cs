namespace Lumio.Api.Dtos.Documents;

public record DocumentResponse(
    Guid Id,
    string Naam,
    string Categorie,
    string BestandsNaam,
    string ContentType,
    long BestandsGrootte,
    string? Notities,
    DateTime AangemaaktOp,
    DateTime GewijzigdOp,
    Guid DocumentGroepId,
    int Versie,
    int AantalVersies);

public record DocumentVersieResponse(
    Guid Id,
    int Versie,
    string BestandsNaam,
    long BestandsGrootte,
    DateTime AangemaaktOp);
