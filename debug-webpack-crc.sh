#!/bin/bash

# Debug script for Webpack CRC error
# This script provides multiple debugging strategies for the CRC compilation error

set -e

echo "🔍 Ephra Webpack CRC Error Debug Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to clean up previous builds
cleanup_builds() {
    print_status "Cleaning up previous builds..."
    rm -rf dist/ web-build/ .expo/ node_modules/.cache/
    print_success "Build artifacts cleaned"
}

# Function to show system information
show_system_info() {
    print_status "System Information:"
    echo "  Node.js: $(node --version)"
    echo "  NPM: $(npm --version)"
    echo "  Platform: $(uname -s)"
    echo "  Architecture: $(uname -m)"
    echo "  Memory: $(if command -v free >/dev/null; then free -h | grep Mem; else echo 'N/A'; fi)"
}

# Strategy 1: Docker Debug Build
strategy_docker_debug() {
    print_status "Strategy 1: Docker Debug Build"
    echo "Building in isolated Docker environment with debug flags..."
    
    docker-compose -f docker-compose.debug.yml down --remove-orphans
    docker-compose -f docker-compose.debug.yml build --no-cache ephra-debug
    docker-compose -f docker-compose.debug.yml up ephra-debug
}

# Strategy 2: Interactive Docker Shell
strategy_interactive_docker() {
    print_status "Strategy 2: Interactive Docker Shell"
    echo "Starting interactive Docker container for manual debugging..."
    
    docker-compose -f docker-compose.debug.yml down --remove-orphans
    docker-compose -f docker-compose.debug.yml build --no-cache ephra-interactive
    docker-compose -f docker-compose.debug.yml run --rm ephra-interactive
}

# Strategy 3: Local Debug with Memory Optimization
strategy_local_debug() {
    print_status "Strategy 3: Local Debug with Memory Optimization"
    echo "Running local build with optimized settings..."
    
    cleanup_builds
    
    export NODE_OPTIONS="--max-old-space-size=8192 --trace-warnings"
    export NODE_ENV=development
    
    print_status "Installing dependencies..."
    npm install --verbose
    
    print_status "Running Expo export with debug flags..."
    npx expo export:web --dev --verbose
}

# Strategy 4: Webpack Bundle Analysis
strategy_webpack_analysis() {
    print_status "Strategy 4: Webpack Bundle Analysis"
    echo "Analyzing webpack bundle to identify problematic modules..."
    
    export WEBPACK_ANALYZE=true
    export NODE_OPTIONS="--max-old-space-size=8192"
    
    npx expo export:web --dev --verbose
}

# Strategy 5: Minimal Build Test
strategy_minimal_build() {
    print_status "Strategy 5: Minimal Build Test"
    echo "Testing with minimal webpack configuration..."
    
    if [ -f "webpack.config.minimal.js" ]; then
        export EXPO_WEBPACK_CONFIG_PATH="./webpack.config.minimal.js"
        npx expo export:web --dev
    else
        print_warning "webpack.config.minimal.js not found, skipping minimal build test"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "Select debugging strategy:"
    echo "1) Docker Debug Build (Recommended)"
    echo "2) Interactive Docker Shell"
    echo "3) Local Debug with Memory Optimization"
    echo "4) Webpack Bundle Analysis"
    echo "5) Minimal Build Test"
    echo "6) Run All Strategies"
    echo "7) Show System Info"
    echo "8) Cleanup and Exit"
    echo ""
    read -p "Enter your choice (1-8): " choice
}

# Main execution
main() {
    show_system_info
    check_docker
    
    while true; do
        show_menu
        
        case $choice in
            1)
                strategy_docker_debug
                ;;
            2)
                strategy_interactive_docker
                ;;
            3)
                strategy_local_debug
                ;;
            4)
                strategy_webpack_analysis
                ;;
            5)
                strategy_minimal_build
                ;;
            6)
                print_status "Running all strategies..."
                strategy_docker_debug
                strategy_local_debug
                strategy_webpack_analysis
                strategy_minimal_build
                ;;
            7)
                show_system_info
                ;;
            8)
                cleanup_builds
                print_success "Cleanup completed. Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main
