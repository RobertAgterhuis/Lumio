namespace Lumio.Api.Dtos.Shamir;

public record GenereerSharesRequest(string Wachtwoord, int AantalDelen, int Drempel);

public record GenereerSharesResponse(
    List<ShareInfo> Delen,
    int Drempel,
    int TotaalAantalDelen);

public record ShareInfo(int Index, string Waarde);

public record ReconstrueerRequest(List<string> Delen);
