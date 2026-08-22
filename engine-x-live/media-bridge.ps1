$script:MediaBridgeReady = $false
$script:MediaManager = $null
$script:MediaManagerType = $null
$script:MediaPropertiesType = $null

function ConvertTo-MediaJsonBytes {
  param([object]$Value)
  [System.Text.Encoding]::UTF8.GetBytes(($Value | ConvertTo-Json -Depth 6 -Compress))
}

function Initialize-MediaBridge {
  if ($script:MediaBridgeReady) { return }
  try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime -ErrorAction Stop
    $script:MediaManagerType = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType=WindowsRuntime]
    $script:MediaPropertiesType = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties, Windows.Media.Control, ContentType=WindowsRuntime]
    $request = $script:MediaManagerType::RequestAsync()
    $method = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
      $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
    } | Select-Object -First 1
    $task = $method.MakeGenericMethod($script:MediaManagerType).Invoke($null, @($request))
    $task.Wait()
    $script:MediaManager = $task.Result
    $script:MediaBridgeReady = $null -ne $script:MediaManager
  } catch {
    $script:MediaBridgeReady = $false
  }
}

function Await-MediaProperties {
  param([object]$Operation)
  $method = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
  } | Select-Object -First 1
  $task = $method.MakeGenericMethod($script:MediaPropertiesType).Invoke($null, @($Operation))
  $task.Wait()
  $task.Result
}

function Normalize-MediaTitle {
  param([string]$Title)
  if ([string]::IsNullOrWhiteSpace($Title)) { return '' }
  $value = $Title.Trim()
  $value = $value -replace '\s+-\s+YouTube\s*$', ''
  $value = $value -replace '\s+\|\s+TikTok\s*$', ''
  $value = $value -replace '\s+\|\s+Suno\s*$', ''
  $value.Trim()
}

function Get-BrowserWindowFallback {
  $candidates = Get-Process chrome, msedge -ErrorAction SilentlyContinue | Where-Object {
    -not [string]::IsNullOrWhiteSpace($_.MainWindowTitle)
  }
  foreach ($process in $candidates) {
    $windowTitle = Normalize-MediaTitle $process.MainWindowTitle
    if ($windowTitle -and $windowTitle -notmatch 'Engine X|DJ Soul|Soul Music RGB Dancers') {
      $source = if ($process.ProcessName -eq 'msedge') { 'Edge' } else { 'Chrome' }
      return [ordered]@{ ready=$true; playing=$true; title=$windowTitle; artist=''; source=$source; method='window-title' }
    }
  }
  return $null
}

function Get-CurrentMedia {
  Initialize-MediaBridge
  if ($script:MediaBridgeReady) {
    try {
      $sessions = @($script:MediaManager.GetSessions())
      $session = $script:MediaManager.GetCurrentSession()
      if ($null -eq $session -or $session.GetPlaybackInfo().PlaybackStatus.ToString() -ne 'Playing') {
        $session = $sessions | Where-Object { $_.GetPlaybackInfo().PlaybackStatus.ToString() -eq 'Playing' } | Select-Object -First 1
      }
      if ($null -ne $session) {
        $props = Await-MediaProperties $session.TryGetMediaPropertiesAsync()
        $title = Normalize-MediaTitle ([string]$props.Title)
        $artist = ([string]$props.Artist).Trim()
        $status = $session.GetPlaybackInfo().PlaybackStatus.ToString()
        if ($title) {
          return [ordered]@{
            ready=$true
            playing=($status -eq 'Playing')
            title=$title
            artist=$artist
            source=[string]$session.SourceAppUserModelId
            method='windows-media-session'
          }
        }
      }
    } catch {
      # Folosim fallback-ul de mai jos daca sesiunea media Windows nu expune metadate.
    }
  }

  $fallback = Get-BrowserWindowFallback
  if ($null -ne $fallback) { return $fallback }

  return [ordered]@{ ready=$true; playing=$false; title=''; artist=''; source=''; method='none' }
}
