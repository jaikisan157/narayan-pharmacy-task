@echo off
echo Starting Narayan Pharmacy Prescription Entry & Drug Checker...
echo.

:: Launch Django backend in a new cmd window
echo Launching Backend Server on http://127.0.0.1:8000 ...
start "Narayan Rx Backend" cmd /k "cd backend && .venv\Scripts\python manage.py runserver"

:: Launch Next.js frontend in a new cmd window
echo Launching Frontend Server on http://localhost:3000 ...
start "Narayan Rx Frontend" cmd /k "cd frontend && node node_modules\next\dist\bin\next dev"


echo.
echo Both servers launching! Check the opened console windows for logs.
pause
