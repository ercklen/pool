@echo off
echo Starting Billiard Tournament Manager...
echo.
echo Make sure you have installed dependencies with 'npm install' if this is your first time.
echo.

:: Start the Vite development server
start cmd /k "npm run dev"

:: Wait 3 seconds for the server to start
timeout /t 3 /nobreak > nul

:: Open the Admin page in the default web browser
start http://localhost:5173/admin

echo Application started! You can close this window.
