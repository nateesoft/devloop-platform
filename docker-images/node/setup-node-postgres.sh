#!/bin/bash

# TON Lowcode Platform - Node.js & PostgreSQL Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up Node.js & PostgreSQL for TON Lowcode Platform..."

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

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not available. Please install Docker Compose and try again."
    exit 1
fi

COMPOSE_CMD="docker-compose"
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
fi

# Check system requirements
print_status "Checking system requirements..."

# Check available memory
if command -v free >/dev/null 2>&1; then
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    if [ "$TOTAL_MEM" -lt 4096 ]; then
        print_warning "System has ${TOTAL_MEM}MB RAM. Recommended: 8GB+ for optimal development experience."
    else
        print_success "Memory check passed: ${TOTAL_MEM}MB available"
    fi
fi

# Check disk space
DISK_SPACE=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$DISK_SPACE" -lt 10 ]; then
    print_warning "Available disk space: ${DISK_SPACE}GB. Recommend at least 20GB free space."
else
    print_success "Disk space check passed: ${DISK_SPACE}GB available"
fi

# Check if network exists
if ! docker network ls | grep -q "lowcode-network"; then
    print_status "Creating lowcode-network..."
    docker network create lowcode-network
    print_success "Network created: lowcode-network"
else
    print_success "Network already exists: lowcode-network"
fi

# Function to wait for service
wait_for_service() {
    local service_name="$1"
    local check_command="$2"
    local timeout="${3:-60}"
    local counter=0
    
    print_status "Waiting for $service_name to be ready..."
    
    while ! eval "$check_command" > /dev/null 2>&1; do
        if [ $counter -eq $timeout ]; then
            print_error "$service_name failed to start within $timeout seconds"
            return 1
        fi
        echo -n "."
        sleep 1
        ((counter++))
    done
    
    print_success "$service_name is ready!"
    return 0
}

# Ask user what to set up
echo
echo "What would you like to set up?"
echo "1) Database only (PostgreSQL + PgAdmin)"
echo "2) Development environment (Database + Node.js dev servers)"
echo "3) Production environment (Database + Production builds)"
echo "4) Everything (All services)"
echo
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_status "Setting up database services..."
        SERVICES="lowcode-postgres"
        ;;
    2)
        print_status "Setting up development environment..."
        SERVICES="lowcode-postgres lowcode-portal-service-dev lowcode-portal-dev"
        ;;
    3)
        print_status "Setting up production environment..."
        SERVICES="lowcode-postgres lowcode-portal-service-prod lowcode-portal-prod"
        ;;
    4)
        print_status "Setting up all services..."
        SERVICES="lowcode-postgres"
        ;;
    *)
        print_error "Invalid choice. Defaulting to database only."
        SERVICES="lowcode-postgres"
        ;;
esac

# Start PostgreSQL first
print_status "Starting PostgreSQL database..."
$COMPOSE_CMD up -d lowcode-postgres

# Wait for PostgreSQL to be ready
wait_for_service "PostgreSQL" "docker exec lowcode-postgres pg_isready -U lowcode -d lowcode_db" 60

# Check database initialization
print_status "Checking database initialization..."
TABLE_COUNT=$(docker exec lowcode-postgres psql -U lowcode -d lowcode_db -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)

if [ "$TABLE_COUNT" -gt 10 ]; then
    print_success "Database initialization completed: $TABLE_COUNT tables created"
else
    print_warning "Database may not be fully initialized. Found $TABLE_COUNT tables."
fi

# Ask if user wants PgAdmin
read -p "Would you like to start PgAdmin for database management? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting PgAdmin..."
    $COMPOSE_CMD --profile pgadmin up -d pgadmin
    wait_for_service "PgAdmin" "curl -f http://localhost:5050/misc/ping" 30
fi

# Start additional services based on choice
if [ "$choice" != "1" ]; then
    print_status "Starting additional services..."
    
    case $choice in
        2)
            # Development environment
            print_status "Building development Docker images..."
            $COMPOSE_CMD build lowcode-portal-service-dev lowcode-portal-dev
            
            print_status "Starting backend development server..."
            $COMPOSE_CMD --profile backend-dev up -d lowcode-portal-service-dev
            wait_for_service "Backend Dev Server" "curl -f http://localhost:8080/health" 120
            
            print_status "Starting frontend development server..."
            $COMPOSE_CMD --profile frontend-dev up -d lowcode-portal-dev
            wait_for_service "Frontend Dev Server" "curl -f http://localhost:3000" 120
            ;;
        3)
            # Production environment
            print_status "Building production Docker images..."
            $COMPOSE_CMD build lowcode-portal-service-prod lowcode-portal-prod
            
            print_status "Starting backend production server..."
            $COMPOSE_CMD --profile backend-prod up -d lowcode-portal-service-prod
            wait_for_service "Backend Prod Server" "curl -f http://localhost:8081/health" 120
            
            print_status "Starting frontend production server..."
            $COMPOSE_CMD --profile frontend-prod up -d lowcode-portal-prod
            wait_for_service "Frontend Prod Server" "curl -f http://localhost:3001" 60
            ;;
        4)
            # Everything - let user choose what to start
            echo "All base services are ready. You can now start development or production services as needed."
            ;;
    esac
fi

# Create environment files if they don't exist
print_status "Creating environment files..."

# Backend .env file
if [ ! -f "../../lowcode-portal-service/.env" ]; then
    print_status "Creating backend .env file..."
    cat > ../../lowcode-portal-service/.env << EOF
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=lowcode
DATABASE_PASSWORD=lowcode_password_2024
DATABASE_NAME=lowcode_db
DATABASE_SCHEMA=public

# Application Configuration
NODE_ENV=development
PORT=8080
JWT_SECRET=your_jwt_secret_key_here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=lowcode_redis_2024

# Kafka Configuration
KAFKA_BROKERS=localhost:9092

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Vault Configuration
VAULT_ENABLED=true
VAULT_ENDPOINT=http://localhost:8200
VAULT_TOKEN=root
VAULT_MOUNT=secret

# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=lowcode
KEYCLOAK_CLIENT_ID=lowcode-client
EOF
    print_success "Backend .env file created"
else
    print_success "Backend .env file already exists"
fi

# Frontend .env.local file
if [ ! -f "../../lowcode-portal/.env.local" ]; then
    print_status "Creating frontend .env.local file..."
    cat > ../../lowcode-portal/.env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REALTIME=true

# Keycloak Configuration
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=lowcode
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=lowcode-client

# Development Settings
NEXT_TELEMETRY_DISABLED=1
EOF
    print_success "Frontend .env.local file created"
else
    print_success "Frontend .env.local file already exists"
fi

# Create development scripts
print_status "Creating development scripts..."

# Backend development script
cat > ../../lowcode-portal-service/dev-start.sh << 'EOF'
#!/bin/bash
echo "Starting lowcode-portal-service in development mode..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create it from .env.example"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start development server
npm run start:dev
EOF

chmod +x ../../lowcode-portal-service/dev-start.sh

# Frontend development script
cat > ../../lowcode-portal/dev-start.sh << 'EOF'
#!/bin/bash
echo "Starting lowcode-portal in development mode..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Warning: .env.local file not found. Using default configuration."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start development server
npm run dev
EOF

chmod +x ../../lowcode-portal/dev-start.sh

print_success "Development scripts created"

# Create Docker development helper scripts
cat > ./dev-logs.sh << 'EOF'
#!/bin/bash
# View logs for development services

echo "Available services:"
echo "1) postgres - PostgreSQL database"
echo "2) backend  - Backend development server"
echo "3) frontend - Frontend development server"
echo "4) all      - All services"
echo

read -p "Which service logs would you like to view? (1-4): " choice

case $choice in
    1) docker-compose logs -f lowcode-postgres ;;
    2) docker-compose logs -f lowcode-portal-service-dev ;;
    3) docker-compose logs -f lowcode-portal-dev ;;
    4) docker-compose logs -f ;;
    *) echo "Invalid choice" ;;
esac
EOF

chmod +x ./dev-logs.sh

cat > ./dev-shell.sh << 'EOF'
#!/bin/bash
# Get shell access to development containers

echo "Available containers:"
echo "1) postgres - PostgreSQL database"
echo "2) backend  - Backend development server"
echo "3) frontend - Frontend development server"
echo

read -p "Which container would you like to access? (1-3): " choice

case $choice in
    1) docker exec -it lowcode-postgres psql -U lowcode -d lowcode_db ;;
    2) docker exec -it lowcode-portal-service-dev sh ;;
    3) docker exec -it lowcode-portal-dev sh ;;
    *) echo "Invalid choice" ;;
esac
EOF

chmod +x ./dev-shell.sh

# Check service status
print_status "Checking service status..."

services_to_check=()
case $choice in
    1) services_to_check=("lowcode-postgres") ;;
    2) services_to_check=("lowcode-postgres" "lowcode-portal-service-dev" "lowcode-portal-dev") ;;
    3) services_to_check=("lowcode-postgres" "lowcode-portal-service-prod" "lowcode-portal-prod") ;;
    4) services_to_check=("lowcode-postgres") ;;
esac

all_healthy=true
for service in "${services_to_check[@]}"; do
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$service.*Up"; then
        print_success "$service is running"
    else
        if docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -q "$service"; then
            print_error "$service is not running (container exists but stopped)"
        else
            print_warning "$service is not started"
        fi
        all_healthy=false
    fi
done

# Display access information
echo
echo "============================================"
echo "🎉 Node.js & PostgreSQL Setup Complete!"
echo "============================================"
echo
echo "📊 Access URLs:"
echo "  PostgreSQL:    localhost:5432"
echo "  PgAdmin:       http://localhost:5050 (if started)"

case $choice in
    2)
        echo "  Backend Dev:   http://localhost:8080"
        echo "  Frontend Dev:  http://localhost:3000"
        echo "  Backend Debug: localhost:9229 (Node.js debugger)"
        ;;
    3)
        echo "  Backend Prod:  http://localhost:8081"
        echo "  Frontend Prod: http://localhost:3001"
        ;;
esac

echo
echo "🔐 Default Credentials:"
echo "  PostgreSQL:    lowcode / lowcode_password_2024"
echo "  PgAdmin:       admin@lowcode.com / admin123"
echo
echo "📋 Database Information:"
echo "  Database Name: lowcode_db"
echo "  Schema:        public"
echo "  Tables:        $TABLE_COUNT tables created"
echo "  Sample Data:   ✅ Included (users, projects, flows, etc.)"
echo
echo "🛠️ Development Tools:"
echo "  Backend:       ./lowcode-portal-service/dev-start.sh"
echo "  Frontend:      ./lowcode-portal/dev-start.sh"
echo "  View Logs:     ./dev-logs.sh"
echo "  Shell Access:  ./dev-shell.sh"
echo
echo "📖 Quick Commands:"
case $choice in
    1)
        echo "  Database Shell: docker exec -it lowcode-postgres psql -U lowcode -d lowcode_db"
        echo "  Start Backend:  docker-compose --profile backend-dev up -d"
        echo "  Start Frontend: docker-compose --profile frontend-dev up -d"
        ;;
    2|3)
        echo "  View Logs:      docker-compose logs -f"
        echo "  Database Shell: docker exec -it lowcode-postgres psql -U lowcode -d lowcode_db"
        echo "  Restart:        docker-compose restart"
        ;;
esac

echo "  Stop All:       docker-compose down"
echo

if [ "$all_healthy" = true ]; then
    echo "✅ All selected services are running successfully!"
else
    echo "⚠️  Some services may not be running. Check the status above and logs if needed."
fi

echo
echo "🐳 Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null | head -6 || echo "Could not retrieve container stats"

echo
echo "🚀 Development Environment Ready!"
echo "You can now start developing with Node.js 20 LTS and PostgreSQL 15!"
echo