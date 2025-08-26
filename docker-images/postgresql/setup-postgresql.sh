#!/bin/bash

# TON Low-code Platform - PostgreSQL Setup Script
# This script sets up PostgreSQL database for the platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
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

# Function to check if Docker is running
check_docker() {
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to start PostgreSQL services
start_postgresql() {
    print_status "Starting PostgreSQL services..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d
    else
        docker compose up -d
    fi
    
    print_success "PostgreSQL services started successfully"
}

# Function to stop PostgreSQL services
stop_postgresql() {
    print_status "Stopping PostgreSQL services..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose down
    else
        docker compose down
    fi
    
    print_success "PostgreSQL services stopped successfully"
}

# Function to restart PostgreSQL services
restart_postgresql() {
    print_status "Restarting PostgreSQL services..."
    stop_postgresql
    start_postgresql
}

# Function to view logs
view_logs() {
    if command -v docker-compose &> /dev/null; then
        docker-compose logs -f
    else
        docker compose logs -f
    fi
}

# Function to check service status
check_status() {
    print_status "Checking PostgreSQL service status..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose ps
    else
        docker compose ps
    fi
    
    # Check PostgreSQL connectivity
    print_status "Testing PostgreSQL connectivity..."
    if docker exec ton-postgresql pg_isready -U tonuser -d tonlowcode &> /dev/null; then
        print_success "PostgreSQL is ready and accepting connections"
    else
        print_warning "PostgreSQL is not ready yet. It may still be starting up."
    fi
    
    # Check if PgAdmin is running
    if docker ps --format "table {{.Names}}" | grep -q "ton-pgadmin"; then
        print_success "PgAdmin is running at http://localhost:5050"
        print_status "Default login: admin@tonlowcode.com / admin123"
    else
        print_warning "PgAdmin is not running"
    fi
}

# Function to connect to PostgreSQL
connect_db() {
    print_status "Connecting to PostgreSQL..."
    docker exec -it ton-postgresql psql -U tonuser -d tonlowcode
}

# Function to backup database
backup_db() {
    local backup_name="tonlowcode_backup_$(date +%Y%m%d_%H%M%S).sql"
    print_status "Creating backup: $backup_name"
    
    docker exec ton-postgresql pg_dump -U tonuser -d tonlowcode > "$backup_name"
    print_success "Database backup created: $backup_name"
}

# Function to restore database
restore_db() {
    if [ -z "$1" ]; then
        print_error "Please provide backup file path"
        print_status "Usage: $0 restore <backup_file>"
        exit 1
    fi
    
    local backup_file="$1"
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_status "Restoring database from: $backup_file"
    print_warning "This will overwrite the existing database. Continue? (y/N)"
    read -r confirmation
    
    if [[ $confirmation =~ ^[Yy]$ ]]; then
        docker exec -i ton-postgresql psql -U tonuser -d tonlowcode < "$backup_file"
        print_success "Database restored successfully"
    else
        print_status "Restore cancelled"
    fi
}

# Function to reset database
reset_db() {
    print_warning "This will reset the database to initial state. All data will be lost!"
    print_status "Continue? (y/N)"
    read -r confirmation
    
    if [[ $confirmation =~ ^[Yy]$ ]]; then
        print_status "Resetting database..."
        docker exec ton-postgresql psql -U tonuser -d tonlowcode -c "DROP SCHEMA IF EXISTS app_schema CASCADE;"
        docker exec ton-postgresql psql -U tonuser -d tonlowcode -f /docker-entrypoint-initdb.d/01-init-database.sql
        print_success "Database reset successfully"
    else
        print_status "Reset cancelled"
    fi
}

# Function to show connection information
show_info() {
    print_status "PostgreSQL Connection Information:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: tonlowcode"
    echo "  Username: tonuser"
    echo "  Password: tonpassword123"
    echo ""
    print_status "Application User:"
    echo "  Username: app_user"
    echo "  Password: app_password123"
    echo ""
    print_status "PgAdmin:"
    echo "  URL: http://localhost:5050"
    echo "  Email: admin@tonlowcode.com"
    echo "  Password: admin123"
    echo ""
    print_status "Connection String:"
    echo "  postgresql://tonuser:tonpassword123@localhost:5432/tonlowcode"
}

# Function to display help
show_help() {
    echo "TON Low-code Platform - PostgreSQL Setup Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start      Start PostgreSQL services"
    echo "  stop       Stop PostgreSQL services"
    echo "  restart    Restart PostgreSQL services"
    echo "  status     Show service status"
    echo "  logs       View service logs"
    echo "  connect    Connect to PostgreSQL database"
    echo "  backup     Create database backup"
    echo "  restore    Restore database from backup"
    echo "  reset      Reset database to initial state"
    echo "  info       Show connection information"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 status"
    echo "  $0 backup"
    echo "  $0 restore backup_file.sql"
}

# Main script logic
main() {
    case "${1:-help}" in
        "start")
            check_docker
            check_docker_compose
            start_postgresql
            sleep 5
            check_status
            show_info
            ;;
        "stop")
            check_docker
            check_docker_compose
            stop_postgresql
            ;;
        "restart")
            check_docker
            check_docker_compose
            restart_postgresql
            sleep 5
            check_status
            ;;
        "status")
            check_docker
            check_status
            ;;
        "logs")
            check_docker
            view_logs
            ;;
        "connect")
            check_docker
            connect_db
            ;;
        "backup")
            check_docker
            backup_db
            ;;
        "restore")
            check_docker
            restore_db "$2"
            ;;
        "reset")
            check_docker
            reset_db
            ;;
        "info")
            show_info
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"