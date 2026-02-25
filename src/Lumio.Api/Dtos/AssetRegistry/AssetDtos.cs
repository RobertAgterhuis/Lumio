using Lumio.Api.Domain.AssetRegistry;

namespace Lumio.Api.Dtos.AssetRegistry;

// Samenvatting van een schuld zoals ingebed in een bezit-responsel
public record BezitSchuldSummary(
    Guid Id, string Schuldeiser, string Type,
    decimal Bedrag, decimal? MaandelijkseAflossing,
    string? LeaseMaatschappij, decimal? Rentepercentage, DateTime? Einddatum);

public record FysiekBezitResponse(
    Guid Id, string Categorie, string Omschrijving,
    decimal? GeschatteWaarde, string? Locatie,
    Guid? BestemdeErfgenaamId, string? BestemdeErfgenaamNaam, VermogensSoort VermogensSoort,
    string? Notities,
    string? KadastraalNummer, string? Kenteken, string? KvKNummer,
    List<BezitSchuldSummary> LinkedSchulden);

public record FysiekBezitUpsertRequest(
    string Categorie, string Omschrijving,
    decimal? GeschatteWaarde, string? Locatie,
    Guid? BestemdeErfgenaamId, VermogensSoort VermogensSoort,
    string? Notities,
    string? KadastraalNummer, string? Kenteken, string? KvKNummer);

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
    string? Notities,
    string? HypotheekVorm, decimal? Rentepercentage,
    decimal? MaandelijkseRente, DateTime? Einddatum,
    decimal? Restschuld,
    // Bezit-koppeling
    string? LeaseMaatschappij,
    Guid? BezitId, string? BezitNaam);

public record SchuldUpsertRequest(
    string Schuldeiser,
    string? SchuldeiserTelefoon, string? SchuldeiserEmail,
    string Type,
    decimal Bedrag, decimal? MaandelijkseAflossing,
    string? Referentie, VermogensSoort VermogensSoort,
    string? Notities,
    string? HypotheekVorm, decimal? Rentepercentage,
    decimal? MaandelijkseRente, DateTime? Einddatum,
    decimal? Restschuld);

// Vereenvoudigd request voor schulden gekoppeld aan een bezitting
public record BezitSchuldUpsertRequest(
    string Schuldeiser,
    string Type,
    decimal Bedrag,
    decimal? MaandelijkseAflossing,
    string? LeaseMaatschappij,
    decimal? Rentepercentage,
    DateTime? Einddatum);
