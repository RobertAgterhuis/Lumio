namespace Lumio.Api.Dtos.AssetRegistry;

public record FysiekBezitResponse(
    Guid Id, string Categorie, string Omschrijving,
    decimal? GeschatteWaarde, string? Locatie,
    string? BestemdeErfgenaam, string? Notities);

public record FysiekBezitUpsertRequest(
    string Categorie, string Omschrijving,
    decimal? GeschatteWaarde, string? Locatie,
    string? BestemdeErfgenaam, string? Notities);

public record BankrekeningResponse(
    Guid Id, string BankNaam, string IBAN,
    string RekeningType, string? Notities);

public record BankrekeningUpsertRequest(
    string BankNaam, string IBAN,
    string RekeningType, string? Notities);

public record VerzekeringResponse(
    Guid Id, string Verzekeraar, string PolisNummer,
    string Type, decimal? VerzekerdBedrag,
    string? Begunstigde, string? Notities);

public record VerzekeringUpsertRequest(
    string Verzekeraar, string PolisNummer,
    string Type, decimal? VerzekerdBedrag,
    string? Begunstigde, string? Notities);

public record SchuldResponse(
    Guid Id, string Schuldeiser, string Type,
    decimal Bedrag, decimal? MaandelijkseAflossing,
    string? Referentie, string? Notities);

public record SchuldUpsertRequest(
    string Schuldeiser, string Type,
    decimal Bedrag, decimal? MaandelijkseAflossing,
    string? Referentie, string? Notities);
