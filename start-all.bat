@echo off
title TechDesk Enterprise Server Launcher
echo ===================================================
echo   TechDesk Enterprise IT Helpdesk Platform
echo ===================================================
echo.
echo Starting Spring Boot Backend (Port 8080)...
start "TechDesk Backend" cmd /k "cd /d %~dp0backend && set PATH=C:\Users\deepa\tools\apache-maven-3.9.9\bin;C:\Program Files\MySQL\MySQL Server 8.0\bin;%PATH% && mvn spring-boot:run"

echo Starting React Frontend (Port 3000)...
start "TechDesk Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Servers are launching:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:8080
echo.
timeout /t 8
start http://localhost:3000
