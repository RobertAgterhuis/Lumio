using FluentValidation;
using Lumio.Api.Dtos.Common;

namespace Lumio.Api.Validators;

public class ErfgenaamUpsertRequestValidator : AbstractValidator<ErfgenaamUpsertRequest>
{
    public ErfgenaamUpsertRequestValidator()
    {
        RuleFor(x => x.Voornaam).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Achternaam).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Relatie).NotEmpty();
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email));
    }
}
