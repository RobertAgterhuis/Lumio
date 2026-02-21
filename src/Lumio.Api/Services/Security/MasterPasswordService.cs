using Microsoft.Data.Sqlite;

namespace Lumio.Api.Services.Security;

public class MasterPasswordService : IMasterPasswordService
{
    private readonly IProfileService _profileService;
    private string? _currentPassword;

    public bool IsUnlocked => _currentPassword != null;
    public bool IsFirstRun => _profileService.ActiveProfile == null
        ? _profileService.IsFirstRun
        : !_profileService.ActiveProfileDbExists;
    public string? CurrentPassword => _currentPassword;
    public string? ActiveDbPath => _profileService.ActiveDbPath;

    public MasterPasswordService(IProfileService profileService)
    {
        _profileService = profileService;
    }

    public async Task<bool> UnlockAsync(string password)
    {
        var dbPath = _profileService.ActiveDbPath
            ?? throw new InvalidOperationException("Geen profiel geselecteerd.");

        var connStr = new SqliteConnectionStringBuilder
        {
            DataSource = dbPath,
            Mode = SqliteOpenMode.ReadWrite,
            Password = password
        }.ToString();

        using var conn = new SqliteConnection(connStr);
        try
        {
            await conn.OpenAsync();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT count(*) FROM sqlite_master;";
            await cmd.ExecuteScalarAsync();
            _currentPassword = password;
            return true;
        }
        catch
        {
            return false;
        }
    }

    public Task SetupAsync(string password)
    {
        if (!IsFirstRun)
            throw new InvalidOperationException("Database bestaat al. Gebruik ontgrendel in plaats van setup.");

        _currentPassword = password;
        return Task.CompletedTask;
    }

    public void Lock()
    {
        _currentPassword = null;
    }

    public async Task ChangePasswordAsync(string currentPassword, string newPassword)
    {
        if (!IsUnlocked)
            throw new InvalidOperationException("Database is niet ontgrendeld.");

        var dbPath = _profileService.ActiveDbPath
            ?? throw new InvalidOperationException("Geen profiel geselecteerd.");

        var connStr = new SqliteConnectionStringBuilder
        {
            DataSource = dbPath,
            Mode = SqliteOpenMode.ReadWrite,
            Password = currentPassword
        }.ToString();

        using var conn = new SqliteConnection(connStr);
        await conn.OpenAsync();

        // Use parameterized quote() to safely escape the password for PRAGMA rekey
        using var quoteCmd = conn.CreateCommand();
        quoteCmd.CommandText = "SELECT quote($pw)";
        quoteCmd.Parameters.AddWithValue("$pw", newPassword);
        var quoted = (string?)await quoteCmd.ExecuteScalarAsync();

        using var rekeyCmd = conn.CreateCommand();
        rekeyCmd.CommandText = $"PRAGMA rekey = {quoted}";
        await rekeyCmd.ExecuteNonQueryAsync();

        _currentPassword = newPassword;
    }
}
