#!/bin/bash
echo "Starting Narayan Pharmacy Prescription Entry & Drug Checker..."
echo ""

# Launch Django backend in background
echo "Launching Backend Server on http://127.0.0.1:8000 ..."
cd backend && .venv/bin/python manage.py runserver &
BACKEND_PID=$!
cd ..

# Launch Next.js frontend in background
echo "Launching Frontend Server on http://localhost:3000 ..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Both servers launched! Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both servers."

# Wait for Ctrl+C and kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
