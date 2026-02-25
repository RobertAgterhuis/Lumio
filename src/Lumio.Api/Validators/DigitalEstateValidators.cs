using FluentValidation;
using Lumio.Api.Dtos.DigitalEstate;

namespace Lumio.Api.Validators;

public class DigitaalAccountUpsertRequestValidator : AbstractValidator<DigitaalAccountUpsertRequest>
{
    public DigitaalAccountUpsertRequestValidator()
    {
        RuleFor(x => x.PlatformNaam).NotEmpty();
        RuleFor(x => x.GewensteActie).NotEmpty();

        // S7-09: URL format validation
        RuleFor(x => x.Url)
            .Matches(@"^https?://").WithMessage("URL moet beginnen met http:// of https://.")
            .When(x => !string.IsNullOrWhiteSpace(x.Url));
    }
}

public class WachtwoordEntryCreateRequestValidator : AbstractValidator<WachtwoordEntryCreateRequest>
{
    public WachtwoordEntryCreateRequestValidator()
    {
        RuleFor(x => x.Naam).NotEmpty();
        RuleFor(x => x.Wachtwoord).NotEmpty();
    }
}

public class WachtwoordEntryUpdateRequestValidator : AbstractValidator<WachtwoordEntryUpdateRequest>
{
    public WachtwoordEntryUpdateRequestValidator()
    {
        RuleFor(x => x.Naam).NotEmpty();
    }
}

public class CryptoWalletUpsertRequestValidator : AbstractValidator<CryptoWalletUpsertRequest>
{
    public CryptoWalletUpsertRequestValidator()
    {
        RuleFor(x => x.WalletNaam).NotEmpty();
        RuleFor(x => x.CryptoType).NotEmpty();
    }
}
