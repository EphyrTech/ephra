#!/bin/bash

# =============================================================================
# Environment Setup Script for Ephra Project
# =============================================================================
# This script helps set up environment configuration for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo -e "${BLUE}==============================================================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}==============================================================================${NC}"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [environment]"
    echo ""
    echo "Available environments:"
    echo "  development  - Local development environment"
    echo "  staging      - Staging environment for testing"
    echo "  production   - Production environment"
    echo ""
    echo "Examples:"
    echo "  $0 development"
    echo "  $0 staging"
    echo "  $0 production"
    echo ""
    echo "If no environment is specified, you will be prompted to choose."
}

# Function to validate environment
validate_environment() {
    local env=$1
    case $env in
        development|staging|production)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Function to backup existing .env file
backup_env_file() {
    if [ -f ".env" ]; then
        local backup_name=".env.backup.$(date +%Y%m%d_%H%M%S)"
        print_status "Backing up existing .env file to $backup_name"
        cp .env "$backup_name"
    fi
}

# Function to copy environment file
setup_environment() {
    local env=$1
    local env_file=".env.$env"
    
    if [ ! -f "$env_file" ]; then
        print_error "Environment file $env_file not found!"
        exit 1
    fi
    
    print_status "Setting up $env environment..."
    
    # Backup existing .env file
    backup_env_file
    
    # Copy environment-specific file to .env
    cp "$env_file" ".env"
    
    print_status "Environment file .env created from $env_file"
    
    # Make sure .env is in .gitignore
    if [ ! -f ".gitignore" ] || ! grep -q "^\.env$" .gitignore; then
        echo ".env" >> .gitignore
        print_status "Added .env to .gitignore"
    fi
}

# Function to validate required variables
validate_env_vars() {
    local env=$1
    
    print_status "Validating environment variables..."
    
    # Source the .env file
    if [ -f ".env" ]; then
        set -a
        source .env
        set +a
    else
        print_error ".env file not found!"
        return 1
    fi
    
    # Check required variables
    local required_vars=(
        "APP_ENV"
        "API_BASE_URL"
        "BACKEND_URL"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        return 1
    fi
    
    print_status "All required environment variables are set"
    return 0
}

# Function to show environment info
show_env_info() {
    if [ -f ".env" ]; then
        set -a
        source .env
        set +a
        
        print_header "CURRENT ENVIRONMENT CONFIGURATION"
        echo "Environment: $APP_ENV"
        echo "API Base URL: $API_BASE_URL"
        echo "Backend URL: $BACKEND_URL"
        echo "Frontend URL: $FRONTEND_URL"
        echo "Debug Mode: $DEBUG"
        echo ""
        echo "Feature Flags:"
        echo "  - Stripe Payments: $FEATURE_STRIPE_PAYMENTS"
        echo "  - Google Calendar: $FEATURE_GOOGLE_CALENDAR"
        echo "  - Push Notifications: $FEATURE_PUSH_NOTIFICATIONS"
        echo "  - Offline Mode: $FEATURE_OFFLINE_MODE"
        echo "  - Analytics: $FEATURE_ANALYTICS"
        echo "  - Crash Reporting: $FEATURE_CRASH_REPORTING"
    else
        print_error "No .env file found. Run setup first."
    fi
}

# Function to prompt for environment selection
prompt_environment() {
    echo ""
    print_header "EPHRA ENVIRONMENT SETUP"
    echo "Please select an environment:"
    echo "1) development - Local development with debug enabled"
    echo "2) staging     - Staging environment for testing"
    echo "3) production  - Production environment"
    echo "4) show        - Show current environment info"
    echo "5) exit        - Exit without changes"
    echo ""
    
    while true; do
        read -p "Enter your choice (1-5): " choice
        case $choice in
            1)
                echo "development"
                return 0
                ;;
            2)
                echo "staging"
                return 0
                ;;
            3)
                echo "production"
                return 0
                ;;
            4)
                show_env_info
                return 1
                ;;
            5)
                print_status "Exiting without changes"
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please enter 1-5."
                ;;
        esac
    done
}

# Main script logic
main() {
    local environment=""
    
    # Check if environment is provided as argument
    if [ $# -eq 1 ]; then
        if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
            show_usage
            exit 0
        fi
        
        environment=$1
        
        if ! validate_environment "$environment"; then
            print_error "Invalid environment: $environment"
            show_usage
            exit 1
        fi
    else
        # Prompt for environment selection
        environment=$(prompt_environment)
        if [ $? -ne 0 ]; then
            exit 0
        fi
    fi
    
    # Setup the environment
    setup_environment "$environment"
    
    # Validate environment variables
    if validate_env_vars "$environment"; then
        print_status "Environment setup completed successfully!"
        echo ""
        show_env_info
        echo ""
        print_status "Next steps:"
        echo "1. Review and update the .env file with your specific values"
        echo "2. Start the development server: npm start"
        echo "3. Test API connection: npm run test:api"
    else
        print_error "Environment setup completed but validation failed."
        print_warning "Please review and update the .env file with correct values."
    fi
}

# Run main function
main "$@"
