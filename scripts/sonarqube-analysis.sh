#!/bin/bash

# SonarQube Analysis Script for TON Lowcode Platform
# This script runs code quality analysis on the backend service

set -e

echo "🔍 Starting SonarQube Analysis for Lowcode Portal Service"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SONAR_PROJECT_KEY="lowcode-portal-service"
SONAR_HOST_URL="http://localhost:9090"
PROJECT_DIR="/Users/nateesun/Documents/personal/my-project/ton-lowcode-platform/master/lowcode-portal-service"

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

# Check if SonarQube is running
print_status "Checking SonarQube server status..."
if ! curl -s ${SONAR_HOST_URL}/api/system/status | grep -q "UP"; then
    print_error "SonarQube server is not running on ${SONAR_HOST_URL}"
    print_status "Starting SonarQube services..."
    cd "$(dirname "$0")/.."
    docker compose up -d lowcode-sonarqube
    
    print_status "Waiting for SonarQube to be ready (this may take 2-3 minutes)..."
    timeout=180
    while [ $timeout -gt 0 ]; do
        if curl -s ${SONAR_HOST_URL}/api/system/status | grep -q "UP"; then
            print_success "SonarQube is now ready!"
            break
        fi
        echo -n "."
        sleep 5
        timeout=$((timeout - 5))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Timeout waiting for SonarQube to start"
        exit 1
    fi
fi

print_success "SonarQube server is running"

# Navigate to project directory
cd "$PROJECT_DIR"

# Generate test coverage
print_status "Running tests and generating coverage report..."
npm run test:cov

if [ ! -f "coverage/lcov.info" ]; then
    print_warning "Coverage report not found. Tests may have failed."
else
    print_success "Coverage report generated successfully"
fi

# Run SonarQube analysis
print_status "Running SonarQube analysis..."

# Option 1: Use local sonar-scanner if available
if command -v sonar-scanner &> /dev/null; then
    print_status "Using local sonar-scanner CLI"
    sonar-scanner \
        -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
        -Dsonar.host.url=${SONAR_HOST_URL} \
        -Dsonar.login=admin \
        -Dsonar.password=admin
else
    # Option 2: Use Docker-based scanner
    print_status "Using Docker-based sonar-scanner"
    cd "$(dirname "$0")/.."
    docker run --rm \
        --network lowcode-network \
        -v "${PROJECT_DIR}:/usr/src" \
        -e SONAR_HOST_URL=http://lowcode-sonarqube:9000 \
        -e SONAR_LOGIN=admin \
        -e SONAR_PASSWORD=admin \
        sonarsource/sonar-scanner-cli
fi

# Check analysis results
print_status "Checking analysis results..."
sleep 10  # Wait for analysis to complete

# Get project status from SonarQube API
PROJECT_STATUS=$(curl -s -u admin:admin "${SONAR_HOST_URL}/api/qualitygates/project_status?projectKey=${SONAR_PROJECT_KEY}" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$PROJECT_STATUS" == "OK" ]; then
    print_success "✅ Quality Gate: PASSED"
    print_success "Code analysis completed successfully!"
elif [ "$PROJECT_STATUS" == "ERROR" ]; then
    print_error "❌ Quality Gate: FAILED"
    print_error "Code quality issues detected. Please check the SonarQube dashboard."
else
    print_warning "⚠️  Quality Gate: UNKNOWN STATUS"
    print_warning "Unable to determine quality gate status. Please check manually."
fi

# Display useful links
print_status "📊 Analysis Results:"
echo "   • SonarQube Dashboard: ${SONAR_HOST_URL}/dashboard?id=${SONAR_PROJECT_KEY}"
echo "   • Project Issues: ${SONAR_HOST_URL}/project/issues?id=${SONAR_PROJECT_KEY}"
echo "   • Coverage Report: ${SONAR_HOST_URL}/component_measures?id=${SONAR_PROJECT_KEY}&metric=coverage"

print_success "SonarQube analysis completed!"

# Optional: Open dashboard in browser (uncomment if desired)
# if command -v open &> /dev/null; then
#     open "${SONAR_HOST_URL}/dashboard?id=${SONAR_PROJECT_KEY}"
# elif command -v xdg-open &> /dev/null; then
#     xdg-open "${SONAR_HOST_URL}/dashboard?id=${SONAR_PROJECT_KEY}"
# fi

exit 0