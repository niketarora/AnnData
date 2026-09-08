@echo off
echo ===================================================
echo Starting KrishiNetra 2.0 Development Environment
echo ===================================================

echo [1/2] Launching Backend API (Port 4000)...
start "KrishiNetra Backend" cmd /k "cd /d %~dp0\..\backend && npm run dev"

echo [2/2] Launching Frontend Mobile App (Expo)...
start "KrishiNetra Frontend" cmd /k "cd /d %~dp0\..\frontend && npm start"

echo.
echo Both servers started!
echo - Backend: http://localhost:4000/health
echo - Frontend: Expo Metro Bundler
echo ===================================================
