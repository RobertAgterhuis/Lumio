namespace Lumio.Api.Dtos.DigitalEstate;

public record DigitaalAccountResponse(
    Guid Id,
    string PlatformNaam,
    string? Categorie,
    string? Gebruikersnaam,
    string? EmailAdres,
    string? Url,
    string GewensteActie,
    string? OverdrachtAan,
    string? Notities);

public record DigitaalAccountUpsertRequest(
    string PlatformNaam,
    string? Categorie,
    string? Gebruikersnaam,
    string? EmailAdres,
    string? Url,
    string GewensteActie,
    string? OverdrachtAan,
    string? Notities);

public record WachtwoordEntryResponse(
    Guid Id,
    string Naam,
    string? Gebruikersnaam,
    string? Url,
    string? Notities);

public record WachtwoordEntryCreateRequest(
    string Naam,
    string? Gebruikersnaam,
    string Wachtwoord,
    string? Url,
    string? Notities);

public record WachtwoordEntryUpdateRequest(
    string Naam,
    string? Gebruikersnaam,
    string? NieuwWachtwoord,
    string? Url,
    string? Notities);

public record WachtwoordOntsluitelResponse(
    Guid Id,
    string Naam,
    string? Gebruikersnaam,
    string Wachtwoord,
    string? Url,
    string? Notities);

public record CryptoWalletResponse(
    Guid Id,
    string WalletNaam,
    string CryptoType,
    string? WalletAdres,
    string? Exchange,
    string? Notities);

public record CryptoWalletOntsluitelResponse(
    Guid Id,
    string WalletNaam,
    string CryptoType,
    string? SeedPhrase,
    string? WalletAdres);

public record CryptoWalletUpsertRequest(
    string WalletNaam,
    string CryptoType,
    string? WalletAdres,
    string? SeedPhrase,
    string? Exchange,
    string? Notities);
