#!/bin/bash

# AI Assistant Extension - Complete Test Script
# This script runs all tests including unit tests and integration tests

set -e  # Exit on any error

echo "🚀 AI Assistant Extension - Complete Test Suite"
echo "=============================================="

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "\${BLUE}[INFO]\${NC} $1"
}

print_success() {
    echo -e "\${GREEN}[SUCCESS]\${NC} $1"
}

print_warning() {
    echo -e "\${YELLOW}[WARNING]\${NC} $1"
}

print_error() {
    echo -e "\${RED}[ERROR]\${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Checking dependencies..."

# Install extension dependencies
if [ ! -d "node_modules" ]; then
    print_status "Installing extension dependencies..."
    npm install
fi

# Install test server dependencies
if [ ! -d "test-server/node_modules" ]; then
    print_status "Installing test server dependencies..."
    cd test-server
    npm install
    cd ..
fi

print_success "Dependencies installed"

# Kill any existing server on port 1998
print_status "Checking for existing server on port 1998..."
EXISTING_PID=$(lsof -ti :1998 2>/dev/null)
if [ ! -z "$EXISTING_PID" ]; then
    print_status "Found existing process $EXISTING_PID, killing it..."
    kill $EXISTING_PID 2>/dev/null || true
    sleep 2
    print_status "Cleaned up existing server"
fi

# Start test server in background
print_status "Starting mock AI server..."
cd test-server
npm start &
SERVER_PID=$!
cd ..

# Wait for server to start
print_status "Waiting for server to start..."
sleep 3

# Check if server is running
if curl -s http://localhost:1998/health > /dev/null; then
    print_success "Mock AI server is running on http://localhost:1998"
else
    print_error "Failed to start mock AI server"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Compile TypeScript
print_status "Compiling TypeScript..."
npm run compile

if [ $? -eq 0 ]; then
    print_success "TypeScript compilation completed"
else
    print_error "TypeScript compilation failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Run extension tests
print_status "Running extension tests..."
npm test

TEST_EXIT_CODE=$?

# Stop test server
print_status "Stopping mock AI server..."
kill $SERVER_PID 2>/dev/null || true

# Check test results
if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "All tests passed! ✅"
    echo ""
    echo "🎉 Test Summary:"
    echo "   ✅ Mock AI Server: OK"
    echo "   ✅ TypeScript Compilation: OK"
    echo "   ✅ Unit Tests: PASSED"
    echo "   ✅ Integration Tests: PASSED"
    echo ""
    echo "Your AI Assistant extension is ready for use!"
else
    print_error "Some tests failed ❌"
    exit 1
fi