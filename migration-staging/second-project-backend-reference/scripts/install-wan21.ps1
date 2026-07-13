# scripts/install-wan21.ps1
# PowerShell automated installer for Wan2.1 Text-to-Video Engine (1.3B T2V model)

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Gold
Write-Host "   BRICK-MAKER STUDIO - WAN2.1 INSTALLER   " -ForegroundColor Gold
Write-Host "=========================================" -ForegroundColor Gold

# 1. Check Python installation
Write-Host "[1/7] Checking Python installation..." -ForegroundColor Cyan
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Success: Python detected - $pythonVersion" -ForegroundColor Green
} catch {
    Write-Error "Error: Python is not installed or not in the system PATH. Python 3.10+ is required."
    Exit 1
}

# 2. Check Git installation
Write-Host "[2/7] Checking Git installation..." -ForegroundColor Cyan
try {
    $gitVersion = git --version 2>&1
    Write-Host "Success: Git detected - $gitVersion" -ForegroundColor Green
} catch {
    Write-Error "Error: Git is not installed or not in the system PATH."
    Exit 1
}

# 3. Create directories
Write-Host "[3/7] Setting up folders..." -ForegroundColor Cyan
$enginePath = "./engines/Wan2.1"
$modelPath = "./models/Wan2.1-T2V-1.3B"

if (!(Test-Path "./engines")) {
    New-Item -ItemType Directory -Path "./engines" | Out-Null
}
if (!(Test-Path "./models")) {
    New-Item -ItemType Directory -Path "./models" | Out-Null
}
Write-Host "Folders successfully prepared." -ForegroundColor Green

# 4. Clone GitHub Repository
Write-Host "[4/7] Clong Wan2.1 GitHub Repository..." -ForegroundColor Cyan
if (Test-Path $enginePath) {
    Write-Host "Wan2.1 repository directory already exists. Skipping clone." -ForegroundColor Yellow
} else {
    try {
        git clone https://github.com/Wan-Video/Wan2.1 $enginePath
        Write-Host "Successfully cloned repository into $enginePath" -ForegroundColor Green
    } catch {
        Write-Error "Failed to clone Wan2.1 repository from GitHub."
        Exit 1
    }
}

# 5. Install huggingface_hub CLI and dependency manager
Write-Host "[5/7] Installing huggingface_hub..." -ForegroundColor Cyan
try {
    pip install --upgrade huggingface_hub
    Write-Host "huggingface_hub installed successfully." -ForegroundColor Green
} catch {
    Write-Error "Failed to install huggingface_hub via pip."
    Exit 1
}

# 6. Download Model from Hugging Face
Write-Host "[6/7] Downloading Wan2.1-T2V-1.3B model (this might take some time)..." -ForegroundColor Cyan
Write-Host "Target Directory: $modelPath" -ForegroundColor Gray
try {
    # Run the Hugging Face CLI download command
    huggingface-cli download Wan-AI/Wan2.1-T2V-1.3B --local-dir $modelPath
    Write-Host "Model downloaded successfully to $modelPath" -ForegroundColor Green
} catch {
    Write-Error "Failed to download model. Please check internet connection, huggingface accessibility, or disk space."
    Exit 1
}

# 7. Install Wan2.1 Requirements
Write-Host "[7/7] Installing Wan2.1 python dependencies..." -ForegroundColor Cyan
try {
    if (Test-Path "$enginePath/requirements.txt") {
        pip install -r "$enginePath/requirements.txt"
        Write-Host "Dependencies successfully installed." -ForegroundColor Green
    } else {
        Write-Host "Warning: requirements.txt not found in cloned engine. Skipping pip install -r requirements." -ForegroundColor Yellow
    }
} catch {
    Write-Error "Failed to install Wan2.1 requirements.txt python packages."
    Exit 1
}

Write-Host "=========================================" -ForegroundColor Gold
Write-Host "   WAN2.1 ENGINE INSTALLED SUCCESSFULLY!  " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Gold
