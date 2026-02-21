namespace Lumio.Api.Dtos.EuthanasiaDirective;

public record WilsverklaringResponse(
    Guid Id,
    Guid EigenaarId,
    DateOnly? DatumOndertekening,
    bool WilEuthanasie,
    string? SituatieBeschrijving,
    string? Huisarts,
    string? HuisartsPraktijk,
    string? HuisartsTelefoon,
    string? HuisartsEmail,
    string? VertegenwoordigerNaam,
    string? VertegenwoordigerRelatie,
    string? VertegenwoordigerTelefoon,
    string? VertegenwoordigerEmail,
    string? VertegenwoordigerAdres,
    string? VertegenwoordigerPostcode,
    string? VertegenwoordigerWoonplaats,
    string? AanvullendeWensen,
    DateTime AangemaaktOp,
    DateTime GewijzigdOp);

public record WilsverklaringUpsertRequest(
    DateOnly? DatumOndertekening,
    bool WilEuthanasie,
    string? SituatieBeschrijving,
    string? Huisarts,
    string? HuisartsPraktijk,
    string? HuisartsTelefoon,
    string? HuisartsEmail,
    string? VertegenwoordigerNaam,
    string? VertegenwoordigerRelatie,
    string? VertegenwoordigerTelefoon,
    string? VertegenwoordigerEmail,
    string? VertegenwoordigerAdres,
    string? VertegenwoordigerPostcode,
    string? VertegenwoordigerWoonplaats,
    string? AanvullendeWensen);

public record VoorwaardeResponse(
    Guid Id,
    string Voorwaarde,
    string? Toelichting);

public record VoorwaardeUpsertRequest(
    string Voorwaarde,
    string? Toelichting);
