using FluentValidation;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Validators;

public class SharedContactUpsertRequestValidator : AbstractValidator<SharedContactUpsertRequest>
{
    public SharedContactUpsertRequestValidator(
        IOptions<VeldLengtesOptions> veldLengtes,
        IOptions<ValidatieOptions> validatie)
    {
        var vl = veldLengtes.Value;
        var va = validatie.Value;

        RuleFor(x => x.Type)
            .NotEmpty()
            .WithMessage("Contact type is verplicht")
            .Must(BeValidContactType)
            .WithMessage("Ongeldig contact type. Gebruik: Notaris, Huisarts, Uitvaartondernemer, etc.");

        RuleFor(x => x.Naam)
            .NotEmpty()
            .WithMessage("Naam is verplicht")
            .MaximumLength(vl.NaamMax);

        RuleFor(x => x.Telefoon)
            .Matches(va.TelefoonRegex)
            .WithMessage("Ongeldig telefoonnummer.")
            .MaximumLength(vl.TelefoonMax)
            .When(x => !string.IsNullOrWhiteSpace(x.Telefoon));

        RuleFor(x => x.Email)
            .EmailAddress()
            .WithMessage("Ongeldig e-mailadres")
            .When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.Postcode)
            .Matches(va.PostcodeRegex)
            .WithMessage("Ongeldige postcode (bijv. 1234AB).")
            .When(x => !string.IsNullOrWhiteSpace(x.Postcode));

        RuleFor(x => x.BedrijfsNaam)
            .MaximumLength(vl.NaamMax)
            .When(x => !string.IsNullOrWhiteSpace(x.BedrijfsNaam));

        RuleFor(x => x.Notities)
            .MaximumLength(vl.NotitieMax)
            .When(x => !string.IsNullOrWhiteSpace(x.Notities));

        // Voor professionals (notaris, huisarts, uitvaartondernemer) is minimaal telefoon of email verplicht
        RuleFor(x => x)
            .Must(HaveContactMethod)
            .WithMessage("Voor professionele contacten is minimaal telefoon of e-mail verplicht")
            .When(x => IsProfessionalType(x.Type));
    }

    private static bool BeValidContactType(string type)
    {
        return Enum.TryParse<Domain.Common.ContactType>(type, out _);
    }

    private static bool IsProfessionalType(string type)
    {
        if (!Enum.TryParse<Domain.Common.ContactType>(type, out var contactType))
            return false;

        return contactType is
            Domain.Common.ContactType.Notaris or
            Domain.Common.ContactType.Huisarts or
            Domain.Common.ContactType.Uitvaartondernemer or
            Domain.Common.ContactType.Professional;
    }

    private static bool HaveContactMethod(SharedContactUpsertRequest request)
    {
        return !string.IsNullOrWhiteSpace(request.Telefoon) ||
               !string.IsNullOrWhiteSpace(request.Email);
    }
}
