#!/bin/bash

# TON Lowcode Platform - Kafka Setup Script
# This script sets up Kafka cluster with pre-configured topics for the platform

set -e

echo "🚀 Setting up Kafka for TON Lowcode Platform..."

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

# Start Kafka cluster
print_status "Starting Kafka cluster..."
docker compose up -d

# Wait for services to be ready
print_status "Waiting for Zookeeper to be ready..."
timeout=60
counter=0
while ! docker exec lowcode-zookeeper bash -c "echo 'ruok' | nc localhost 2181 | grep -q imok" 2>/dev/null; do
    if [ $counter -eq $timeout ]; then
        print_error "Zookeeper failed to start within $timeout seconds"
        exit 1
    fi
    echo -n "."
    sleep 1
    ((counter++))
done
print_success "Zookeeper is ready!"

print_status "Waiting for Kafka to be ready..."
timeout=120
counter=0
while ! docker exec lowcode-kafka kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1; do
    if [ $counter -eq $timeout ]; then
        print_error "Kafka failed to start within $timeout seconds"
        exit 1
    fi
    echo -n "."
    sleep 1
    ((counter++))
done
print_success "Kafka is ready!"

# Check if topics were created by init container
print_status "Verifying Kafka topics..."
sleep 10

TOPICS=$(docker exec lowcode-kafka kafka-topics --list --bootstrap-server localhost:9092 2>/dev/null)

if [ -z "$TOPICS" ]; then
    print_warning "No topics found. Creating topics manually..."
    
    # Create topics for Lowcode Platform
    print_status "Creating Kafka topics..."
    
    docker exec lowcode-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic user.activity
    docker exec lowcode-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 5 --replication-factor 1 --topic flow.execution
    docker exec lowcode-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic flow.completed
    docker exec lowcode-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic flow.failed
    docker exec lowcode-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic notifications
    docker exec lowcode-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic audit.logs
    docker exec lowcode-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 5 --replication-factor 1 --topic analytics.events
    docker exec lowcode-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic media.events
    docker exec lowcode-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 5 --replication-factor 1 --topic collaboration.events
    docker exec lowcode-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --topic database.changes
    docker exec lowcode-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1 --topic error.events
    docker exec lowcode-kafka kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1 --topic dead.letter.queue
fi

# List created topics
print_success "Kafka topics created:"
docker exec lowcode-kafka kafka-topics --list --bootstrap-server localhost:9092 | sort

# Test topic creation and message production/consumption
print_status "Testing Kafka functionality..."

# Produce a test message
echo "test-message-$(date)" | docker exec -i lowcode-kafka kafka-console-producer --bootstrap-server localhost:9092 --topic user.activity

# Consume the test message
TEST_MESSAGE=$(timeout 5 docker exec lowcode-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic user.activity --from-beginning --max-messages 1 2>/dev/null || true)

if [ -n "$TEST_MESSAGE" ]; then
    print_success "Kafka message production/consumption test passed!"
else
    print_warning "Kafka message test may have issues, but basic setup is complete"
fi

# Check service status
print_status "Checking service status..."

services=("lowcode-zookeeper" "lowcode-kafka" "lowcode-kafka-ui")
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
echo "🎉 Kafka Setup Complete!"
echo "=================================="
echo
echo "📊 Access URLs:"
echo "  Kafka Broker:    localhost:9092"
echo "  Kafka UI:        http://localhost:8083"
echo "  Zookeeper:       localhost:2181"
echo
echo "🔐 Default Credentials:"
echo "  Kafka UI: admin / admin123"
echo
echo "📋 Pre-configured Topics:"
echo "  ✅ user.activity (user actions)"
echo "  ✅ flow.execution (flow processing)"
echo "  ✅ flow.completed (successful flows)"
echo "  ✅ flow.failed (failed flows)"
echo "  ✅ notifications (real-time notifications)"
echo "  ✅ audit.logs (security audit)"
echo "  ✅ analytics.events (usage analytics)"
echo "  ✅ media.events (file operations)"
echo "  ✅ collaboration.events (real-time collab)"
echo "  ✅ database.changes (change data capture)"
echo "  ✅ error.events (error tracking)"
echo "  ✅ dead.letter.queue (failed message handling)"
echo
echo "🔧 Next Steps:"
echo "  1. Open Kafka UI at http://localhost:8083"
echo "  2. Login with admin/admin123"
echo "  3. Explore topics and produce test messages"
echo "  4. Integrate with your lowcode-portal-service"
echo
echo "📖 Integration Examples:"
echo "  # Test message production"
echo "  echo 'test message' | docker exec -i lowcode-kafka kafka-console-producer --bootstrap-server localhost:9092 --topic user.activity"
echo
echo "  # Test message consumption"
echo "  docker exec lowcode-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic user.activity --from-beginning"
echo

if [ "$all_healthy" = true ]; then
    echo "✅ All Kafka services are running successfully!"
else
    echo "⚠️  Some services may not be running properly. Check docker logs for details."
fi

echo
echo "🐳 Useful Commands:"
echo "  Stop services: docker compose down"
echo "  View logs: docker compose logs -f kafka"
echo "  List topics: docker exec lowcode-kafka kafka-topics --list --bootstrap-server localhost:9092"
echo "  Topic details: docker exec lowcode-kafka kafka-topics --describe --bootstrap-server localhost:9092 --topic [topic-name]"
echo

print_success "Kafka cluster is ready for TON Lowcode Platform! 🚀"