# 🎯 Redis for TON Lowcode Platform

## ภาพรวม

Redis configuration สำหรับ TON Lowcode Platform ที่ออกแบบมาเพื่อ:
- **Session Management** - จัดการ user sessions
- **Real-time Collaboration** - สนับสนุน collaborative features
- **Caching** - Cache database queries และ API responses
- **Rate Limiting** - ควบคุมการใช้งาน API
- **Pub/Sub** - Real-time messaging

## 🏗️ Architecture

```
TON Lowcode Platform
        ↓
    Redis Cluster
        ├─ Database 0: Sessions
        ├─ Database 1: Flow Cache  
        ├─ Database 2: Components
        ├─ Database 3: Collaboration
        ├─ Database 4: Rate Limiting
        └─ Database 5: Query Cache
```

## 🚀 การติดตั้งและใช้งาน

### Quick Start
```bash
# เข้าไปที่ Redis directory
cd docker-images/redis

# รัน setup script (แนะนำ)
./setup-redis.sh

# หรือ manual start
docker-compose up -d
```

### Manual Setup
```bash
# 1. สร้าง network (ถ้ายังไม่มี)
docker network create lowcode-network

# 2. Start Redis
docker-compose up -d redis

# 3. Start Management UI
docker-compose up -d redis-commander

# 4. Test connection
docker exec lowcode-redis redis-cli -a lowcode_redis_2024 ping
```

## 🔧 Configuration Details

### 🎯 Redis Configuration Highlights

#### Memory Management
```conf
maxmemory 384mb
maxmemory-policy allkeys-lru
maxmemory-samples 5
```

#### Persistence  
```conf
# RDB Snapshots
save 900 1    # 15 min if ≥1 key changed
save 300 10   # 5 min if ≥10 keys changed  
save 60 10000 # 1 min if ≥10000 keys changed

# AOF (Append Only File)
appendonly yes
appendfsync everysec
```

#### Performance Optimization
```conf
# Active defragmentation
activedefrag yes
active-defrag-threshold-lower 10

# Key expiration notifications
notify-keyspace-events Ex

# Client connections
maxclients 10000
tcp-keepalive 300
```

## 📊 Use Cases Implementation

### 🎪 1. Session Management
```typescript
// Store user session
await redis.hset(`session:${userId}`, {
  token: jwtToken,
  last_activity: Date.now(),
  ip_address: clientIP,
  user_agent: userAgent
});
await redis.expire(`session:${userId}`, 3600); // 1 hour TTL
```

### 🔄 2. Real-time Collaboration
```typescript
// Track active users in flow
await redis.hset(`flow:${flowId}:users`, userId, JSON.stringify({
  cursor: { x: 100, y: 200 },
  editing_node: nodeId,
  last_seen: Date.now()
}));

// Publish cursor movement
await redis.publish(`flow:${flowId}:cursors`, JSON.stringify({
  userId,
  position: { x, y }
}));
```

### ⚡ 3. Database Query Caching
```typescript
// Cache expensive queries
const cacheKey = `query:users:${JSON.stringify(filters)}`;
const cached = await redis.get(cacheKey);

if (!cached) {
  const result = await database.query(sql, params);
  await redis.setex(cacheKey, 300, JSON.stringify(result)); // 5 min cache
  return result;
}
return JSON.parse(cached);
```

### 🚦 4. Rate Limiting
```typescript
// API rate limiting
const key = `ratelimit:${userId}:${endpoint}`;
const current = await redis.incr(key);

if (current === 1) {
  await redis.expire(key, 60); // 1 minute window
}

if (current > 10) { // 10 requests per minute
  throw new Error('Rate limit exceeded');
}
```

### 🎯 5. Flow Execution State
```typescript
// Store intermediate flow state
await redis.hset(`flow:execution:${runId}`, {
  flow_id: flowId,
  current_step: stepIndex,
  variables: JSON.stringify(variables),
  start_time: startTime
});
await redis.expire(`flow:execution:${runId}`, 300); // 5 min TTL
```

### 🎨 6. Component Templates Cache
```typescript
// Cache component definitions
const componentKey = `component:${componentId}`;
await redis.hset(componentKey, {
  definition: JSON.stringify(componentDef),
  version: version,
  updated_at: Date.now()
});
await redis.expire(componentKey, 86400); // 1 day cache
```

## 🔍 Monitoring & Management

### Access URLs
- **Redis Server**: localhost:6379
- **Redis Commander**: http://localhost:8081 (admin/admin123)
- **Redis Insight**: http://localhost:8082 (optional, use `--profile insight`)

### Redis CLI Commands
```bash
# Connect to Redis
docker exec -it lowcode-redis redis-cli -a lowcode_redis_2024

# Check memory usage
INFO memory

# Monitor commands in real-time
MONITOR

# Check slow queries
SLOWLOG GET 10

# Database sizes
INFO keyspace

# Connection info
INFO clients
```

### Performance Monitoring
```bash
# Memory statistics
docker exec lowcode-redis redis-cli -a lowcode_redis_2024 info memory

# Connection statistics
docker exec lowcode-redis redis-cli -a lowcode_redis_2024 info clients

# Command statistics
docker exec lowcode-redis redis-cli -a lowcode_redis_2024 info commandstats

# Slow queries
docker exec lowcode-redis redis-cli -a lowcode_redis_2024 slowlog get 5
```

## 📋 Database Schema Design

### Database Allocation
```
DB 0: Sessions & Authentication
├─ session:{userId} (hash, TTL: 1h)
├─ refresh_token:{token} (string, TTL: 7d)
└─ login_attempts:{ip} (string, TTL: 1h)

DB 1: Flow Execution & Cache
├─ flow:execution:{runId} (hash, TTL: 5m)
├─ flow:result:{runId} (string, TTL: 1h)
└─ flow:queue (list)

DB 2: Component Templates & UI
├─ component:{componentId} (hash, TTL: 1d)
├─ page:template:{pageId} (string, TTL: 1d)
└─ ui:themes (hash, no TTL)

DB 3: Real-time Collaboration
├─ flow:{flowId}:users (hash, TTL: 1m)
├─ flow:{flowId}:cursors (hash, TTL: 30s)
└─ collaboration:{sessionId} (hash, TTL: 5m)

DB 4: Rate Limiting & Security
├─ ratelimit:{userId}:{endpoint} (string, TTL: 1m)
├─ failed_auth:{ip} (string, TTL: 15m)
└─ api_usage:{userId} (hash, TTL: 1d)

DB 5: Query & Data Cache
├─ query:{hash} (string, TTL: 5m)
├─ api:response:{hash} (string, TTL: 10m)
└─ metadata:cache (hash, TTL: 1h)
```

### Key Naming Conventions
```
Format: {category}:{identifier}[:{subcategory}]

Examples:
- session:user:12345
- flow:execution:run:67890
- component:template:button:v2
- ratelimit:user:12345:api:flows
- query:users:filter:active:true
```

## 🎯 Integration with Lowcode Platform

### NestJS Integration Example
```typescript
// redis.service.ts
@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: 'localhost',
      port: 6379,
      password: 'lowcode_redis_2024',
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
  }

  // Session management
  async setSession(userId: string, sessionData: any, ttl = 3600) {
    await this.client.hset(`session:${userId}`, sessionData);
    await this.client.expire(`session:${userId}`, ttl);
  }

  async getSession(userId: string) {
    return await this.client.hgetall(`session:${userId}`);
  }

  // Cache operations
  async cache(key: string, data: any, ttl = 300) {
    await this.client.setex(key, ttl, JSON.stringify(data));
  }

  async getCached(key: string) {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Pub/Sub for real-time features
  async publish(channel: string, message: any) {
    await this.client.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, callback: (message: any) => void) {
    const subscriber = this.client.duplicate();
    await subscriber.subscribe(channel);
    subscriber.on('message', (channel, message) => {
      callback(JSON.parse(message));
    });
    return subscriber;
  }
}
```

### Rate Limiting Middleware
```typescript
// rate-limit.middleware.ts
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private redisService: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id || req.ip;
    const endpoint = req.path;
    const key = `ratelimit:${userId}:${endpoint}`;

    const count = await this.redisService.client.incr(key);
    
    if (count === 1) {
      await this.redisService.client.expire(key, 60);
    }

    if (count > 10) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    next();
  }
}
```

## 🔒 Security Configuration

### Password Authentication
```conf
requirepass lowcode_redis_2024
```

### Command Renaming (Production)
```conf
# Disable dangerous commands
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command CONFIG "CONFIG_a8f2d9e4b1c3"
```

### Network Security
```conf
# Bind to specific interfaces
bind 0.0.0.0  # Development only
# bind 127.0.0.1 10.0.0.1  # Production

# Protected mode
protected-mode yes
```

## 🚀 Performance Tuning

### Memory Optimization
```conf
# Use memory-efficient data structures
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
set-max-intset-entries 512
```

### Connection Pooling
```typescript
// Connection pooling in NestJS
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  password: 'lowcode_redis_2024',
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxLoadingTimeout: 1000,
});
```

### Monitoring Scripts
```bash
#!/bin/bash
# redis-monitor.sh - Monitor Redis performance

echo "=== Redis Performance Monitor ==="
echo "Memory Usage:"
docker exec lowcode-redis redis-cli -a lowcode_redis_2024 info memory | grep used_memory_human

echo -e "\nConnected Clients:"
docker exec lowcode-redis redis-cli -a lowcode_redis_2024 info clients | grep connected_clients

echo -e "\nCommand Stats:"
docker exec lowcode-redis redis-cli -a lowcode_redis_2024 info commandstats | head -10

echo -e "\nSlow Queries:"
docker exec lowcode-redis redis-cli -a lowcode_redis_2024 slowlog get 3
```

## 🛠️ Troubleshooting

### Common Issues

#### Connection Refused
```bash
# Check if Redis is running
docker ps | grep lowcode-redis

# Check Redis logs
docker logs lowcode-redis

# Test connection
docker exec lowcode-redis redis-cli ping
```

#### Memory Issues
```bash
# Check memory usage
docker exec lowcode-redis redis-cli -a lowcode_redis_2024 info memory

# Check eviction stats
docker exec lowcode-redis redis-cli -a lowcode_redis_2024 info stats | grep evicted

# Monitor memory in real-time
watch -n 1 'docker exec lowcode-redis redis-cli -a lowcode_redis_2024 info memory | grep used_memory_human'
```

#### Performance Issues
```bash
# Check slow queries
docker exec lowcode-redis redis-cli -a lowcode_redis_2024 slowlog get 10

# Monitor commands
docker exec lowcode-redis redis-cli -a lowcode_redis_2024 monitor

# Check client connections
docker exec lowcode-redis redis-cli -a lowcode_redis_2024 client list
```

## 📊 Production Considerations

### High Availability Setup
```yaml
# Redis Sentinel (for production)
version: '3.8'
services:
  redis-sentinel:
    image: redis:7-alpine
    command: redis-sentinel /usr/local/etc/redis/sentinel.conf
    volumes:
      - ./sentinel.conf:/usr/local/etc/redis/sentinel.conf
```

### Backup Strategy
```bash
# Automated backups
0 2 * * * docker exec lowcode-redis redis-cli -a lowcode_redis_2024 bgsave
0 3 * * * docker cp lowcode-redis:/data/dump.rdb /backup/redis/dump-$(date +\%Y\%m\%d).rdb
```

### Scaling Considerations
- **Redis Cluster** สำหรับ horizontal scaling
- **Read Replicas** สำหรับ read-heavy workloads
- **Sharding** สำหรับ large datasets
- **Connection pooling** สำหรับ high concurrency

---

*Redis Configuration - High-Performance Caching for TON Lowcode Platform* 🎯