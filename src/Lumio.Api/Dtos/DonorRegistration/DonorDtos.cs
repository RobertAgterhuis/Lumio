namespace Lumio.Api.Dtos.DonorRegistration;

public record DonorRegistratieResponse(
    Guid Id,
    Guid EigenaarId,
    string Keuze,
    bool IsGeregistreerdBijDonorregister,
    string? DonorregisterReferentie,
    string? Toelichting,
    string? BeslisserNaam,
    string? BeslisserRelatie,
    string? BeslisserTelefoon,
    DateTime AangemaaktOp,
    DateTime GewijzigdOp);

public record DonorRegistratieUpsertRequest(
    string Keuze,
    bool IsGeregistreerdBijDonorregister,
    string? DonorregisterReferentie,
    string? Toelichting,
    string? BeslisserNaam,
    string? BeslisserRelatie,
    string? BeslisserTelefoon);

public record OrgaanKeuzeResponse(
    Guid Id,
    string Orgaan,
    bool WelDoneren,
    string? Toelichting);

public record OrgaanKeuzeUpsertRequest(
    string Orgaan,
    bool WelDoneren,
    string? Toelichting);
