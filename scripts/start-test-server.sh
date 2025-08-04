#!/bin/bash

# Start AI Assistant Test Server
# This script starts the mock AI server for testing

echo "🚀 Starting AI Assistant Test Server"
echo "===================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "test-server/node_modules" ]; then
    echo "📦 Installing test server dependencies..."
    cd test-server
    npm install
    cd ..
fi

# Kill any existing server on port 1998
echo "🧹 Checking for existing server on port 1998..."
EXISTING_PID=$(lsof -ti :1998 2>/dev/null)
if [ ! -z "$EXISTING_PID" ]; then
    echo "   Found existing process $EXISTING_PID, killing it..."
    kill $EXISTING_PID 2>/dev/null || true
    sleep 2
    echo "   ✅ Cleaned up existing server"
else
    echo "   ✅ Port 1998 is available"
fi

# Start server
echo "🔧 Configuration:"
echo "   URL: http://localhost:1998"
echo "   Model: Qwen3 0.6B"
echo "   API Key: EMPTY"
echo ""

cd test-server
npm start