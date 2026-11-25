@echo off
title Push to GitHub - IT Helpdesk Ticket Management System
echo ===================================================================
echo  Pushing IT Helpdesk Ticket Management System to GitHub
echo  Repository: https://github.com/srinivashdeepak/IT-HELPDESK-TICKET-MANAGEMENT-SYSTEM
echo ===================================================================
echo.
cd /d "%~dp0"
echo Current Branch:
git branch --show-current
echo.
echo Executing git push -u origin main...
echo (If prompted, sign in via browser to authorize GitHub access)
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Repository pushed successfully to GitHub!
) else (
    echo [ERROR] Git push encountered an issue. See above for details.
)
echo.
pause
