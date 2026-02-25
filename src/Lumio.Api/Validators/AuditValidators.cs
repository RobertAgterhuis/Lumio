using FluentValidation;
using Lumio.Api.Controllers;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Validators;

/// <summary>S3-26 — Validatie voor AuditLog-aanmaken.</summary>
public class AuditLogCreateDtoValidator : AbstractValidator<AuditLogCreateDto>
{
    public AuditLogCreateDtoValidator()
    {
        RuleFor(x => x.Actie)
            .NotEmpty().WithMessage("Actie is verplicht.")
            .MaximumLength(100).WithMessage("Actie mag maximaal 100 tekens bevatten.");

        RuleFor(x => x.EntityType)
            .MaximumLength(100)
            .When(x => x.EntityType != null);

        RuleFor(x => x.Details)
            .MaximumLength(2000)
            .When(x => x.Details != null);
    }
}
