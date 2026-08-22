@echo off
setlocal
title DJ Soul - Cheie din Clipboard
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0CONFIGUREAZA-CHEIA-DIN-CLIPBOARD.ps1"
echo.
pause
endlocal
