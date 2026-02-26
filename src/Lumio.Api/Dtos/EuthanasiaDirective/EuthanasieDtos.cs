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
    bool DementieClausule,
    string? DementieClausuleToelichting,
    string? BehandelVerbod,
    // S3-01 — Tweede vertegenwoordiger + situatie-opties
    string? Vertegenwoordiger2Naam,
    string? Vertegenwoordiger2Relatie,
    string? Vertegenwoordiger2Telefoon,
    string? Vertegenwoordiger2Email,
    string? SituatieOpties,
    string? SituatieNotitie,
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
    string? AanvullendeWensen,
    bool DementieClausule,
    string? DementieClausuleToelichting,
    string? BehandelVerbod,
    // S3-01 — Tweede vertegenwoordiger + situatie-opties
    string? Vertegenwoordiger2Naam,
    string? Vertegenwoordiger2Relatie,
    string? Vertegenwoordiger2Telefoon,
    string? Vertegenwoordiger2Email,
    string? SituatieOpties,
    string? SituatieNotitie);

public record VoorwaardeResponse(
    Guid Id,
    string Voorwaarde,
    string? Toelichting);

public record VoorwaardeUpsertRequest(
    string Voorwaarde,
    string? Toelichting);
