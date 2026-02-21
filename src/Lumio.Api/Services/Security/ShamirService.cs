using SecretSharingDotNet.Cryptography;
using SecretSharingDotNet.Cryptography.ShamirsSecretSharing;
using SecretSharingDotNet.Math;
using System.Numerics;

namespace Lumio.Api.Services.Security;

public class ShamirService : IShamirService
{
    public ShamirResult GenerateShares(string secret, int totalShares, int threshold)
    {
        if (threshold < 2)
            throw new ArgumentException("Drempel moet minimaal 2 zijn.", nameof(threshold));
        if (totalShares < threshold)
            throw new ArgumentException("Totaal aantal delen moet >= drempel zijn.", nameof(totalShares));

        var splitter = new SecretSplitter<BigInteger>();

        // Secret<BigInteger> has implicit conversion from string
        Secret<BigInteger> secretValue = secret;

        var shares = splitter.MakeShares(
            (BigInteger)threshold,
            (BigInteger)totalShares,
            secretValue);

        var result = new List<ShamirShare>();
        int index = 1;
        foreach (var share in shares)
        {
            result.Add(new ShamirShare(index++, share.ToString()));
        }

        return new ShamirResult(result, threshold, totalShares);
    }

    public string ReconstructSecret(IEnumerable<string> shares)
    {
        var gcd = new ExtendedEuclideanAlgorithm<BigInteger>();
        var reconstructor = new SecretReconstructor<BigInteger>(gcd);

        // Implicit conversion from string[] to Shares<BigInteger>
        Shares<BigInteger> sharesCollection = shares.ToArray();
        var secret = reconstructor.Reconstruction(sharesCollection);

        return secret.ToString();
    }
}
