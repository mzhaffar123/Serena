param(
  [Parameter(Mandatory = $true)]
  [string]$Url
)

$ErrorActionPreference = "SilentlyContinue"

for ($i = 0; $i -lt 60; $i++) {
  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -ge 200) {
      Start-Process $Url | Out-Null
      exit 0
    }
  } catch {
  }

  Start-Sleep -Seconds 1
}

Start-Process $Url | Out-Null
