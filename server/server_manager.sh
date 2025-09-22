#!/bin/bash

# WayPoint Backend Server Management Script
# This script provides easy commands to manage the WayPoint Django server

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server configuration
SERVER_DIR="/media/zayko2/NewDisk/WayPoint/server"
VENV_DIR="$SERVER_DIR/venv"
MANAGE_PY="$SERVER_DIR/manage.py"
SERVER_HOST="0.0.0.0"
SERVER_PORT="8000"
DB_NAME="waypoint_db"
DB_USER="waypoint_user"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  WayPoint Server Manager${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if server is running
check_server_status() {
    if pgrep -f "manage.py runserver" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to get server PID
get_server_pid() {
    pgrep -f "manage.py runserver"
}

# Function to start the server
start_server() {
    print_header
    print_status "Starting WayPoint Backend Server..."
    
    if check_server_status; then
        print_warning "Server is already running (PID: $(get_server_pid))"
        echo "Use 'stop' command to stop it first, or 'restart' to restart"
        return 1
    fi
    
    cd "$SERVER_DIR" || {
        print_error "Failed to change to server directory: $SERVER_DIR"
        exit 1
    }
    
    if [ ! -f "$VENV_DIR/bin/activate" ]; then
        print_error "Virtual environment not found at: $VENV_DIR"
        print_status "Please run 'setup' command first to create the virtual environment"
        exit 1
    fi
    
    print_status "Activating virtual environment..."
    if [ -f "$VENV_DIR/bin/activate" ]; then
        source "$VENV_DIR/bin/activate"
        PYTHON_CMD="python"
    else
        print_warning "Virtual environment activation script not found, using system Python"
        PYTHON_CMD="python3"
    fi
    
    print_status "Starting Django development server on $SERVER_HOST:$SERVER_PORT..."
    print_status "Server will be accessible at:"
    echo "  - Local: http://localhost:$SERVER_PORT"
    echo "  - Network: http://$(hostname -I | awk '{print $1}'):$SERVER_PORT"
    echo ""
    print_status "Press Ctrl+C to stop the server"
    echo ""
    
    $PYTHON_CMD "$MANAGE_PY" runserver "$SERVER_HOST:$SERVER_PORT"
}

# Function to stop the server
stop_server() {
    print_header
    print_status "Stopping WayPoint Backend Server..."
    
    if ! check_server_status; then
        print_warning "Server is not currently running"
        return 1
    fi
    
    PID=$(get_server_pid)
    print_status "Stopping server (PID: $PID)..."
    
    kill "$PID" 2>/dev/null
    
    # Wait a moment and check if it's still running
    sleep 2
    if check_server_status; then
        print_warning "Server didn't stop gracefully, force killing..."
        kill -9 "$PID" 2>/dev/null
    fi
    
    print_status "Server stopped successfully"
}

# Function to restart the server
restart_server() {
    print_header
    print_status "Restarting WayPoint Backend Server..."
    
    if check_server_status; then
        stop_server
        sleep 2
    fi
    
    start_server
}

# Function to show server status
show_status() {
    print_header
    print_status "WayPoint Server Status"
    echo ""
    
    if check_server_status; then
        PID=$(get_server_pid)
        print_status "✅ Server is RUNNING (PID: $PID)"
        echo ""
        print_status "Server URLs:"
        echo "  - Local: http://localhost:$SERVER_PORT"
        echo "  - Network: http://$(hostname -I | awk '{print $1}'):$SERVER_PORT"
        echo ""
        print_status "API Endpoints:"
        echo "  - Authentication: http://localhost:$SERVER_PORT/auth/"
        echo "  - Delivery: http://localhost:$SERVER_PORT/delivery/"
        echo "  - Admin: http://localhost:$SERVER_PORT/admin/"
    else
        print_warning "❌ Server is NOT RUNNING"
    fi
    
    echo ""
    print_status "Database Status:"
    if sudo -u postgres psql -c "SELECT 1;" -d "$DB_NAME" >/dev/null 2>&1; then
        print_status "✅ Database '$DB_NAME' is accessible"
    else
        print_error "❌ Database '$DB_NAME' is not accessible"
    fi
}

# Function to run database migrations
run_migrations() {
    print_header
    print_status "Running Database Migrations..."
    
    cd "$SERVER_DIR" || {
        print_error "Failed to change to server directory: $SERVER_DIR"
        exit 1
    }
    
    if [ ! -f "$VENV_DIR/bin/activate" ]; then
        print_error "Virtual environment not found at: $VENV_DIR"
        exit 1
    fi
    
    if [ -f "$VENV_DIR/bin/activate" ]; then
        source "$VENV_DIR/bin/activate"
        PYTHON_CMD="python"
    else
        print_warning "Virtual environment activation script not found, using system Python"
        PYTHON_CMD="python3"
    fi
    
    print_status "Creating migrations..."
    $PYTHON_CMD "$MANAGE_PY" makemigrations
    
    print_status "Applying migrations..."
    $PYTHON_CMD "$MANAGE_PY" migrate
    
    print_status "Migrations completed successfully"
}

# Function to create superuser
create_superuser() {
    print_header
    print_status "Creating Django Superuser..."
    
    cd "$SERVER_DIR" || {
        print_error "Failed to change to server directory: $SERVER_DIR"
        exit 1
    }
    
    if [ ! -f "$VENV_DIR/bin/activate" ]; then
        print_error "Virtual environment not found at: $VENV_DIR"
        exit 1
    fi
    
    if [ -f "$VENV_DIR/bin/activate" ]; then
        source "$VENV_DIR/bin/activate"
        PYTHON_CMD="python"
    else
        print_warning "Virtual environment activation script not found, using system Python"
        PYTHON_CMD="python3"
    fi
    
    $PYTHON_CMD "$MANAGE_PY" createsuperuser
}

# Function to show logs
show_logs() {
    print_header
    print_status "Server Logs (last 50 lines)"
    echo ""
    
    if check_server_status; then
        print_status "Server is running. Use 'tail -f' to follow logs in real-time"
    else
        print_warning "Server is not running"
    fi
    
    echo ""
    print_status "Recent server activity:"
    journalctl --user -u waypoint-server --no-pager -n 50 2>/dev/null || echo "No systemd logs found"
}

# Function to test API endpoints
test_api() {
    print_header
    print_status "Testing WayPoint API Endpoints..."
    echo ""
    
    if ! check_server_status; then
        print_error "Server is not running. Start it first with 'start' command"
        return 1
    fi
    
    BASE_URL="http://localhost:$SERVER_PORT"
    
    print_status "Testing server connectivity..."
    if curl -s -I "$BASE_URL/" >/dev/null; then
        print_status "✅ Server is responding"
    else
        print_error "❌ Server is not responding"
        return 1
    fi
    
    echo ""
    print_status "Testing API endpoints:"
    
    # Test auth endpoints
    echo "  - Auth login endpoint:"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/auth/login/")
    if [ "$RESPONSE" = "405" ]; then
        print_status "    ✅ /auth/login/ (Method Not Allowed - Expected for GET)"
    else
        print_warning "    ⚠️  /auth/login/ returned: $RESPONSE"
    fi
    
    # Test delivery endpoints
    echo "  - Delivery packages endpoint:"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/delivery/packages/")
    if [ "$RESPONSE" = "401" ]; then
        print_status "    ✅ /delivery/packages/ (Unauthorized - Expected without auth)"
    else
        print_warning "    ⚠️  /delivery/packages/ returned: $RESPONSE"
    fi
    
    echo ""
    print_status "API test completed"
}

# Function to setup the server environment
setup_server() {
    print_header
    print_status "Setting up WayPoint Backend Server..."
    echo ""
    
    cd "$SERVER_DIR" || {
        print_error "Failed to change to server directory: $SERVER_DIR"
        exit 1
    }
    
    # Check if Python 3 is available
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3 first."
        exit 1
    fi
    
    # Check if pip is available
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 is not installed. Please install pip3 first."
        exit 1
    fi
    
    print_status "Python 3 and pip3 found ✓"
    
    # Create virtual environment if it doesn't exist
    if [ -d "$VENV_DIR" ]; then
        print_warning "Virtual environment already exists at: $VENV_DIR"
        read -p "Do you want to recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Removing existing virtual environment..."
            rm -rf "$VENV_DIR"
        else
            print_status "Using existing virtual environment..."
        fi
    fi
    
    if [ ! -d "$VENV_DIR" ]; then
        print_status "Creating virtual environment..."
        python3 -m venv "$VENV_DIR"
        if [ $? -ne 0 ]; then
            print_error "Failed to create virtual environment"
            exit 1
        fi
        print_status "Virtual environment created successfully ✓"
    fi
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    if [ -f "$VENV_DIR/bin/activate" ]; then
        source "$VENV_DIR/bin/activate"
        PYTHON_CMD="python"
        PIP_CMD="pip"
    else
        print_warning "Virtual environment activation script not found, using system Python"
        PYTHON_CMD="python3"
        PIP_CMD="pip3"
    fi
    
    # Upgrade pip
    print_status "Upgrading pip..."
    $PIP_CMD install --upgrade pip
    
    # Install requirements
    if [ -f "requirements.txt" ]; then
        print_status "Installing Python dependencies..."
        $PIP_CMD install -r requirements.txt
        if [ $? -ne 0 ]; then
            print_error "Failed to install dependencies"
            exit 1
        fi
        print_status "Dependencies installed successfully ✓"
    else
        print_warning "requirements.txt not found, skipping dependency installation"
    fi
    
    # Setup environment file
    if [ ! -f ".env" ] && [ -f "env_example.txt" ]; then
        print_status "Creating environment file from template..."
        cp env_example.txt .env
        print_warning "Please edit .env file with your actual configuration values"
        print_status "Environment file created: $SERVER_DIR/.env"
    elif [ -f ".env" ]; then
        print_status "Environment file already exists ✓"
    else
        print_warning "No environment file template found, you may need to create .env manually"
    fi
    
    # Run migrations
    print_status "Running database migrations..."
    $PYTHON_CMD "$MANAGE_PY" makemigrations
    $PYTHON_CMD "$MANAGE_PY" migrate
    if [ $? -ne 0 ]; then
        print_warning "Database migrations failed. You may need to configure your database first."
        print_status "Please check your database configuration in .env file"
    else
        print_status "Database migrations completed successfully ✓"
    fi
    
    # Ask about creating superuser
    echo ""
    read -p "Do you want to create a Django superuser now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        $PYTHON_CMD "$MANAGE_PY" createsuperuser
    fi
    
    echo ""
    print_status "Setup completed successfully! 🎉"
    echo ""
    print_status "Next steps:"
    echo "  1. Edit .env file with your configuration"
    echo "  2. Run './server_manager.sh start' to start the server"
    echo "  3. Run './server_manager.sh status' to check server status"
    echo ""
    print_status "Server will be accessible at:"
    echo "  - Local: http://localhost:$SERVER_PORT"
    echo "  - Network: http://$(hostname -I | awk '{print $1}'):$SERVER_PORT"
}

# Function to show help
show_help() {
    print_header
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Available commands:"
    echo ""
    echo "  setup       Set up the server environment (first time setup)"
    echo "  start       Start the WayPoint backend server"
    echo "  stop        Stop the running server"
    echo "  restart     Restart the server"
    echo "  status      Show server status and information"
    echo "  logs        Show server logs"
    echo "  test        Test API endpoints"
    echo "  migrate     Run database migrations"
    echo "  superuser   Create Django superuser"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup    # First time setup"
    echo "  $0 start    # Start the server"
    echo "  $0 status   # Check if server is running"
    echo "  $0 restart  # Restart the server"
    echo ""
    echo "Server Configuration:"
    echo "  Host: $SERVER_HOST"
    echo "  Port: $SERVER_PORT"
    echo "  Directory: $SERVER_DIR"
    echo "  Database: $DB_NAME"
}

# Main script logic
case "${1:-help}" in
    setup)
        setup_server
        ;;
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    test)
        test_api
        ;;
    migrate)
        run_migrations
        ;;
    superuser)
        create_superuser
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
