$ErrorActionPreference = "Stop"
$projectPath = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $projectPath "dj-soul.local.json"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " VERIFICARE DJ SOUL - YOUTUBE" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cheia API nu va fi afisata." -ForegroundColor Green
Write-Host ""

if (-not (Test-Path -LiteralPath $configPath)) {
  Write-Host "REZULTAT: fisierul dj-soul.local.json nu exista." -ForegroundColor Red
  Write-Host "Ruleaza configure-dj-soul.bat din folderul proiectului." -ForegroundColor Yellow
  exit 1
}

try {
  $config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
} catch {
  Write-Host "REZULTAT: fisierul local nu este JSON valid." -ForegroundColor Red
  exit 1
}

$apiKey = [string]$config.apiKey
$playlistId = [string]$config.playlistId
$keyLooksValid = $apiKey.StartsWith("AIza") -and $apiKey.Length -ge 35
$playlistLooksValid = $playlistId.StartsWith("PL") -and $playlistId.Length -ge 20

Write-Host "Fisier configurare: GASIT" -ForegroundColor Green
Write-Host "Lungime cheie: $($apiKey.Length) caractere" -ForegroundColor White
Write-Host "Format cheie Google: $(if ($keyLooksValid) { 'CORECT' } else { 'INCORECT' })" -ForegroundColor $(if ($keyLooksValid) { 'Green' } else { 'Red' })
Write-Host "Playlist ID: $playlistId" -ForegroundColor White
Write-Host "Format playlist: $(if ($playlistLooksValid) { 'CORECT' } else { 'INCORECT' })" -ForegroundColor $(if ($playlistLooksValid) { 'Green' } else { 'Red' })
Write-Host ""

if (-not $keyLooksValid) {
  Write-Host "CAUZA: cheia nu a fost lipita complet." -ForegroundColor Red
  Write-Host "Sterge dj-soul.local.json si ruleaza din nou configuratorul." -ForegroundColor Yellow
  exit 1
}

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$query = @(
  "part=snippet,status",
  "maxResults=5",
  "playlistId=$([Uri]::EscapeDataString($playlistId))",
  "key=$([Uri]::EscapeDataString($apiKey))"
) -join "&"
$uri = "https://www.googleapis.com/youtube/v3/playlistItems?$query"

Write-Host "Testez conexiunea cu Google YouTube..." -ForegroundColor Cyan
try {
  $response = Invoke-RestMethod -Method Get -Uri $uri -TimeoutSec 25
  $count = @($response.items).Count
  Write-Host ""
  Write-Host "REZULTAT: CONEXIUNE REUSITA" -ForegroundColor Green
  Write-Host "Google a returnat $count elemente la test." -ForegroundColor Green
  Write-Host "DJ Soul poate citi playlistul." -ForegroundColor Green
  exit 0
} catch {
  $statusCode = $null
  try { $statusCode = [int]$_.Exception.Response.StatusCode } catch {}
  $googleMessage = $null
  $googleReason = $null
  try {
    $details = $_.ErrorDetails.Message | ConvertFrom-Json
    $googleMessage = [string]$details.error.message
    $googleReason = [string]$details.error.errors[0].reason
  } catch {}

  Write-Host ""
  Write-Host "REZULTAT: GOOGLE A RESPINS CEREREA" -ForegroundColor Red
  if ($statusCode) { Write-Host "Cod HTTP: $statusCode" -ForegroundColor White }
  if ($googleReason) { Write-Host "Motiv Google: $googleReason" -ForegroundColor Yellow }
  if ($googleMessage) { Write-Host "Mesaj Google: $googleMessage" -ForegroundColor Yellow }
  if (-not $googleMessage) { Write-Host "Mesaj sigur: conexiunea HTTPS sau serviciul Google nu a raspuns corect." -ForegroundColor Yellow }
  Write-Host ""
  Write-Host "Poti trimite o captura a acestui rezultat. Cheia nu este afisata." -ForegroundColor Green
  exit 1
}
