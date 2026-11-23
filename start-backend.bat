@echo off
title Messenger Auto Assistant - Backend Server
echo ========================================================
echo   Messenger Auto Assistant - Khoi dong Backend Server
echo ========================================================
cd /d "%~dp0\backend"
set PATH=%~dp0.tools\node;%PATH%
npm run dev
pause
