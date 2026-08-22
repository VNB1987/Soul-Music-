$ErrorActionPreference = "Stop"
$configPath = Join-Path $PSScriptRoot "dj-soul.local.json"
$playlistId = "PLedJ9SZ73vniuUjEsj5oPpog0bMWxUbQG"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " DJ SOUL - CONFIGURARE DIN CLIPBOARD" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cheia nu va fi afisata." -ForegroundColor Green
Write-Host ""

try {
  $apiKey = [string](Get-Clipboard -Raw)
} catch {
  Write-Host "Nu am putut citi Clipboard-ul." -ForegroundColor Red
  exit 1
}

$apiKey = $apiKey.Trim()
if (-not $apiKey.StartsWith("AIza") -or $apiKey.Length -lt 35) {
  Write-Host "REZULTAT: Clipboard-ul nu contine o cheie Google completa." -ForegroundColor Red
  Write-Host "Lungime detectata: $($apiKey.Length) caractere." -ForegroundColor Yellow
  Write-Host "Revino in Google Cloud, apasa Copy key si ruleaza iar acest fisier." -ForegroundColor Yellow
  exit 1
}

if (Test-Path -LiteralPath $configPath) {
  try {
    $item = Get-Item -LiteralPath $configPath -Force
    $item.Attributes = $item.Attributes -band (-bnot [IO.FileAttributes]::Hidden)
    $item.Attributes = $item.Attributes -band (-bnot [IO.FileAttributes]::ReadOnly)
  } catch {}
}

$json = [ordered]@{ apiKey=$apiKey; playlistId=$playlistId } | ConvertTo-Json
$utf8 = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText($configPath, $json, $utf8)
try { (Get-Item -LiteralPath $configPath -Force).Attributes = [IO.FileAttributes]::Hidden } catch {}

Write-Host "REZULTAT: CHEIA A FOST SALVATA CORECT." -ForegroundColor Green
Write-Host "Lungime verificata: $($apiKey.Length) caractere." -ForegroundColor Green
Write-Host "Format Google: CORECT" -ForegroundColor Green
Write-Host "Playlist: $playlistId" -ForegroundColor White
Write-Host ""
Write-Host "Acum ruleaza PORNESTE-DJ-SOUL.bat." -ForegroundColor Yellow
