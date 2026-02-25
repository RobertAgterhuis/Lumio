using FluentValidation;
using Lumio.Api.Dtos.DonorRegistration;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Validators;

/// <summary>S3-11 — Validatie voor donorregistratie upsert.</summary>
public class DonorRegistratieUpsertRequestValidator : AbstractValidator<DonorRegistratieUpsertRequest>
{
    private static readonly HashSet<string> GeldigeKeuzes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Ja, alles",
        "Ja, specifiek",
        "Nee",
        "Nabestaanden beslissen",
        "Specifiek persoon beslist",
    };

    public DonorRegistratieUpsertRequestValidator(IOptions<VeldLengtesOptions> veldLengtes)
    {
        var vl = veldLengtes.Value;

        RuleFor(x => x.Keuze)
            .NotEmpty().WithMessage("Donorkeuze is verplicht.")
            .Must(k => GeldigeKeuzes.Contains(k))
            .WithMessage("Ongeldige donorkeuze.");

        RuleFor(x => x.Toelichting)
            .MaximumLength(vl.NotitieMax)
            .When(x => x.Toelichting != null);

        RuleFor(x => x.DonorregisterReferentie)
            .MaximumLength(500)
            .When(x => x.DonorregisterReferentie != null);
    }
}

/// <summary>S3-12 — Validatie voor orgaankeuze upsert.</summary>
public class OrgaanKeuzeUpsertRequestValidator : AbstractValidator<OrgaanKeuzeUpsertRequest>
{
    private static readonly HashSet<string> GeldigeOrganen = new(StringComparer.OrdinalIgnoreCase)
    {
        "Hart",
        "Longen",
        "Lever",
        "Nieren",
        "Alvleesklier",
        "Dunne darm",
        "Hoornvliezen",
        "Huid",
        "Botweefsel",
        "Hartkleppen",
        "Bloedvaten",
    };

    public OrgaanKeuzeUpsertRequestValidator(IOptions<VeldLengtesOptions> veldLengtes)
    {
        var vl = veldLengtes.Value;

        RuleFor(x => x.Orgaan)
            .NotEmpty().WithMessage("Orgaan is verplicht.")
            .Must(o => GeldigeOrganen.Contains(o))
            .WithMessage("Ongeldig orgaan.");

        RuleFor(x => x.Toelichting)
            .MaximumLength(vl.OmschrijvingMax)
            .When(x => x.Toelichting != null);
    }
}
