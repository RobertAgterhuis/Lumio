using FluentValidation;
using Lumio.Api.Dtos.Testament;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Validators;

/// <summary>S3-08 — Validatie voor testament-info upsert.</summary>
public class TestamentInfoUpsertRequestValidator : AbstractValidator<TestamentInfoUpsertRequest>
{
    public TestamentInfoUpsertRequestValidator(
        IOptions<VeldLengtesOptions> veldLengtes,
        IOptions<ValidatieOptions> validatie)
    {
        var vl = veldLengtes.Value;
        var va = validatie.Value;

        RuleFor(x => x.DatumTestament)
            .Must(d => d == null || d.Value <= DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("Datum testament mag niet in de toekomst liggen.");

        RuleFor(x => x.CTR_Nummer)
            .Matches(@"^\d{1,20}$").WithMessage("CTR-nummer mag alleen cijfers bevatten (max. 20 tekens).")
            .When(x => !string.IsNullOrWhiteSpace(x.CTR_Nummer));

        RuleFor(x => x.UitsluitingsClausule)
            .NotNull().WithMessage("Keuze voor uitsluitingsclausule is verplicht.");

        RuleFor(x => x.NotarisNaam).MaximumLength(vl.NaamMax).When(x => x.NotarisNaam != null);

        RuleFor(x => x.NotarisTelefoon)
            .Matches(va.TelefoonRegex).WithMessage("Ongeldig telefoonnummer (notaris).")
            .MaximumLength(vl.TelefoonMax)
            .When(x => !string.IsNullOrWhiteSpace(x.NotarisTelefoon));

        RuleFor(x => x.NotarisEmail)
            .EmailAddress().WithMessage("Ongeldig e-mailadres (notaris).")
            .When(x => !string.IsNullOrWhiteSpace(x.NotarisEmail));

        RuleFor(x => x.NotarisPostcode)
            .Matches(va.PostcodeRegex).WithMessage("Ongeldige postcode (notaris).")
            .When(x => !string.IsNullOrWhiteSpace(x.NotarisPostcode));

        RuleFor(x => x.AlgemeneWensen).MaximumLength(vl.NotitieMax).When(x => x.AlgemeneWensen != null);
        RuleFor(x => x.BijzondereBepalingen).MaximumLength(vl.NotitieMax).When(x => x.BijzondereBepalingen != null);
        RuleFor(x => x.Legaten).MaximumLength(vl.NotitieMax).When(x => x.Legaten != null);
    }
}

/// <summary>S3-09 — Validatie voor begunstigde upsert.</summary>
public class BegunstigdeUpsertRequestValidator : AbstractValidator<BegunstigdeUpsertRequest>
{
    public BegunstigdeUpsertRequestValidator(
        IOptions<VeldLengtesOptions> veldLengtes,
        IOptions<ValidatieOptions> validatie)
    {
        var vl = veldLengtes.Value;
        var va = validatie.Value;

        RuleFor(x => x.Naam)
            .NotEmpty().WithMessage("Naam is verplicht.")
            .MaximumLength(vl.NaamMax);

        RuleFor(x => x.Relatie)
            .NotEmpty().WithMessage("Relatie is verplicht.")
            .MaximumLength(100);

        RuleFor(x => x.Percentage)
            .InclusiveBetween(0m, 100m).WithMessage("Percentage moet tussen 0 en 100 liggen.")
            .When(x => x.Percentage.HasValue);

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Ongeldig e-mailadres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Postcode)
            .Matches(va.PostcodeRegex).WithMessage("Ongeldige postcode.")
            .When(x => !string.IsNullOrWhiteSpace(x.Postcode));

        RuleFor(x => x.Omschrijving).MaximumLength(vl.OmschrijvingMax).When(x => x.Omschrijving != null);
    }
}

/// <summary>S3-10 — Validatie voor executeur upsert.</summary>
public class ExecuteurUpsertRequestValidator : AbstractValidator<ExecuteurUpsertRequest>
{
    public ExecuteurUpsertRequestValidator(
        IOptions<VeldLengtesOptions> veldLengtes,
        IOptions<ValidatieOptions> validatie)
    {
        var vl = veldLengtes.Value;
        var va = validatie.Value;

        RuleFor(x => x.Naam)
            .NotEmpty().WithMessage("Naam is verplicht.")
            .MaximumLength(vl.NaamMax);

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Ongeldig e-mailadres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Telefoon)
            .Matches(va.TelefoonRegex).WithMessage("Ongeldig telefoonnummer.")
            .MaximumLength(vl.TelefoonMax)
            .When(x => !string.IsNullOrWhiteSpace(x.Telefoon));

        RuleFor(x => x.Postcode)
            .Matches(va.PostcodeRegex).WithMessage("Ongeldige postcode.")
            .When(x => !string.IsNullOrWhiteSpace(x.Postcode));

        RuleFor(x => x.Bevoegdheden).MaximumLength(vl.NotitieMax).When(x => x.Bevoegdheden != null);
    }
}
