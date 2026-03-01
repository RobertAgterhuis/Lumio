using Lumio.Api.Services.Security;

namespace Lumio.Api.Tests;

/// <summary>
/// Configurable fake for <see cref="IMasterPasswordService"/> for use in controller unit tests.
/// </summary>
public sealed class FakeMasterPasswordService : IMasterPasswordService
{
    public bool IsUnlocked { get; set; } = true;
    public bool IsFirstRun { get; set; } = false;
    public bool IsReadOnly { get; set; } = false;
    public string? ActiveDbPath { get; set; } = null;

    /// <summary>Controls what <see cref="VerifyPasswordAsync"/> returns.</summary>
    public bool VerifyResult { get; set; } = true;

    /// <summary>Set to true after <see cref="Lock"/> is called.</summary>
    public bool WasLocked { get; private set; }

    public void UsePassword(PasswordConsumer use) =>
        throw new NotSupportedException("UsePassword not supported in fake.");

    public Task<bool> UnlockAsync(string password) => Task.FromResult(true);

    public Task<bool> VerifyPasswordAsync(string password) => Task.FromResult(VerifyResult);

    public Task SetupAsync(string password) => Task.CompletedTask;

    public void Lock()
    {
        WasLocked = true;
        IsUnlocked = false;
    }

    public void SetReadOnly(bool readOnly) => IsReadOnly = readOnly;

    public Task ChangePasswordAsync(string currentPassword, string newPassword) => Task.CompletedTask;
}
