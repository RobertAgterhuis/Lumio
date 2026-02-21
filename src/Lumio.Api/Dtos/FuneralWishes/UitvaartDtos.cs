namespace Lumio.Api.Dtos.FuneralWishes;

public record UitvaartWensenResponse(
    Guid Id,
    Guid EigenaarId,
    string VoorkeurType,
    string? Begraafplaats,
    string? UitvaartOndernemer,
    bool HeeftUitvaartVerzekering,
    string? UitvaartVerzekeringDetails,
    string? CeremonieSoort,
    string? CeremonieLocatie,
    string? Muziekwensen,
    string? Sprekers,
    string? Bloemen,
    string? Kledingwensen,
    string? RouwkaartTekst,
    string? Condoleance,
    string? OverigeWensen,
    DateTime AangemaaktOp,
    DateTime GewijzigdOp);

public record UitvaartWensenUpsertRequest(
    string VoorkeurType,
    string? Begraafplaats,
    string? UitvaartOndernemer,
    bool HeeftUitvaartVerzekering,
    string? UitvaartVerzekeringDetails,
    string? CeremonieSoort,
    string? CeremonieLocatie,
    string? Muziekwensen,
    string? Sprekers,
    string? Bloemen,
    string? Kledingwensen,
    string? RouwkaartTekst,
    string? Condoleance,
    string? OverigeWensen);

public record CeremonieDetailResponse(
    Guid Id,
    string Onderdeel,
    string? Beschrijving,
    int Volgorde);

public record CeremonieDetailUpsertRequest(
    string Onderdeel,
    string? Beschrijving,
    int Volgorde);
