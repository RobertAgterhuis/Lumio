using FluentValidation;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Validators;

public class ErfgenaamUpsertRequestValidator : AbstractValidator<ErfgenaamUpsertRequest>
{
    public ErfgenaamUpsertRequestValidator(
        IOptions<VeldLengtesOptions> veldLengtes,
        IOptions<ValidatieOptions> validatie)
    {
        var vl = veldLengtes.Value;
        var va = validatie.Value;

        RuleFor(x => x.Voornaam).NotEmpty().MaximumLength(vl.NaamMax);
        RuleFor(x => x.Achternaam).NotEmpty().MaximumLength(vl.NaamMax);
        RuleFor(x => x.Relatie).NotEmpty();
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email));

        // S3-23 — BSN elf-proef
        RuleFor(x => x.BSN)
            .Must(BsnElf11Proef)
            .WithMessage("BSN heeft een ongeldig formaat (elf-proef mislukt).")
            .When(x => !string.IsNullOrWhiteSpace(x.BSN));

        // S7-15 — Geboortedatum, telefoon, postcode
        RuleFor(x => x.Geboortedatum)
            .LessThan(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("Geboortedatum moet in het verleden liggen.")
            .When(x => x.Geboortedatum.HasValue);

        RuleFor(x => x.Telefoon)
            .Matches(va.TelefoonRegex).WithMessage("Ongeldig telefoonnummer.")
            .MaximumLength(vl.TelefoonMax)
            .When(x => !string.IsNullOrWhiteSpace(x.Telefoon));

        RuleFor(x => x.Postcode)
            .Matches(va.PostcodeRegex).WithMessage("Ongeldige postcode (bijv. 1234AB).")
            .When(x => !string.IsNullOrWhiteSpace(x.Postcode));
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
