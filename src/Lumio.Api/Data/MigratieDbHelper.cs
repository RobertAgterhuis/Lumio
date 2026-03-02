using Lumio.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Data;

/// <summary>
/// Internal helper for database migration housekeeping.
/// Extracted from AuthController (SP-7-004 / GUARD-010 refactoring).
/// </summary>
internal static class MigratieDbHelper
{
    /// <summary>
    /// Applies pending EF migrations. Handles databases that were created with
    /// EnsureCreated (no __EFMigrationsHistory table) by creating the table and
    /// baselining existing migrations.
    /// </summary>
    internal static async Task EnsureMigratedAsync(LumioDbContext db)
    {
        // Check if the migration history table exists
        bool historyExists;
        try
        {
            await db.Database.ExecuteSqlRawAsync("SELECT COUNT(*) FROM \"__EFMigrationsHistory\"");
            historyExists = true;
        }
        catch
        {
            historyExists = false;
        }

        if (!historyExists)
        {
            // Database was bootstrapped with EnsureCreated — create the history table
            await db.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS ""__EFMigrationsHistory"" (
                    ""MigrationId"" TEXT NOT NULL CONSTRAINT ""PK___EFMigrationsHistory"" PRIMARY KEY,
                    ""ProductVersion"" TEXT NOT NULL
                )");

            // Mark all non-new migrations as already applied so Migrate() only runs new ones
            // SP-10-COR-002: voeg elke nieuwe migratie hier toe zodat pre-EnsureCreated databases
            // de kolommen ook aangemaakt krijgen (zie DEC-110 + adr-001-schulden-schema-brug.md).
            var newMigrations = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "20260224151055_AddSchuldBezitLink",
                "20260302113751_SP9_ShamirDrempel"
            };
            foreach (var migrationId in db.Database.GetMigrations().Where(m => !newMigrations.Contains(m)))
            {
                await db.Database.ExecuteSqlAsync(
                    $"INSERT OR IGNORE INTO \"__EFMigrationsHistory\" VALUES ({migrationId}, '10.0.3')");
            }
        }

        await db.Database.MigrateAsync();

        // Belt-and-suspenders: if the migration was recorded as applied but the
        // ALTER TABLE failed (SQLite FK issue), add the columns directly.
        await EnsureSchuldKolommenAsync(db);
    }

    internal static async Task EnsureSchuldKolommenAsync(LumioDbContext db)
    {
        // Schulden — BezitId + LeaseMaatschappij (migratie 20260224151055_AddSchuldBezitLink)
        try
        {
            await db.Database.ExecuteSqlRawAsync("SELECT \"BezitId\" FROM \"Schulden\" LIMIT 0");
            // Column exists — nothing to do
        }
        catch
        {
            // Column missing — apply it directly
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE \"Schulden\" ADD COLUMN \"BezitId\" TEXT NULL");
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE \"Schulden\" ADD COLUMN \"LeaseMaatschappij\" TEXT NULL");
            await db.Database.ExecuteSqlRawAsync("CREATE INDEX IF NOT EXISTS \"IX_Schulden_BezitId\" ON \"Schulden\" (\"BezitId\")");
        }

        // SP-10-COR-002: Eigenaren — ShamirDrempel (migratie 20260302113751_SP9_ShamirDrempel)
        // Belt-and-suspenders voor pre-migratie databases conform ADR-001.
        try
        {
            await db.Database.ExecuteSqlRawAsync("SELECT \"ShamirDrempel\" FROM \"Eigenaren\" LIMIT 0");
            // Column exists — nothing to do
        }
        catch
        {
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE \"Eigenaren\" ADD COLUMN \"ShamirDrempel\" INTEGER NULL");
        }
    }
}
