namespace Lumio.Api.Services.Security;

/// <summary>
/// Callback delegate used to consume the master-password bytes in a scoped, synchronous context.
/// The <see cref="ReadOnlySpan{T}"/> is only valid for the duration of the callback — callers
/// must NOT store a reference to the span beyond the callback invocation.
/// </summary>
public delegate void PasswordConsumer(ReadOnlySpan<byte> passwordBytes);

public interface IMasterPasswordService
{
    bool IsUnlocked { get; }
    bool IsFirstRun { get; }
    bool IsReadOnly { get; }
    string? ActiveDbPath { get; }

    /// <summary>
    /// Provides scoped, synchronous access to the master-password bytes without exposing them
    /// as a heap-allocated managed string. The bytes are valid only during the callback.
    /// Throws <see cref="InvalidOperationException"/> when the service is not unlocked.
    /// </summary>
    void UsePassword(PasswordConsumer use);

    Task<bool> UnlockAsync(string password);

    /// <summary>
    /// Verifies that <paramref name="password"/> matches the database key without
    /// side-effects: does not update the in-memory password buffer.
    /// Use this for re-authentication checks (e.g. before destructive operations)
    /// when the database is already unlocked.
    /// </summary>
    Task<bool> VerifyPasswordAsync(string password);

    Task SetupAsync(string password);
    void Lock();
    void SetReadOnly(bool readOnly);
    Task ChangePasswordAsync(string currentPassword, string newPassword);
}
