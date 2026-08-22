$ErrorActionPreference = "Stop"

$port = 8988
$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$rootPrefix = $root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "application/javascript; charset=utf-8"
  ".txt" = "text/plain; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif" = "image/gif"
  ".svg" = "image/svg+xml"
  ".webp" = "image/webp"
  ".ico" = "image/x-icon"
}

$youtubeBridgePath = Join-Path $root "youtube-bridge.ps1"
if ([System.IO.File]::Exists($youtubeBridgePath)) { . $youtubeBridgePath }
$mediaBridgePath = Join-Path $root "media-bridge.ps1"
if ([System.IO.File]::Exists($mediaBridgePath)) { . $mediaBridgePath }

function Write-Response {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [byte[]]$Body,
    [string]$ContentType,
    [string]$CacheControl = "no-cache"
  )
  $headers = @(
    "HTTP/1.1 $StatusCode $StatusText"
    "Content-Type: $ContentType"
    "Content-Length: $($Body.Length)"
    "Cache-Control: $CacheControl"
    "Access-Control-Allow-Origin: *"
    "Connection: close"
    ""
    ""
  ) -join "`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($Body.Length -gt 0) { $Stream.Write($Body, 0, $Body.Length) }
  $Stream.Flush()
}

function Write-JsonResponse {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [object]$Payload,
    [string]$Method = "GET",
    [int]$StatusCode = 200,
    [string]$StatusText = "OK"
  )
  $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($Payload | ConvertTo-Json -Depth 8 -Compress))
  $body = if ($Method -eq "HEAD") { [byte[]]::new(0) } else { $jsonBytes }
  Write-Response -Stream $Stream -StatusCode $StatusCode -StatusText $StatusText -Body $body -ContentType "application/json; charset=utf-8" -CacheControl "no-store, no-cache, must-revalidate"
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)

try {
  $listener.Start()
  Write-Host ""
  Write-Host "===============================================" -ForegroundColor Cyan
  Write-Host " SOUL MUSIC RGB DANCERS" -ForegroundColor Yellow
  Write-Host "===============================================" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "URL: http://127.0.0.1:$port" -ForegroundColor Green
  Write-Host "Root: $root"
  Write-Host ""
  Write-Host "Server activ. Inchide aceasta fereastra pentru oprire." -ForegroundColor White
  Write-Host ""

  while ($true) {
    $client = $listener.AcceptTcpClient()
    $reader = $null
    $stream = $null
    try {
      $stream = $client.GetStream()
      $stream.ReadTimeout = 1500
      $stream.WriteTimeout = 5000
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }
      while ($true) {
        $headerLine = $reader.ReadLine()
        if ($null -eq $headerLine -or $headerLine.Length -eq 0) { break }
      }

      $parts = $requestLine.Split(" ")
      if ($parts.Length -lt 2) { throw "Cerere HTTP invalida" }
      $method = $parts[0].ToUpperInvariant()
      $rawPath = $parts[1].Split("?")[0]
      $decodedPath = [System.Uri]::UnescapeDataString($rawPath)

      if ($method -ne "GET" -and $method -ne "HEAD") {
        Write-JsonResponse -Stream $stream -Payload ([ordered]@{ ready=$false; message="Metoda HTTP nu este permisa." }) -Method $method -StatusCode 405 -StatusText "Method Not Allowed"
        continue
      }

      if ($decodedPath -eq "/api/media/current") {
        try {
          $payload = if (Get-Command Get-CurrentMedia -ErrorAction SilentlyContinue) { Get-CurrentMedia } else { [ordered]@{ ready=$false; playing=$false; title=''; artist=''; source=''; method='unavailable' } }
          Write-JsonResponse -Stream $stream -Payload $payload -Method $method
        } catch {
          Write-JsonResponse -Stream $stream -Payload ([ordered]@{ ready=$false; playing=$false; title=''; artist=''; source=''; method='error' }) -Method $method -StatusCode 200 -StatusText "OK"
        }
        continue
      }

      if ($decodedPath -eq "/api/dj-soul/status" -or $decodedPath -eq "/api/dj-soul/playlist") {
        try {
          $payload = if ($decodedPath -eq "/api/dj-soul/status") { Get-DJSoulStatus } else { Get-DJSoulPlaylist }
          Write-JsonResponse -Stream $stream -Payload $payload -Method $method
        } catch {
          Write-JsonResponse -Stream $stream -Payload ([ordered]@{ ready=$false; message="Nu am putut citi playlistul YouTube. Verifica cheia API si conexiunea la internet." }) -Method $method -StatusCode 502 -StatusText "Bad Gateway"
        }
        continue
      }

      if ($decodedPath -eq "/") { $decodedPath = "/index.html" }
      $relativePath = $decodedPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
      $fullPath = [System.IO.Path]::GetFullPath((Join-Path $root $relativePath))
      $insideRoot = $fullPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)
      if (-not $insideRoot) {
        Write-Response -Stream $stream -StatusCode 403 -StatusText "Forbidden" -Body ([System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")) -ContentType "text/plain; charset=utf-8"
        continue
      }
      if (-not [System.IO.File]::Exists($fullPath)) {
        Write-Response -Stream $stream -StatusCode 404 -StatusText "Not Found" -Body ([System.Text.Encoding]::UTF8.GetBytes("404 Not Found")) -ContentType "text/plain; charset=utf-8"
        continue
      }

      $extension = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
      $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { "application/octet-stream" }
      $body = if ($method -eq "HEAD") { [byte[]]::new(0) } else { [System.IO.File]::ReadAllBytes($fullPath) }
      $cacheControl = if ($extension -eq ".txt" -or $extension -eq ".html" -or $extension -eq ".js") { "no-store, no-cache, must-revalidate" } else { "no-cache" }
      Write-Response -Stream $stream -StatusCode 200 -StatusText "OK" -Body $body -ContentType $contentType -CacheControl $cacheControl
    } catch {
      try {
        Write-Response -Stream $stream -StatusCode 500 -StatusText "Internal Server Error" -Body ([System.Text.Encoding]::UTF8.GetBytes("500 Internal Server Error")) -ContentType "text/plain; charset=utf-8"
      } catch {}
    } finally {
      if ($null -ne $reader) { $reader.Dispose() }
      if ($null -ne $stream) { $stream.Dispose() }
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
