using FluentValidation;
using Lumio.Api.Dtos.Auth;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Validators;

public class SetupRequestValidator : AbstractValidator<SetupRequest>
{
    public SetupRequestValidator(IOptions<LimietenOptions> limieten)
    {
        var minLen = limieten.Value.WachtwoordMinLengte;

        RuleFor(x => x.Wachtwoord).NotEmpty().MinimumLength(minLen)
            .WithMessage($"Wachtwoord moet minimaal {minLen} tekens bevatten.");
    }
}

public class OntgrendelRequestValidator : AbstractValidator<OntgrendelRequest>
{
    public OntgrendelRequestValidator()
    {
        RuleFor(x => x.Wachtwoord).NotEmpty();
    }
}

public class WachtwoordWijzigenRequestValidator : AbstractValidator<WachtwoordWijzigenRequest>
{
    public WachtwoordWijzigenRequestValidator(IOptions<LimietenOptions> limieten)
    {
        var minLen = limieten.Value.WachtwoordMinLengte;

        RuleFor(x => x.HuidigWachtwoord).NotEmpty();
        RuleFor(x => x.NieuwWachtwoord).NotEmpty().MinimumLength(minLen)
            .WithMessage($"Nieuw wachtwoord moet minimaal {minLen} tekens bevatten.");
    }
}

public class OntgrendelErfgenaamRequestValidator : AbstractValidator<OntgrendelErfgenaamRequest>
{
    public OntgrendelErfgenaamRequestValidator()
    {
        RuleFor(x => x.Shares).NotEmpty()
            .WithMessage("Minimaal één share is vereist.");
    }
}
