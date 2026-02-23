using System.Text.Json;
using Lumio.Api.Domain.Common;
using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Services.Security;

public class ProfileService : IProfileService
{
    private readonly string _dataDir;
    private readonly string _profilesPath;
    private readonly object _lock = new();
    private readonly int _maxProfielen;
    private List<Profile> _profiles;
    private Profile? _activeProfile;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ProfileService(IConfiguration config, IOptions<LimietenOptions> limieten)
    {
        _dataDir = config["DataDir"]
            ?? throw new InvalidOperationException("DataDir is not configured.");
        _profilesPath = Path.Combine(_dataDir, "profiles.json");
        _maxProfielen = limieten.Value.MaxProfielen;
        _profiles = LoadProfiles();

        // Migration: if no profiles.json exists but lumio.db does, create a default profile
        MigrateExistingDatabase();
    }

    public List<Profile> GetProfiles()
    {
        lock (_lock) return [.. _profiles];
    }

    public Profile? GetProfile(Guid id)
    {
        lock (_lock) return _profiles.FirstOrDefault(p => p.Id == id);
    }

    public Profile? ActiveProfile
    {
        get { lock (_lock) return _activeProfile; }
    }

    public string? ActiveDbPath
    {
        get
        {
            lock (_lock)
            {
                if (_activeProfile == null) return null;
                return Path.GetFullPath(Path.Combine(_dataDir, _activeProfile.DbBestand));
            }
        }
    }

    public string? ActiveSaltPath
    {
        get
        {
            var dbPath = ActiveDbPath;
            return dbPath == null ? null : Path.ChangeExtension(dbPath, ".salt");
        }
    }

    public bool IsFirstRun
    {
        get { lock (_lock) return _profiles.Count == 0; }
    }

    public bool ActiveProfileDbExists
    {
        get
        {
            var path = ActiveDbPath;
            return path != null && File.Exists(path);
        }
    }

    public void SelectProfile(Guid profileId)
    {
        lock (_lock)
        {
            var profile = _profiles.FirstOrDefault(p => p.Id == profileId)
                ?? throw new InvalidOperationException("Profiel niet gevonden.");
            _activeProfile = profile;
        }
    }

    public void DeselectProfile()
    {
        lock (_lock) _activeProfile = null;
    }

    public Profile CreateProfile(string naam, string relatie)
    {
        lock (_lock)
        {
            if (_profiles.Count >= _maxProfielen)
                throw new InvalidOperationException($"Maximaal {_maxProfielen} profielen toegestaan.");

            var isPrimary = _profiles.Count == 0;
            var profile = new Profile
            {
                Id = Guid.NewGuid(),
                Naam = naam,
                Relatie = isPrimary ? "Primair" : relatie,
                IsPrimair = isPrimary,
                AangemaaktOp = DateTime.UtcNow
            };
            profile.DbBestand = $"{profile.Id}.db";

            _profiles.Add(profile);
            SaveProfiles();
            return profile;
        }
    }

    public void DeleteProfile(Guid profileId)
    {
        lock (_lock)
        {
            var profile = _profiles.FirstOrDefault(p => p.Id == profileId)
                ?? throw new InvalidOperationException("Profiel niet gevonden.");

            if (profile.IsPrimair && _profiles.Count > 1)
                throw new InvalidOperationException("Primair profiel kan niet worden verwijderd zolang er andere profielen bestaan.");

            // Delete database and salt files
            var dbPath = Path.GetFullPath(Path.Combine(_dataDir, profile.DbBestand));
            var saltPath = Path.ChangeExtension(dbPath, ".salt");

            if (File.Exists(dbPath)) File.Delete(dbPath);
            if (File.Exists(saltPath)) File.Delete(saltPath);

            _profiles.Remove(profile);

            if (_activeProfile?.Id == profileId)
                _activeProfile = null;

            SaveProfiles();
        }
    }

    public void UpdateActiveProfileThumbnail(string? base64Thumbnail)
    {
        lock (_lock)
        {
            if (_activeProfile == null) return;
            _activeProfile.FotoThumbnail = base64Thumbnail;
            SaveProfiles();
        }
    }

    private List<Profile> LoadProfiles()
    {
        if (!File.Exists(_profilesPath))
            return [];

        try
        {
            var json = File.ReadAllText(_profilesPath);
            return JsonSerializer.Deserialize<List<Profile>>(json, JsonOptions) ?? [];
        }
        catch
        {
            return [];
        }
    }

    private void SaveProfiles()
    {
        var json = JsonSerializer.Serialize(_profiles, JsonOptions);
        File.WriteAllText(_profilesPath, json);
    }

    /// <summary>
    /// If there's an existing lumio.db but no profiles.json, migrate to the profile system
    /// by creating a default "Primair" profile pointing to the existing database.
    /// </summary>
    private void MigrateExistingDatabase()
    {
        lock (_lock)
        {
            if (_profiles.Count > 0) return;

            var legacyDbPath = Path.Combine(_dataDir, "lumio.db");
            if (!File.Exists(legacyDbPath)) return;

            // Create a default profile
            var profile = new Profile
            {
                Id = Guid.NewGuid(),
                Naam = "Mijn profiel",
                Relatie = "Primair",
                IsPrimair = true,
                AangemaaktOp = DateTime.UtcNow
            };
            profile.DbBestand = $"{profile.Id}.db";

            // Rename the existing database file
            var newDbPath = Path.Combine(_dataDir, profile.DbBestand);
            File.Move(legacyDbPath, newDbPath);

            // Rename the salt file if it exists
            var legacySaltPath = Path.ChangeExtension(legacyDbPath, ".salt");
            var newSaltPath = Path.ChangeExtension(newDbPath, ".salt");
            if (File.Exists(legacySaltPath))
                File.Move(legacySaltPath, newSaltPath);

            _profiles.Add(profile);
            SaveProfiles();
        }
    }
}
