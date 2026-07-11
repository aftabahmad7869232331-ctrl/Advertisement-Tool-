Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Resolve-Path "$PSScriptRoot\..\.."
$Worker = Join-Path $Root "apps\ai-worker"
$Python = Join-Path $Worker ".venv\Scripts\python.exe"

if (-not (Test-Path $Python)) {
    Write-Host "AI worker virtual environment is not installed yet."
    Write-Host "Expected path:"
    Write-Host $Python
    Write-Host ""
    Write-Host "Run the AI worker setup script in a later setup phase."
    exit 1
}

Push-Location $Worker

try {
    & $Python -m src.main
}
finally {
    Pop-Location
}
