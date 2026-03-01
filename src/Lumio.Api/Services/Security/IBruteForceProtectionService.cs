namespace Lumio.Api.Services.Security;

/// <summary>
/// Tracks failed unlock attempts per profile and enforces a time-based lockout after
/// exceeding the maximum allowed failures (GAP-SEC-02 — brute-force bescherming).
/// </summary>
public interface IBruteForceProtectionService
{
    /// <summary>
    /// Checks whether the given profile is currently locked out due to too many
    /// failed unlock attempts.
    /// </summary>
    bool IsLocked(string profileId);

    /// <summary>
    /// Returns how long the lockout window still lasts for <paramref name="profileId"/>,
    /// or <c>null</c> when the profile is not locked.
    /// </summary>
    TimeSpan? GetRemainingLockout(string profileId);

    /// <summary>Records a failed unlock attempt for <paramref name="profileId"/>.</summary>
    void RecordFailedAttempt(string profileId);

    /// <summary>Clears the attempt counter after a successful unlock.</summary>
    void RecordSuccess(string profileId);

    /// <summary>Maximum allowed failures before a lockout is triggered.</summary>
    int MaxFailedAttempts { get; }

    /// <summary>Duration of the lockout window after <see cref="MaxFailedAttempts"/> failures.</summary>
    TimeSpan LockoutDuration { get; }
}
