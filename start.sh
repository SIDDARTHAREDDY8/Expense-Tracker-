#!/bin/bash
set -e

echo "Starting Expense Tracker..."

# Start PostgreSQL if not running
if ! brew services list | grep "postgresql@16" | grep "started" > /dev/null 2>&1; then
    echo "Starting PostgreSQL..."
    brew services start postgresql@16
    sleep 2
fi

# Create DB if not exists
/opt/homebrew/opt/postgresql@16/bin/psql postgres -c "CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres';" 2>/dev/null || true
/opt/homebrew/opt/postgresql@16/bin/psql postgres -c "CREATE DATABASE expense_tracker OWNER postgres;" 2>/dev/null || true

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Start Backend
echo "Starting FastAPI backend..."
cd "$ROOT/backend"
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

sleep 2

# Start Frontend
echo "Starting React frontend..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "==========================================="
echo "  Expense Tracker is running!"
echo "==========================================="
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo "==========================================="
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
