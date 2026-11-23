@echo off
title Messenger Auto Assistant - He thong Hoan chinh
echo ========================================================
echo   Messenger Auto Assistant - Khoi dong toan bo he thong
echo ========================================================
echo [1/3] Khoi dong Backend API & Database...
start "Messenger Assistant Backend" cmd /k "cd /d %~dp0\backend && set PATH=%~dp0.tools\node;%PATH% && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/3] Khoi dong Web Application (Vite Frontend)...
start "Messenger Assistant Web" cmd /k "cd /d %~dp0\frontend && set PATH=%~dp0.tools\node;%PATH% && npm run dev"

timeout /t 2 /nobreak > nul

echo [3/3] Mo trinh duyet Google Chrome den ung dung...
start http://localhost:5173

echo ========================================================
echo   He thong da khoi dong thanh cong!
echo   - Web URL: http://localhost:5173
echo   - Backend API: http://localhost:5000/api
echo   - Tai khoan mac dinh: admin@messenger.vn / Password123@
echo ========================================================
pause
