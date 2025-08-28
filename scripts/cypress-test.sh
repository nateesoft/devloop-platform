#!/bin/bash

# Cypress E2E Testing Script for TON Lowcode Platform
# This script runs comprehensive E2E tests using Cypress

set -e

echo "🧪 Starting Cypress E2E Testing for TON Lowcode Platform"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/Users/nateesun/Documents/personal/my-project/ton-lowcode-platform/master"
FRONTEND_DIR="$PROJECT_DIR/lowcode-portal"
CYPRESS_RESULTS_DIR="$FRONTEND_DIR/cypress/results"

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

# Function to check if service is running
check_service() {
    local service_name=$1
    local url=$2
    local timeout=${3:-60}
    
    print_status "Checking $service_name at $url"
    
    local count=0
    while [ $count -lt $timeout ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        echo -n "."
        sleep 1
        count=$((count + 1))
    done
    
    print_error "$service_name failed to start within ${timeout} seconds"
    return 1
}

# Function to cleanup processes
cleanup() {
    print_status "Cleaning up processes..."
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
}

# Set trap for cleanup
trap cleanup EXIT INT TERM

# Parse command line arguments
TEST_TYPE="all"
BROWSER="chrome"
HEADLESS=true
RECORD=false
PARALLEL=false
SPEC_PATTERN=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            TEST_TYPE="$2"
            shift 2
            ;;
        --browser)
            BROWSER="$2"
            shift 2
            ;;
        --headed)
            HEADLESS=false
            shift
            ;;
        --record)
            RECORD=true
            shift
            ;;
        --parallel)
            PARALLEL=true
            shift
            ;;
        --spec)
            SPEC_PATTERN="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --type TYPE        Test type: all, e2e, component, smoke (default: all)"
            echo "  --browser BROWSER  Browser: chrome, firefox, edge, electron (default: chrome)"
            echo "  --headed           Run tests in headed mode"
            echo "  --record           Record tests to Cypress Dashboard"
            echo "  --parallel         Run tests in parallel"
            echo "  --spec PATTERN     Spec file pattern to run"
            echo "  --help             Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_status "Test Configuration:"
echo "  Type: $TEST_TYPE"
echo "  Browser: $BROWSER"
echo "  Headless: $HEADLESS"
echo "  Record: $RECORD"
echo "  Parallel: $PARALLEL"
echo "  Spec Pattern: ${SPEC_PATTERN:-all}"

# Navigate to project directory
cd "$PROJECT_DIR"

# Create results directory
mkdir -p "$CYPRESS_RESULTS_DIR"

# Check if we should use Docker or local setup
USE_DOCKER=${USE_DOCKER:-false}

if [ "$USE_DOCKER" = "true" ]; then
    print_status "Using Docker setup for testing"
    
    # Start required services
    print_status "Starting required services..."
    docker compose up -d lowcode-postgres lowcode-redis lowcode-sonarqube
    
    # Wait for services to be ready
    check_service "PostgreSQL" "localhost:5432" 60
    check_service "Redis" "localhost:6379" 30
    
    # Start application services
    print_status "Starting application services..."
    docker compose up -d lowcode-portal-service-dev lowcode-portal-dev
    
    # Wait for applications to be ready
    check_service "Backend Service" "http://localhost:8080/health" 120
    check_service "Frontend Application" "http://localhost:3000" 120
    
    # Run Cypress tests in Docker
    print_status "Running Cypress tests in Docker..."
    
    case $TEST_TYPE in
        "e2e")
            docker compose --profile testing up --exit-code-from cypress-e2e cypress-e2e
            ;;
        "component")
            docker compose --profile component-testing up --exit-code-from cypress-component cypress-component
            ;;
        "all")
            docker compose --profile testing up --exit-code-from cypress-e2e cypress-e2e
            docker compose --profile component-testing up --exit-code-from cypress-component cypress-component
            ;;
        *)
            print_error "Unknown test type: $TEST_TYPE"
            exit 1
            ;;
    esac
    
else
    print_status "Using local setup for testing"
    
    # Navigate to frontend directory
    cd "$FRONTEND_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm ci
    fi
    
    # Start backend service (assume it's running or start it)
    print_status "Checking backend service..."
    if ! check_service "Backend Service" "http://localhost:8080/health" 5; then
        print_warning "Backend service not running. Please start it manually."
        print_status "You can start it with: cd lowcode-portal-service && npm run start:dev"
        exit 1
    fi
    
    # Start frontend application
    print_status "Starting frontend application..."
    npm run dev > /dev/null 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    check_service "Frontend Application" "http://localhost:3000" 120
    
    # Build Cypress command
    CYPRESS_CMD="npx cypress"
    
    if [ "$TEST_TYPE" = "component" ]; then
        CYPRESS_CMD="$CYPRESS_CMD run --component"
    else
        CYPRESS_CMD="$CYPRESS_CMD run"
    fi
    
    # Add browser option
    if [ "$BROWSER" != "electron" ]; then
        CYPRESS_CMD="$CYPRESS_CMD --browser $BROWSER"
    fi
    
    # Add headless option
    if [ "$HEADLESS" = "true" ]; then
        CYPRESS_CMD="$CYPRESS_CMD --headless"
    fi
    
    # Add spec pattern if provided
    if [ ! -z "$SPEC_PATTERN" ]; then
        CYPRESS_CMD="$CYPRESS_CMD --spec '$SPEC_PATTERN'"
    fi
    
    # Add record option if enabled
    if [ "$RECORD" = "true" ] && [ ! -z "$CYPRESS_RECORD_KEY" ]; then
        CYPRESS_CMD="$CYPRESS_CMD --record --key $CYPRESS_RECORD_KEY"
    fi
    
    # Add parallel option if enabled
    if [ "$PARALLEL" = "true" ]; then
        CYPRESS_CMD="$CYPRESS_CMD --parallel"
    fi
    
    # Run different test types
    case $TEST_TYPE in
        "smoke")
            print_status "Running smoke tests..."
            eval "$CYPRESS_CMD --spec 'cypress/e2e/01-basic/**/*'"
            ;;
        "e2e")
            print_status "Running E2E tests..."
            eval "$CYPRESS_CMD"
            ;;
        "component")
            print_status "Running component tests..."
            npx cypress run --component
            ;;
        "all")
            print_status "Running all tests..."
            print_status "1. Running E2E tests..."
            eval "$CYPRESS_CMD"
            
            print_status "2. Running component tests..."
            npx cypress run --component
            ;;
        *)
            print_error "Unknown test type: $TEST_TYPE"
            exit 1
            ;;
    esac
fi

# Test results analysis
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "✅ All tests passed!"
else
    print_error "❌ Some tests failed!"
fi

# Generate reports if available
if [ -d "cypress/results" ]; then
    print_status "📊 Test Results Summary:"
    
    # Count test files
    TOTAL_SPECS=$(find cypress/results -name "*.json" 2>/dev/null | wc -l)
    echo "   • Total spec files executed: $TOTAL_SPECS"
    
    # Display screenshots if any failures
    SCREENSHOT_COUNT=$(find cypress/screenshots -name "*.png" 2>/dev/null | wc -l)
    if [ $SCREENSHOT_COUNT -gt 0 ]; then
        echo "   • Screenshots captured: $SCREENSHOT_COUNT"
        echo "   • Screenshots location: cypress/screenshots/"
    fi
    
    # Display videos if any
    VIDEO_COUNT=$(find cypress/videos -name "*.mp4" 2>/dev/null | wc -l)
    if [ $VIDEO_COUNT -gt 0 ]; then
        echo "   • Videos recorded: $VIDEO_COUNT"
        echo "   • Videos location: cypress/videos/"
    fi
fi

# Display useful links
print_status "📋 Useful Resources:"
echo "   • Cypress Dashboard: https://dashboard.cypress.io (if recording enabled)"
echo "   • Test Results: file://$CYPRESS_RESULTS_DIR"
echo "   • Screenshots: file://$FRONTEND_DIR/cypress/screenshots"
echo "   • Videos: file://$FRONTEND_DIR/cypress/videos"

# Cleanup message
print_status "🧹 Cleanup completed"

print_success "Cypress testing completed!"

exit $TEST_EXIT_CODE