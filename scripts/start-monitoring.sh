#!/bin/bash

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

print_status "Starting TON Lowcode Platform with Monitoring..."

# Create necessary directories
print_info "Creating necessary directories..."
mkdir -p docker-images/monitoring/grafana/provisioning/{datasources,dashboards}
mkdir -p docker-images/monitoring/prometheus/rules
mkdir -p lowcode-portal-service/logs
sudo chown -R 472:472 docker-images/monitoring/grafana/ 2>/dev/null || true

# Set proper permissions for logs
chmod 755 lowcode-portal-service/logs

print_status "Building and starting services..."

# Start the stack
if docker compose -f docker-compose.monitoring.yml up -d; then
    print_status "Services started successfully!"
    
    print_info "Waiting for services to be healthy..."
    sleep 30
    
    print_status "=== Service Status ==="
    docker compose -f docker-compose.monitoring.yml ps
    
    print_status "=== Access URLs ==="
    echo -e "${BLUE}Backend Service:${NC} http://localhost:8888"
    echo -e "${BLUE}API Documentation:${NC} http://localhost:8888/api-docs"
    echo -e "${BLUE}Metrics Endpoint:${NC} http://localhost:8888/metrics"
    echo -e "${BLUE}Grafana Dashboard:${NC} http://localhost:3001 (admin/admin123)"
    echo -e "${BLUE}Prometheus:${NC} http://localhost:9292"
    echo -e "${BLUE}Loki:${NC} http://localhost:3100"
    echo -e "${BLUE}Node Exporter:${NC} http://localhost:9100"
    echo -e "${BLUE}cAdvisor:${NC} http://localhost:8081"
    
    print_status "=== Default Dashboards ==="
    echo -e "${BLUE}Platform Overview:${NC} http://localhost:3001/d/lowcode-platform-overview"
    echo -e "${BLUE}Detailed Metrics:${NC} http://localhost:3001/d/lowcode-platform-detailed"
    
    print_status "=== Useful Commands ==="
    echo -e "${YELLOW}View logs:${NC} docker compose -f docker-compose.monitoring.yml logs -f [service-name]"
    echo -e "${YELLOW}Stop services:${NC} docker compose -f docker-compose.monitoring.yml down"
    echo -e "${YELLOW}Restart service:${NC} docker compose -f docker-compose.monitoring.yml restart [service-name]"
    echo -e "${YELLOW}View service status:${NC} docker compose -f docker-compose.monitoring.yml ps"
    
    print_warning "Note: If this is the first run, it may take a few minutes for all metrics to appear in Grafana."
    print_info "You can monitor the startup process by running:"
    echo -e "${BLUE}docker compose -f docker-compose.monitoring.yml logs -f${NC}"
    
else
    print_error "Failed to start services. Check the logs for more details:"
    echo -e "${RED}docker compose -f docker-compose.monitoring.yml logs${NC}"
    exit 1
fi