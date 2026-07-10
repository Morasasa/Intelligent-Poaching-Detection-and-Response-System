#!/bin/bash

# Define colors for output formatting
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Intelligent Poaching Detection System...${NC}\n"

# Start the Backend
echo -e "${BLUE}▶ Starting FastAPI Backend (Port 8000)...${NC}"
cd backend || exit
# Activate virtual environment and set PYTHONPATH
source ../venv/bin/activate
export PYTHONPATH=..
# Run uvicorn in the background
uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start the Frontend
echo -e "\n${BLUE}▶ Starting React Frontend (Port 5173)...${NC}"
cd frontend || exit
# Run vite in the background
npm run dev &
FRONTEND_PID=$!
cd ..

# Function to cleanly shut down both servers
cleanup() {
    echo -e "\n${GREEN}Shutting down servers gracefully...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Done."
    exit
}

# Trap Ctrl+C (SIGINT) and SIGTERM to trigger the cleanup
trap cleanup SIGINT SIGTERM

echo -e "\n${GREEN}✔ Both servers are running!${NC}"
echo -e "Frontend: http://localhost:5173"
echo -e "Backend API: http://localhost:8000/docs\n"
echo -e "Press ${BLUE}Ctrl+C${NC} to stop both servers."

# Wait indefinitely until interrupted
wait
