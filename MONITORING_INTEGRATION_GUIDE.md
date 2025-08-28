# 📊 TON Lowcode Platform - Monitoring Integration Guide

## ภาพรวม

คู่มือนี้อธิบายวิธีการ integration backend service (lowcode-portal-service) กับ monitoring stack ที่ประกอบด้วย Grafana, Prometheus, และ Loki

## 🏗️ สถาปัตยกรรม Monitoring

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│                     │    │                     │    │                     │
│  Lowcode Portal     │───▶│    Prometheus       │───▶│     Grafana         │
│  Service            │    │   (Metrics Store)   │    │   (Visualization)   │
│                     │    │                     │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
           │                                                      ▲
           │                ┌─────────────────────┐               │
           └───────────────▶│       Loki          │──────────────────┘
                            │   (Log Store)       │
                            │                     │
                            └─────────────────────┘
                                      ▲
                            ┌─────────────────────┐
                            │     Promtail        │
                            │  (Log Shipper)      │
                            │                     │
                            └─────────────────────┘
```

## 🚀 การติดตั้งและใช้งาน

### Quick Start

```bash
# 1. เริ่มต้น monitoring stack
./scripts/start-monitoring.sh

# 2. หยุด monitoring stack
./scripts/stop-monitoring.sh
```

### Manual Setup

```bash
# 1. Build และ start services
docker-compose -f docker-compose.monitoring.yml up -d

# 2. ตรวจสอบสถานะ services
docker-compose -f docker-compose.monitoring.yml ps

# 3. ดู logs
docker-compose -f docker-compose.monitoring.yml logs -f [service-name]
```

## 📈 Metrics ที่ถูก Track

### System Metrics
- **CPU Usage**: การใช้งาน CPU ของระบบ
- **Memory Usage**: การใช้งาน Memory
- **Disk Usage**: พื้นที่ disk ที่ใช้
- **Network I/O**: การรับส่งข้อมูลผ่าน network

### Application Metrics
- **HTTP Requests**: จำนวน HTTP requests ทั้งหมด
- **Response Time**: เวลาตอบสนอง (50th, 95th percentile)
- **Error Rate**: อัตราการเกิด error
- **Service Availability**: สถานะการทำงานของ service

### Business Metrics
- **Active Users**: จำนวนผู้ใช้ที่ active
- **Flows Created**: จำนวน flows ที่สร้าง
- **Pages Created**: จำนวนหน้าที่สร้าง
- **Components Created**: จำนวน components ที่สร้าง
- **Database Operations**: การทำงานกับ database
- **Authentication Events**: เหตุการณ์เกี่ยวกับการ authentication

### Custom Metrics Examples

```typescript
// ใน controller หรือ service
constructor(private readonly metricsService: MetricsService) {}

// Track business events
async createFlow(createFlowDto: CreateFlowDto, userId: string) {
  // ... business logic
  
  this.metricsService.incrementFlowsCreated(userId);
  return flow;
}

// Track database operations
async findAll() {
  const start = Date.now();
  try {
    const result = await this.repository.find();
    const duration = Date.now() - start;
    
    this.metricsService.incrementDatabaseQueries('SELECT', 'success');
    return result;
  } catch (error) {
    this.metricsService.incrementDatabaseQueries('SELECT', 'error');
    throw error;
  }
}
```

## 📝 Logging Integration

### Log Levels
- **ERROR**: ข้อผิดพลาดที่สำคัญ
- **WARN**: คำเตือน
- **INFO**: ข้อมูลทั่วไป
- **DEBUG**: ข้อมูลสำหรับ debug

### Structured Logging

```typescript
// ใน service หรือ controller
constructor(private readonly logger: CustomLoggerService) {}

// Log user actions
this.logger.logUserAction(userId, 'create_flow', { flowId, name });

// Log API calls
this.logger.logAPICall('/api/flows', 'POST', 201, 250, userId);

// Log errors
this.logger.error('Database connection failed', error.stack, 'FlowsService');
```

### Log Queries in Loki

```logql
# ดู logs ทั้งหมดของ backend service
{job="lowcode-portal-service"}

# ดู error logs เท่านั้น
{job="lowcode-portal-service"} |= "ERROR"

# ดู user actions
{job="lowcode-portal-service", type="user_action"}

# Count error rate
rate({job="lowcode-portal-service"} |= "ERROR" [5m])
```

## 📊 Grafana Dashboards

### 1. Platform Overview Dashboard
- **URL**: http://localhost:3001/d/lowcode-platform-overview
- **Features**:
  - System resource usage
  - Service health status
  - Basic metrics overview

### 2. Detailed Metrics Dashboard
- **URL**: http://localhost:3001/d/lowcode-platform-detailed
- **Features**:
  - HTTP metrics (request rate, response time)
  - Business metrics (flows, pages, components)
  - Database and authentication metrics
  - Error tracking

### Custom Dashboard Creation

```json
{
  "targets": [
    {
      "expr": "rate(lowcode_portal_http_requests_total[5m])",
      "legendFormat": "{{method}} {{route}} ({{status_code}})"
    }
  ]
}
```

## 🚨 Alert Rules

### Prometheus Alert Rules

```yaml
# prometheus/rules/lowcode-platform.yml
groups:
  - name: lowcode-platform
    rules:
      - alert: HighErrorRate
        expr: rate(lowcode_portal_http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          
      - alert: ServiceDown
        expr: up{job="lowcode-portal-service"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Lowcode Portal Service is down"
```

## 🔧 Configuration

### Environment Variables

```bash
# Backend Service (.env)
NODE_ENV=production
LOG_LEVEL=info
LOKI_HOST=http://loki:3100
PROMETHEUS_ENABLED=true
```

### Prometheus Configuration

```yaml
# prometheus/prometheus.yml
scrape_configs:
  - job_name: 'lowcode-portal-service'
    static_configs:
      - targets: ['host.docker.internal:8080']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

### Loki Configuration

```yaml
# loki/loki-config.yml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h
```

## 🐳 Docker Integration

### Services ที่รวมอยู่ใน Stack

1. **lowcode-portal-service**: Backend service พร้อม metrics
2. **postgres**: Database
3. **redis**: Cache
4. **prometheus**: Metrics collection
5. **grafana**: Visualization
6. **loki**: Log aggregation
7. **promtail**: Log shipping
8. **node-exporter**: System metrics
9. **cadvisor**: Container metrics

### Port Mapping

| Service | Port | Description |
|---------|------|-------------|
| Backend Service | 8080 | API และ Swagger |
| Grafana | 3001 | Dashboard |
| Prometheus | 9292 | Metrics query |
| Loki | 3100 | Log query |
| Node Exporter | 9100 | System metrics |
| cAdvisor | 8081 | Container metrics |
| Promtail | 9080 | Log shipping |

## 📊 Performance Tuning

### Prometheus
```yaml
# Retention policy
--storage.tsdb.retention.time=30d

# Resource limits
--query.max-concurrency=20
--query.max-samples=50000000
```

### Grafana
```bash
# Environment variables
GF_USERS_ALLOW_SIGN_UP=false
GF_SECURITY_ALLOW_EMBEDDING=true
GF_INSTALL_PLUGINS=grafana-piechart-panel,grafana-worldmap-panel
```

### Loki
```yaml
# Retention
table_manager:
  retention_deletes_enabled: true
  retention_period: 168h  # 7 days
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Grafana Permission Denied
```bash
sudo chown -R 472:472 docker-images/monitoring/grafana/
docker-compose restart grafana
```

#### 2. Backend Service Can't Connect to Loki
```bash
# ตรวจสอบ network connectivity
docker-compose exec lowcode-portal-service ping loki

# ตรวจสอบ Loki logs
docker-compose logs loki
```

#### 3. Prometheus Can't Scrape Metrics
```bash
# ตรวจสอบ metrics endpoint
curl http://localhost:8080/metrics

# ตรวจสอบ Prometheus targets
curl http://localhost:9292/api/v1/targets
```

#### 4. No Logs in Loki
```bash
# ตรวจสอบ Promtail configuration
docker-compose exec promtail promtail -config.file=/etc/promtail/config.yml -dry-run

# ตรวจสอบ log files
docker-compose exec lowcode-portal-service ls -la logs/
```

### Health Checks

```bash
# ตรวจสอบสถานะ services
docker-compose ps

# ตรวจสอบ health endpoints
curl http://localhost:8080/api-docs  # Backend health
curl http://localhost:3001/api/health  # Grafana health
curl http://localhost:9292/-/healthy  # Prometheus health
curl http://localhost:3100/ready  # Loki health
```

## 📚 Best Practices

### 1. Metrics Design
- ใช้ labels อย่างระมัดระวัง (หลีกเลี่ยง high cardinality)
- สร้าง business metrics ที่มีความหมาย
- ใช้ recording rules สำหรับ complex queries

### 2. Logging
- ใช้ structured logging (JSON format)
- เพิ่ม context ที่จำเป็น (userId, requestId, etc.)
- หลีกเลี่ยง log sensitive information

### 3. Alerting
- สร้าง alerts ที่มีความหมายและ actionable
- หลีกเลี่ยง alert fatigue
- กำหนด severity levels ที่เหมาะสม

### 4. Dashboard Design
- จัดกลุ่ม metrics ตาม business domain
- ใช้ templating และ variables
- เพิ่ม documentation ใน dashboard

## 🔗 Useful Links

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [NestJS Prometheus Integration](https://github.com/willsoto/nestjs-prometheus)

## 📞 Support

หากพบปัญหาในการใช้งาน monitoring system สามารถ:

1. ตรวจสอบ logs: `docker-compose logs [service-name]`
2. ดู dashboard status ใน Grafana
3. ตรวจสอบ Prometheus targets
4. ใช้ Loki queries เพื่อ debug logs

---

*TON Lowcode Platform - Complete Monitoring Solution* 🚀