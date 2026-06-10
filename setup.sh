#!/bin/bash
set -e

echo "==================================================="
echo "Narayan Pharmacy Workspace - Setting Up Environment"
echo "==================================================="

echo "[1/3] Creating Python virtual environment..."
python3 -m venv backend/.venv

echo "[2/3] Installing backend dependencies..."
./backend/.venv/bin/pip install -r backend/requirements.txt

# Copy environment variables template if they don't exist
if [ ! -f backend/.env ]; then
    echo "Creating backend .env file..."
    cp .env.example backend/.env
fi
if [ ! -f frontend/.env ]; then
    echo "Creating frontend .env file..."
    cp .env.example frontend/.env
fi

echo "[3/3] Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "==================================================="
echo "Setup completed successfully!"
echo "==================================================="
