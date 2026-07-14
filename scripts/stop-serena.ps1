$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$escapedRoot = [Regex]::Escape($projectRoot)

$processes = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "node.exe" -and
  $_.CommandLine -and
  $_.CommandLine -match $escapedRoot -and
  (
    $_.CommandLine -match "next\\dist\\server\\lib\\start-server\.js" -or
    $_.CommandLine -match "next\\dist\\bin\\next"
  )
}

if (-not $processes) {
  Write-Host "Tidak ada server Serena yang sedang berjalan." -ForegroundColor Yellow
  exit 0
}

$processes | ForEach-Object {
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

Write-Host "Server Serena berhasil dihentikan." -ForegroundColor Green
