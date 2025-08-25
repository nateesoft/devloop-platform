#!/bin/bash

# TON Lowcode Platform - SonarQube Setup Script
# This script sets up SonarQube with PostgreSQL for code quality analysis

set -e

echo "🚀 Setting up SonarQube for TON Lowcode Platform..."

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if network exists
if ! docker network ls | grep -q "lowcode-network"; then
    print_status "Creating lowcode-network..."
    docker network create lowcode-network
fi

# Check system requirements
print_status "Checking system requirements..."

# Check available memory (SonarQube needs at least 2GB)
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
if [ "$TOTAL_MEM" -lt 4096 ]; then
    print_warning "System has ${TOTAL_MEM}MB RAM. SonarQube recommends at least 4GB for optimal performance."
fi

# Check disk space (need at least 10GB free)
DISK_SPACE=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$DISK_SPACE" -lt 10 ]; then
    print_warning "Available disk space: ${DISK_SPACE}GB. Recommend at least 10GB free space."
fi

# Set system parameters for Elasticsearch (used by SonarQube)
print_status "Setting system parameters..."

# Check if we can set vm.max_map_count
if sysctl vm.max_map_count >/dev/null 2>&1; then
    CURRENT_MAP_COUNT=$(sysctl -n vm.max_map_count)
    if [ "$CURRENT_MAP_COUNT" -lt 262144 ]; then
        print_status "Setting vm.max_map_count=262144 (current: $CURRENT_MAP_COUNT)"
        if command -v sysctl >/dev/null; then
            sudo sysctl -w vm.max_map_count=262144 || print_warning "Could not set vm.max_map_count. SonarQube may not start properly."
        fi
    else
        print_success "vm.max_map_count is already set to $CURRENT_MAP_COUNT"
    fi
else
    print_warning "Cannot check/set vm.max_map_count. Running in Docker Desktop or restricted environment."
fi

# Start PostgreSQL database first
print_status "Starting PostgreSQL database..."
docker compose up -d sonarqube-db

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
timeout=60
counter=0
while ! docker exec lowcode-sonarqube-db pg_isready -U sonarqube -d sonarqubedb > /dev/null 2>&1; do
    if [ $counter -eq $timeout ]; then
        print_error "PostgreSQL failed to start within $timeout seconds"
        docker compose logs sonarqube-db
        exit 1
    fi
    echo -n "."
    sleep 1
    ((counter++))
done
print_success "PostgreSQL is ready!"

# Start SonarQube
print_status "Starting SonarQube server..."
docker compose up -d sonarqube

# Wait for SonarQube to be ready (can take 2-3 minutes)
print_status "Waiting for SonarQube to start (this may take 2-3 minutes)..."
timeout=300  # 5 minutes
counter=0
while ! curl -s http://localhost:9000/api/system/status | grep -q '"status":"UP"' 2>/dev/null; do
    if [ $counter -eq $timeout ]; then
        print_error "SonarQube failed to start within $(($timeout/60)) minutes"
        echo "Checking SonarQube logs..."
        docker compose logs --tail=50 sonarqube
        exit 1
    fi
    if [ $((counter % 10)) -eq 0 ]; then
        echo -n "."
    fi
    sleep 1
    ((counter++))
done
print_success "SonarQube is ready!"

# Check SonarQube health
print_status "Checking SonarQube health..."
HEALTH_STATUS=$(curl -s http://localhost:9000/api/system/health | jq -r '.health' 2>/dev/null || echo "unknown")
if [ "$HEALTH_STATUS" = "GREEN" ]; then
    print_success "SonarQube health status: $HEALTH_STATUS"
else
    print_warning "SonarQube health status: $HEALTH_STATUS (may still be initializing)"
fi

# Wait a bit more for complete initialization
print_status "Allowing additional time for complete initialization..."
sleep 30

# Test API access
print_status "Testing SonarQube API access..."
API_RESPONSE=$(curl -s -u admin:admin http://localhost:9000/api/authentication/validate 2>/dev/null || echo "failed")
if echo "$API_RESPONSE" | grep -q '"valid":true'; then
    print_success "API access test passed"
else
    print_warning "API access test inconclusive, but SonarQube appears to be running"
fi

# Create initial projects via API (with retry logic)
print_status "Setting up initial projects..."

create_project() {
    local project_key="$1"
    local project_name="$2"
    
    for i in {1..3}; do
        if curl -s -u admin:admin -X POST \
           "http://localhost:9000/api/projects/create" \
           -d "project=$project_key&name=$project_name" > /dev/null 2>&1; then
            print_success "Created project: $project_name"
            return 0
        else
            print_warning "Attempt $i failed for project: $project_name"
            sleep 5
        fi
    done
    print_error "Failed to create project: $project_name"
    return 1
}

# Create projects for the platform
create_project "lowcode-portal" "Lowcode Portal (Frontend)" || true
create_project "lowcode-portal-service" "Lowcode Portal Service (Backend)" || true

# Set up quality gate (if API is accessible)
print_status "Configuring quality gate..."
if curl -s -u admin:admin -X POST \
   "http://localhost:9000/api/qualitygates/create" \
   -d "name=TON Lowcode Quality Gate" > /dev/null 2>&1; then
    print_success "Created custom quality gate"
else
    print_warning "Could not create custom quality gate (may already exist or API not ready)"
fi

# Check service status
print_status "Checking service status..."

services=("lowcode-sonarqube-db" "lowcode-sonarqube")
all_healthy=true

for service in "${services[@]}"; do
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$service.*Up"; then
        print_success "$service is running"
    else
        print_error "$service is not running"
        all_healthy=false
    fi
done

# Display database info
print_status "Database information:"
DB_INFO=$(docker exec lowcode-sonarqube-db psql -U sonarqube -d sonarqubedb -c "SELECT version();" -t 2>/dev/null | head -1 | xargs || echo "Could not retrieve database info")
echo "PostgreSQL: $DB_INFO"

# Generate initial scanner configuration
print_status "Generating scanner configuration files..."

# Create sonar-project.properties for frontend
cat > ../../lowcode-portal/sonar-project.properties << EOF
# SonarQube Configuration for Lowcode Portal (Frontend)
sonar.projectKey=lowcode-portal
sonar.projectName=Lowcode Portal (Frontend)
sonar.projectVersion=1.0.0

# Source directories
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx

# Exclusions
sonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/coverage/**,**/*.config.js,**/*.config.ts
sonar.test.exclusions=**/node_modules/**,**/dist/**,**/.next/**

# Language settings
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# SonarQube server
sonar.host.url=http://localhost:9000
sonar.login=admin
sonar.password=admin

# Source encoding
sonar.sourceEncoding=UTF-8
EOF

# Create sonar-project.properties for backend
cat > ../../lowcode-portal-service/sonar-project.properties << EOF
# SonarQube Configuration for Lowcode Portal Service (Backend)
sonar.projectKey=lowcode-portal-service
sonar.projectName=Lowcode Portal Service (Backend)
sonar.projectVersion=1.0.0

# Source directories
sonar.sources=src
sonar.tests=src,test

# Test patterns
sonar.test.inclusions=**/*.spec.ts,**/*.test.ts,test/**/*.ts

# Exclusions
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/*.config.js,**/*.config.ts
sonar.test.exclusions=**/node_modules/**,**/dist/**

# Language settings
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# SonarQube server
sonar.host.url=http://localhost:9000
sonar.login=admin
sonar.password=admin

# Source encoding
sonar.sourceEncoding=UTF-8
EOF

print_success "Created SonarQube project configuration files"

# Display access information
echo
echo "=========================================="
echo "🎉 SonarQube Setup Complete!"
echo "=========================================="
echo
echo "📊 Access URLs:"
echo "  SonarQube:       http://localhost:9000"
echo "  PostgreSQL:      localhost:5433"
echo "  PgAdmin:         http://localhost:5050 (use --profile pgadmin)"
echo
echo "🔐 Default Credentials:"
echo "  SonarQube:       admin / admin"
echo "  PostgreSQL:      sonarqube / sonarqube_password_2024"
echo "  PgAdmin:         admin@lowcode.com / admin123"
echo
echo "📋 Pre-configured Projects:"
echo "  ✅ lowcode-portal (Frontend)"
echo "  ✅ lowcode-portal-service (Backend)"
echo
echo "🔧 Configuration Files Created:"
echo "  ✅ lowcode-portal/sonar-project.properties"
echo "  ✅ lowcode-portal-service/sonar-project.properties"
echo
echo "🚀 Next Steps:"
echo "  1. Change default admin password at http://localhost:9000"
echo "  2. Install SonarScanner CLI or use Docker scanner"
echo "  3. Run code analysis on your projects"
echo "  4. Configure quality gates as needed"
echo
echo "📖 Quick Analysis Commands:"
echo "  # Using Docker scanner (from project root)"
echo "  docker run --rm --network=lowcode-network -v \$(pwd):/usr/src sonarsource/sonar-scanner-cli"
echo
echo "  # Using SonarScanner CLI (install first)"
echo "  cd lowcode-portal && sonar-scanner"
echo "  cd lowcode-portal-service && sonar-scanner"
echo
echo "🔍 Quality Metrics Available:"
echo "  ✅ Code Coverage"
echo "  ✅ Code Smells"
echo "  ✅ Bugs & Vulnerabilities"
echo "  ✅ Security Hotspots"
echo "  ✅ Technical Debt"
echo "  ✅ Duplicated Code"
echo "  ✅ Maintainability Rating"
echo

if [ "$all_healthy" = true ]; then
    echo "✅ All SonarQube services are running successfully!"
else
    echo "⚠️  Some services may not be running properly. Check docker logs for details."
fi

echo
echo "🐳 Useful Commands:"
echo "  View logs: docker compose logs -f sonarqube"
echo "  Stop services: docker compose down"
echo "  Restart SonarQube: docker compose restart sonarqube"
echo "  Database backup: docker exec lowcode-sonarqube-db pg_dump -U sonarqube sonarqubedb > backup.sql"
echo

# Display system resource usage
print_status "Current resource usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" lowcode-sonarqube lowcode-sonarqube-db 2>/dev/null || echo "Could not retrieve container stats"

print_success "SonarQube is ready for code quality analysis! 📊"

# Check if we should start optional services
read -p "Would you like to start PgAdmin for database management? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting PgAdmin..."
    docker compose --profile pgadmin up -d pgadmin
    print_success "PgAdmin is available at http://localhost:5050"
fi