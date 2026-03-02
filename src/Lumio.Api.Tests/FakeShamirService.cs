using Lumio.Api.Services.Security;

namespace Lumio.Api.Tests;

/// <summary>
/// In-memory fake for <see cref="IShamirService"/> for use in controller unit tests.
/// Returns configurable shares or a predictable default set.
/// </summary>
public sealed class FakeShamirService : IShamirService
{
    /// <summary>Override to control what GenerateShares returns. Auto-generated when null.</summary>
    public ShamirResult? GenerateResult { get; set; }

    public ShamirResult GenerateShares(string secret, int totalShares, int threshold)
    {
        if (GenerateResult is not null) return GenerateResult;

        var shares = Enumerable.Range(1, totalShares)
            .Select(i => new ShamirShare(i, $"fake-share-{i}"))
            .ToList();
        return new ShamirResult(shares, threshold, totalShares);
    }

    public string ReconstructSecret(IEnumerable<string> shares) => "reconstructed-fake-secret";
}
