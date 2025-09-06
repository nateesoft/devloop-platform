# 🌐 TON Lowcode Platform - Complete NGINX Integration Guide

## ภาพรวม

คู่มือนี้อธิบายการใช้งาน NGINX เป็น reverse proxy ที่รวบรวมทุก service ของ TON Lowcode Platform ไว้ใน endpoints เดียว พร้อม monitoring, infrastructure services และ admin tools ครบครัน

## 🏗️ สถาปัตยกรรม NGINX

```
                                    ┌─────────────────┐
                                    │     NGINX       │
                                    │  Reverse Proxy  │
                                    │                 │
                          ┌─────────┤  Port 80, 81, 82│─────────┐
                          │         └─────────────────┘         │
                          │                                     │
         ┌────────────────▼──────┐                 ┌──────────▼─────────┐
         │   Frontend Routes     │                 │   Admin Services   │
         │   (Port 80)          │                 │   (Port 81)        │
         │                      │                 │                    │
         │ • /                  │                 │ • /grafana/        │
         │ • /api/              │                 │ • /prometheus/     │
         │ • /api-docs/         │                 │ • /loki/           │
         │ • /auth/             │                 │ • /vault/          │
         │ • /health            │                 │ • /minio/          │
         │ • /metrics           │                 │ • /keycloak/       │
         └─────────────────────┘                 │ • /cadvisor/       │
                                                  │ • /node-exporter/  │
                                                  └────────────────────┘
                          
                          ┌─────────────────────┐
                          │   API-Only Access   │
                          │   (Port 82)         │
                          │                     │
                          │ • /api/             │
                          │ • /metrics          │
                          │ • /health           │
                          │ • /api-docs/        │
                          └─────────────────────┘
```

## 🚀 การติดตั้งและใช้งาน

### Quick Start - Complete Stack

```bash
# เริ่ม complete stack พร้อม nginx และทุก services
./scripts/start-complete-stack.sh

# หยุด complete stack
./scripts/stop-complete-stack.sh
```

### Manual Setup

```bash
# เริ่ม complete stack
docker compose -f docker-compose.complete.yml up -d

# ดู status
docker compose -f docker-compose.complete.yml ps

# ดู logs
docker compose -f docker-compose.complete.yml logs -f nginx
```

## 🌐 Port และ Endpoint Mapping

### Port 80 - Main Application
| Endpoint | Service | Description |
|----------|---------|-------------|
| `/` | Frontend | หน้าแรกของแอปพลิเคชัน |
| `/api/` | Backend API | REST API endpoints |
| `/api-docs/` | Swagger UI | API documentation |
| `/auth/` | Authentication | Login/logout endpoints |
| `/health` | Health Check | Service health status |
| `/metrics` | Prometheus | Application metrics (restricted) |

### Port 81 - Administrative Services
| Endpoint | Service | Description |
|----------|---------|-------------|
| `/` | Admin Dashboard | แดชบอร์ดรวมลิงค์ทุก service |
| `/grafana/` | Grafana | Monitoring dashboard |
| `/prometheus/` | Prometheus | Metrics query interface |
| `/loki/` | Loki | Log query interface |
| `/cadvisor/` | cAdvisor | Container metrics |
| `/node-exporter/` | Node Exporter | System metrics |
| `/vault/` | Vault UI | Secret management |
| `/minio/` | MinIO Console | Object storage management |
| `/keycloak/` | Keycloak | Identity management |

### Port 82 - API-Only Access
| Endpoint | Service | Description |
|----------|---------|-------------|
| `/api/` | Backend API | Direct API access without frontend |
| `/metrics` | Metrics | Application metrics (open access) |
| `/health` | Health Check | Service health status |
| `/api-docs/` | Swagger UI | API documentation |

## 📊 Service Integration Details

### Frontend Routes (Port 80)
```nginx
location / {
    proxy_pass http://lowcode_frontend;
    # Rate limiting: 20 req/sec, burst 50
    # WebSocket support
    # Static file caching
}

location /api/ {
    proxy_pass http://lowcode_backend/;
    # Rate limiting: 10 req/sec, burst 20
    # CORS headers
    # OPTIONS preflight handling
}
```

### Monitoring Routes (Port 81)
```nginx
location /grafana/ {
    proxy_pass http://grafana/;
    # WebSocket support for live updates
    # Extended timeouts
    # Rate limiting: 30 req/sec, burst 30
}

location /prometheus/ {
    proxy_pass http://prometheus/;
    # Heavy query timeouts: 300s
    # Rate limiting: 30 req/sec, burst 20
}
```

### Infrastructure Routes (Port 81)
```nginx
location /vault/ {
    proxy_pass http://vault/ui/;
    # Standard proxy headers
}

location /keycloak/ {
    proxy_pass http://keycloak/;
    # Extended buffer settings
    # Keycloak-specific headers
}
```

## 🛡️ Security Features

### Rate Limiting
- **API**: 10 requests/second, burst 20
- **Auth**: 5 requests/second, burst 10  
- **General**: 20 requests/second, burst 50
- **Monitoring**: 30 requests/second, burst 30

### Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Access Control
- **Metrics endpoint**: Restricted to Docker networks และ localhost
- **Admin services**: Optional basic auth (commented out)
- **CORS**: Full CORS support สำหรับ API endpoints

## ⚡ Performance Optimizations

### Gzip Compression
```nginx
gzip on;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
gzip_min_length 1000;
```

### Static File Caching
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Connection Pooling
- **Frontend/Backend**: keepalive 32 connections
- **Monitoring Services**: keepalive 8 connections
- **Infrastructure**: keepalive 8 connections

## 🔧 Configuration Files

### Main Configuration: `nginx.conf`
- 3 server blocks (port 80, 81, 82)
- Comprehensive upstream definitions
- Rate limiting zones
- Security headers
- Performance optimizations

### Docker Compose Integration
```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"   # Main app
      - "81:81"   # Admin
      - "82:82"   # API-only
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - lowcode-network
      - monitoring
```

## 📱 Admin Dashboard Features

Port 81 มี built-in admin dashboard ที่สร้างด้วย HTML/CSS/JavaScript:

### Sections:
1. **📊 Monitoring & Analytics**
   - Grafana Dashboard
   - Prometheus Metrics
   - Loki Logs
   - cAdvisor Container Metrics
   - Node Exporter System Metrics
   - Promtail Log Shipper

2. **🔧 Infrastructure Services**
   - Vault Secret Management
   - MinIO Object Storage
   - Keycloak Identity Management

3. **🌐 Application Services**
   - Frontend Application
   - API Documentation
   - Health Check
   - Application Metrics

4. **📚 Quick Links**
   - Pre-configured Dashboards
   - Health Checks
   - Monitoring Status

## 🔍 Health Checks และ Monitoring

### Service Health Endpoints
```bash
# Main application health
curl http://localhost/health

# Admin services health
curl http://localhost:81/grafana/api/health
curl http://localhost:81/prometheus/-/healthy
curl http://localhost:81/loki/ready

# API-only health
curl http://localhost:82/health
```

### NGINX Status
```bash
# Test NGINX configuration
docker exec lowcode-nginx nginx -t

# Reload NGINX configuration
docker exec lowcode-nginx nginx -s reload

# View NGINX access logs
docker-compose -f docker-compose.complete.yml logs nginx
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Service Unavailable (502/503)
```bash
# ตรวจสอบ upstream services
docker compose -f docker-compose.complete.yml ps

# ตรวจสอบ NGINX logs
docker compose -f docker-compose.complete.yml logs nginx

# ตรวจสอบ backend service logs
docker compose -f docker-compose.complete.yml logs lowcode-portal-service
```

#### 2. Rate Limiting (429)
```bash
# ปรับ rate limiting ใน nginx.conf
limit_req_zone $binary_remote_addr zone=api:10m rate=20r/s;  # เพิ่มจาก 10r/s

# Reload configuration
docker exec lowcode-nginx nginx -s reload
```

#### 3. WebSocket Connection Issues
```bash
# ตรวจสอบ WebSocket headers
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost/socket.io/
```

#### 4. SSL/HTTPS Issues (เมื่อเปิดใช้งาน)
```bash
# ตรวจสอบ SSL certificate
docker exec lowcode-nginx openssl x509 -in /etc/ssl/certs/lowcode-platform.crt -text -noout
```

### Performance Tuning

#### Increase Worker Connections
```nginx
events {
    worker_connections 2048;  # เพิ่มจาก default 1024
}
```

#### Optimize Buffer Sizes
```nginx
client_body_buffer_size 128k;
client_max_body_size 200M;  # เพิ่มสำหรับ file uploads ขนาดใหญ่
proxy_buffer_size 128k;
proxy_buffers 4 256k;
```

#### Enable HTTP/2 (สำหรับ HTTPS)
```nginx
server {
    listen 443 ssl http2;
    # ... SSL configuration
}
```

## 📊 Load Testing

### Basic Load Testing
```bash
# Test main application
ab -n 1000 -c 10 http://localhost/

# Test API endpoint
ab -n 500 -c 5 http://localhost/api/health

# Test admin dashboard
ab -n 100 -c 2 http://localhost:81/
```

### Advanced Load Testing with wrk
```bash
# Install wrk
brew install wrk  # macOS
sudo apt install wrk  # Ubuntu

# Test API performance
wrk -t12 -c400 -d30s http://localhost/api/health

# Test with POST requests
wrk -t12 -c400 -d30s -s script.lua http://localhost/api/
```

## 🔄 Deployment Strategies

### Blue-Green Deployment
```bash
# Start new version
docker compose -f docker-compose.complete.yml up -d --scale lowcode-portal-service=2

# Test new version
curl http://localhost/health

# Update NGINX upstream (if needed)
# Restart NGINX
docker compose -f docker-compose.complete.yml restart nginx
```

### Rolling Updates
```bash
# Update single service
docker compose -f docker-compose.complete.yml up -d --no-deps lowcode-portal-service

# Verify update
docker compose -f docker-compose.complete.yml ps
```

## 📚 Best Practices

### 1. Configuration Management
- ใช้ environment variables สำหรับ sensitive data
- Version control สำหรับ nginx.conf
- Regular backup configurations

### 2. Security
- เปลี่ยน default passwords ทั้งหมด
- เปิดใช้ basic auth สำหรับ admin services ใน production
- ใช้ HTTPS ใน production environment

### 3. Monitoring
- ตั้ง alerts สำหรับ NGINX error rate
- Monitor upstream service health
- Log analysis สำหรับ performance tuning

### 4. Performance
- Regular review ของ rate limits
- Monitor connection pooling effectiveness
- Optimize cache strategies

## 📖 Reference Links

- [NGINX Documentation](https://nginx.org/en/docs/)
- [NGINX Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Docker Compose Networking](https://docs.docker.com/compose/networking/)
- [Grafana Proxy Configuration](https://grafana.com/docs/grafana/latest/administration/configuration/#serve_from_sub_path)

---

## 🆘 Support Commands

```bash
# View all containers
docker ps

# Check NGINX configuration
docker exec lowcode-nginx nginx -T

# Restart specific service
docker compose -f docker-compose.complete.yml restart [service-name]

# View resource usage
docker stats

# Cleanup unused resources
docker system prune -f
```

---

*TON Lowcode Platform - Complete NGINX Integration* 🌐🚀