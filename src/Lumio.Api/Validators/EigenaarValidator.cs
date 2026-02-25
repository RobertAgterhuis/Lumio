using FluentValidation;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Validators;

public class EigenaarUpsertRequestValidator : AbstractValidator<EigenaarUpsertRequest>
{
    public EigenaarUpsertRequestValidator(
        IOptions<VeldLengtesOptions> veldLengtes,
        IOptions<ValidatieOptions> validatie)
    {
        var vl = veldLengtes.Value;
        var va = validatie.Value;

        RuleFor(x => x.Voornaam).NotEmpty().MaximumLength(vl.NaamMax);
        RuleFor(x => x.Achternaam).NotEmpty().MaximumLength(vl.NaamMax);
        RuleFor(x => x.Tussenvoegsel).MaximumLength(vl.TussenvoegselMax);

        // S3-24 — Geboortedatum mag niet in de toekomst liggen en niet vóór 1900
        RuleFor(x => x.Geboortedatum)
            .GreaterThanOrEqualTo(new DateOnly(1900, 1, 1))
            .WithMessage("Geboortedatum mag niet vóór 1900 liggen.")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("Geboortedatum mag niet in de toekomst liggen.");

        // S3-23 — BSN elf-proef
        RuleFor(x => x.BSN)
            .Must(BsnElf11Proef)
            .WithMessage("BSN heeft een ongeldig formaat (elf-proef mislukt).")
            .When(x => !string.IsNullOrWhiteSpace(x.BSN));

        // S3-25 — Telefoon regex + email
        RuleFor(x => x.Telefoon)
            .Matches(va.TelefoonRegex).WithMessage("Ongeldig telefoonnummer.")
            .MaximumLength(vl.TelefoonMax)
            .When(x => !string.IsNullOrWhiteSpace(x.Telefoon));

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Ongeldig e-mailadres.")
            .When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.Postcode).MaximumLength(vl.PostcodeMax);

        // S7-13 — Huwelijksdatum verplicht bij gehuwd/geregistreerd partnerschap
        RuleFor(x => x.DatumHuwelijk)
            .NotNull().WithMessage("Huwelijksdatum is verplicht als burgerlijke staat 'Gehuwd' of 'Geregistreerd partnerschap' is.")
            .When(x => x.BurgerlijkeStaat == BurgerlijkeStaat.Gehuwd || x.BurgerlijkeStaat == BurgerlijkeStaat.GeregistreerdPartnerschap);

        // S7-14 — Legitimatiedatums logisch
        RuleFor(x => x.LegitimatieDatumAfgifte)
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("Datum van afgifte mag niet in de toekomst liggen.")
            .When(x => x.LegitimatieDatumAfgifte.HasValue);

        RuleFor(x => x.LegitimatieGeldigTot)
            .GreaterThan(x => x.LegitimatieDatumAfgifte!.Value)
            .WithMessage("Geldig-tot datum moet na de datum van afgifte liggen.")
            .When(x => x.LegitimatieGeldigTot.HasValue && x.LegitimatieDatumAfgifte.HasValue);
    }

    /// <summary>Dutch BSN elf-proef (mod-11 with positional weights 9..1, last digit subtracted).</summary>
    private static bool BsnElf11Proef(string? bsn)
    {
        if (bsn is null || bsn.Length != 9 || !bsn.All(char.IsDigit)) return false;
        int sum = 0;
        for (int i = 0; i < 8; i++)
            sum += (9 - i) * (bsn[i] - '0');
        sum -= (bsn[8] - '0');
        return sum % 11 == 0 && sum > 0;
    }
}
