using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services.Security;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Tests.Services;

/// <summary>
/// Unit tests for ShamirService (SP-8-001 — coverage gate ≥70%).
/// Uses SecretSharingDotNet under the hood; tests verify integration correctness.
/// </summary>
public class ShamirServiceTests
{
    private static ShamirService Create(int minDrempel = 2)
    {
        var opts = Options.Create(new LimietenOptions { ShamirMinDrempel = minDrempel });
        return new ShamirService(opts);
    }

    // ── GenerateShares ──────────────────────────────────────────────────

    [Fact]
    public void GenerateShares_ReturnsCorrectShareCount()
    {
        var svc = Create();

        var result = svc.GenerateShares("mijn-geheim", totalShares: 5, threshold: 3);

        Assert.Equal(5, result.Shares.Count);
    }

    [Fact]
    public void GenerateShares_RecordsThresholdAndTotal()
    {
        var svc = Create();

        var result = svc.GenerateShares("test-secret-123", totalShares: 3, threshold: 2);

        Assert.Equal(2, result.Threshold);
        Assert.Equal(3, result.TotalShares);
    }

    [Fact]
    public void GenerateShares_SharesHaveSequentialIndexes()
    {
        var svc = Create();

        var result = svc.GenerateShares("abc", totalShares: 4, threshold: 2);

        var indexes = result.Shares.Select(s => s.Index).OrderBy(i => i).ToList();
        Assert.Equal([1, 2, 3, 4], indexes);
    }

    [Fact]
    public void GenerateShares_SharesAreNonEmpty()
    {
        var svc = Create();

        var result = svc.GenerateShares("geheim-waarde", totalShares: 3, threshold: 2);

        Assert.All(result.Shares, s => Assert.False(string.IsNullOrWhiteSpace(s.Value)));
    }

    [Fact]
    public void GenerateShares_ThrowsWhenThresholdBelowMinimum()
    {
        var svc = Create(minDrempel: 2);

        var ex = Assert.Throws<ArgumentException>(() =>
            svc.GenerateShares("secret", totalShares: 3, threshold: 1));

        Assert.Equal("threshold", ex.ParamName);
    }

    [Fact]
    public void GenerateShares_ThrowsWhenTotalSharesLessThanThreshold()
    {
        var svc = Create();

        var ex = Assert.Throws<ArgumentException>(() =>
            svc.GenerateShares("secret", totalShares: 2, threshold: 3));

        Assert.Equal("totalShares", ex.ParamName);
    }

    [Fact]
    public void GenerateShares_ThresholdEqualsTotal_IsValid()
    {
        var svc = Create();

        // 2-of-2: minimum valid scenario
        var result = svc.GenerateShares("gelijk", totalShares: 2, threshold: 2);

        Assert.Equal(2, result.Shares.Count);
    }

    // ── ReconstructSecret ───────────────────────────────────────────────

    [Fact]
    public void ReconstructSecret_RoundTrips_MinimumShares()
    {
        var svc = Create();
        const string original = "mijn-masterpassword";

        var generated = svc.GenerateShares(original, totalShares: 3, threshold: 2);

        // Use exactly the threshold number of shares (first 2 of 3)
        var subset = generated.Shares.Take(2).Select(s => s.Value);
        var reconstructed = svc.ReconstructSecret(subset);

        Assert.Equal(original, reconstructed);
    }

    [Fact]
    public void ReconstructSecret_RoundTrips_AllShares()
    {
        var svc = Create();
        const string original = "volledig-geheim-abc-123";

        var generated = svc.GenerateShares(original, totalShares: 5, threshold: 3);

        // Use all 5 shares — should still reconstruct correctly
        var allShares = generated.Shares.Select(s => s.Value);
        var reconstructed = svc.ReconstructSecret(allShares);

        Assert.Equal(original, reconstructed);
    }

    [Fact]
    public void ReconstructSecret_DifferentSubsets_ProduceSameSecret()
    {
        var svc = Create();
        const string original = "subset-test";

        var generated = svc.GenerateShares(original, totalShares: 5, threshold: 3);
        var shares = generated.Shares.Select(s => s.Value).ToList();

        var r1 = svc.ReconstructSecret(shares.Take(3));
        var r2 = svc.ReconstructSecret(shares.Skip(2).Take(3));

        Assert.Equal(original, r1);
        Assert.Equal(original, r2);
    }

    [Fact]
    public void GenerateShares_UniqueShareValues()
    {
        var svc = Create();

        var result = svc.GenerateShares("distinct-test", totalShares: 5, threshold: 2);

        var values = result.Shares.Select(s => s.Value).ToList();
        Assert.Equal(values.Distinct().Count(), values.Count);
    }
}
