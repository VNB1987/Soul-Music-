$script:DJSoulConfigPath = Join-Path $PSScriptRoot "dj-soul.local.json"

function Get-DJSoulConfig {
  if (-not [System.IO.File]::Exists($script:DJSoulConfigPath)) { return $null }
  try {
    $config = [System.IO.File]::ReadAllText($script:DJSoulConfigPath) | ConvertFrom-Json
    if ([string]::IsNullOrWhiteSpace($config.apiKey) -or [string]::IsNullOrWhiteSpace($config.playlistId)) { return $null }
    return $config
  } catch { return $null }
}

function ConvertTo-DJSoulJsonBytes {
  param([Parameter(Mandatory = $true)]$Value)
  return [System.Text.Encoding]::UTF8.GetBytes(($Value | ConvertTo-Json -Depth 12 -Compress))
}

function Get-DJSoulStatus {
  $config = Get-DJSoulConfig
  return [ordered]@{
    ready = ($null -ne $config)
    configured = ($null -ne $config)
    playlistId = if ($null -ne $config) { $config.playlistId } else { $null }
    apiKeyExposed = $false
    phase = "youtube-playlist-readonly"
  }
}

function Get-DJSoulPlaylist {
  $config = Get-DJSoulConfig
  if ($null -eq $config) { throw "DJ Soul nu este configurat. Ruleaza configure-dj-soul.bat." }
  $items = New-Object System.Collections.Generic.List[object]
  $pageToken = $null
  do {
    $query = @(
      "part=snippet,contentDetails,status",
      "maxResults=50",
      "playlistId=$([System.Uri]::EscapeDataString($config.playlistId))",
      "key=$([System.Uri]::EscapeDataString($config.apiKey))"
    )
    if (-not [string]::IsNullOrWhiteSpace($pageToken)) { $query += "pageToken=$([System.Uri]::EscapeDataString($pageToken))" }
    $response = Invoke-RestMethod -Method Get -Uri "https://www.googleapis.com/youtube/v3/playlistItems?$($query -join '&')" -UseBasicParsing -TimeoutSec 20
    foreach ($entry in $response.items) {
      $snippet = $entry.snippet
      $thumbnail = if ($null -ne $snippet.thumbnails.maxres) { $snippet.thumbnails.maxres.url } elseif ($null -ne $snippet.thumbnails.high) { $snippet.thumbnails.high.url } elseif ($null -ne $snippet.thumbnails.medium) { $snippet.thumbnails.medium.url } else { $snippet.thumbnails.default.url }
      $items.Add([ordered]@{
        playlistItemId = $entry.id; videoId = $snippet.resourceId.videoId; title = $snippet.title
        description = $snippet.description; position = [int]$snippet.position
        channelTitle = $snippet.videoOwnerChannelTitle; channelId = $snippet.videoOwnerChannelId
        publishedAt = $snippet.publishedAt; privacyStatus = $entry.status.privacyStatus
        thumbnail = $thumbnail
        url = "https://www.youtube.com/watch?v=$($snippet.resourceId.videoId)&list=$($config.playlistId)"
      })
    }
    $pageToken = $response.nextPageToken
  } while (-not [string]::IsNullOrWhiteSpace($pageToken))
  return [ordered]@{ ready=$true; playlistId=$config.playlistId; count=$items.Count; fetchedAt=[DateTime]::UtcNow.ToString("o"); items=$items }
}
