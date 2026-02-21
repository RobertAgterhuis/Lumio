namespace Lumio.Api.Dtos.EuthanasiaDirective;

public record WilsverklaringResponse(
    Guid Id,
    Guid EigenaarId,
    DateOnly? DatumOndertekening,
    bool WilEuthanasie,
    string? SituatieBeschrijving,
    string? Huisarts,
    string? HuisartsPraktijk,
    string? VertegenwoordigerNaam,
    string? VertegenwoordigerRelatie,
    string? VertegenwoordigerTelefoon,
    string? AanvullendeWensen,
    DateTime AangemaaktOp,
    DateTime GewijzigdOp);

public record WilsverklaringUpsertRequest(
    DateOnly? DatumOndertekening,
    bool WilEuthanasie,
    string? SituatieBeschrijving,
    string? Huisarts,
    string? HuisartsPraktijk,
    string? VertegenwoordigerNaam,
    string? VertegenwoordigerRelatie,
    string? VertegenwoordigerTelefoon,
    string? AanvullendeWensen);

public record VoorwaardeResponse(
    Guid Id,
    string Voorwaarde,
    string? Toelichting);

public record VoorwaardeUpsertRequest(
    string Voorwaarde,
    string? Toelichting);
