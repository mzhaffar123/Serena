param(
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$port = 3000
$url = "http://localhost:$port"
$browserWaiterScript = Join-Path $scriptDir "open-browser-when-ready.ps1"

$npmCommand = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
if (-not $npmCommand) {
  $npmCommand = (Get-Command npm -ErrorAction SilentlyContinue).Source
}

if (-not $npmCommand) {
  throw "npm tidak ditemukan. Pastikan Node.js dan npm sudah terpasang."
}

Set-Location $projectRoot

Write-Host "Menutup server Serena lama jika ada..." -ForegroundColor Yellow
powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $scriptDir "stop-serena.ps1") | Out-Null

if (-not (Test-Path (Join-Path $projectRoot "node_modules"))) {
  Write-Host "node_modules belum ada. Menjalankan npm install..." -ForegroundColor Yellow
  & $npmCommand "install"

  if ($LASTEXITCODE -ne 0) {
    throw "npm install gagal."
  }
}

if (-not $NoBrowser) {
  Start-Process -FilePath "powershell.exe" -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", $browserWaiterScript,
    "-Url", $url
  ) | Out-Null
}

Write-Host "Menjalankan Serena di $url" -ForegroundColor Cyan
Write-Host "Biarkan jendela ini tetap terbuka selama aplikasi digunakan." -ForegroundColor DarkYellow
Write-Host "Tekan Ctrl + C jika ingin menghentikan server." -ForegroundColor DarkYellow
Write-Host "" 

& $npmCommand "run" "dev" "--" "--port" "$port"

if ($LASTEXITCODE -ne 0) {
  Write-Host "" 
  Write-Host "Server Serena berhenti atau gagal dijalankan." -ForegroundColor Red
  Write-Host "Tekan Enter untuk menutup jendela ini..." -ForegroundColor Yellow
  [void](Read-Host)
}
