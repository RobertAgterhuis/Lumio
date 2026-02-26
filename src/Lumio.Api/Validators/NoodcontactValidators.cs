using FluentValidation;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Validators;

/// <summary>S3-05 — Validatie voor noodcontact-aanmaken/bewerken.</summary>
public class NoodcontactUpsertRequestValidator : AbstractValidator<NoodcontactUpsertRequest>
{
    private static readonly HashSet<string> Rollen = new(StringComparer.OrdinalIgnoreCase)
    {
        "Vertrouwenspersoon",
        "Huisarts",
        "Notaris",
        "Uitvaartondernemer",
        "Advocaat",
        "Financieel adviseur",
        "Overig",
    };

    public NoodcontactUpsertRequestValidator(
        IOptions<VeldLengtesOptions> veldLengtes,
        IOptions<ValidatieOptions> validatie)
    {
        var vl = veldLengtes.Value;
        var va = validatie.Value;

        RuleFor(x => x.Naam)
            .NotEmpty().WithMessage("Naam is verplicht.")
            .MaximumLength(vl.NaamMax);

        RuleFor(x => x.Relatie)
            .MaximumLength(100);

        RuleFor(x => x.Rol)
            .NotEmpty().WithMessage("Rol is verplicht.")
            .Must(r => Rollen.Contains(r))
            .WithMessage("Ongeldige rol.");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Ongeldig e-mailadres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Telefoon)
            .Matches(va.TelefoonRegex).WithMessage("Ongeldig telefoonnummer.")
            .MaximumLength(vl.TelefoonMax)
            .When(x => !string.IsNullOrWhiteSpace(x.Telefoon));

        RuleFor(x => x.Postcode)
            .Matches(va.PostcodeRegex).WithMessage("Ongeldige postcode (bijv. 1234AB).")
            .When(x => !string.IsNullOrWhiteSpace(x.Postcode));

        RuleFor(x => x.Instructies)
            .MaximumLength(vl.NotitieMax)
            .When(x => x.Instructies != null);
    }
}
