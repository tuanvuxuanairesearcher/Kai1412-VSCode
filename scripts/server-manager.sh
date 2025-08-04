#!/bin/bash

# AI Assistant Test Server Manager
# Utility script to manage the mock AI server

PORT=1998
SERVER_NAME="AI Assistant Test Server"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if server is running
check_server() {
    local pid=$(lsof -ti :$PORT 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "$pid"
    else
        echo ""
    fi
}

# Function to get server status
status() {
    print_status "Checking $SERVER_NAME status..."
    
    local pid=$(check_server)
    if [ ! -z "$pid" ]; then
        print_success "Server is running (PID: $pid)"
        print_status "URL: http://localhost:$PORT"
        print_status "Health check:"
        curl -s http://localhost:$PORT/health 2>/dev/null | jq . 2>/dev/null || echo "  Failed to get health status"
        return 0
    else
        print_warning "Server is not running"
        return 1
    fi
}

# Function to start server
start() {
    print_status "Starting $SERVER_NAME..."
    
    local pid=$(check_server)
    if [ ! -z "$pid" ]; then
        print_warning "Server is already running (PID: $pid)"
        print_status "Use './scripts/server-manager.sh restart' to restart"
        return 1
    fi
    
    # Check dependencies
    if [ ! -d "test-server/node_modules" ]; then
        print_status "Installing server dependencies..."
        cd test-server && npm install && cd ..
    fi
    
    # Start server
    print_status "Launching server on port $PORT..."
    cd test-server && npm start &
    local new_pid=$!
    cd ..
    
    # Wait for server to start
    print_status "Waiting for server to initialize..."
    sleep 3
    
    # Verify server started
    if curl -s http://localhost:$PORT/health >/dev/null 2>&1; then
        print_success "Server started successfully!"
        print_status "URL: http://localhost:$PORT"
        print_status "Model: Qwen3 0.6B"
        print_status "API Key: EMPTY"
        print_status ""
        print_status "Use 'curl http://localhost:$PORT/health' to check status"
        print_status "Use './scripts/server-manager.sh stop' to stop server"
    else
        print_error "Server failed to start properly"
        return 1
    fi
}

# Function to stop server
stop() {
    print_status "Stopping $SERVER_NAME..."
    
    local pid=$(check_server)
    if [ ! -z "$pid" ]; then
        kill $pid 2>/dev/null
        sleep 2
        
        # Check if still running
        local check_pid=$(check_server)
        if [ ! -z "$check_pid" ]; then
            print_warning "Server still running, force killing..."
            kill -9 $check_pid 2>/dev/null
            sleep 1
        fi
        
        # Final check
        local final_pid=$(check_server)
        if [ -z "$final_pid" ]; then
            print_success "Server stopped successfully"
        else
            print_error "Failed to stop server (PID: $final_pid)"
            return 1
        fi
    else
        print_warning "Server is not running"
    fi
}

# Function to restart server
restart() {
    print_status "Restarting $SERVER_NAME..."
    stop
    sleep 2
    start
}

# Function to show logs
logs() {
    print_status "Recent server activity:"
    print_status "To see live logs, run: ./scripts/start-test-server.sh"
    print_status ""
    
    if curl -s http://localhost:$PORT/health >/dev/null 2>&1; then
        print_status "Server health check:"
        curl -s http://localhost:$PORT/health | jq . 2>/dev/null || echo "Raw response: $(curl -s http://localhost:$PORT/health)"
        
        print_status ""
        print_status "Available models:"
        curl -s http://localhost:$PORT/v1/models | jq . 2>/dev/null || echo "Failed to get models"
    else
        print_warning "Server is not responding"
    fi
}

# Function to test server
test() {
    print_status "Testing $SERVER_NAME functionality..."
    
    if ! curl -s http://localhost:$PORT/health >/dev/null 2>&1; then
        print_error "Server is not running or not responding"
        print_status "Start server with: ./scripts/server-manager.sh start"
        return 1
    fi
    
    print_status "✓ Health check: OK"
    
    # Test chat completion
    print_status "Testing chat completion..."
    local response=$(curl -s -X POST http://localhost:$PORT/v1/chat/completions \
        -H "Authorization: Bearer EMPTY" \
        -H "Content-Type: application/json" \
        -d '{"model": "qwen3-0.6b", "messages": [{"role": "user", "content": "Hello"}]}' 2>/dev/null)
    
    if echo "$response" | grep -q "choices"; then
        print_status "✓ Chat completion: OK"
        local content=$(echo "$response" | jq -r '.choices[0].message.content' 2>/dev/null)
        print_status "  Response: ${content:0:50}..."
    else
        print_error "✗ Chat completion: FAILED"
        echo "Response: $response"
        return 1
    fi
    
    print_success "All tests passed! Server is working correctly."
    print_status ""
    print_status "🎯 Next steps:"
    print_status "1. Configure VS Code extension to use http://localhost:$PORT"
    print_status "2. Set API key to 'EMPTY' in extension settings"
    print_status "3. Run demo: npm run demo"
}

# Function to show help
help() {
    echo "🤖 $SERVER_NAME Manager"
    echo "==============================================" 
    echo ""
    echo "Usage: ./scripts/server-manager.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start the server"
    echo "  stop      Stop the server"
    echo "  restart   Restart the server"
    echo "  status    Check server status"
    echo "  logs      Show server logs and info"
    echo "  test      Test server functionality"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/server-manager.sh start"
    echo "  ./scripts/server-manager.sh status"
    echo "  ./scripts/server-manager.sh test"
    echo ""
    echo "Server Configuration:"
    echo "  URL: http://localhost:$PORT"
    echo "  Model: Qwen3 0.6B"  
    echo "  API Key: EMPTY"
}

# Main command handling
case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    test)
        test
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        help
        exit 1
        ;;
esac