using FluentValidation;
using Lumio.Api.Dtos.EuthanasiaDirective;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Validators;

/// <summary>S3-06 — Validatie voor wilsverklaring euthanasie upsert.</summary>
public class WilsverklaringUpsertRequestValidator : AbstractValidator<WilsverklaringUpsertRequest>
{
    public WilsverklaringUpsertRequestValidator(
        IOptions<VeldLengtesOptions> veldLengtes,
        IOptions<ValidatieOptions> validatie)
    {
        var vl = veldLengtes.Value;
        var va = validatie.Value;

        RuleFor(x => x.DatumOndertekening)
            .Must(d => d == null || d.Value <= DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("Datum ondertekening mag niet in de toekomst liggen.");

        // Huisarts
        RuleFor(x => x.Huisarts).MaximumLength(vl.NaamMax).When(x => x.Huisarts != null);
        RuleFor(x => x.HuisartsTelefoon)
            .Matches(va.TelefoonRegex).WithMessage("Ongeldig telefoonnummer (huisarts).")
            .MaximumLength(vl.TelefoonMax)
            .When(x => !string.IsNullOrWhiteSpace(x.HuisartsTelefoon));
        RuleFor(x => x.HuisartsEmail)
            .EmailAddress().WithMessage("Ongeldig e-mailadres (huisarts).")
            .When(x => !string.IsNullOrWhiteSpace(x.HuisartsEmail));

        // Vertegenwoordiger 1
        RuleFor(x => x.VertegenwoordigerTelefoon)
            .Matches(va.TelefoonRegex).WithMessage("Ongeldig telefoonnummer (vertegenwoordiger).")
            .MaximumLength(vl.TelefoonMax)
            .When(x => !string.IsNullOrWhiteSpace(x.VertegenwoordigerTelefoon));
        RuleFor(x => x.VertegenwoordigerEmail)
            .EmailAddress().WithMessage("Ongeldig e-mailadres (vertegenwoordiger).")
            .When(x => !string.IsNullOrWhiteSpace(x.VertegenwoordigerEmail));
        RuleFor(x => x.VertegenwoordigerPostcode)
            .Matches(va.PostcodeRegex).WithMessage("Ongeldige postcode (vertegenwoordiger).")
            .When(x => !string.IsNullOrWhiteSpace(x.VertegenwoordigerPostcode));

        // Vertegenwoordiger 2 (S3-01)
        RuleFor(x => x.Vertegenwoordiger2Naam).MaximumLength(vl.NaamMax).When(x => x.Vertegenwoordiger2Naam != null);
        RuleFor(x => x.Vertegenwoordiger2Telefoon)
            .Matches(va.TelefoonRegex).WithMessage("Ongeldig telefoonnummer (vertegenwoordiger 2).")
            .MaximumLength(vl.TelefoonMax)
            .When(x => !string.IsNullOrWhiteSpace(x.Vertegenwoordiger2Telefoon));
        RuleFor(x => x.Vertegenwoordiger2Email)
            .EmailAddress().WithMessage("Ongeldig e-mailadres (vertegenwoordiger 2).")
            .When(x => !string.IsNullOrWhiteSpace(x.Vertegenwoordiger2Email));

        // Text fields
        RuleFor(x => x.SituatieBeschrijving).MaximumLength(vl.NotitieMax).When(x => x.SituatieBeschrijving != null);
        RuleFor(x => x.AanvullendeWensen).MaximumLength(vl.NotitieMax).When(x => x.AanvullendeWensen != null);
        RuleFor(x => x.DementieClausuleToelichting).MaximumLength(vl.NotitieMax).When(x => x.DementieClausuleToelichting != null);
        RuleFor(x => x.BehandelVerbod).MaximumLength(vl.NotitieMax).When(x => x.BehandelVerbod != null);
        RuleFor(x => x.SituatieNotitie).MaximumLength(vl.NotitieMax).When(x => x.SituatieNotitie != null);
    }
}
