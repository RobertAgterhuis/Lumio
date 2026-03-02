// T-008: Validator unit tests — brings scoped coverage from ~9% to ≥50%.
// Covers all FluentValidation validator classes in Lumio.Api.Validators that
// were previously at 0% line coverage.

using Lumio.Api.Controllers;          // AuditLogCreateDto
using Lumio.Api.Domain.AssetRegistry; // VermogensSoort
using Lumio.Api.Dtos.AssetRegistry;
using Lumio.Api.Dtos.Auth;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Dtos.DigitalEstate;
using Lumio.Api.Dtos.Documents;
using Lumio.Api.Dtos.DonorRegistration;
using Lumio.Api.Dtos.EuthanasiaDirective;
using Lumio.Api.Dtos.FuneralWishes;
using Lumio.Api.Dtos.Testament;
using Lumio.Api.Dtos.VideoMessages;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Validators;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Validators;

// ─── Shared test helpers ──────────────────────────────────────────────────────

file static class Opts
{
    public static IOptions<VeldLengtesOptions> Lengtes =>
        Options.Create(new VeldLengtesOptions());

    public static IOptions<ValidatieOptions> Validatie =>
        Options.Create(new ValidatieOptions());

    public static IOptions<LimietenOptions> Limieten =>
        Options.Create(new LimietenOptions());
}

/// <summary>
/// Minimal IFormFile fake — no Moq required.
/// </summary>
file sealed class FormFileFake : IFormFile
{
    public string ContentType { get; init; } = "application/pdf";
    public string ContentDisposition => $"form-data; name=\"bestand\"; filename=\"test.pdf\"";
    public IHeaderDictionary Headers => new HeaderDictionary();
    public long Length { get; init; } = 1024;
    public string Name => "bestand";
    public string FileName => "test.pdf";
    public Stream OpenReadStream() => new MemoryStream(new byte[Length > 0 ? (int)Length : 1]);
    public void CopyTo(Stream target) { }
    public Task CopyToAsync(Stream target, CancellationToken cancellationToken = default) => Task.CompletedTask;
}

// ─── Asset Validators ─────────────────────────────────────────────────────────

public class BankrekeningValidatorTests
{
    [Fact]
    public void Bankrekening_ValidRequest_Passes()
    {
        var v = new BankrekeningUpsertRequestValidator(Opts.Validatie);
        var req = new BankrekeningUpsertRequest(
            BankNaam: "ING",
            IBAN: "NL91ABNA0417164300",
            RekeningType: "Betaalrekening",
            Saldo: null,
            VermogensSoort: VermogensSoort.Prive,
            Notities: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Bankrekening_EmptyBankNaam_Fails()
    {
        var v = new BankrekeningUpsertRequestValidator(Opts.Validatie);
        var req = new BankrekeningUpsertRequest(
            BankNaam: "",
            IBAN: "NL91ABNA0417164300",
            RekeningType: "Betaalrekening",
            Saldo: null,
            VermogensSoort: VermogensSoort.Prive,
            Notities: null);
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void Bankrekening_InvalidIban_Fails()
    {
        var v = new BankrekeningUpsertRequestValidator(Opts.Validatie);
        var req = new BankrekeningUpsertRequest(
            BankNaam: "ING",
            IBAN: "INVALID_IBAN",
            RekeningType: "Betaalrekening",
            Saldo: null,
            VermogensSoort: VermogensSoort.Prive,
            Notities: null);
        Assert.False(v.Validate(req).IsValid);
    }
}

public class FysiekBezitValidatorTests
{
    [Fact]
    public void FysiekBezit_Valid_Passes()
    {
        var v = new FysiekBezitUpsertRequestValidator();
        var req = new FysiekBezitUpsertRequest(
            Categorie: "Auto",
            Omschrijving: "Mijn auto",
            GeschatteWaarde: 10000m,
            Locatie: null,
            BestemdeErfgenaamId: null,
            VermogensSoort: VermogensSoort.Prive,
            Notities: null,
            KadastraalNummer: null,
            Kenteken: null,
            KvKNummer: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void FysiekBezit_NegativeWaarde_Fails()
    {
        var v = new FysiekBezitUpsertRequestValidator();
        var req = new FysiekBezitUpsertRequest(
            Categorie: "Auto",
            Omschrijving: "Mijn auto",
            GeschatteWaarde: -1m,
            Locatie: null,
            BestemdeErfgenaamId: null,
            VermogensSoort: VermogensSoort.Prive,
            Notities: null,
            KadastraalNummer: null,
            Kenteken: null,
            KvKNummer: null);
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void FysiekBezit_EmptyCategorie_Fails()
    {
        var v = new FysiekBezitUpsertRequestValidator();
        var req = new FysiekBezitUpsertRequest(
            Categorie: "",
            Omschrijving: "Mijn auto",
            GeschatteWaarde: null,
            Locatie: null,
            BestemdeErfgenaamId: null,
            VermogensSoort: VermogensSoort.Prive,
            Notities: null,
            KadastraalNummer: null,
            Kenteken: null,
            KvKNummer: null);
        Assert.False(v.Validate(req).IsValid);
    }
}

public class VerzekeringValidatorTests
{
    [Fact]
    public void Verzekering_Valid_Passes()
    {
        var v = new VerzekeringUpsertRequestValidator();
        var req = new VerzekeringUpsertRequest(
            Verzekeraar: "Nationale Nederlanden",
            VerzekeraarTelefoon: null,
            VerzekeraarEmail: null,
            PolisNummer: "POL-12345",
            Type: "Levensverzekering",
            VerzekerdBedrag: 50000m,
            Begunstigde: null,
            BegunstigdeErfgenaamId: null,
            VermogensSoort: VermogensSoort.Prive,
            Notities: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Verzekering_EmptyVerzekeraar_Fails()
    {
        var v = new VerzekeringUpsertRequestValidator();
        var req = new VerzekeringUpsertRequest(
            Verzekeraar: "",
            VerzekeraarTelefoon: null,
            VerzekeraarEmail: null,
            PolisNummer: "POL-12345",
            Type: "Levensverzekering",
            VerzekerdBedrag: null,
            Begunstigde: null,
            BegunstigdeErfgenaamId: null,
            VermogensSoort: VermogensSoort.Prive,
            Notities: null);
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void Verzekering_NegatiefVerzekerdBedrag_Fails()
    {
        var v = new VerzekeringUpsertRequestValidator();
        var req = new VerzekeringUpsertRequest(
            Verzekeraar: "NN",
            VerzekeraarTelefoon: null,
            VerzekeraarEmail: null,
            PolisNummer: "POL-1",
            Type: "Overlijden",
            VerzekerdBedrag: -100m,
            Begunstigde: null,
            BegunstigdeErfgenaamId: null,
            VermogensSoort: VermogensSoort.Prive,
            Notities: null);
        Assert.False(v.Validate(req).IsValid);
    }
}

public class SchuldValidatorTests
{
    [Fact]
    public void Schuld_Valid_Passes()
    {
        var v = new SchuldUpsertRequestValidator();
        var req = new SchuldUpsertRequest(
            Schuldeiser: "ABN AMRO",
            SchuldeiserTelefoon: null,
            SchuldeiserEmail: null,
            Type: "Hypotheek",
            Bedrag: 250000m,
            MaandelijkseAflossing: 800m,
            Referentie: null,
            VermogensSoort: VermogensSoort.Prive,
            Notities: null,
            HypotheekVorm: null,
            Rentepercentage: null,
            MaandelijkseRente: null,
            Einddatum: null,
            Restschuld: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Schuld_NulBedrag_Fails()
    {
        var v = new SchuldUpsertRequestValidator();
        var req = new SchuldUpsertRequest(
            Schuldeiser: "ABN AMRO",
            SchuldeiserTelefoon: null,
            SchuldeiserEmail: null,
            Type: "Hypotheek",
            Bedrag: 0m,
            MaandelijkseAflossing: null,
            Referentie: null,
            VermogensSoort: VermogensSoort.Prive,
            Notities: null,
            HypotheekVorm: null,
            Rentepercentage: null,
            MaandelijkseRente: null,
            Einddatum: null,
            Restschuld: null);
        Assert.False(v.Validate(req).IsValid);
    }
}

// ─── Auth Validators ──────────────────────────────────────────────────────────

public class SetupRequestValidatorTests
{
    [Fact]
    public void Setup_ValidWachtwoord_Passes()
    {
        var v = new SetupRequestValidator(Opts.Limieten);
        Assert.True(v.Validate(new SetupRequest("Welkom123!")).IsValid);
    }

    [Fact]
    public void Setup_TeKortWachtwoord_Fails()
    {
        var v = new SetupRequestValidator(Opts.Limieten);
        // Default WachtwoordMinLengte = 8; "abc" is too short
        Assert.False(v.Validate(new SetupRequest("abc")).IsValid);
    }

    [Fact]
    public void Setup_LeegWachtwoord_Fails()
    {
        var v = new SetupRequestValidator(Opts.Limieten);
        Assert.False(v.Validate(new SetupRequest("")).IsValid);
    }
}

public class OntgrendelRequestValidatorTests
{
    [Fact]
    public void Ontgrendel_Valid_Passes()
    {
        var v = new OntgrendelRequestValidator();
        Assert.True(v.Validate(new OntgrendelRequest("Welkom123!")).IsValid);
    }

    [Fact]
    public void Ontgrendel_Leeg_Fails()
    {
        var v = new OntgrendelRequestValidator();
        Assert.False(v.Validate(new OntgrendelRequest("")).IsValid);
    }
}

public class WachtwoordWijzigenValidatorTests
{
    [Fact]
    public void Wijzigen_Valid_Passes()
    {
        var v = new WachtwoordWijzigenRequestValidator(Opts.Limieten);
        Assert.True(v.Validate(new WachtwoordWijzigenRequest("OudWw12!", "NieuwWw34!")).IsValid);
    }

    [Fact]
    public void Wijzigen_NieuwTeKort_Fails()
    {
        var v = new WachtwoordWijzigenRequestValidator(Opts.Limieten);
        Assert.False(v.Validate(new WachtwoordWijzigenRequest("OudWw12!", "abc")).IsValid);
    }
}

public class OntgrendelErfgenaamValidatorTests
{
    [Fact]
    public void Erfgenaam_MetShares_Passes()
    {
        var v = new OntgrendelErfgenaamRequestValidator();
        var req = new OntgrendelErfgenaamRequest(new List<string> { "share1", "share2" });
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Erfgenaam_GeenShares_Fails()
    {
        var v = new OntgrendelErfgenaamRequestValidator();
        var req = new OntgrendelErfgenaamRequest(new List<string>());
        Assert.False(v.Validate(req).IsValid);
    }
}

// ─── Audit Validators ─────────────────────────────────────────────────────────

public class AuditLogValidatorTests
{
    [Fact]
    public void AuditLog_Valid_Passes()
    {
        var v = new AuditLogCreateDtoValidator();
        var dto = new AuditLogCreateDto { Actie = "LOGIN", EntityType = null, Details = null };
        Assert.True(v.Validate(dto).IsValid);
    }

    [Fact]
    public void AuditLog_LegeActie_Fails()
    {
        var v = new AuditLogCreateDtoValidator();
        var dto = new AuditLogCreateDto { Actie = "" };
        Assert.False(v.Validate(dto).IsValid);
    }

    [Fact]
    public void AuditLog_TeLangeActie_Fails()
    {
        var v = new AuditLogCreateDtoValidator();
        var dto = new AuditLogCreateDto { Actie = new string('A', 101) };
        Assert.False(v.Validate(dto).IsValid);
    }
}

// ─── Noodcontact Validators ───────────────────────────────────────────────────

public class NoodcontactValidatorTests
{
    [Fact]
    public void Noodcontact_Valid_Passes()
    {
        var v = new NoodcontactUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new NoodcontactUpsertRequest(
            Naam: "Jan de Vries",
            Relatie: "Broer",
            Telefoon: null,
            Email: null,
            Adres: null,
            Postcode: null,
            Woonplaats: null,
            Rol: "Vertrouwenspersoon",
            Instructies: null,
            BedrijfsNaam: null,
            Functie: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Noodcontact_OngeldigeRol_Fails()
    {
        var v = new NoodcontactUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new NoodcontactUpsertRequest(
            Naam: "Jan",
            Relatie: "Broer",
            Telefoon: null,
            Email: null,
            Adres: null,
            Postcode: null,
            Woonplaats: null,
            Rol: "OngeldigeRol",
            Instructies: null,
            BedrijfsNaam: null,
            Functie: null);
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void Noodcontact_OngeldigEmail_Fails()
    {
        var v = new NoodcontactUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new NoodcontactUpsertRequest(
            Naam: "Jan",
            Relatie: "Broer",
            Telefoon: null,
            Email: "geen-email",
            Adres: null,
            Postcode: null,
            Woonplaats: null,
            Rol: "Overig",
            Instructies: null,
            BedrijfsNaam: null,
            Functie: null);
        Assert.False(v.Validate(req).IsValid);
    }
}

// ─── Donor Validators ─────────────────────────────────────────────────────────

public class DonorValidatorTests
{
    [Fact]
    public void Donor_ValidKeuze_Passes()
    {
        var v = new DonorRegistratieUpsertRequestValidator(Opts.Lengtes);
        var req = new DonorRegistratieUpsertRequest(
            Keuze: "Ja, alles",
            IsGeregistreerdBijDonorregister: false,
            DonorregisterReferentie: null,
            Toelichting: null,
            BeslisserNaam: null,
            BeslisserRelatie: null,
            BeslisserTelefoon: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Donor_OngeldigeKeuze_Fails()
    {
        var v = new DonorRegistratieUpsertRequestValidator(Opts.Lengtes);
        var req = new DonorRegistratieUpsertRequest(
            Keuze: "Misschien",
            IsGeregistreerdBijDonorregister: false,
            DonorregisterReferentie: null,
            Toelichting: null,
            BeslisserNaam: null,
            BeslisserRelatie: null,
            BeslisserTelefoon: null);
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void OrgaanKeuze_ValidOrgaan_Passes()
    {
        var v = new OrgaanKeuzeUpsertRequestValidator(Opts.Lengtes);
        var req = new OrgaanKeuzeUpsertRequest(Orgaan: "Hart", WelDoneren: true, Toelichting: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void OrgaanKeuze_OngeldigOrgaan_Fails()
    {
        var v = new OrgaanKeuzeUpsertRequestValidator(Opts.Lengtes);
        var req = new OrgaanKeuzeUpsertRequest(Orgaan: "Oor", WelDoneren: true, Toelichting: null);
        Assert.False(v.Validate(req).IsValid);
    }
}

// ─── Video Validators ─────────────────────────────────────────────────────────

public class VideoValidatorTests
{
    [Fact]
    public void Video_LegeUpdate_Passes()
    {
        var v = new VideoboodschapUpdateRequestValidator(Opts.Lengtes);
        // All fields optional
        var req = new VideoboodschapUpdateRequest(Titel: null, Beschrijving: null, OntvangerIds: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Video_LegeTitel_Fails()
    {
        var v = new VideoboodschapUpdateRequestValidator(Opts.Lengtes);
        // Titel set but empty string → MinimumLength(1) fails
        var req = new VideoboodschapUpdateRequest(Titel: "", Beschrijving: null, OntvangerIds: null);
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void Video_ValideTitel_Passes()
    {
        var v = new VideoboodschapUpdateRequestValidator(Opts.Lengtes);
        var req = new VideoboodschapUpdateRequest(Titel: "Boodschap voor mijn kinderen", Beschrijving: null, OntvangerIds: null);
        Assert.True(v.Validate(req).IsValid);
    }
}

// ─── Digital Estate Validators ────────────────────────────────────────────────

public class DigitaalAccountValidatorTests
{
    [Fact]
    public void DigitaalAccount_Valid_Passes()
    {
        var v = new DigitaalAccountUpsertRequestValidator();
        var req = new DigitaalAccountUpsertRequest(
            PlatformNaam: "LinkedIn",
            Categorie: null,
            Gebruikersnaam: "jdevries",
            EmailAdres: null,
            Url: "https://linkedin.com",
            GewensteActie: "Verwijderen",
            OverdrachtAan: null,
            Notities: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void DigitaalAccount_LegePlatformNaam_Fails()
    {
        var v = new DigitaalAccountUpsertRequestValidator();
        var req = new DigitaalAccountUpsertRequest(
            PlatformNaam: "",
            Categorie: null,
            Gebruikersnaam: null,
            EmailAdres: null,
            Url: null,
            GewensteActie: "Verwijderen",
            OverdrachtAan: null,
            Notities: null);
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void DigitaalAccount_OngeldigeUrl_Fails()
    {
        var v = new DigitaalAccountUpsertRequestValidator();
        var req = new DigitaalAccountUpsertRequest(
            PlatformNaam: "LinkedIn",
            Categorie: null,
            Gebruikersnaam: null,
            EmailAdres: null,
            Url: "ftp://invalid",
            GewensteActie: "Verwijderen",
            OverdrachtAan: null,
            Notities: null);
        Assert.False(v.Validate(req).IsValid);
    }
}

public class WachtwoordEntryValidatorTests
{
    [Fact]
    public void Create_Valid_Passes()
    {
        var v = new WachtwoordEntryCreateRequestValidator();
        var req = new WachtwoordEntryCreateRequest(
            Naam: "Gmail",
            Gebruikersnaam: "jan@example.com",
            Wachtwoord: "geheim123",
            Url: null,
            Notities: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Create_LegeNaam_Fails()
    {
        var v = new WachtwoordEntryCreateRequestValidator();
        var req = new WachtwoordEntryCreateRequest(
            Naam: "",
            Gebruikersnaam: null,
            Wachtwoord: "geheim123",
            Url: null,
            Notities: null);
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void Update_Valid_Passes()
    {
        var v = new WachtwoordEntryUpdateRequestValidator();
        var req = new WachtwoordEntryUpdateRequest(
            Naam: "Gmail",
            Gebruikersnaam: null,
            NieuwWachtwoord: null,
            Url: null,
            Notities: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Update_LegeNaam_Fails()
    {
        var v = new WachtwoordEntryUpdateRequestValidator();
        var req = new WachtwoordEntryUpdateRequest(
            Naam: "",
            Gebruikersnaam: null,
            NieuwWachtwoord: null,
            Url: null,
            Notities: null);
        Assert.False(v.Validate(req).IsValid);
    }
}

public class CryptoWalletValidatorTests
{
    [Fact]
    public void CryptoWallet_Valid_Passes()
    {
        var v = new CryptoWalletUpsertRequestValidator();
        var req = new CryptoWalletUpsertRequest(
            WalletNaam: "Mijn Bitcoin Wallet",
            CryptoType: "Bitcoin",
            WalletAdres: null,
            SeedPhrase: null,
            Exchange: null,
            Notities: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void CryptoWallet_LegeWalletNaam_Fails()
    {
        var v = new CryptoWalletUpsertRequestValidator();
        var req = new CryptoWalletUpsertRequest(
            WalletNaam: "",
            CryptoType: "Bitcoin",
            WalletAdres: null,
            SeedPhrase: null,
            Exchange: null,
            Notities: null);
        Assert.False(v.Validate(req).IsValid);
    }
}

// ─── Document Validators ──────────────────────────────────────────────────────

public class DocumentValidatorTests
{
    [Fact]
    public void Upload_Valid_Passes()
    {
        var v = new DocumentUploadRequestValidator(Opts.Limieten);
        var req = new DocumentUploadRequest
        {
            Naam = "Paspoort",
            Categorie = "Identiteitsbewijs",
            Bestand = new FormFileFake { ContentType = "application/pdf", Length = 1024 },
        };
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Upload_GeenBestand_Fails()
    {
        var v = new DocumentUploadRequestValidator(Opts.Limieten);
        var req = new DocumentUploadRequest
        {
            Naam = "Paspoort",
            Categorie = "Identiteitsbewijs",
            Bestand = null,
        };
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void Upload_OngeldigeCategorie_Fails()
    {
        var v = new DocumentUploadRequestValidator(Opts.Limieten);
        var req = new DocumentUploadRequest
        {
            Naam = "Test",
            Categorie = "Onbekend",
            Bestand = new FormFileFake(),
        };
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void Upload_OngeldigMimeType_Fails()
    {
        var v = new DocumentUploadRequestValidator(Opts.Limieten);
        var req = new DocumentUploadRequest
        {
            Naam = "Test",
            Categorie = "Testament",
            Bestand = new FormFileFake { ContentType = "application/x-executable", Length = 100 },
        };
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void Update_Valid_Passes()
    {
        var v = new DocumentUpdateRequestValidator(Opts.Lengtes);
        var req = new DocumentUpdateRequest(VerlooptOp: null, Notities: "Bijgewerkt");
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Update_TeLangeNotities_Fails()
    {
        var v = new DocumentUpdateRequestValidator(Opts.Lengtes);
        var req = new DocumentUpdateRequest(
            VerlooptOp: null,
            Notities: new string('X', new VeldLengtesOptions().NotitieMax + 1));
        Assert.False(v.Validate(req).IsValid);
    }
}

// ─── Testament Validators ─────────────────────────────────────────────────────

public class TestamentInfoValidatorTests
{
    [Fact]
    public void TestamentInfo_MinimaalValid_Passes()
    {
        // UitsluitingsClausule is NotNull — must be provided
        var v = new TestamentInfoUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new TestamentInfoUpsertRequest(
            TestamentType: null,
            NotarisNaam: null,
            NotarisKantoor: null,
            NotarisTelefoon: null,
            NotarisEmail: null,
            NotarisAdres: null,
            NotarisPostcode: null,
            NotarisPlaats: null,
            DatumTestament: null,
            TestamentLocatie: null,
            CTR_Nummer: null,
            AlgemeneWensen: null,
            BijzondereBepalingen: null,
            UitsluitingsClausule: false,
            Legaten: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void TestamentInfo_UitsluitingsClausuleNull_Fails()
    {
        var v = new TestamentInfoUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new TestamentInfoUpsertRequest(
            TestamentType: null,
            NotarisNaam: null,
            NotarisKantoor: null,
            NotarisTelefoon: null,
            NotarisEmail: null,
            NotarisAdres: null,
            NotarisPostcode: null,
            NotarisPlaats: null,
            DatumTestament: null,
            TestamentLocatie: null,
            CTR_Nummer: null,
            AlgemeneWensen: null,
            BijzondereBepalingen: null,
            UitsluitingsClausule: null,
            Legaten: null);
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void TestamentInfo_DatumInToekomst_Fails()
    {
        var v = new TestamentInfoUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new TestamentInfoUpsertRequest(
            TestamentType: null,
            NotarisNaam: null,
            NotarisKantoor: null,
            NotarisTelefoon: null,
            NotarisEmail: null,
            NotarisAdres: null,
            NotarisPostcode: null,
            NotarisPlaats: null,
            DatumTestament: DateOnly.FromDateTime(DateTime.Today.AddDays(10)),
            TestamentLocatie: null,
            CTR_Nummer: null,
            AlgemeneWensen: null,
            BijzondereBepalingen: null,
            UitsluitingsClausule: null,
            Legaten: null);
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void TestamentInfo_OngeldigCtrNummer_Fails()
    {
        var v = new TestamentInfoUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new TestamentInfoUpsertRequest(
            TestamentType: null,
            NotarisNaam: null,
            NotarisKantoor: null,
            NotarisTelefoon: null,
            NotarisEmail: null,
            NotarisAdres: null,
            NotarisPostcode: null,
            NotarisPlaats: null,
            DatumTestament: null,
            TestamentLocatie: null,
            CTR_Nummer: "ABCDEF",  // must be digits only
            AlgemeneWensen: null,
            BijzondereBepalingen: null,
            UitsluitingsClausule: null,
            Legaten: null);
        Assert.False(v.Validate(req).IsValid);
    }
}

public class BegunstigdeValidatorTests
{
    [Fact]
    public void Begunstigde_Valid_Passes()
    {
        var v = new BegunstigdeUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new BegunstigdeUpsertRequest(
            Naam: "Klara de Vries",
            Relatie: "Dochter",
            Telefoon: null,
            Email: null,
            Adres: null,
            Postcode: null,
            Woonplaats: null,
            Omschrijving: null,
            Percentage: 50m,
            IsLegitiemePortie: false);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Begunstigde_LegeNaam_Fails()
    {
        var v = new BegunstigdeUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new BegunstigdeUpsertRequest(
            Naam: "",
            Relatie: "Dochter",
            Telefoon: null,
            Email: null,
            Adres: null,
            Postcode: null,
            Woonplaats: null,
            Omschrijving: null,
            Percentage: null,
            IsLegitiemePortie: false);
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void Begunstigde_PercentageBuijenRange_Fails()
    {
        var v = new BegunstigdeUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new BegunstigdeUpsertRequest(
            Naam: "Jan",
            Relatie: "Broer",
            Telefoon: null,
            Email: null,
            Adres: null,
            Postcode: null,
            Woonplaats: null,
            Omschrijving: null,
            Percentage: 150m,
            IsLegitiemePortie: false);
        Assert.False(v.Validate(req).IsValid);
    }
}

public class ExecuteurValidatorTests
{
    [Fact]
    public void Executeur_Valid_Passes()
    {
        var v = new ExecuteurUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new ExecuteurUpsertRequest(
            Naam: "Mevrouw Janssen",
            Relatie: "Advocaat",
            Telefoon: null,
            Email: null,
            Adres: null,
            Postcode: null,
            Woonplaats: null,
            Bevoegdheden: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Executeur_LegeNaam_Fails()
    {
        var v = new ExecuteurUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new ExecuteurUpsertRequest(
            Naam: "",
            Relatie: null,
            Telefoon: null,
            Email: null,
            Adres: null,
            Postcode: null,
            Woonplaats: null,
            Bevoegdheden: null);
        Assert.False(v.Validate(req).IsValid);
    }
}

// ─── Uitvaart Validators ──────────────────────────────────────────────────────

public class UitvaartWensenValidatorTests
{
    [Fact]
    public void Uitvaart_ValidType_Passes()
    {
        var v = new UitvaartWensenUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new UitvaartWensenUpsertRequest(
            VoorkeurType: "Crematie",
            Begraafplaats: null,
            UitvaartOndernemer: null,
            UitvaartOndernemerTelefoon: null,
            UitvaartOndernemerEmail: null,
            UitvaartOndernemerAdres: null,
            UitvaartOndernemerPostcode: null,
            UitvaartOndernemerPlaats: null,
            HeeftUitvaartVerzekering: false,
            UitvaartVerzekeringDetails: null,
            CeremonieSoort: null,
            CeremonieLocatie: null,
            Muziekwensen: null,
            Sprekers: null,
            Bloemen: null,
            Kledingwensen: null,
            RouwkaartTekst: null,
            RouwadvertentieTekst: null,
            Condoleance: null,
            OverigeWensen: null,
            VoorkeurBegraafplaatsNaam: null,
            VoorkeurBegraafplaatsAdres: null,
            VoorkeurCrematoriumnaam: null,
            VoorkeurCrematoriumAdres: null,
            VoorkeurAulaNaam: null,
            VoorkeurAulaAdres: null,
            BudgetRichting: null,
            DatumOpgesteld: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Uitvaart_OngeldigType_Fails()
    {
        var v = new UitvaartWensenUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new UitvaartWensenUpsertRequest(
            VoorkeurType: "Verbranden",  // not in allowed set
            Begraafplaats: null,
            UitvaartOndernemer: null,
            UitvaartOndernemerTelefoon: null,
            UitvaartOndernemerEmail: null,
            UitvaartOndernemerAdres: null,
            UitvaartOndernemerPostcode: null,
            UitvaartOndernemerPlaats: null,
            HeeftUitvaartVerzekering: false,
            UitvaartVerzekeringDetails: null,
            CeremonieSoort: null,
            CeremonieLocatie: null,
            Muziekwensen: null,
            Sprekers: null,
            Bloemen: null,
            Kledingwensen: null,
            RouwkaartTekst: null,
            RouwadvertentieTekst: null,
            Condoleance: null,
            OverigeWensen: null,
            VoorkeurBegraafplaatsNaam: null,
            VoorkeurBegraafplaatsAdres: null,
            VoorkeurCrematoriumnaam: null,
            VoorkeurCrematoriumAdres: null,
            VoorkeurAulaNaam: null,
            VoorkeurAulaAdres: null,
            BudgetRichting: null,
            DatumOpgesteld: null);
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void Uitvaart_OngeldigBudget_Fails()
    {
        var v = new UitvaartWensenUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new UitvaartWensenUpsertRequest(
            VoorkeurType: "Begrafenis",
            Begraafplaats: null,
            UitvaartOndernemer: null,
            UitvaartOndernemerTelefoon: null,
            UitvaartOndernemerEmail: null,
            UitvaartOndernemerAdres: null,
            UitvaartOndernemerPostcode: null,
            UitvaartOndernemerPlaats: null,
            HeeftUitvaartVerzekering: false,
            UitvaartVerzekeringDetails: null,
            CeremonieSoort: null,
            CeremonieLocatie: null,
            Muziekwensen: null,
            Sprekers: null,
            Bloemen: null,
            Kledingwensen: null,
            RouwkaartTekst: null,
            RouwadvertentieTekst: null,
            Condoleance: null,
            OverigeWensen: null,
            VoorkeurBegraafplaatsNaam: null,
            VoorkeurBegraafplaatsAdres: null,
            VoorkeurCrematoriumnaam: null,
            VoorkeurCrematoriumAdres: null,
            VoorkeurAulaNaam: null,
            VoorkeurAulaAdres: null,
            BudgetRichting: "Onbekend",  // invalid budget
            DatumOpgesteld: null);
        Assert.False(v.Validate(req).IsValid);
    }
}

public class CeremonieDetailValidatorTests
{
    [Fact]
    public void Ceremonie_Valid_Passes()
    {
        var v = new CeremonieDetailUpsertRequestValidator(Opts.Lengtes);
        var req = new CeremonieDetailUpsertRequest(
            Onderdeel: "Welkomstwoord",
            Beschrijving: null,
            Volgorde: 1,
            Muziek: null,
            Spreker: null,
            Tekstlezing: null,
            Dresscode: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Ceremonie_LeegOnderdeel_Fails()
    {
        var v = new CeremonieDetailUpsertRequestValidator(Opts.Lengtes);
        var req = new CeremonieDetailUpsertRequest(
            Onderdeel: "",
            Beschrijving: null,
            Volgorde: 1,
            Muziek: null,
            Spreker: null,
            Tekstlezing: null,
            Dresscode: null);
        Assert.False(v.Validate(req).IsValid);
    }
}

public class UitvaartGenodigdeValidatorTests
{
    [Fact]
    public void Genodigde_Valid_Passes()
    {
        var v = new UitvaartGenodigdeUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new UitvaartGenodigdeUpsertRequest(
            Naam: "Piet de Hoorn",
            Relatie: "Vriend",
            Telefoon: null,
            Email: null,
            Adres: null,
            Postcode: null,
            Woonplaats: null,
            Notities: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Genodigde_LegeNaam_Fails()
    {
        var v = new UitvaartGenodigdeUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new UitvaartGenodigdeUpsertRequest(
            Naam: "",
            Relatie: null,
            Telefoon: null,
            Email: null,
            Adres: null,
            Postcode: null,
            Woonplaats: null,
            Notities: null);
        Assert.False(v.Validate(req).IsValid);
    }
}

// ─── Wilsverklaring Validators ────────────────────────────────────────────────

public class WilsverklaringValidatorTests
{
    [Fact]
    public void Wilsverklaring_Valid_Passes()
    {
        var v = new WilsverklaringUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new WilsverklaringUpsertRequest(
            DatumOndertekening: DateOnly.FromDateTime(DateTime.Today),
            WilEuthanasie: true,
            SituatieBeschrijving: null,
            Huisarts: "Dr. A. Bakker",
            HuisartsPraktijk: null,
            HuisartsTelefoon: null,
            HuisartsEmail: null,
            VertegenwoordigerNaam: null,
            VertegenwoordigerRelatie: null,
            VertegenwoordigerTelefoon: null,
            VertegenwoordigerEmail: null,
            VertegenwoordigerAdres: null,
            VertegenwoordigerPostcode: null,
            VertegenwoordigerWoonplaats: null,
            AanvullendeWensen: null,
            DementieClausule: false,
            DementieClausuleToelichting: null,
            BehandelVerbod: null,
            Vertegenwoordiger2Naam: null,
            Vertegenwoordiger2Relatie: null,
            Vertegenwoordiger2Telefoon: null,
            Vertegenwoordiger2Email: null,
            SituatieOpties: null,
            SituatieNotitie: null);
        Assert.True(v.Validate(req).IsValid);
    }

    [Fact]
    public void Wilsverklaring_DatumInToekomst_Fails()
    {
        var v = new WilsverklaringUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new WilsverklaringUpsertRequest(
            DatumOndertekening: DateOnly.FromDateTime(DateTime.Today.AddDays(5)),
            WilEuthanasie: false,
            SituatieBeschrijving: null,
            Huisarts: null,
            HuisartsPraktijk: null,
            HuisartsTelefoon: null,
            HuisartsEmail: null,
            VertegenwoordigerNaam: null,
            VertegenwoordigerRelatie: null,
            VertegenwoordigerTelefoon: null,
            VertegenwoordigerEmail: null,
            VertegenwoordigerAdres: null,
            VertegenwoordigerPostcode: null,
            VertegenwoordigerWoonplaats: null,
            AanvullendeWensen: null,
            DementieClausule: false,
            DementieClausuleToelichting: null,
            BehandelVerbod: null,
            Vertegenwoordiger2Naam: null,
            Vertegenwoordiger2Relatie: null,
            Vertegenwoordiger2Telefoon: null,
            Vertegenwoordiger2Email: null,
            SituatieOpties: null,
            SituatieNotitie: null);
        Assert.False(v.Validate(req).IsValid);
    }

    [Fact]
    public void Wilsverklaring_OngeldigHuisartsEmail_Fails()
    {
        var v = new WilsverklaringUpsertRequestValidator(Opts.Lengtes, Opts.Validatie);
        var req = new WilsverklaringUpsertRequest(
            DatumOndertekening: null,
            WilEuthanasie: false,
            SituatieBeschrijving: null,
            Huisarts: null,
            HuisartsPraktijk: null,
            HuisartsTelefoon: null,
            HuisartsEmail: "geen-email",
            VertegenwoordigerNaam: null,
            VertegenwoordigerRelatie: null,
            VertegenwoordigerTelefoon: null,
            VertegenwoordigerEmail: null,
            VertegenwoordigerAdres: null,
            VertegenwoordigerPostcode: null,
            VertegenwoordigerWoonplaats: null,
            AanvullendeWensen: null,
            DementieClausule: false,
            DementieClausuleToelichting: null,
            BehandelVerbod: null,
            Vertegenwoordiger2Naam: null,
            Vertegenwoordiger2Relatie: null,
            Vertegenwoordiger2Telefoon: null,
            Vertegenwoordiger2Email: null,
            SituatieOpties: null,
            SituatieNotitie: null);
        Assert.False(v.Validate(req).IsValid);
    }
}
