#!/bin/bash
# 50BraIns Client Development Startup Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting 50BraIns Client Development Environment${NC}"
echo -e "${BLUE}=================================================${NC}"

# Check if backend is running on port 3000
echo -e "${YELLOW}📡 Checking if backend is running on port 3000...${NC}"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is running on port 3000${NC}"
else
    echo -e "${RED}⚠️  Backend API is not running on port 3000${NC}"
    echo -e "${YELLOW}   Please start your backend server first${NC}"
fi

# Check if port 5173 is available for frontend
echo -e "${YELLOW}🔍 Checking if port 5173 is available for frontend...${NC}"
if netstat -an | grep :5173 > /dev/null 2>&1; then
    echo -e "${RED}❌ Port 5173 is already in use${NC}"
    echo -e "${YELLOW}   Attempting to free port 5173...${NC}"
    # Kill any process using port 5173
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
else
    echo -e "${GREEN}✅ Port 5173 is available${NC}"
fi

# Install dependencies if needed
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Start the development server
echo -e "${YELLOW}🔧 Starting Next.js development server on port 5173...${NC}"
echo -e "${BLUE}   Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}   Backend:  http://localhost:3000${NC}"
echo -e "${BLUE}=================================================${NC}"

npm run dev
