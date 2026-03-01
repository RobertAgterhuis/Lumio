using Lumio.Api.Services.Security;

namespace Lumio.Api.Tests.Services;

/// <summary>
/// Unit tests for <see cref="BruteForceProtectionService"/> — GAP-SEC-02.
///
/// AC: Rate limiting actief op unlock-endpoint (max 5 pogingen).
/// AC: Lockout mechanisme actief (15 min window na 5 foute pogingen).
/// AC: Geen impact op UX bij normaal gebruik.
/// </summary>
public class BruteForceProtectionServiceTests
{
    private const string ProfileId = "profiel-a";
    private const string OtherProfileId = "profiel-b";

    // ── MaxFailedAttempts ─────────────────────────────────────────────────────

    [Fact]
    public void MaxFailedAttempts_Is5()
    {
        var svc = CreateSvc();
        Assert.Equal(5, svc.MaxFailedAttempts);
    }

    [Fact]
    public void LockoutDuration_Is15Minutes()
    {
        var svc = CreateSvc();
        Assert.Equal(TimeSpan.FromMinutes(15), svc.LockoutDuration);
    }

    // ── IsLocked — normal usage ───────────────────────────────────────────────

    [Fact]
    public void IsLocked_NoAttempts_ReturnsFalse()
    {
        var svc = CreateSvc();
        Assert.False(svc.IsLocked(ProfileId));
    }

    [Theory]
    [InlineData(1)]
    [InlineData(3)]
    [InlineData(4)]
    public void IsLocked_BelowThreshold_ReturnsFalse(int failCount)
    {
        var svc = CreateSvc();
        for (var i = 0; i < failCount; i++)
            svc.RecordFailedAttempt(ProfileId);

        Assert.False(svc.IsLocked(ProfileId));
    }

    [Fact]
    public void IsLocked_ExactlyAtThreshold_ReturnsTrue()
    {
        var svc = CreateSvc();
        for (var i = 0; i < 5; i++)
            svc.RecordFailedAttempt(ProfileId);

        Assert.True(svc.IsLocked(ProfileId));
    }

    [Fact]
    public void IsLocked_AboveThreshold_ReturnsTrue()
    {
        var svc = CreateSvc();
        for (var i = 0; i < 8; i++)
            svc.RecordFailedAttempt(ProfileId);

        Assert.True(svc.IsLocked(ProfileId));
    }

    // ── Lockout expires after LockoutDuration ─────────────────────────────────

    [Fact]
    public void IsLocked_AfterLockoutExpiry_ReturnsFalse()
    {
        var fakeNow = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
        var svc = CreateSvc(() => fakeNow);

        for (var i = 0; i < 5; i++)
            svc.RecordFailedAttempt(ProfileId);

        Assert.True(svc.IsLocked(ProfileId));

        // Advance clock past 15-minute lockout window
        fakeNow = fakeNow.AddMinutes(16);

        Assert.False(svc.IsLocked(ProfileId), "Lockout moet verlopen zijn na 16 minuten.");
    }

    [Fact]
    public void GetRemainingLockout_DuringLockout_ReturnsPositiveTimeSpan()
    {
        var fakeNow = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
        var svc = CreateSvc(() => fakeNow);

        for (var i = 0; i < 5; i++)
            svc.RecordFailedAttempt(ProfileId);

        // Advance by 5 minutes (10 minutes remaining)
        fakeNow = fakeNow.AddMinutes(5);

        var remaining = svc.GetRemainingLockout(ProfileId);
        Assert.NotNull(remaining);
        Assert.True(remaining!.Value.TotalMinutes is > 9 and <= 10,
            $"Resterende lockout: {remaining.Value.TotalMinutes:F1} min — verwacht ~10 min.");
    }

    [Fact]
    public void GetRemainingLockout_NoBreach_ReturnsNull()
    {
        var svc = CreateSvc();
        svc.RecordFailedAttempt(ProfileId);

        Assert.Null(svc.GetRemainingLockout(ProfileId));
    }

    // ── RecordSuccess resets counter ──────────────────────────────────────────

    [Fact]
    public void RecordSuccess_AfterFailures_UnlocksProfile()
    {
        var svc = CreateSvc();
        for (var i = 0; i < 5; i++)
            svc.RecordFailedAttempt(ProfileId);

        Assert.True(svc.IsLocked(ProfileId));

        svc.RecordSuccess(ProfileId);

        Assert.False(svc.IsLocked(ProfileId), "Na succesvolle unlock mogen geen pogingen meer tellen.");
    }

    [Fact]
    public void RecordSuccess_WithNoFailures_DoesNotThrow()
    {
        var svc = CreateSvc();
        // Should not throw when there is no state to clear
        svc.RecordSuccess(ProfileId);
        Assert.False(svc.IsLocked(ProfileId));
    }

    // ── Profile isolation ─────────────────────────────────────────────────────

    [Fact]
    public void Lockout_IsPerProfile_DoesNotAffectOtherProfiles()
    {
        var svc = CreateSvc();
        for (var i = 0; i < 5; i++)
            svc.RecordFailedAttempt(ProfileId);

        Assert.True(svc.IsLocked(ProfileId));
        Assert.False(svc.IsLocked(OtherProfileId), "Lockout van profiel A mag profiel B niet raken.");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static BruteForceProtectionService CreateSvc(
        Func<DateTimeOffset>? now = null) =>
        now is null
            ? new BruteForceProtectionService()
            : new BruteForceProtectionService(now);
}
