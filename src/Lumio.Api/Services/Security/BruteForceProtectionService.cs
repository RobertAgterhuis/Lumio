using System.Collections.Concurrent;

namespace Lumio.Api.Services.Security;

/// <summary>
/// In-memory, thread-safe implementation of <see cref="IBruteForceProtectionService"/>.
///
/// Implements GAP-SEC-02: limits unlock attempts to <see cref="MaxFailedAttempts"/> (5)
/// within any <see cref="LockoutDuration"/> (15 minutes) window. After the lockout expires,
/// the state is reset automatically — no manual reset required.
///
/// Registered as a singleton so state persists across requests for the lifetime of the
/// API process. State is in-memory only; it does not survive API restarts.
/// </summary>
public sealed class BruteForceProtectionService : IBruteForceProtectionService
{
    /// <inheritdoc />
    public int MaxFailedAttempts => 5;

    /// <inheritdoc />
    public TimeSpan LockoutDuration => TimeSpan.FromMinutes(15);

    // Keyed by profileId (string)
    private readonly ConcurrentDictionary<string, ProfileAttemptState> _state = new(StringComparer.Ordinal);

    // Injectable for unit testing
    private readonly Func<DateTimeOffset> _now;

    public BruteForceProtectionService() : this(() => DateTimeOffset.UtcNow) { }

    /// <summary>Overload for unit testing — allows controlling the clock.</summary>
    public BruteForceProtectionService(Func<DateTimeOffset> nowFactory)
    {
        _now = nowFactory;
    }

    /// <inheritdoc />
    public bool IsLocked(string profileId)
    {
        if (!_state.TryGetValue(profileId, out var state)) return false;
        if (state.FailedAttempts < MaxFailedAttempts) return false;

        // Lockout expires automatically after LockoutDuration
        var lockoutExpiry = state.FirstFailureAt + LockoutDuration;
        if (_now() >= lockoutExpiry)
        {
            // Lockout expired — reset
            _state.TryRemove(profileId, out _);
            return false;
        }
        return true;
    }

    /// <inheritdoc />
    public TimeSpan? GetRemainingLockout(string profileId)
    {
        if (!_state.TryGetValue(profileId, out var state)) return null;
        if (state.FailedAttempts < MaxFailedAttempts) return null;

        var lockoutExpiry = state.FirstFailureAt + LockoutDuration;
        var remaining = lockoutExpiry - _now();
        return remaining > TimeSpan.Zero ? remaining : null;
    }

    /// <inheritdoc />
    public void RecordFailedAttempt(string profileId)
    {
        _state.AddOrUpdate(
            profileId,
            addValueFactory: _ => new ProfileAttemptState(FirstFailureAt: _now(), FailedAttempts: 1),
            updateValueFactory: (_, existing) =>
            {
                var lockoutExpiry = existing.FirstFailureAt + LockoutDuration;
                // If the window has expired: restart the counter.
                if (_now() >= lockoutExpiry)
                    return new ProfileAttemptState(FirstFailureAt: _now(), FailedAttempts: 1);

                return existing with { FailedAttempts = existing.FailedAttempts + 1 };
            });
    }

    /// <inheritdoc />
    public void RecordSuccess(string profileId)
    {
        _state.TryRemove(profileId, out _);
    }

    // ── Internal state ────────────────────────────────────────────────────────

    private record ProfileAttemptState(DateTimeOffset FirstFailureAt, int FailedAttempts);
}
