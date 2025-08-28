#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_status "Stopping TON Lowcode Platform with Monitoring..."

# Stop and remove containers
if docker-compose -f docker-compose.monitoring.yml down; then
    print_status "All services stopped successfully!"
    
    # Optional: Remove volumes (uncomment if you want to clean everything)
    # print_warning "Removing all data volumes..."
    # docker-compose -f docker-compose.monitoring.yml down -v
    
    print_status "=== Cleanup completed ==="
    echo -e "${YELLOW}To remove all data volumes, run:${NC}"
    echo -e "${RED}docker-compose -f docker-compose.monitoring.yml down -v${NC}"
    
    echo -e "${YELLOW}To remove unused Docker resources, run:${NC}"
    echo -e "${RED}docker system prune${NC}"
    
else
    print_error "Failed to stop services. Check if they are running:"
    echo -e "${RED}docker-compose -f docker-compose.monitoring.yml ps${NC}"
    exit 1
fi