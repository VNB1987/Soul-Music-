@echo off
setlocal
title DJ Soul - Ingeri si Dans
cd /d "%~dp0"

echo.
echo ===================================================
echo  DJ SOUL - INGERI SI DANS
echo ===================================================
echo.

if not exist "%~dp0dj-soul.local.json" (
  echo DJ Soul nu este configurat pentru YouTube.
  echo Ruleaza mai intai configure-dj-soul.bat.
  echo.
  pause
  exit /b 1
)

start "DJ Soul Local Server" powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-live.ps1"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8988/?v=20260822-01"

echo Proiect pornit la http://127.0.0.1:8988/
echo Nu inchide fereastra serverului in timpul LIVE-ului.
echo.
pause
endlocal
