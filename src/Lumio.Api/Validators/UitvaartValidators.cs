using FluentValidation;
using Lumio.Api.Dtos.FuneralWishes;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Validators;

/// <summary>S3-20/21/22 — Validatie voor uitvaart-wensen upsert.</summary>
public class UitvaartWensenUpsertRequestValidator : AbstractValidator<UitvaartWensenUpsertRequest>
{
    /// <summary>S3-21 — Geldige waarden voor VoorkeurType.</summary>
    private static readonly HashSet<string> GeldigeTypen = new(StringComparer.OrdinalIgnoreCase)
    {
        "Begrafenis",
        "Crematie",
        "Natuurbegraven",
        "Resomatie",
        "Geen voorkeur",
    };

    /// <summary>S3-22 — Geldige waarden voor BudgetRichting.</summary>
    private static readonly HashSet<string> GeldigeBudgetten = new(StringComparer.OrdinalIgnoreCase)
    {
        "Eenvoudig",
        "Gemiddeld",
        "Uitgebreid",
        "Luxe",
    };

    public UitvaartWensenUpsertRequestValidator(
        IOptions<VeldLengtesOptions> veldLengtes,
        IOptions<ValidatieOptions> validatie)
    {
        var vl = veldLengtes.Value;
        var va = validatie.Value;

        // S3-21
        RuleFor(x => x.VoorkeurType)
            .NotEmpty().WithMessage("VoorkeurType is verplicht.")
            .Must(t => GeldigeTypen.Contains(t))
            .WithMessage("Ongeldig uitvaarttype. Kies uit: Begrafenis, Crematie, Natuurbegraven, Resomatie, Geen voorkeur.");

        // S3-22 — allow null/empty
        RuleFor(x => x.BudgetRichting)
            .Must(b => string.IsNullOrEmpty(b) || GeldigeBudgetten.Contains(b))
            .WithMessage("Ongeldige budgetrichting. Kies uit: Eenvoudig, Gemiddeld, Uitgebreid, Luxe.")
            .When(x => x.BudgetRichting != null);

        // Contactvelden uitvaartondernemer
        RuleFor(x => x.UitvaartOndernemerTelefoon)
            .Matches(va.TelefoonRegex).WithMessage("Ongeldig telefoonnummer (uitvaartondernemer).")
            .MaximumLength(vl.TelefoonMax)
            .When(x => !string.IsNullOrWhiteSpace(x.UitvaartOndernemerTelefoon));

        RuleFor(x => x.UitvaartOndernemerEmail)
            .EmailAddress().WithMessage("Ongeldig e-mailadres (uitvaartondernemer).")
            .When(x => !string.IsNullOrWhiteSpace(x.UitvaartOndernemerEmail));

        RuleFor(x => x.UitvaartOndernemerPostcode)
            .Matches(va.PostcodeRegex).WithMessage("Ongeldige postcode (uitvaartondernemer).")
            .When(x => !string.IsNullOrWhiteSpace(x.UitvaartOndernemerPostcode));

        // Tekstvelden
        RuleFor(x => x.Muziekwensen).MaximumLength(vl.NotitieMax).When(x => x.Muziekwensen != null);
        RuleFor(x => x.Sprekers).MaximumLength(vl.NotitieMax).When(x => x.Sprekers != null);
        RuleFor(x => x.Bloemen).MaximumLength(vl.OmschrijvingMax).When(x => x.Bloemen != null);
        RuleFor(x => x.Kledingwensen).MaximumLength(vl.OmschrijvingMax).When(x => x.Kledingwensen != null);
        RuleFor(x => x.RouwkaartTekst).MaximumLength(vl.NotitieMax).When(x => x.RouwkaartTekst != null);
        RuleFor(x => x.RouwadvertentieTekst).MaximumLength(vl.NotitieMax).When(x => x.RouwadvertentieTekst != null);
        RuleFor(x => x.OverigeWensen).MaximumLength(vl.NotitieMax).When(x => x.OverigeWensen != null);
    }
}

/// <summary>S3-20 — Validatie voor ceremonie-detail upsert.</summary>
public class CeremonieDetailUpsertRequestValidator : AbstractValidator<CeremonieDetailUpsertRequest>
{
    public CeremonieDetailUpsertRequestValidator(IOptions<VeldLengtesOptions> veldLengtes)
    {
        var vl = veldLengtes.Value;

        RuleFor(x => x.Onderdeel)
            .NotEmpty().WithMessage("Onderdeel is verplicht.")
            .MaximumLength(200);

        RuleFor(x => x.Beschrijving).MaximumLength(vl.OmschrijvingMax).When(x => x.Beschrijving != null);
        RuleFor(x => x.Muziek).MaximumLength(200).When(x => x.Muziek != null);
        RuleFor(x => x.Spreker).MaximumLength(vl.NaamMax).When(x => x.Spreker != null);
        RuleFor(x => x.Tekstlezing).MaximumLength(vl.NotitieMax).When(x => x.Tekstlezing != null);
        RuleFor(x => x.Dresscode).MaximumLength(200).When(x => x.Dresscode != null);
    }
}

/// <summary>S3-20 — Validatie voor uitvaart-genodigde upsert.</summary>
public class UitvaartGenodigdeUpsertRequestValidator : AbstractValidator<UitvaartGenodigdeUpsertRequest>
{
    public UitvaartGenodigdeUpsertRequestValidator(
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

        RuleFor(x => x.Notities).MaximumLength(vl.NotitieMax).When(x => x.Notities != null);
    }
}
