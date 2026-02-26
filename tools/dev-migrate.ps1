#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Developer helper for EF Core database migrations.

.DESCRIPTION
    Three simple commands:

    add    <name>   Create a new migration  (e.g. .\dev-migrate.ps1 add AddEmailColumn)
    list            Show all migrations and which are applied
    script          Generate a SQL script of all migrations (for production deployments)

.EXAMPLES
    .\tools\dev-migrate.ps1 add AddEmailColumn
    .\tools\dev-migrate.ps1 list
    .\tools\dev-migrate.ps1 script
#>

param(
    [Parameter(Position = 0, Mandatory)]
    [ValidateSet("add", "list", "script")]
    [string] $Command,

    [Parameter(Position = 1)]
    [string] $MigrationName
)

$ErrorActionPreference = "Stop"
$projectPath = "$PSScriptRoot\..\src\Lumio.Api"

switch ($Command) {

    "add" {
        if (-not $MigrationName) {
            Write-Error "Provide a migration name.  Example: .\tools\dev-migrate.ps1 add AddEmailColumn"
        }
        Write-Host "Creating migration '$MigrationName'..." -ForegroundColor Cyan
        dotnet ef migrations add $MigrationName --project $projectPath
        Write-Host ""
        Write-Host "Done. The migration file is in src/Lumio.Api/Migrations/." -ForegroundColor Green
        Write-Host "Restart the API and unlock your profile — the migration will be applied automatically." -ForegroundColor Green
    }

    "list" {
        Write-Host "Listing migrations..." -ForegroundColor Cyan
        dotnet ef migrations list --project $projectPath
    }

    "script" {
        $outFile = "$PSScriptRoot\migration-script.sql"
        Write-Host "Generating idempotent SQL script -> $outFile" -ForegroundColor Cyan
        dotnet ef migrations script --idempotent --output $outFile --project $projectPath
        Write-Host ""
        Write-Host "SQL script written to tools\migration-script.sql" -ForegroundColor Green
        Write-Host "Apply this file to the production database before deploying." -ForegroundColor Yellow
    }
}
