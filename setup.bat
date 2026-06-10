@echo off
echo ===================================================
echo Narayan Pharmacy Workspace - Setting Up Environment
echo ===================================================

echo [1/3] Creating Python virtual environment...
python -m venv backend\.venv
if %errorlevel% neq 0 (
    echo Error: Failed to create Python virtual environment.
    exit /b %errorlevel%
)

echo [2/3] Installing backend dependencies...
call .\backend\.venv\Scripts\pip install -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install backend requirements.
    exit /b %errorlevel%
)

:: Copy environment variables template if they don't exist
if not exist backend\.env (
    echo Creating backend .env file...
    copy .env.example backend\.env > nul
)
if not exist frontend\.env (
    echo Creating frontend .env file...
    copy .env.example frontend\.env > nul
)

echo [3/3] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo ===================================================
echo Setup completed successfully!
echo ===================================================
