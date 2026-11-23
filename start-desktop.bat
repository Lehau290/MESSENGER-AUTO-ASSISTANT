@echo off
title Messenger Auto Assistant - Desktop Windows App
echo ========================================================
echo   Messenger Auto Assistant - Khoi dong Desktop Windows App
echo ========================================================
cd /d "%~dp0\desktop"
set PATH=%~dp0.tools\node;%PATH%
npm run dev
pause
