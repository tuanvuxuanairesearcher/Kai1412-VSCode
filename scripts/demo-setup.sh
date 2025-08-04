#!/bin/bash

# AI Assistant Extension - Demo Setup Script
# Prepares everything for a live demo

echo "🎬 AI Assistant Extension - Demo Setup"
echo "======================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[DEMO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Step 1: Ensure server is running
print_status "Step 1: Checking mock AI server..."
if curl -s http://localhost:1998/health >/dev/null 2>&1; then
    print_success "Mock server is running on localhost:1998"
else
    print_status "Starting mock server..."
    ./scripts/server-manager.sh start
    sleep 3
    if curl -s http://localhost:1998/health >/dev/null 2>&1; then
        print_success "Mock server started successfully"
    else
        echo "❌ Failed to start mock server"
        exit 1
    fi
fi

# Step 2: Compile extension
print_status "Step 2: Compiling TypeScript..."
npm run compile
if [ $? -eq 0 ]; then
    print_success "Extension compiled successfully"
else
    echo "❌ Compilation failed"
    exit 1
fi

# Step 3: Test server connectivity
print_status "Step 3: Testing server functionality..."
./scripts/server-manager.sh test > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Server tests passed"
else
    print_warning "Server tests had issues, but proceeding..."
fi

# Step 4: Prepare demo files
print_status "Step 4: Preparing demo files..."
if [ ! -f "demo/live-demo.js" ]; then
    echo "❌ Demo file not found"
    exit 1
fi
print_success "Demo files ready"

# Step 5: Show demo instructions
echo ""
print_success "🚀 Demo Environment Ready!"
echo ""
echo "📋 Quick Demo Steps:"
echo "==================="
echo ""
echo "1️⃣  Launch Extension Development Host:"
echo "   - Press F5 in VS Code"
echo "   - New VS Code window will open"
echo ""
echo "2️⃣  Configure Extension (in new window):"
echo "   - Ctrl+, → Search 'AI Assistant'"
echo "   - Provider: local"
echo "   - Endpoint: http://localhost:1998" 
echo "   - Model: qwen3-0.6b"
echo "   - API Key: EMPTY"
echo ""
echo "3️⃣  Open Demo File:"
echo "   - File → Open → demo/live-demo.js"
echo "   - Follow comments for demo steps"
echo ""
echo "4️⃣  Demo Features:"
echo "   ✨ Chat Interface - Click AI Assistant icon"
echo "   ✨ Code Generation - Ctrl+\\"
echo "   ✨ Code Explanation - Right-click → AI Actions"
echo "   ✨ Documentation - Right-click → AI Actions"
echo "   ✨ Unit Tests - Right-click → AI Actions"
echo "   ✨ Git Integration - Source Control panel"
echo "   ✨ Inline Completion - Alt+Shift+\\"
echo ""
echo "📊 Server Status:"
echo "=================="
./scripts/server-manager.sh status | tail -n +2
echo ""
echo "🎯 Ready to demo! Press F5 to start."
echo ""
echo "📚 Full demo guide: cat DEMO-GUIDE.md"
echo "🛠️  Server management: ./scripts/server-manager.sh help"