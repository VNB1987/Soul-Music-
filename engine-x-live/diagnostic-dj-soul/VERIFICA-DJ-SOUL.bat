@echo off
setlocal
title Verificare DJ Soul YouTube
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0VERIFICA-DJ-SOUL.ps1"
echo.
pause
endlocal
