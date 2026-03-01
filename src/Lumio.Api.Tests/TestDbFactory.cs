using Lumio.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Lumio.Api.Tests;

/// <summary>Creates a fresh in-memory LumioDbContext per test.</summary>
public static class TestDbFactory
{
    public static LumioDbContext Create(string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<LumioDbContext>()
            .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
            // InMemory-provider ondersteunt geen echte transacties; negeer de warning
            // zodat BeginTransactionAsync() een no-op is in tests (zie T-006 tests).
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new LumioDbContext(options);
    }
}
