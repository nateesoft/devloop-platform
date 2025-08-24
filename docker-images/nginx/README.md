# 🚀 NGINX Reverse Proxy for TON Lowcode Platform

## ภาพรวม

NGINX reverse proxy สำหรับ TON Lowcode Platform ที่ให้บริการ:
- **Single entry point** สำหรับทั้งระบบ
- **SSL/TLS termination** 
- **Rate limiting** และ DDoS protection
- **Static file caching** 
- **Load balancing** (พร้อมขยาย)
- **Security headers**

## 🏗️ Architecture

```
Internet → NGINX (Port 80/443) → {
    /          → Frontend (Next.js :3000)
    /api/      → Backend (NestJS :8080)
    /auth/     → Backend Auth Routes
    /health    → Health Checks
    /metrics   → Prometheus Metrics
}

Admin Services (Port 81) → {
    /grafana/    → Grafana :3000
    /prometheus/ → Prometheus :9090
    /vault/      → Vault UI :8200
    /minio/      → MinIO Console :9090
}
```

## 🚀 การติดตั้งและใช้งาน

### Prerequisites
- Docker & Docker Compose
- Lowcode Platform services running
- Network: `lowcode-network`

### Quick Start
```bash
# สร้าง Docker network (ถ้ายังไม่มี)
docker network create lowcode-network

# เริ่ม NGINX
cd docker-images/nginx
docker-compose up -d

# ตรวจสอบสถานะ
docker-compose ps
docker-compose logs nginx
```

### Manual Setup
```bash
# 1. สร้าง SSL directory (สำหรับอนาคต)
mkdir ssl

# 2. ตรวจสอบ nginx config
docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf nginx:alpine nginx -t

# 3. Start NGINX
docker-compose up -d nginx
```

## 🔧 Configuration Details

### 🎯 Main Features

#### Rate Limiting
```nginx
# API calls: 10 requests/second
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# Auth calls: 5 requests/second  
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

# General: 20 requests/second
limit_req_zone $binary_remote_addr zone=general:10m rate=20r/s;
```

#### Caching Strategy
```nginx
# Static assets: 1 year cache
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Next.js static: 1 year cache
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### 🎪 Route Configuration

#### Main Application Routes
- `GET /` → Frontend (Next.js)
- `POST /api/*` → Backend APIs
- `POST /auth/*` → Authentication (rate limited)
- `GET /health` → Health checks (no rate limit)
- `GET /metrics` → Prometheus metrics (restricted access)

#### Admin Routes (Port 81)
- `/grafana/` → Grafana dashboard
- `/prometheus/` → Prometheus UI
- `/vault/` → Vault management
- `/minio/` → MinIO console

## 🔒 SSL/HTTPS Setup

### 1. Generate Self-signed Certificate (Development)
```bash
# สร้าง SSL certificate สำหรับ development
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/lowcode-platform.key \
    -out ssl/lowcode-platform.crt \
    -subj "/C=TH/ST=Bangkok/L=Bangkok/O=Lowcode Platform/CN=localhost"
```

### 2. Enable HTTPS Configuration
```bash
# แก้ไข nginx.conf - uncomment SSL server block
# Restart NGINX
docker-compose restart nginx
```

### 3. Production SSL (Let's Encrypt)
```bash
# ใช้ Certbot สำหรับ production
docker run -it --rm --name certbot \
    -v $(pwd)/ssl:/etc/letsencrypt \
    certbot/certbot certonly --standalone -d yourdomain.com
```

## 📊 Monitoring & Logging

### Access Logs
```bash
# ดู access logs
docker-compose logs -f nginx

# ดู error logs
docker exec lowcode-nginx tail -f /var/log/nginx/error.log
```

### Health Check
```bash
# ตรวจสอบ NGINX config
docker exec lowcode-nginx nginx -t

# ตรวจสอบการเชื่อมต่อ
curl -I http://localhost/health
curl -I http://localhost:81/grafana/
```

### Performance Monitoring
```bash
# NGINX status (ถ้า enable)
curl http://localhost/nginx_status

# Connection stats
docker exec lowcode-nginx netstat -an | grep :80
```

## 🎯 Use Cases & Benefits

### ✅ What NGINX Gives You

#### Performance
- **Static file serving** - 10x faster than app servers
- **Gzip compression** - 70% bandwidth reduction
- **Keep-alive connections** - Reduced latency
- **Caching** - Browser & intermediate caching

#### Security  
- **Rate limiting** - DDoS protection
- **Security headers** - XSS, clickjacking protection
- **IP filtering** - Restrict access to admin routes
- **SSL termination** - Encrypted connections

#### Scalability
- **Load balancing** - Multiple backend instances
- **Health checks** - Automatic failover
- **Connection pooling** - Efficient resource usage
- **Request buffering** - Handle slow clients

#### Operations
- **Single entry point** - Simplified networking
- **Centralized logging** - Better visibility
- **Zero-downtime deployments** - Rolling updates
- **A/B testing** - Traffic splitting

## 🔄 Advanced Configuration

### Load Balancing (Multiple Backends)
```nginx
upstream lowcode_backend {
    server lowcode-portal-service-1:8080 weight=3;
    server lowcode-portal-service-2:8080 weight=2;
    server lowcode-portal-service-3:8080 backup;
    
    keepalive 32;
    keepalive_requests 100;
    keepalive_timeout 60s;
}
```

### Custom Error Pages
```nginx
error_page 404 /404.html;
error_page 500 502 503 504 /50x.html;

location = /50x.html {
    root /usr/share/nginx/html;
}
```

### Advanced Rate Limiting
```nginx
# Different limits for different endpoints
location /api/upload {
    limit_req zone=api burst=5 nodelay;
    client_max_body_size 500M;
}

location /api/search {
    limit_req zone=api burst=20 nodelay;
    limit_req_status 429;
}
```

## 🛠️ Troubleshooting

### Common Issues

#### Backend Connection Refused
```bash
# ตรวจสอบ backend service
docker ps | grep lowcode-portal-service
docker logs lowcode-portal-service

# ตรวจสอบ network
docker network ls
docker network inspect lowcode-network
```

#### 502 Bad Gateway
```bash
# ตรวจสอบ upstream configuration
docker exec lowcode-nginx nginx -T | grep upstream

# ตรวจสอบ backend health
curl http://lowcode-portal-service:8080/health
```

#### SSL Certificate Issues
```bash
# ตรวจสอบ certificate
openssl x509 -in ssl/lowcode-platform.crt -text -noout

# Test SSL configuration
docker exec lowcode-nginx nginx -T | grep ssl
```

### Performance Tuning

#### Worker Processes
```nginx
# ใน nginx.conf (main context)
worker_processes auto;
worker_connections 1024;
worker_rlimit_nofile 65535;
```

#### Buffer Sizes
```nginx
client_body_buffer_size 128k;
client_header_buffer_size 1m;
large_client_header_buffers 4 4k;
output_buffers 1 32k;
postpone_output 1460;
```

## 📋 Maintenance

### Log Rotation
```bash
# Setup logrotate
cat > /etc/logrotate.d/nginx << EOF
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 nginx nginx
    postrotate
        docker exec lowcode-nginx nginx -s reload
    endscript
}
EOF
```

### Backup Configuration
```bash
# Backup NGINX config
cp nginx.conf nginx.conf.backup.$(date +%Y%m%d)

# Test configuration before applying
docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf nginx:alpine nginx -t
```

### Updates
```bash
# Update NGINX image
docker-compose pull nginx
docker-compose up -d nginx

# Zero-downtime config reload
docker exec lowcode-nginx nginx -s reload
```

## 📊 Metrics Integration

### NGINX Metrics for Prometheus
```nginx
# Enable nginx-prometheus-exporter (optional)
location /nginx_status {
    stub_status on;
    access_log off;
    allow 172.16.0.0/12;
    deny all;
}
```

### Custom Log Format
```nginx
log_format json_analytics escape=json '{'
    '"time": "$time_iso8601",'
    '"remote_addr": "$remote_addr",'
    '"request": "$request",'
    '"status": "$status",'
    '"bytes": "$body_bytes_sent",'
    '"request_time": "$request_time",'
    '"referrer": "$http_referer",'
    '"user_agent": "$http_user_agent"'
'}';

access_log /var/log/nginx/access.json json_analytics;
```

---

## 🎯 Recommendation Summary

### ✅ Use NGINX When:
- **Production deployment**
- **SSL/HTTPS required**  
- **Performance optimization needed**
- **Security features required**
- **Multiple services to proxy**
- **Static file optimization**

### ❌ Skip NGINX When:
- **Pure development environment**
- **Single developer setup**
- **Prototype/POC phase**
- **Resource-constrained environment**

For your **Lowcode Platform**, NGINX is **highly recommended** because:
- 🎯 **Production ready** architecture
- 🚀 **Performance boost** for static assets
- 🔒 **Security** features built-in
- 📊 **Monitoring** integration ready
- 🔄 **Scalability** for future growth

---

*NGINX Reverse Proxy - Production-Ready Gateway for TON Lowcode Platform* 🚀