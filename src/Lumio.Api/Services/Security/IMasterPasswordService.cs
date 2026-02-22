namespace Lumio.Api.Services.Security;

public interface IMasterPasswordService
{
    bool IsUnlocked { get; }
    bool IsFirstRun { get; }
    bool IsReadOnly { get; }
    string? CurrentPassword { get; }
    string? ActiveDbPath { get; }
    Task<bool> UnlockAsync(string password);
    Task SetupAsync(string password);
    void Lock();
    void SetReadOnly(bool readOnly);
    Task ChangePasswordAsync(string currentPassword, string newPassword);
}
