namespace Lumio.Api.Dtos.Auth;

public record SetupRequest(string Wachtwoord);
public record OntgrendelRequest(string Wachtwoord);
public record WachtwoordWijzigenRequest(string HuidigWachtwoord, string NieuwWachtwoord);
public record OntgrendelErfgenaamRequest(List<string> Shares);

public record AuthStatusResponse(bool IsOntgrendeld, bool IsEersteKeer);
