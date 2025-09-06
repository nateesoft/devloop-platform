#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not available. Please make sure Docker is up to date."
    exit 1
fi

print_header "🚀 Starting TON Lowcode Platform - Complete Stack with NGINX"

# Create necessary directories
print_info "Creating necessary directories..."
mkdir -p docker-images/monitoring/grafana/provisioning/{datasources,dashboards}
mkdir -p docker-images/monitoring/prometheus/rules
mkdir -p lowcode-portal-service/logs
mkdir -p docker-images/nginx/ssl
sudo chown -R 472:472 docker-images/monitoring/grafana/ 2>/dev/null || true

# Set proper permissions
chmod 755 lowcode-portal-service/logs

print_status "Building and starting complete stack..."

# Start the complete stack
if docker compose -f docker-compose.complete.yml up -d; then
    print_status "Complete stack started successfully!"
    
    print_info "Waiting for services to be healthy..."
    sleep 45
    
    print_header "=== 🌐 Complete Service Access Guide ==="
    
    echo -e "${CYAN}┌─────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│                Main Application                     │${NC}"
    echo -e "${CYAN}├─────────────────────────────────────────────────────┤${NC}"
    echo -e "${BLUE}│ Frontend (via NGINX):${NC} http://localhost/"
    echo -e "${BLUE}│ API via NGINX:${NC}        http://localhost/api/"
    echo -e "${BLUE}│ API Documentation:${NC}    http://localhost/api-docs/"
    echo -e "${BLUE}│ Health Check:${NC}         http://localhost/health"
    echo -e "${CYAN}└─────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    echo -e "${CYAN}┌─────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│                Admin Dashboard                      │${NC}"
    echo -e "${CYAN}├─────────────────────────────────────────────────────┤${NC}"
    echo -e "${PURPLE}│ Admin Portal:${NC}         http://localhost:81/"
    echo -e "${PURPLE}│ Grafana Dashboard:${NC}    http://localhost:81/grafana/"
    echo -e "${PURPLE}│ Prometheus:${NC}           http://localhost:81/prometheus/"
    echo -e "${PURPLE}│ Loki Logs:${NC}            http://localhost:81/loki/"
    echo -e "${PURPLE}│ cAdvisor:${NC}             http://localhost:81/cadvisor/"
    echo -e "${PURPLE}│ Node Exporter:${NC}        http://localhost:81/node-exporter/"
    echo -e "${PURPLE}│ Vault UI:${NC}             http://localhost:81/vault/"
    echo -e "${PURPLE}│ MinIO Console:${NC}        http://localhost:81/minio/"
    echo -e "${PURPLE}│ Keycloak Admin:${NC}       http://localhost:81/keycloak/"
    echo -e "${CYAN}└─────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    echo -e "${CYAN}┌─────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│                API-Only Access                     │${NC}"
    echo -e "${CYAN}├─────────────────────────────────────────────────────┤${NC}"
    echo -e "${GREEN}│ API Direct:${NC}           http://localhost:82/api/"
    echo -e "${GREEN}│ Metrics:${NC}              http://localhost:82/metrics"
    echo -e "${GREEN}│ Health:${NC}               http://localhost:82/health"
    echo -e "${GREEN}│ API Docs:${NC}             http://localhost:82/api-docs/"
    echo -e "${CYAN}└─────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    echo -e "${CYAN}┌─────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│              Direct Service Access                 │${NC}"
    echo -e "${CYAN}├─────────────────────────────────────────────────────┤${NC}"
    echo -e "${BLUE}│ Backend Service:${NC}      http://localhost:8888"
    echo -e "${BLUE}│ Grafana Direct:${NC}       http://localhost:3001 (admin/admin123)"
    echo -e "${BLUE}│ Prometheus Direct:${NC}    http://localhost:9292"
    echo -e "${BLUE}│ Loki Direct:${NC}          http://localhost:3100"
    echo -e "${BLUE}│ PostgreSQL:${NC}           localhost:5432 (lowcode_user/lowcode_password)"
    echo -e "${BLUE}│ Redis:${NC}                localhost:6379"
    echo -e "${BLUE}│ MinIO API:${NC}            http://localhost:9000"
    echo -e "${BLUE}│ Vault API:${NC}            http://localhost:8200"
    echo -e "${CYAN}└─────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    print_header "=== 📊 Pre-configured Dashboards ==="
    echo -e "${YELLOW}Platform Overview:${NC} http://localhost:81/grafana/d/lowcode-platform-overview"
    echo -e "${YELLOW}Detailed Metrics:${NC}  http://localhost:81/grafana/d/lowcode-platform-detailed"
    echo -e "${YELLOW}Prometheus Targets:${NC} http://localhost:81/prometheus/targets"
    echo -e "${YELLOW}Loki Health:${NC}       http://localhost:81/loki/ready"
    echo ""
    
    print_header "=== 🔑 Default Credentials ==="
    echo -e "${YELLOW}Grafana:${NC}      admin / admin123"
    echo -e "${YELLOW}Keycloak:${NC}     admin / admin123"
    echo -e "${YELLOW}MinIO:${NC}        minioadmin / minioadmin"
    echo -e "${YELLOW}PostgreSQL:${NC}   lowcode_user / lowcode_password"
    echo -e "${YELLOW}Vault:${NC}        Root Token: myroot"
    echo ""
    
    print_header "=== 🛠️ Useful Commands ==="
    echo -e "${YELLOW}View all services:${NC} docker compose -f docker-compose.complete.yml ps"
    echo -e "${YELLOW}View logs:${NC} docker compose -f docker-compose.complete.yml logs -f [service-name]"
    echo -e "${YELLOW}Stop all services:${NC} docker compose -f docker-compose.complete.yml down"
    echo -e "${YELLOW}Restart service:${NC} docker compose -f docker-compose.complete.yml restart [service-name]"
    echo -e "${YELLOW}Scale service:${NC} docker compose -f docker-compose.complete.yml up -d --scale [service-name]=N"
    echo ""
    
    print_status "=== Current Service Status ==="
    docker compose -f docker-compose.complete.yml ps
    echo ""
    
    print_warning "📋 Note: If this is the first run, it may take a few minutes for all services to be fully ready."
    print_info "🔍 You can monitor the startup process by running:"
    echo -e "${BLUE}docker compose -f docker-compose.complete.yml logs -f${NC}"
    
    print_status "✅ TON Lowcode Platform Complete Stack is now running!"
    
else
    print_error "Failed to start complete stack. Check the logs for more details:"
    echo -e "${RED}docker compose -f docker-compose.complete.yml logs${NC}"
    exit 1
fi