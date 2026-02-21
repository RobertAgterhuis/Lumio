#Requires -Version 7.0
<#
.SYNOPSIS
    Builds and starts both the Lumio backend and frontend for local development.

.DESCRIPTION
    1. Kills any running Lumio.Api and Next.js processes
    2. Builds the .NET backend (Debug)
    3. Builds the Next.js frontend (static export)
    4. Starts the backend with the frontend served as static files
    5. Opens the browser at http://127.0.0.1:5123

.PARAMETER SkipBuild
    Skip building and just (re)start the processes.

.PARAMETER Port
    Port for the backend API. Default: 5123.
#>
param(
    [switch]$SkipBuild,
    [int]$Port = 5123
)

$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
$ApiProject = Join-Path $Root "src" "Lumio.Api" "Lumio.Api.csproj"
$WebDir = Join-Path $Root "src" "lumio-web"
$FrontendOut = Join-Path $WebDir "out"
$DataDir = Join-Path $Root "data"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Lumio — Dev Start Script" -ForegroundColor Cyan
Write-Host "  Port: $Port" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ─── Step 1: Kill existing processes ─────────────────────────────────────────

Write-Host "[1/4] Killing existing processes..." -ForegroundColor Yellow

# Kill any running Lumio.Api processes
$apiProcesses = Get-Process -Name "Lumio.Api" -ErrorAction SilentlyContinue
if ($apiProcesses) {
    Write-Host "  Stopping $($apiProcesses.Count) Lumio.Api process(es)..."
    $apiProcesses | Stop-Process -Force
    Start-Sleep -Milliseconds 500
}

# Kill any dotnet run processes that might be running the API
$dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue |
    Where-Object {
        try {
            $_.CommandLine -match "Lumio\.Api"
        } catch {
            $false
        }
    }
if ($dotnetProcesses) {
    Write-Host "  Stopping $($dotnetProcesses.Count) dotnet process(es) for Lumio.Api..."
    $dotnetProcesses | Stop-Process -Force
    Start-Sleep -Milliseconds 500
}

# Kill any Node/Next.js dev processes on our port
$portListeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($portListeners) {
    foreach ($conn in $portListeners) {
        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  Stopping process '$($proc.ProcessName)' (PID $($proc.Id)) on port $Port..."
            Stop-Process -Id $proc.Id -Force
        }
    }
    Start-Sleep -Milliseconds 500
}

Write-Host "[1/4] Clean slate." -ForegroundColor Green
Write-Host ""

# ─── Step 2: Build frontend ─────────────────────────────────────────────────

if (-not $SkipBuild) {
    Write-Host "[2/4] Building Next.js frontend..." -ForegroundColor Yellow

    if (-not (Test-Path (Join-Path $WebDir "package.json"))) {
        Write-Error "Frontend project not found at $WebDir"
        exit 1
    }

    # Install dependencies if node_modules missing
    if (-not (Test-Path (Join-Path $WebDir "node_modules"))) {
        Write-Host "  Installing frontend dependencies (npm install)..."
        Push-Location $WebDir
        npm install
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            Write-Error "npm install failed!"
            exit 1
        }
        Pop-Location
    }

    # Clean previous output
    if (Test-Path $FrontendOut) {
        Remove-Item -Recurse -Force $FrontendOut
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

    if (-not (Test-Path $FrontendOut)) {
        Write-Error "Next.js output not found at $FrontendOut — build may have failed."
        exit 1
    }

    Write-Host "[2/4] Frontend build complete." -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host "[2/4] Skipping frontend build." -ForegroundColor DarkGray
    if (-not (Test-Path $FrontendOut)) {
        Write-Warning "Frontend output not found at $FrontendOut. Run without -SkipBuild first."
    }
    Write-Host ""
}

# ─── Step 3: Build backend ──────────────────────────────────────────────────

if (-not $SkipBuild) {
    Write-Host "[3/4] Building .NET backend..." -ForegroundColor Yellow

    if (-not (Test-Path $ApiProject)) {
        Write-Error "Backend project not found at $ApiProject"
        exit 1
    }

    dotnet build $ApiProject --configuration Debug
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Backend build failed!"
        exit 1
    }

    Write-Host "[3/4] Backend build complete." -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host "[3/4] Skipping backend build." -ForegroundColor DarkGray
    Write-Host ""
}

# ─── Step 4: Start backend ──────────────────────────────────────────────────

Write-Host "[4/4] Starting Lumio backend..." -ForegroundColor Yellow

# Ensure data directory exists
if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Force -Path $DataDir | Out-Null
    Write-Host "  Created data directory: $DataDir"
}

# Resolve the backend executable
$BackendExe = Join-Path $Root "src" "Lumio.Api" "bin" "Debug" "net10.0" "Lumio.Api.exe"
if (-not (Test-Path $BackendExe)) {
    Write-Warning "Backend executable not found at $BackendExe, falling back to 'dotnet run'..."
    $useDotnetRun = $true
}
else {
    $useDotnetRun = $false
}

$env:ASPNETCORE_URLS = "http://127.0.0.1:$Port"
$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:LUMIO_DATA_DIR = $DataDir
$env:LUMIO_FRONTEND_DIR = $FrontendOut

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Lumio is starting!" -ForegroundColor Green
Write-Host "" -ForegroundColor Cyan
Write-Host "  URL:          http://127.0.0.1:$Port" -ForegroundColor Cyan
Write-Host "  Swagger:      http://127.0.0.1:$Port/swagger" -ForegroundColor Cyan
Write-Host "  Frontend:     $FrontendOut" -ForegroundColor Cyan
Write-Host "  Data:         $DataDir" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Open browser after a short delay
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 3
    Start-Process "http://127.0.0.1:$using:Port"
} | Out-Null

# Start the backend (blocking — Ctrl+C stops everything)
if ($useDotnetRun) {
    dotnet run --project $ApiProject --configuration Debug --no-build
}
else {
    & $BackendExe
}
