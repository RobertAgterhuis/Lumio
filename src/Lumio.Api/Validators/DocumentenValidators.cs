using FluentValidation;
using Lumio.Api.Dtos.Documents;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Validators;

/// <summary>S3-04 — Validatie voor document-upload.</summary>
public class DocumentUploadRequestValidator : AbstractValidator<DocumentUploadRequest>
{
    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/tiff",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
    };

    private static readonly HashSet<string> AllowedCategorieen = new(StringComparer.OrdinalIgnoreCase)
    {
        "Testament",
        "Identiteitsbewijs",
        "Akte",
        "Verzekeringspolis",
        "Medisch",
        "Financieel",
        "Overig",
    };

    public DocumentUploadRequestValidator(IOptions<LimietenOptions> limieten)
    {
        var lim = limieten.Value;

        RuleFor(x => x.Naam)
            .NotEmpty().WithMessage("Naam is verplicht.")
            .MaximumLength(200);

        RuleFor(x => x.Categorie)
            .NotEmpty().WithMessage("Categorie is verplicht.")
            .Must(c => AllowedCategorieen.Contains(c))
            .WithMessage("Ongeldige categorie. Kies uit: Testament, Identiteitsbewijs, Akte, Verzekeringspolis, Medisch, Financieel, Overig.");

        RuleFor(x => x.Bestand)
            .NotNull().WithMessage("Bestand is verplicht.");

        When(x => x.Bestand != null, () =>
        {
            RuleFor(x => x.Bestand!.Length)
                .LessThanOrEqualTo(lim.DocumentMaxBytes)
                .WithMessage($"Bestand mag maximaal {lim.DocumentMaxBytes / 1_048_576} MB zijn.");

            RuleFor(x => x.Bestand!.ContentType)
                .Must(ct => AllowedMimeTypes.Contains(ct))
                .WithMessage("Bestandstype is niet toegestaan. Toegestaan: PDF, afbeeldingen, Word, Excel, tekst.");
        });
    }
}

/// <summary>S3-04 — Validatie voor document-update (verlooptOp / notities).</summary>
public class DocumentUpdateRequestValidator : AbstractValidator<DocumentUpdateRequest>
{
    private static readonly VeldLengtesOptions _vl = new();

    public DocumentUpdateRequestValidator(IOptions<VeldLengtesOptions> veldLengtes)
    {
        var vl = veldLengtes.Value;
        RuleFor(x => x.Notities).MaximumLength(vl.NotitieMax).When(x => x.Notities != null);
    }
}
