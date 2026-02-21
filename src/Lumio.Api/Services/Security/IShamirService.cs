namespace Lumio.Api.Services.Security;

public record ShamirShare(int Index, string Value);
public record ShamirResult(List<ShamirShare> Shares, int Threshold, int TotalShares);

public interface IShamirService
{
    ShamirResult GenerateShares(string secret, int totalShares, int threshold);
    string ReconstructSecret(IEnumerable<string> shares);
}
