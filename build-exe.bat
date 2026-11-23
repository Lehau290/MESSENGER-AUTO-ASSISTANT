@echo off
title Messenger Auto Assistant - Dong goi ung dung Windows .EXE
echo ========================================================
echo   Messenger Auto Assistant - Dong goi file .EXE Windows
echo ========================================================
set PATH=%~dp0.tools\node;%PATH%
set ELECTRON_CACHE=%~dp0.cache\electron

echo [1/3] Build Frontend Web App...
cd /d "%~dp0\frontend"
call npm run build

echo [2/3] Build Electron Main Process...
cd /d "%~dp0\desktop"
call npm run build:electron

echo [3/3] Dong goi thanh file Windows .EXE voi Electron Builder...
call npx electron-builder --win --dir

echo ========================================================
echo   Hoan tat dong goi!
echo   Thu muc xuat file ung dung Windows: desktop\release\win-unpacked
echo ========================================================
pause
