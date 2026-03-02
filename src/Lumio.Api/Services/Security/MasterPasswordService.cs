using System.Security.Cryptography;
using System.Text;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Logging;

namespace Lumio.Api.Services.Security;

public class MasterPasswordService : IMasterPasswordService
{
    private readonly IProfileService _profileService;
    private readonly ISqlCipherKdfService _kdfService;
    private readonly ILogger<MasterPasswordService> _logger;
    // Stored as UTF-8 bytes so the buffer can be zeroed on Lock() via ZeroMemory.
    // Never expose as string — use UsePassword() for scoped access.
    private byte[]? _currentPasswordBytes;
    private bool _isReadOnly;

    public bool IsUnlocked => _currentPasswordBytes != null;
    public bool IsFirstRun => _profileService.ActiveProfile == null
        ? _profileService.IsFirstRun
        : !_profileService.ActiveProfileDbExists;
    public bool IsReadOnly => _isReadOnly;
    public string? ActiveDbPath => _profileService.ActiveDbPath;

    public MasterPasswordService(IProfileService profileService, ISqlCipherKdfService kdfService, ILogger<MasterPasswordService> logger)
    {
        _profileService = profileService;
        _kdfService = kdfService;
        _logger = logger;
    }

    public void UsePassword(PasswordConsumer use)
    {
        if (_currentPasswordBytes is null)
            throw new InvalidOperationException("Database is niet ontgrendeld.");
        use(_currentPasswordBytes);
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
            _currentPasswordBytes = Encoding.UTF8.GetBytes(password);

        // GAP-SEC-01: Ensure the database uses target KDF (PBKDF2-SHA512 ≥310 000 iterations).
        // Runs after every successful unlock — is a no-op when the DB already meets the target.
        // `dbPath` is already declared (non-null) above this try-block.
        try
        {
            await ExecuteKdfMigrationAsync(dbPath, password);
        }
        catch (Exception kdfEx)
        {
            // KDF migration failure must never prevent unlock — log for operator observability.
            // The database is still accessible; migration will be retried on next unlock.
            _logger.LogWarning(kdfEx, "KDF-migratie mislukt voor {DbPath}", dbPath);
        }

        return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> VerifyPasswordAsync(string password)
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

        _currentPasswordBytes = Encoding.UTF8.GetBytes(password);
        return Task.CompletedTask;
    }

    /// <summary>
    /// Executes KDF migration. Protected virtual to allow overriding in unit tests
    /// without requiring a real SQLCipher database connection.
    /// </summary>
    protected virtual Task ExecuteKdfMigrationAsync(string dbPath, string password)
        => _kdfService.EnsureTargetKdfAsync(dbPath, password);

    public void Lock()
    {
        if (_currentPasswordBytes is not null)
        {
            CryptographicOperations.ZeroMemory(_currentPasswordBytes);
            _currentPasswordBytes = null;
        }
        _isReadOnly = false;
    }

    public void SetReadOnly(bool readOnly)
    {
        _isReadOnly = readOnly;
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

        if (_currentPasswordBytes is not null)
            CryptographicOperations.ZeroMemory(_currentPasswordBytes);
        _currentPasswordBytes = Encoding.UTF8.GetBytes(newPassword);
    }
}
