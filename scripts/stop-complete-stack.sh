#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
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

print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

print_header "🛑 Stopping TON Lowcode Platform - Complete Stack"

# Stop and remove containers
if docker compose -f docker-compose.complete.yml down; then
    print_status "All services stopped successfully!"
    
    print_header "=== Cleanup Options ==="
    echo -e "${YELLOW}To remove all data volumes (⚠️  THIS WILL DELETE ALL DATA):${NC}"
    echo -e "${RED}docker compose -f docker-compose.complete.yml down -v${NC}"
    echo ""
    
    echo -e "${YELLOW}To remove unused Docker resources:${NC}"
    echo -e "${RED}docker system prune${NC}"
    echo ""
    
    echo -e "${YELLOW}To remove unused Docker images:${NC}"
    echo -e "${RED}docker image prune -a${NC}"
    echo ""
    
    print_status "=== Available Start Commands ==="
    echo -e "${GREEN}Complete Stack:${NC} ./scripts/start-complete-stack.sh"
    echo -e "${GREEN}Monitoring Only:${NC} ./scripts/start-monitoring.sh"
    echo ""
    
else
    print_error "Failed to stop services. Check if they are running:"
    echo -e "${RED}docker compose -f docker-compose.complete.yml ps${NC}"
    exit 1
fi