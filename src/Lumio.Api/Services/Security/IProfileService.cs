using Lumio.Api.Domain.Common;

namespace Lumio.Api.Services.Security;

public interface IProfileService
{
    /// <summary>Maximum number of profiles allowed per installation. Deprecated: use IOptions&lt;LimietenOptions&gt;.MaxProfielen.</summary>
    [Obsolete("Gebruik IOptions<LimietenOptions>.MaxProfielen in plaats van deze constante.")]
    const int MaxProfiles = 5;

    /// <summary>All registered profiles.</summary>
    List<Profile> GetProfiles();

    /// <summary>Get profile by ID.</summary>
    Profile? GetProfile(Guid id);

    /// <summary>The currently active profile, or null if none selected.</summary>
    Profile? ActiveProfile { get; }

    /// <summary>The full path to the active profile's database file.</summary>
    string? ActiveDbPath { get; }

    /// <summary>The full path to the active profile's salt file.</summary>
    string? ActiveSaltPath { get; }

    /// <summary>Select a profile as active (before unlock).</summary>
    void SelectProfile(Guid profileId);

    /// <summary>Deselect the active profile (on lock).</summary>
    void DeselectProfile();

    /// <summary>Create a new profile. Returns the created profile.</summary>
    Profile CreateProfile(string naam, string relatie);

    /// <summary>Delete a profile and its database/salt files.</summary>
    void DeleteProfile(Guid profileId);

    /// <summary>Check if this is the very first run (no profiles exist).</summary>
    bool IsFirstRun { get; }

    /// <summary>Check if the active profile's database file exists.</summary>
    bool ActiveProfileDbExists { get; }
}
