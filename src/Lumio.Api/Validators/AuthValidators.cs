using FluentValidation;
using Lumio.Api.Dtos.Auth;

namespace Lumio.Api.Validators;

public class SetupRequestValidator : AbstractValidator<SetupRequest>
{
    public SetupRequestValidator()
    {
        RuleFor(x => x.Wachtwoord).NotEmpty().MinimumLength(8)
            .WithMessage("Wachtwoord moet minimaal 8 tekens bevatten.");
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
    public WachtwoordWijzigenRequestValidator()
    {
        RuleFor(x => x.HuidigWachtwoord).NotEmpty();
        RuleFor(x => x.NieuwWachtwoord).NotEmpty().MinimumLength(8)
            .WithMessage("Nieuw wachtwoord moet minimaal 8 tekens bevatten.");
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
