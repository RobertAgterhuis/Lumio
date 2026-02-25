namespace Lumio.Api.Dtos.VideoMessages;

public record VideoboodschapResponse(
    Guid Id,
    string Titel,
    string? Beschrijving,
    string BestandsNaam,
    string ContentType,
    long BestandsGrootte,
    int? DuurSeconden,
    IReadOnlyList<OntvangerResponse> Ontvangers,
    DateTime AangemaaktOp,
    DateTime GewijzigdOp);

public record OntvangerResponse(Guid Id, Guid ErfgenaamId);
