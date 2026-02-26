# Database Migrations

This document explains how Lumio manages its SQLite database schema using Entity Framework Core migrations — how it works in development, why it works differently in production, and how you as a developer add or apply migrations.

---

## Table of Contents

1. [Overview](#overview)
2. [How it works](#how-it-works)
3. [Development workflow](#development-workflow)
4. [Production workflow](#production-workflow)
5. [The dev-migrate.ps1 script](#the-dev-migrateps1-script)
6. [Frequently asked questions](#frequently-asked-questions)

---

## Overview

Lumio uses **Entity Framework Core (EF Core)** to define the database schema in C# code (`src/Lumio.Api/Data/` and `src/Lumio.Api/Domain/`). Every time you add or change a model — e.g. a new table, a new column, a renamed property — you create a **migration**: a small C# file that describes what changed. EF Core uses that file to keep the database in sync with the code.

There are two distinct situations, each handled differently:

| Situation | What happens | Who acts |
|---|---|---|
| **First run** — no database exists yet | Migrations always run automatically, in every environment. The database file is created and the full schema is applied as part of the user's own setup flow. No manual steps. | The running API (on `POST /api/auth/setup`) |
| **Existing database** — dev | Pending migrations are applied automatically each time the user unlocks. | The running API (on `POST /api/auth/ontgrendel`) |
| **Existing database** — production | No auto-migration. Schema must be brought up to date by a SQL script before the new version is deployed. | DBA / CI pipeline |

End users are never aware of migrations. The separation between development and production only matters when deploying an **update** to an installation that already has user data.

---

## How it works

### Database location

Each user profile has its own encrypted SQLite database file stored in the `data/` directory. The file is only opened after the correct master password is entered in the unlock flow.

### Migrations folder

All migration files live in:

```
src/Lumio.Api/Migrations/
```

Each migration is a pair of files:
- `<timestamp>_<Name>.cs` — the actual change (Up/Down methods)
- `<timestamp>_<Name>.Designer.cs` — EF Core snapshot (do not edit manually)

EF Core tracks which migrations have been applied by storing their names in a table called `__EFMigrationsHistory` inside each database file.

### Path 1 — First run (setup)

When a user runs the application for the first time there is no database file yet. The user creates a profile and a master password through the setup wizard, which calls `POST /api/auth/setup`. This endpoint always runs `db.Database.MigrateAsync()` — in **every** environment, regardless of the `ASPNETCORE_ENVIRONMENT` setting:

```csharp
// In AuthController — Setup endpoint (always runs, dev and production alike)
await db.Database.MigrateAsync();
```

This call both **creates** the SQLite file and **applies the full schema** in one step. The user does not have to do anything special. This path is intentionally not gated behind the dev-only check because there is nothing to "update" — the database simply does not exist yet.

### Path 2 — Existing database, development

When you unlock an existing profile (`POST /api/auth/ontgrendel`) in development, `AuthController` calls `EnsureMigratedAsync`. This:

1. Checks whether `__EFMigrationsHistory` exists in the database.
2. If not (database was bootstrapped before migrations were introduced), creates the history table and baselines all existing migrations as already applied.
3. Calls `MigrateAsync()` — only new migrations (not yet in the history table) are applied.

This means **you never have to manually touch the database during development**. Start the API, unlock, and any new migrations you created are applied automatically.

### Path 2 — Existing database, production

When `ASPNETCORE_ENVIRONMENT` is set to `Production`, the migration block inside the unlock endpoint is skipped entirely:

```csharp
// In AuthController — Ontgrendel endpoint
if (_env.IsDevelopment())
{
    await EnsureMigratedAsync(db); // skipped in production
}
```

The database schema must already be correct **before** the new version of the API is deployed. See [Production workflow](#production-workflow) for how to do this.

---

## Development workflow

### Prerequisites

Make sure the EF Core CLI tools are installed globally:

```powershell
dotnet tool install --global dotnet-ef
```

Verify with:

```powershell
dotnet ef --version
```

### Step-by-step: adding a new migration

**1. Change your model**

Edit or add a class in `src/Lumio.Api/Domain/` or update `LumioDbContext`. For example, adding an `Email` column to the `Contacten` table:

```csharp
// In Contact.cs
public string? Email { get; set; }
```

**2. Create the migration**

From the repository root, run:

```powershell
.\tools\dev-migrate.ps1 add AddEmailToContacten
```

This generates a new file in `src/Lumio.Api/Migrations/`. The name you choose should describe the change clearly — it becomes part of the file name and migration history forever.

**3. Restart the API and unlock**

No extra steps. The next time you unlock a profile the migration is applied automatically and you will see the new column in the database.

**4. Commit the migration files**

Both generated files (`.cs` and `.Designer.cs`) must be committed to git. Migrations are shared between all developers.

```powershell
git add src/Lumio.Api/Migrations/
git commit -m "migration: AddEmailToContacten"
```

---

## Production workflow

This section only applies when you are **deploying an update** to an installation that already has user data. If a user is running Lumio for the very first time on a production machine, no action is needed — the setup wizard creates and migrates the database automatically.

For existing databases, the application **never auto-migrates in production**. Instead, you generate a SQL script and apply it to each database before deploying the new version of the API.

### 1. Generate the SQL script

```powershell
.\tools\dev-migrate.ps1 script
```

This creates `tools/migration-script.sql`. The script is **idempotent** — it can be run multiple times safely. EF Core wraps each migration in a check so already-applied migrations are skipped.

### 2. Apply the script

Run the SQL file against the production database(s) using the SQLite CLI or your preferred database tool:

```powershell
sqlite3 path\to\profile.db < tools\migration-script.sql
```

Or pipe it through a CI/CD step before the deployment job runs.

### 3. Deploy the API

Only after the schema is updated should the new version of the API be deployed. The app does not run any migration code in production, so if the schema is missing a column the app will throw a runtime error.

> **Tip:** In a CI pipeline, the SQL script step should be a separate job that runs before the deployment job, with a dependency gate between them.

---

## The dev-migrate.ps1 script

Located at `tools/dev-migrate.ps1`. It wraps the `dotnet ef` CLI so you never have to remember the flags.

### Commands

#### `add <name>` — create a new migration

```powershell
.\tools\dev-migrate.ps1 add AddEmailToContacten
```

- Runs `dotnet ef migrations add` against `src/Lumio.Api`
- Creates two files in `src/Lumio.Api/Migrations/`
- The API will apply the migration automatically on next unlock (development only)

#### `list` — see all migrations and their applied status

```powershell
.\tools\dev-migrate.ps1 list
```

Prints every migration name and whether it has been applied to the currently configured database. Useful for diagnosing sync issues.

#### `script` — generate a production SQL script

```powershell
.\tools\dev-migrate.ps1 script
```

- Runs `dotnet ef migrations script --idempotent`
- Writes output to `tools/migration-script.sql`
- The file is safe to re-run and suitable for CI pipelines and DBA-managed databases

---

## Frequently asked questions

### I added a property but the column is not appearing

1. Check that you ran `.\tools\dev-migrate.ps1 add <name>` — just editing a model class does not automatically create a migration file.
2. Restart the API (migrations are applied at unlock time, so a running API has the old code).
3. Lock and re-unlock your profile to trigger the migration.

### A colleague has a database that does not have the migration history table

This can happen with very old databases that were created before migrations were introduced. `EnsureMigratedAsync` handles this automatically: it creates the `__EFMigrationsHistory` table and baselines all existing migrations as already applied, then only runs truly new ones.

### Can I squash all migrations into one clean InitialSchema?

Yes, and it is the recommended cleanup once the schema has stabilised. The key rule is: **the Setup endpoint uses `MigrateAsync()`, not `EnsureCreated()`**. This means it only creates tables by running migration files — it does not derive the schema from your model classes at runtime. With zero migration files it has nothing to run and no tables are created. You therefore always need at least one migration file, even for a brand-new database.

Steps to squash:

1. **Delete the test/dev database file** (e.g. `data/<profile>.db`) so there is no existing database to worry about.
2. **Delete all `.cs` files in `src/Lumio.Api/Migrations/`** — except `LumioDbContextModelSnapshot.cs`. EF Core needs the snapshot to generate the next migration correctly; do not delete it.
3. **Create one new migration** that captures the full current schema:
   ```powershell
   .\tools\dev-migrate.ps1 add InitialSchema
   ```
4. **Start the API and run setup** — the new database is created with all tables correct in a single step.
5. **Commit the result** — the `Migrations/` folder now contains only `InitialSchema` and the snapshot.

> **Important:** only do this when all existing databases have been deleted or upgraded. If any database still has the old migration names in `__EFMigrationsHistory`, the squash will break it because those names no longer exist as migration files.

### Can I roll back a migration?

Yes, with the EF Core CLI:

```powershell
cd src\Lumio.Api
dotnet ef database update <PreviousMigrationName>
```

Replace `<PreviousMigrationName>` with the name of the migration you want to roll back to. After rolling back, delete the unwanted migration files and remove them from git.

Note: SQLite has very limited `ALTER TABLE` support. `Down()` methods that try to remove columns or rename tables may not work reliably. In practice it is safer to create a new corrective migration.

### How do I see what SQL a migration generates?

```powershell
cd src\Lumio.Api
dotnet ef migrations script <PreviousMigration> <TargetMigration>
```

Example — see only the last migration:

```powershell
dotnet ef migrations script 20260224151055_AddSchuldBezitLink 20260226_AddEmailToContacten
```

### What is the `--idempotent` flag in the script command?

Without it the generated SQL assumes the database starts from scratch. With `--idempotent`, each migration block is wrapped in an `IF NOT EXISTS` check against `__EFMigrationsHistory`. This means the script can be applied to both new databases and databases that already have some migrations applied.

Always use `--idempotent` for production scripts. The `dev-migrate.ps1 script` command does this automatically.

### Should migration files be committed to git?

**Yes, always.** Migration files are the single source of truth for the schema history. Every developer and every environment must have the same set of migration files. Never delete or edit a migration that has already been applied to any database.
