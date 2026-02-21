using FluentValidation;
using Lumio.Api.Dtos.Common;

namespace Lumio.Api.Validators;

public class EigenaarUpsertRequestValidator : AbstractValidator<EigenaarUpsertRequest>
{
    public EigenaarUpsertRequestValidator()
    {
        RuleFor(x => x.Voornaam).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Achternaam).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Tussenvoegsel).MaximumLength(20);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email));
        RuleFor(x => x.Postcode).MaximumLength(10);
    }
}
