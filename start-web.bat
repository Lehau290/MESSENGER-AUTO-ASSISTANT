@echo off
title Messenger Auto Assistant - Web Application
echo ========================================================
echo   Messenger Auto Assistant - Khoi dong Web App (Chrome)
echo ========================================================
cd /d "%~dp0\frontend"
set PATH=%~dp0.tools\node;%PATH%
npm run dev
pause
