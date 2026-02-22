using Lumio.Api.Domain.AssetRegistry;

namespace Lumio.Api.Dtos.AssetRegistry;

public record FysiekBezitResponse(
    Guid Id, string Categorie, string Omschrijving,
    decimal? GeschatteWaarde, string? Locatie,
    string? BestemdeErfgenaam, VermogensSoort VermogensSoort,
    string? Notities);

public record FysiekBezitUpsertRequest(
    string Categorie, string Omschrijving,
    decimal? GeschatteWaarde, string? Locatie,
    string? BestemdeErfgenaam, VermogensSoort VermogensSoort,
    string? Notities);

public record BankrekeningResponse(
    Guid Id, string BankNaam, string IBAN,
    string RekeningType, decimal? Saldo,
    VermogensSoort VermogensSoort, string? Notities);

public record BankrekeningUpsertRequest(
    string BankNaam, string IBAN,
    string RekeningType, decimal? Saldo,
    VermogensSoort VermogensSoort, string? Notities);

public record VerzekeringResponse(
    Guid Id, string Verzekeraar,
    string? VerzekeraarTelefoon, string? VerzekeraarEmail,
    string PolisNummer,
    string Type, decimal? VerzekerdBedrag,
    string? Begunstigde, VermogensSoort VermogensSoort,
    string? Notities);

public record VerzekeringUpsertRequest(
    string Verzekeraar,
    string? VerzekeraarTelefoon, string? VerzekeraarEmail,
    string PolisNummer,
    string Type, decimal? VerzekerdBedrag,
    string? Begunstigde, VermogensSoort VermogensSoort,
    string? Notities);

public record SchuldResponse(
    Guid Id, string Schuldeiser,
    string? SchuldeiserTelefoon, string? SchuldeiserEmail,
    string Type,
    decimal Bedrag, decimal? MaandelijkseAflossing,
    string? Referentie, VermogensSoort VermogensSoort,
    string? Notities);

public record SchuldUpsertRequest(
    string Schuldeiser,
    string? SchuldeiserTelefoon, string? SchuldeiserEmail,
    string Type,
    decimal Bedrag, decimal? MaandelijkseAflossing,
    string? Referentie, VermogensSoort VermogensSoort,
    string? Notities);
