using Lumio.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Tests;

/// <summary>Creates a fresh in-memory LumioDbContext per test.</summary>
public static class TestDbFactory
{
    public static LumioDbContext Create(string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<LumioDbContext>()
            .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
            .Options;
        return new LumioDbContext(options);
    }
}
