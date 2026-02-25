using FluentValidation;
using Lumio.Api.Dtos.VideoMessages;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Validators;

/// <summary>S3-07 — Validatie voor videoboodschap-update (PATCH).</summary>
public class VideoboodschapUpdateRequestValidator : AbstractValidator<VideoboodschapUpdateRequest>
{
    public VideoboodschapUpdateRequestValidator(IOptions<VeldLengtesOptions> veldLengtes)
    {
        var vl = veldLengtes.Value;

        RuleFor(x => x.Titel)
            .MinimumLength(1).WithMessage("Titel mag niet leeg zijn.")
            .MaximumLength(200).WithMessage("Titel mag maximaal 200 tekens bevatten.")
            .When(x => x.Titel != null);

        RuleFor(x => x.Beschrijving)
            .MaximumLength(vl.OmschrijvingMax)
            .When(x => x.Beschrijving != null);
    }
}
