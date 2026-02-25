using Microsoft.AspNetCore.Http;

namespace Lumio.Api.Dtos.Documents;

/// <summary>S3-04 — Multipart upload request (FluentValidation-valideerbaar).</summary>
public class DocumentUploadRequest
{
    public string Naam { get; set; } = "";
    public string Categorie { get; set; } = "";
    public IFormFile? Bestand { get; set; }
    public string? Notities { get; set; }
    public string? VerlooptOp { get; set; }
}

public record DocumentResponse(
    Guid Id,
    string Naam,
    string Categorie,
    string BestandsNaam,
    string ContentType,
    long BestandsGrootte,
    string? Notities,
    DateOnly? VerlooptOp,
    DateTime AangemaaktOp,
    DateTime GewijzigdOp,
    Guid DocumentGroepId,
    int Versie,
    int AantalVersies);

public record DocumentVersieResponse(
    Guid Id,
    int Versie,
    string BestandsNaam,
    long BestandsGrootte,
    DateTime AangemaaktOp);

public record DocumentUpdateRequest(
    DateOnly? VerlooptOp,
    string? Notities);
