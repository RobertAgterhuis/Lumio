namespace Lumio.Api.Dtos.FuneralWishes;

public record UitvaartWensenResponse(
    Guid Id,
    Guid EigenaarId,
    string VoorkeurType,
    string? Begraafplaats,
    string? UitvaartOndernemer,
    string? UitvaartOndernemerTelefoon,
    string? UitvaartOndernemerEmail,
    string? UitvaartOndernemerAdres,
    string? UitvaartOndernemerPostcode,
    string? UitvaartOndernemerPlaats,
    bool HeeftUitvaartVerzekering,
    string? UitvaartVerzekeringDetails,
    string? CeremonieSoort,
    string? CeremonieLocatie,
    string? Muziekwensen,
    string? Sprekers,
    string? Bloemen,
    string? Kledingwensen,
    string? RouwkaartTekst,
    string? RouwadvertentieTekst,
    string? Condoleance,
    string? OverigeWensen,
    string? VoorkeurBegraafplaatsNaam,
    string? VoorkeurBegraafplaatsAdres,
    string? VoorkeurCrematoriumnaam,
    string? VoorkeurCrematoriumAdres,
    string? VoorkeurAulaNaam,
    string? VoorkeurAulaAdres,
    string? BudgetRichting,
    DateOnly? DatumOpgesteld,
    DateTime AangemaaktOp,
    DateTime GewijzigdOp);

public record UitvaartWensenUpsertRequest(
    string VoorkeurType,
    string? Begraafplaats,
    string? UitvaartOndernemer,
    string? UitvaartOndernemerTelefoon,
    string? UitvaartOndernemerEmail,
    string? UitvaartOndernemerAdres,
    string? UitvaartOndernemerPostcode,
    string? UitvaartOndernemerPlaats,
    bool HeeftUitvaartVerzekering,
    string? UitvaartVerzekeringDetails,
    string? CeremonieSoort,
    string? CeremonieLocatie,
    string? Muziekwensen,
    string? Sprekers,
    string? Bloemen,
    string? Kledingwensen,
    string? RouwkaartTekst,
    string? RouwadvertentieTekst,
    string? Condoleance,
    string? OverigeWensen,
    string? VoorkeurBegraafplaatsNaam,
    string? VoorkeurBegraafplaatsAdres,
    string? VoorkeurCrematoriumnaam,
    string? VoorkeurCrematoriumAdres,
    string? VoorkeurAulaNaam,
    string? VoorkeurAulaAdres,
    string? BudgetRichting,
    DateOnly? DatumOpgesteld);

public record CeremonieDetailResponse(
    Guid Id,
    string Onderdeel,
    string? Beschrijving,
    int Volgorde,
    string? Muziek,
    string? Spreker,
    string? Tekstlezing,
    string? Dresscode);

public record CeremonieDetailUpsertRequest(
    string Onderdeel,
    string? Beschrijving,
    int Volgorde,
    string? Muziek,
    string? Spreker,
    string? Tekstlezing,
    string? Dresscode);

// --- Genodigden ---

public record UitvaartGenodigdeResponse(
    Guid Id,
    string Naam,
    string? Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Notities);

public record UitvaartGenodigdeUpsertRequest(
    string Naam,
    string? Relatie,
    string? Telefoon,
    string? Email,
    string? Adres,
    string? Postcode,
    string? Woonplaats,
    string? Notities);
