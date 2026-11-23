@echo off
title InterviewIQ Launcher
echo ========================================================
echo   Starting InterviewIQ Platform (Backend + Frontend)
echo ========================================================
echo.

:: 1. Start Backend in a new window
start "InterviewIQ Backend (Port 5000)" cmd /k "cd /d %~dp0backend && node server.js"

:: 2. Start Frontend in a new window
start "InterviewIQ Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Backend and Frontend servers are launching!
echo.
echo - Backend API:  http://localhost:5000/api/health
echo - Frontend UI:   http://localhost:5173
echo.
echo You can keep this window closed. Both servers run in their own windows.
pause
