$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"
$venvPython = Join-Path $projectRoot "venv\Scripts\python.exe"

function Test-Command {
    param([string]$Name)
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

Write-Host "Starting Intelligent Poaching Detection System..." -ForegroundColor Green

if (-not (Test-Path $venvPython)) {
    throw "Python virtual environment not found at '$venvPython'. Install Python 3.10+ and run: py -m venv venv"
}

if (-not (Test-Path (Join-Path $backendDir ".env"))) {
    Copy-Item (Join-Path $backendDir ".env.example") (Join-Path $backendDir ".env")
    Write-Host "Created backend\.env from .env.example" -ForegroundColor Yellow
}

if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    if (-not (Test-Command "npm")) {
        throw "npm is not available. Install Node.js 18+ first."
    }

    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Push-Location $frontendDir
    try {
        npm install
    }
    finally {
        Pop-Location
    }
}

Write-Host "Starting backend on http://localhost:8000 ..." -ForegroundColor Cyan
$backendProcess = Start-Process -FilePath $venvPython -ArgumentList "-m", "uvicorn", "main:app", "--reload", "--port", "8000", "--app-dir", "backend" -WorkingDirectory $projectRoot -PassThru

Write-Host "Starting frontend on http://localhost:5173 ..." -ForegroundColor Cyan
$frontendProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory $frontendDir -PassThru

Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend : http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers."

try {
    while (-not $backendProcess.HasExited -and -not $frontendProcess.HasExited) {
        Start-Sleep -Seconds 2
        $backendProcess.Refresh()
        $frontendProcess.Refresh()
    }
}
finally {
    if (-not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id
    }
    if (-not $frontendProcess.HasExited) {
        Stop-Process -Id $frontendProcess.Id
    }
}
