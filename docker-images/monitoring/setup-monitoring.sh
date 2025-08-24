#!/bin/bash

# TON Lowcode Platform - Monitoring Setup Script
# This script sets up Grafana + Loki + Prometheus monitoring stack

set -e

echo "🚀 Setting up TON Lowcode Platform Monitoring Stack..."

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
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    print_error "Docker Compose is not available. Please install Docker Compose and try again."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p prometheus/rules
mkdir -p grafana/{provisioning/{datasources,dashboards},dashboards}
mkdir -p loki
mkdir -p promtail

# Check if configuration files exist
if [ ! -f "prometheus/prometheus.yml" ]; then
    print_error "prometheus.yml not found. Please ensure all configuration files are in place."
    exit 1
fi

if [ ! -f "loki/loki-config.yml" ]; then
    print_error "loki-config.yml not found. Please ensure all configuration files are in place."
    exit 1
fi

# Set permissions for Grafana
print_status "Setting up Grafana permissions..."
sudo chown -R 472:472 grafana/ 2>/dev/null || {
    print_warning "Could not set Grafana permissions. You may need to run with sudo."
}

# Start the monitoring stack
print_status "Starting monitoring services..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check service status
print_status "Checking service status..."

services=("prometheus" "grafana" "loki" "promtail" "node-exporter" "cadvisor")
all_healthy=true

for service in "${services[@]}"; do
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$service.*Up"; then
        print_success "$service is running"
    else
        print_error "$service is not running"
        all_healthy=false
    fi
done

# Display access information
echo
echo "=================================="
echo "🎉 Monitoring Stack Setup Complete!"
echo "=================================="
echo
echo "📊 Access URLs:"
echo "  Grafana:    http://localhost:3001"
echo "  Prometheus: http://localhost:9090"
echo "  Loki:       http://localhost:3100"
echo "  cAdvisor:   http://localhost:8080"
echo
echo "🔐 Default Credentials:"
echo "  Grafana: admin / admin123"
echo
echo "📈 Pre-configured:"
echo "  ✅ Prometheus datasource"
echo "  ✅ Loki datasource for logs"
echo "  ✅ Lowcode Platform dashboard"
echo "  ✅ System monitoring (CPU, Memory, Disk)"
echo "  ✅ Container monitoring"
echo "  ✅ Alert rules"
echo
echo "🔧 Next Steps:"
echo "  1. Open Grafana at http://localhost:3001"
echo "  2. Login with admin/admin123"
echo "  3. Check the 'Lowcode Platform Overview' dashboard"
echo "  4. Configure additional dashboards as needed"
echo
if [ "$all_healthy" = true ]; then
    echo "✅ All services are running successfully!"
else
    echo "⚠️  Some services may not be running properly. Check docker logs for details."
fi
echo

# Show container status
print_status "Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(prometheus|grafana|loki|promtail|node-exporter|cadvisor)"

echo
echo "🐳 To stop all services: docker-compose down"
echo "📋 To view logs: docker-compose logs -f [service-name]"
echo