using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Validators;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Validators;

/// <summary>
/// Tests for BSN elf-proef (mod-11) validation in EigenaarUpsertRequestValidator and
/// ErfgenaamUpsertRequestValidator (OI-010 – Maand 11 – Data governance).
///
/// Valid BSNs used:
///   111222333 → sum = 9+8+7+12+10+8+9+6−3 = 66 → 66%11 = 0 ✓
///   123000002 → sum = 9+16+21+0+0+0+0+0−2 = 44 → 44%11 = 0 ✓
///
/// Invalid BSN:
///   123456789 → sum = 147 → 147%11 = 4 ✗
/// </summary>
public class BsnValidatieTests
{
    // ── Test fixtures ─────────────────────────────────────────────────────

    private static IOptions<VeldLengtesOptions> Lengtes =>
        Options.Create(new VeldLengtesOptions());

    private static IOptions<ValidatieOptions> Validatie =>
        Options.Create(new ValidatieOptions());

    private static EigenaarUpsertRequest MinimalEigenaar(string? bsn) =>
        new(
            Voornaam: "Test",
            Achternaam: "Persoon",
            Tussenvoegsel: null,
            Geboortedatum: new DateOnly(1980, 1, 1),
            BSN: bsn,
            Adres: null,
            Postcode: null,
            Woonplaats: null,
            Telefoon: null,
            Email: null,
            Notaris: null,
            NotarisKantoor: null,
            NotarisTelefoon: null,
            NotarisEmail: null,
            NotarisAdres: null,
            NotarisPostcode: null,
            NotarisPlaats: null,
            BurgerlijkeStaat: BurgerlijkeStaat.Ongehuwd,
            HuwelijksVoorwaarden: HuwelijksVoorwaarden.NietVanToepassing,
            DatumHuwelijk: null,
            LegitimatieSoort: LegitimatieSoort.Geen,
            LegitimatieNummer: null,
            LegitimatieDatumAfgifte: null,
            LegitimatieGeldigTot: null);

    private static ErfgenaamUpsertRequest MinimalErfgenaam(string? bsn) =>
        new(
            Voornaam: "Test",
            Achternaam: "Erfgenaam",
            Tussenvoegsel: null,
            Relatie: "Kind",
            Telefoon: null,
            Email: null,
            Adres: null,
            Postcode: null,
            Woonplaats: null,
            Geboortedatum: null,
            BSN: bsn,
            LegitimatieSoort: LegitimatieSoort.Geen,
            LegitimatieNummer: null,
            LegitimatieDatumAfgifte: null,
            LegitimatieGeldigTot: null);

    // ── EigenaarUpsertRequestValidator ────────────────────────────────────

    [Theory]
    [InlineData("111222333")]   // sum=66, 66%11=0
    [InlineData("123000002")]   // sum=44, 44%11=0
    public void EigenaarValidator_GeldigBSN_GeeftGeenBsnFout(string bsn)
    {
        var validator = new EigenaarUpsertRequestValidator(Lengtes, Validatie);
        var result = validator.Validate(MinimalEigenaar(bsn));
        Assert.DoesNotContain(result.Errors, e => e.PropertyName == "BSN");
    }

    [Theory]
    [InlineData("123456789")]   // sum=147, 147%11=4 — invalid
    [InlineData("000000000")]   // all zeros — sum negatively checked
    [InlineData("111111111")]   // sum=9+8+7+6+5+4+3+2-1=43, 43%11=10 — invalid
    public void EigenaarValidator_OngeldigBSN_GeeftBsnFout(string bsn)
    {
        var validator = new EigenaarUpsertRequestValidator(Lengtes, Validatie);
        var result = validator.Validate(MinimalEigenaar(bsn));
        Assert.Contains(result.Errors, e =>
            e.PropertyName == "BSN" &&
            e.ErrorMessage.Contains("elf-proef"));
    }

    [Fact]
    public void EigenaarValidator_LeegBSN_WordtOvergeslagen()
    {
        var validator = new EigenaarUpsertRequestValidator(Lengtes, Validatie);
        var result = validator.Validate(MinimalEigenaar(null));
        Assert.DoesNotContain(result.Errors, e => e.PropertyName == "BSN");
    }

    [Theory]
    [InlineData("12345678")]    // 8 digits — too short
    [InlineData("1234567890")]  // 10 digits — too long
    [InlineData("12345678A")]   // non-digit
    public void EigenaarValidator_MisvormdBSN_GeeftBsnFout(string bsn)
    {
        var validator = new EigenaarUpsertRequestValidator(Lengtes, Validatie);
        var result = validator.Validate(MinimalEigenaar(bsn));
        Assert.Contains(result.Errors, e => e.PropertyName == "BSN");
    }

    // ── ErfgenaamUpsertRequestValidator ──────────────────────────────────

    [Theory]
    [InlineData("111222333")]
    [InlineData("123000002")]
    public void ErfgenaamValidator_GeldigBSN_GeeftGeenBsnFout(string bsn)
    {
        var validator = new ErfgenaamUpsertRequestValidator(Lengtes, Validatie);
        var result = validator.Validate(MinimalErfgenaam(bsn));
        Assert.DoesNotContain(result.Errors, e => e.PropertyName == "BSN");
    }

    [Theory]
    [InlineData("123456789")]
    [InlineData("000000000")]
    public void ErfgenaamValidator_OngeldigBSN_GeeftBsnFout(string bsn)
    {
        var validator = new ErfgenaamUpsertRequestValidator(Lengtes, Validatie);
        var result = validator.Validate(MinimalErfgenaam(bsn));
        Assert.Contains(result.Errors, e =>
            e.PropertyName == "BSN" &&
            e.ErrorMessage.Contains("elf-proef"));
    }

    [Fact]
    public void ErfgenaamValidator_LeegBSN_WordtOvergeslagen()
    {
        var validator = new ErfgenaamUpsertRequestValidator(Lengtes, Validatie);
        var result = validator.Validate(MinimalErfgenaam(null));
        Assert.DoesNotContain(result.Errors, e => e.PropertyName == "BSN");
    }
}
