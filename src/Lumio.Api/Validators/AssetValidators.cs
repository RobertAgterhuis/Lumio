using FluentValidation;
using Lumio.Api.Dtos.AssetRegistry;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Validators;

public class BankrekeningUpsertRequestValidator : AbstractValidator<BankrekeningUpsertRequest>
{
    public BankrekeningUpsertRequestValidator(IOptions<ValidatieOptions> validatie)
    {
        var regex = validatie.Value.IbanRegex;

        RuleFor(x => x.BankNaam).NotEmpty();
        RuleFor(x => x.IBAN).NotEmpty()
            .Matches(regex)
            .When(x => !string.IsNullOrEmpty(x.IBAN))
            .WithMessage("IBAN heeft een ongeldig formaat.");
    }
}

public class FysiekBezitUpsertRequestValidator : AbstractValidator<FysiekBezitUpsertRequest>
{
    public FysiekBezitUpsertRequestValidator()
    {
        RuleFor(x => x.Omschrijving).NotEmpty();
        RuleFor(x => x.Categorie).NotEmpty();
        RuleFor(x => x.GeschatteWaarde).GreaterThanOrEqualTo(0)
            .When(x => x.GeschatteWaarde.HasValue);
    }
}

public class VerzekeringUpsertRequestValidator : AbstractValidator<VerzekeringUpsertRequest>
{
    public VerzekeringUpsertRequestValidator()
    {
        RuleFor(x => x.Verzekeraar).NotEmpty();
        RuleFor(x => x.Type).NotEmpty();
        RuleFor(x => x.PolisNummer).NotEmpty();
        RuleFor(x => x.VerzekerdBedrag).GreaterThanOrEqualTo(0)
            .When(x => x.VerzekerdBedrag.HasValue);
    }
}

public class SchuldUpsertRequestValidator : AbstractValidator<SchuldUpsertRequest>
{
    public SchuldUpsertRequestValidator()
    {
        RuleFor(x => x.Schuldeiser).NotEmpty();
        RuleFor(x => x.Bedrag).GreaterThan(0)
            .WithMessage("Bedrag moet groter zijn dan 0.");
        RuleFor(x => x.MaandelijkseAflossing).GreaterThanOrEqualTo(0)
            .When(x => x.MaandelijkseAflossing.HasValue);
    }
}
