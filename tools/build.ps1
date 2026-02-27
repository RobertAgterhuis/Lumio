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

.PARAMETER Whitelabel
    Path to a whitelabel config directory (e.g. ".\tools\whitelabel\configs\example-corp").
    When provided, runs the whitelabel engine before the main build steps and
    packages the Electron shell using the generated electron-builder.wl.json override.
    When omitted, a standard Lumio build is produced.
#>
param(
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Release",

    [string]$Runtime = "win-x64",

    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$SkipElectron,

    [string]$Whitelabel = ""
)

$ErrorActionPreference = "Stop"

# ─── Helper: stop processes locking dist/ files ──────────────────────────────

function Stop-LumioProcesses {
    <#
    .SYNOPSIS
        Terminates any running Lumio process (packaged app OR dev-mode backend)
        that may hold file locks inside dist\backend\ or dist\Lumio\
    #>
    $killed = [System.Collections.Generic.List[string]]::new()

    Get-Process -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            $exePath = $_.MainModule.FileName
            if ($exePath -like "*\dist\Lumio\*" -or $exePath -like "*\dist\backend\*") {
                Write-Host "  Stopping locked process: $($_.Name) (PID $($_.Id))" -ForegroundColor DarkYellow
                $_ | Stop-Process -Force -ErrorAction SilentlyContinue
                $killed.Add($_.Name)
            }
        } catch {
            # MainModule access denied for some system processes — ignore
        }
    }

    # Phase 2: kill the .NET API host by name in case it was started via
    # start-dev.ps1 from a path not matched by the MainModule filter above.
    Get-Process -Name "Lumio.Api" -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "  Stopping backend by name: $($_.Name) (PID $($_.Id))" -ForegroundColor DarkYellow
        $_ | Stop-Process -Force -ErrorAction SilentlyContinue
        $killed.Add($_.Name)
    }

    if ($killed.Count -gt 0) {
        Write-Host "  Released $($killed.Count) process lock(s): $($killed -join ', ')" -ForegroundColor DarkYellow
    }

    # Wait for Windows to fully release file handles.
    # Even after Stop-Process the OS can take >1 s to release locks on EXEs/DLLs.
    Start-Sleep -Milliseconds 2000

    # Extra safety: wait until every EXE in the output directory is no longer locked.
    # ($Root is not in function scope — derive path from $PSScriptRoot instead)
    $outDir = Join-Path $PSScriptRoot ".." "dist" "Lumio" "win-unpacked"
    if (Test-Path $outDir) {
        $exes = Get-ChildItem $outDir -Filter "*.exe" -ErrorAction SilentlyContinue
        foreach ($exe in $exes) {
            $deadline = [DateTime]::UtcNow.AddSeconds(10)
            while ([DateTime]::UtcNow -lt $deadline) {
                try {
                    $stream = [System.IO.File]::Open($exe.FullName, 'Open', 'ReadWrite', 'None')
                    $stream.Close()
                    break   # file is accessible
                } catch {
                    Write-Host "  Waiting for '$($exe.Name)' lock to release..." -ForegroundColor DarkYellow
                    Start-Sleep -Milliseconds 500
                }
            }
        }
    }
}

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$DistDir = Join-Path $Root "dist"
$BackendDist = Join-Path $DistDir "backend"
$FrontendDist = Join-Path $DistDir "frontend"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Lumio Build Script" -ForegroundColor Cyan
Write-Host "  Configuration: $Configuration" -ForegroundColor Cyan
Write-Host "  Runtime:       $Runtime" -ForegroundColor Cyan
if ($Whitelabel -ne "") {
    Write-Host "  Whitelabel:    $Whitelabel" -ForegroundColor Cyan
}
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ─── Step 0: Whitelabel Engine ──────────────────────────────────────────────

if ($Whitelabel -ne "") {
    Write-Host "[0/3] Running whitelabel engine..." -ForegroundColor Yellow

    $WhitelabelEngineDir = Join-Path $PSScriptRoot "whitelabel"
    $EngineScript        = Join-Path $WhitelabelEngineDir "engine.mjs"
    $WhitelabelAbsPath   = Resolve-Path $Whitelabel

    if (-not (Test-Path $EngineScript)) {
        Write-Error "Whitelabel engine not found: $EngineScript"
        exit 1
    }

    # Ensure engine dependencies are installed
    if (-not (Test-Path (Join-Path $WhitelabelEngineDir "node_modules"))) {
        Write-Host "  Installing whitelabel engine dependencies..."
        Push-Location $WhitelabelEngineDir
        npm install
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            Write-Error "npm install failed for whitelabel engine!"
            exit 1
        }
        Pop-Location
    }

    # Run the engine
    node $EngineScript --config $WhitelabelAbsPath --repo-root $Root
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Whitelabel engine failed!"
        exit 1
    }

    Write-Host "[0/3] Whitelabel engine complete." -ForegroundColor Green
    Write-Host ""
}
else {
    # Clean up any leftover whitelabel artefacts from a previous WL build
    $DesktopDir    = Join-Path $Root "src" "lumio-desktop"
    $WlFlag        = Join-Path $DesktopDir ".whitelabel-active"
    $WlOverride    = Join-Path $DesktopDir "electron-builder.wl.json"
    $WlBuildAssets = Join-Path $DesktopDir "build" "whitelabel"
    if (Test-Path $WlFlag)        { Remove-Item -Force $WlFlag }
    if (Test-Path $WlOverride)    { Remove-Item -Force $WlOverride }
    if (Test-Path $WlBuildAssets) { Remove-Item -Recurse -Force $WlBuildAssets }
}

# ─── Step 1: .NET Backend ────────────────────────────────────────────────────

if (-not $SkipBackend) {
    Write-Host "[1/3] Building .NET backend..." -ForegroundColor Yellow

    $ApiProject = Join-Path $Root "src" "Lumio.Api" "Lumio.Api.csproj"

    if (-not (Test-Path $ApiProject)) {
        Write-Error "Backend project not found: $ApiProject"
        exit 1
    }

    # Stop any process holding dist\backend\ files before cleaning
    Stop-LumioProcesses

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

    # Stop any running Lumio app / backend that locks files inside the output dir
    Stop-LumioProcesses

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

    # Choose electron-builder config:
    #   Standard build  → electron-builder.yml
    #   Whitelabel build → electron-builder.wl.json (generated by the engine;
    #                       extends the base yml and overrides appId/productName/extraResources)
    $WlFlagPath     = Join-Path $DesktopDir ".whitelabel-active"
    $WlOverridePath = Join-Path $DesktopDir "electron-builder.wl.json"
    if ((Test-Path $WlFlagPath) -and (Test-Path $WlOverridePath)) {
        Write-Host "  Using whitelabel electron-builder config: electron-builder.wl.json" -ForegroundColor Cyan
        npx electron-builder --dir --config electron-builder.wl.json
    }
    else {
        npx electron-builder --dir --config electron-builder.yml
    }
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
