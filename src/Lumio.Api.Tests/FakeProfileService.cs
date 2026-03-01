using Lumio.Api.Domain.Common;
using Lumio.Api.Services.Security;

namespace Lumio.Api.Tests;

/// <summary>
/// In-memory fake for <see cref="IProfileService"/> for use in controller unit tests.
/// Initialised with an optional set of pre-existing profiles.
/// </summary>
public sealed class FakeProfileService : IProfileService
{
    private readonly List<Profile> _profiles;

    public FakeProfileService(params Profile[] profiles)
    {
        _profiles = [.. profiles];
    }

    public Profile? ActiveProfile { get; set; }
    public string? ActiveDbPath => null;
    public string? ActiveSaltPath => null;
    public bool IsFirstRun => _profiles.Count == 0;
    public bool ActiveProfileDbExists => true;

    public List<Profile> GetProfiles() => _profiles;
    public Profile? GetProfile(Guid id) => _profiles.FirstOrDefault(p => p.Id == id);

    public void SelectProfile(Guid profileId) =>
        ActiveProfile = _profiles.FirstOrDefault(p => p.Id == profileId);

    public void DeselectProfile() => ActiveProfile = null;

    public Profile CreateProfile(string naam, string relatie)
    {
        var profile = new Profile { Naam = naam, Relatie = relatie };
        _profiles.Add(profile);
        return profile;
    }

    public void DeleteProfile(Guid profileId) =>
        _profiles.RemoveAll(p => p.Id == profileId);

    public void UpdateActiveProfileThumbnail(string? base64Thumbnail) { }
}
