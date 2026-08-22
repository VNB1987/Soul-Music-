$ErrorActionPreference = "Stop"
$configPath = Join-Path $PSScriptRoot "dj-soul.local.json"
$defaultPlaylistId = "PLedJ9SZ73vniuUjEsj5oPpog0bMWxUbQG"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " DJ SOUL - INGERI SI DANS - YOUTUBE" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cheia ramane numai pe acest PC si nu este afisata." -ForegroundColor Green
Write-Host ""

$secureApiKey = Read-Host "Lipeste cheia YouTube API (textul ramane ascuns)" -AsSecureString
$pointer = [IntPtr]::Zero
try {
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureApiKey)
  $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
} finally {
  if ($pointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}
if ([string]::IsNullOrWhiteSpace($apiKey)) { throw "Cheia YouTube API nu poate fi goala." }

$playlistId = Read-Host "Playlist ID [$defaultPlaylistId]"
if ([string]::IsNullOrWhiteSpace($playlistId)) { $playlistId = $defaultPlaylistId }

$json = [ordered]@{ apiKey = $apiKey.Trim(); playlistId = $playlistId.Trim() } | ConvertTo-Json
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($configPath, $json, $utf8)
try { (Get-Item -LiteralPath $configPath -Force).Attributes = [System.IO.FileAttributes]::Hidden } catch {}

Write-Host ""
Write-Host "DJ Soul a fost configurat pentru YouTube." -ForegroundColor Green
Write-Host "Playlist: $playlistId" -ForegroundColor White
Write-Host "Porneste proiectul cu PORNESTE-DJ-SOUL.bat." -ForegroundColor Yellow
