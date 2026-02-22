#Requires -Version 7.0
<#
.SYNOPSIS
    Master build script for Lumio — produces a USB-portable distribution.

.DESCRIPTION
    Builds all three components in order:
    1. .NET backend (self-contained publish)
    2. Next.js frontend (static export)
    3. Electron shell (dir target)

    Output: dist/Lumio/ — copy this folder to a USB drive.

.PARAMETER Configuration
    Build configuration (Debug or Release). Default: Release.

.PARAMETER Runtime
    .NET runtime identifier. Default: win-x64.

.PARAMETER SkipBackend
    Skip the .NET backend build.

.PARAMETER SkipFrontend
    Skip the Next.js frontend build.

.PARAMETER SkipElectron
    Skip the Electron packaging step.
#>
param(
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Release",

    [string]$Runtime = "win-x64",

    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$SkipElectron
)

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$DistDir = Join-Path $Root "dist"
$BackendDist = Join-Path $DistDir "backend"
$FrontendDist = Join-Path $DistDir "frontend"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Lumio Build Script" -ForegroundColor Cyan
Write-Host "  Configuration: $Configuration" -ForegroundColor Cyan
Write-Host "  Runtime:       $Runtime" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ─── Step 1: .NET Backend ────────────────────────────────────────────────────

if (-not $SkipBackend) {
    Write-Host "[1/3] Building .NET backend..." -ForegroundColor Yellow

    $ApiProject = Join-Path $Root "src" "Lumio.Api" "Lumio.Api.csproj"

    if (-not (Test-Path $ApiProject)) {
        Write-Error "Backend project not found: $ApiProject"
        exit 1
    }

    # Clean previous output
    if (Test-Path $BackendDist) {
        Remove-Item -Recurse -Force $BackendDist
    }

    dotnet publish $ApiProject `
        --configuration $Configuration `
        --runtime $Runtime `
        --self-contained true `
        --output $BackendDist `
        /p:PublishSingleFile=false `
        /p:PublishTrimmed=false

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Backend build failed!"
        exit 1
    }

    Write-Host "[1/3] Backend build complete." -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host "[1/3] Skipping backend build." -ForegroundColor DarkGray
}

# ─── Step 2: Next.js Frontend ────────────────────────────────────────────────

if (-not $SkipFrontend) {
    Write-Host "[2/3] Building Next.js frontend..." -ForegroundColor Yellow

    $WebDir = Join-Path $Root "src" "lumio-web"

    if (-not (Test-Path (Join-Path $WebDir "package.json"))) {
        Write-Error "Frontend project not found: $WebDir"
        exit 1
    }

    # Install dependencies if needed
    if (-not (Test-Path (Join-Path $WebDir "node_modules"))) {
        Write-Host "  Installing frontend dependencies..."
        Push-Location $WebDir
        npm ci
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            Write-Error "npm ci failed!"
            exit 1
        }
        Pop-Location
    }

    # Build static export
    Push-Location $WebDir
    npx next build
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Error "Next.js build failed!"
        exit 1
    }
    Pop-Location

    # Copy static export to dist
    $NextOut = Join-Path $WebDir "out"
    if (-not (Test-Path $NextOut)) {
        Write-Error "Next.js output not found: $NextOut"
        exit 1
    }

    if (Test-Path $FrontendDist) {
        Remove-Item -Recurse -Force $FrontendDist
    }
    Copy-Item -Recurse $NextOut $FrontendDist

    Write-Host "[2/3] Frontend build complete." -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host "[2/3] Skipping frontend build." -ForegroundColor DarkGray
}

# ─── Step 3: Electron Shell ──────────────────────────────────────────────────

if (-not $SkipElectron) {
    Write-Host "[3/3] Packaging Electron shell..." -ForegroundColor Yellow

    $DesktopDir = Join-Path $Root "src" "lumio-desktop"

    if (-not (Test-Path (Join-Path $DesktopDir "package.json"))) {
        Write-Error "Electron project not found: $DesktopDir"
        exit 1
    }

    # Install dependencies if needed
    if (-not (Test-Path (Join-Path $DesktopDir "node_modules"))) {
        Write-Host "  Installing Electron dependencies..."
        Push-Location $DesktopDir
        npm ci
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            Write-Error "npm ci failed!"
            exit 1
        }
        Pop-Location
    }

    # Compile TypeScript
    Push-Location $DesktopDir
    npx tsc
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Error "TypeScript compilation failed!"
        exit 1
    }

    # Disable code signing auto-discovery (no certificate needed for USB-portable app)
    $env:CSC_IDENTITY_AUTO_DISCOVERY = "false"

    # Package with electron-builder (dir target only)
    npx electron-builder --dir --config electron-builder.yml
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Error "Electron packaging failed!"
        exit 1
    }
    Pop-Location

    Write-Host "[3/3] Electron packaging complete." -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host "[3/3] Skipping Electron packaging." -ForegroundColor DarkGray
}

# ─── Done ────────────────────────────────────────────────────────────────────

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Build complete!" -ForegroundColor Green
Write-Host "  Output: $DistDir" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "  Copy the content of the dist/Lumio/ folder to a USB drive" -ForegroundColor Cyan
Write-Host "  and run the Lumio executable to start." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
