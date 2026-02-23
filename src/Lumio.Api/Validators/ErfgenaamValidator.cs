using FluentValidation;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Validators;

public class ErfgenaamUpsertRequestValidator : AbstractValidator<ErfgenaamUpsertRequest>
{
    public ErfgenaamUpsertRequestValidator(IOptions<VeldLengtesOptions> veldLengtes)
    {
        var vl = veldLengtes.Value;

        RuleFor(x => x.Voornaam).NotEmpty().MaximumLength(vl.NaamMax);
        RuleFor(x => x.Achternaam).NotEmpty().MaximumLength(vl.NaamMax);
        RuleFor(x => x.Relatie).NotEmpty();
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email));
    }
}
