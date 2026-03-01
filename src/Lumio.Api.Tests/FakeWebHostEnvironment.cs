using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;

namespace Lumio.Api.Tests;

/// <summary>
/// Minimal fake <see cref="IWebHostEnvironment"/> for controller unit tests.
/// Defaults to "Production" so that auto-migration code paths are skipped.
/// </summary>
public sealed class FakeWebHostEnvironment : IWebHostEnvironment
{
    public string ApplicationName { get; set; } = "Lumio.Api.Tests";

    /// <summary>Defaults to "Production" — keeps auto-migration branches out of tests.</summary>
    public string EnvironmentName { get; set; } = "Production";

    public string ContentRootPath { get; set; } = string.Empty;
    public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();

    public string WebRootPath { get; set; } = string.Empty;
    public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
}
