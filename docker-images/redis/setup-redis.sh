#!/bin/bash

# TON Lowcode Platform - Redis Setup Script
# This script sets up Redis with optimized configuration for the platform

set -e

echo "🚀 Setting up Redis for TON Lowcode Platform..."

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

# Start Redis services
print_status "Starting Redis services..."
docker-compose up -d redis

# Wait for Redis to be ready
print_status "Waiting for Redis to be ready..."
timeout=30
counter=0
while ! docker exec lowcode-redis redis-cli ping > /dev/null 2>&1; do
    if [ $counter -eq $timeout ]; then
        print_error "Redis failed to start within $timeout seconds"
        exit 1
    fi
    echo -n "."
    sleep 1
    ((counter++))
done
print_success "Redis is ready!"

# Start UI services
print_status "Starting Redis UI services..."
docker-compose up -d redis-commander

# Wait for Redis Commander to be ready
print_status "Waiting for Redis Commander to be ready..."
sleep 10

# Test Redis functionality
print_status "Testing Redis functionality..."

# Test basic operations
docker exec lowcode-redis redis-cli auth lowcode_redis_2024
docker exec lowcode-redis redis-cli set "test:setup" "success" EX 60
TEST_VALUE=$(docker exec lowcode-redis redis-cli auth lowcode_redis_2024 > /dev/null && docker exec lowcode-redis redis-cli get "test:setup" 2>/dev/null)

if [ "$TEST_VALUE" = "success" ]; then
    print_success "Redis basic operations test passed!"
else
    print_warning "Redis basic operations test failed, but service is running"
fi

# Test hash operations (for session management)
docker exec lowcode-redis redis-cli auth lowcode_redis_2024 > /dev/null
docker exec lowcode-redis redis-cli hset "session:test" user_id "123" active "true" last_seen "$(date +%s)" > /dev/null
SESSION_DATA=$(docker exec lowcode-redis redis-cli hgetall "session:test" 2>/dev/null)

if [ -n "$SESSION_DATA" ]; then
    print_success "Redis hash operations test passed!"
else
    print_warning "Redis hash operations test failed"
fi

# Test pub/sub (for real-time features)
print_status "Testing Redis pub/sub functionality..."
(docker exec lowcode-redis redis-cli auth lowcode_redis_2024 > /dev/null && docker exec lowcode-redis redis-cli subscribe "test:channel" &) > /dev/null &
SUBSCRIBER_PID=$!
sleep 2
docker exec lowcode-redis redis-cli auth lowcode_redis_2024 > /dev/null && docker exec lowcode-redis redis-cli publish "test:channel" "test message" > /dev/null
sleep 1
kill $SUBSCRIBER_PID 2>/dev/null || true
wait $SUBSCRIBER_PID 2>/dev/null || true

# Initialize Redis with platform-specific data structures
print_status "Initializing Redis with platform-specific schemas..."

# Create some initial key structures for the platform
docker exec lowcode-redis redis-cli auth lowcode_redis_2024 > /dev/null

# Session management structure
docker exec lowcode-redis redis-cli hset "sessions:schema" "structure" "hash" "ttl" "3600" "description" "User session storage" > /dev/null

# Flow execution cache structure  
docker exec lowcode-redis redis-cli hset "flows:schema" "structure" "hash" "ttl" "300" "description" "Flow execution state cache" > /dev/null

# Component templates cache
docker exec lowcode-redis redis-cli hset "components:schema" "structure" "hash" "ttl" "86400" "description" "Component templates cache" > /dev/null

# Real-time collaboration
docker exec lowcode-redis redis-cli hset "collaboration:schema" "structure" "hash" "ttl" "60" "description" "Real-time collaboration state" > /dev/null

# Rate limiting
docker exec lowcode-redis redis-cli hset "ratelimit:schema" "structure" "string" "ttl" "60" "description" "API rate limiting counters" > /dev/null

# Database query cache
docker exec lowcode-redis redis-cli hset "querycache:schema" "structure" "string" "ttl" "300" "description" "Database query result cache" > /dev/null

# Cleanup test data
docker exec lowcode-redis redis-cli del "test:setup" "session:test" > /dev/null

# Check service status
print_status "Checking service status..."

services=("lowcode-redis" "lowcode-redis-ui")
all_healthy=true

for service in "${services[@]}"; do
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$service.*Up"; then
        print_success "$service is running"
    else
        print_warning "$service may not be running properly"
        all_healthy=false
    fi
done

# Display Redis info
print_status "Redis Configuration Summary:"
REDIS_INFO=$(docker exec lowcode-redis redis-cli auth lowcode_redis_2024 > /dev/null && docker exec lowcode-redis redis-cli info server | head -10 2>/dev/null || echo "Could not retrieve Redis info")
echo "$REDIS_INFO"

# Display access information
echo
echo "=================================="
echo "🎉 Redis Setup Complete!"
echo "=================================="
echo
echo "📊 Access Information:"
echo "  Redis Server:     localhost:6379"
echo "  Redis Commander: http://localhost:8081"
echo "  Redis Insight:    http://localhost:8082 (use --profile insight to enable)"
echo
echo "🔐 Connection Details:"
echo "  Password: lowcode_redis_2024"
echo "  Databases: 16 (0-15)"
echo "  Max Memory: 384MB"
echo "  Eviction Policy: allkeys-lru"
echo
echo "🔧 Redis Commander Credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo
echo "📋 Pre-configured Use Cases:"
echo "  ✅ Session Management (DB 0)"
echo "  ✅ Flow Execution Cache (DB 1)" 
echo "  ✅ Component Templates (DB 2)"
echo "  ✅ Real-time Collaboration (DB 3)"
echo "  ✅ Rate Limiting (DB 4)"
echo "  ✅ Query Result Cache (DB 5)"
echo "  ✅ Pub/Sub for Real-time Features"
echo "  ✅ Lua Scripting Support"
echo
echo "🚀 Performance Features:"
echo "  ✅ AOF Persistence (everysec)"
echo "  ✅ LRU Memory Eviction"
echo "  ✅ Connection Pooling"
echo "  ✅ Slow Query Monitoring"
echo "  ✅ Keyspace Notifications"
echo "  ✅ Memory Defragmentation"
echo
echo "📖 Integration Examples:"
echo "  # Connect with password"
echo "  redis-cli -h localhost -p 6379 -a lowcode_redis_2024"
echo
echo "  # Test connection"
echo "  docker exec lowcode-redis redis-cli auth lowcode_redis_2024"
echo "  docker exec lowcode-redis redis-cli ping"
echo
echo "  # Monitor real-time commands"
echo "  docker exec lowcode-redis redis-cli auth lowcode_redis_2024"
echo "  docker exec lowcode-redis redis-cli monitor"
echo

if [ "$all_healthy" = true ]; then
    echo "✅ All Redis services are running successfully!"
else
    echo "⚠️  Some services may not be running properly. Check docker logs for details."
fi

echo
echo "🐳 Useful Commands:"
echo "  View logs: docker-compose logs -f redis"
echo "  Redis CLI: docker exec -it lowcode-redis redis-cli -a lowcode_redis_2024"
echo "  Redis info: docker exec lowcode-redis redis-cli -a lowcode_redis_2024 info"
echo "  Stop services: docker-compose down"
echo "  Restart Redis: docker-compose restart redis"
echo

print_success "Redis is ready for TON Lowcode Platform! 🎯"