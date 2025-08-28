# 📊 TON Lowcode Platform - Monitoring Stack

## ภาพรวม

Monitoring Stack นี้ประกอบด้วย Grafana, Loki, และ Prometheus สำหรับการติดตามและวิเคราะห์ระบบ TON Lowcode Platform แบบ Real-time

## 🛠️ Components

### 📈 Prometheus (Port: 9090)
- **Metrics Collection**: เก็บ metrics จากทุก services
- **Time Series Database**: จัดเก็บข้อมูลแบบ time-series
- **Alert Manager**: ส่งการแจ้งเตือนเมื่อมีปัญหา
- **Service Discovery**: ค้นหา services อัตโนมัติ

### 📊 Grafana (Port: 3001)
- **Visualization**: แสดงผลข้อมูลเป็นกราฟและ dashboard
- **Multi-Datasource**: รองรับ Prometheus และ Loki
- **Alerting**: สร้าง alerts และ notifications
- **User Management**: จัดการผู้ใช้และ permissions

### 📝 Loki (Port: 3100)
- **Log Aggregation**: รวบรวม logs จากทุก services
- **Label-based**: ใช้ labels สำหรับ query logs
- **Cost Effective**: ประหยัด storage เมื่อเทียบกับ Elasticsearch
- **Grafana Integration**: ทำงานร่วมกับ Grafana ได้ดี

### 📋 Promtail (Port: 9080)
- **Log Shipper**: ส่ง logs ไปยัง Loki
- **Label Extraction**: แยก labels จาก log messages
- **Pipeline Processing**: ประมวลผล logs ก่อนส่ง
- **Multi-target**: รองรับหลาย log sources

### 🖥️ Node Exporter (Port: 9100)
- **System Metrics**: CPU, Memory, Disk, Network
- **Hardware Monitoring**: Temperature, Fan speed
- **OS Statistics**: Load average, uptime
- **File System**: Disk usage, mount points

### 🐳 cAdvisor (Port: 8080)
- **Container Metrics**: CPU, Memory usage per container
- **Docker Integration**: ติดตาม Docker containers
- **Resource Usage**: Network, Disk I/O per container
- **Performance Analysis**: Container performance metrics

## 🚀 การติดตั้ง

### Prerequisites
- Docker & Docker Compose
- 8GB RAM ขั้นต่ำ
- 20GB disk space สำหรับ metrics storage

### Quick Start
```bash
# เข้าไปที่ directory
cd docker-images/monitoring

# รัน setup script
./setup-monitoring.sh

# หรือ manual start
docker compose up -d
```

### Manual Setup
```bash
# 1. สร้าง directories
mkdir -p prometheus/rules grafana/{provisioning/{datasources,dashboards},dashboards} loki promtail

# 2. Set Grafana permissions
sudo chown -R 472:472 grafana/

# 3. Start services
docker compose up -d

# 4. Check status
docker compose ps
```

## 🔧 Configuration Files

### Prometheus Configuration
- **prometheus.yml**: Main configuration
- **rules/*.yml**: Alert rules
- **Scrape targets**: All platform services

### Grafana Configuration
- **datasources.yml**: Auto-configured datasources
- **dashboard.yml**: Dashboard provisioning
- **dashboards/*.json**: Pre-built dashboards

### Loki Configuration
- **loki-config.yml**: Loki server configuration
- **Storage**: File system backend
- **Retention**: 7 days default

### Promtail Configuration
- **promtail-config.yml**: Log shipping configuration
- **Docker logs**: Container log collection
- **System logs**: OS log collection

## 📊 Pre-configured Dashboards

### 🎯 Lowcode Platform Overview
- **System Metrics**: CPU, Memory, Disk usage
- **Service Status**: All services health status
- **Application Metrics**: Response times, error rates
- **Container Metrics**: Docker container performance

### 📈 Available Metrics

#### System Metrics
- `node_cpu_seconds_total`: CPU usage by core
- `node_memory_*`: Memory statistics
- `node_filesystem_*`: Disk usage
- `node_network_*`: Network statistics

#### Application Metrics
- `http_requests_total`: HTTP request count
- `http_request_duration_seconds`: Response time
- `up`: Service availability
- `container_*`: Container metrics

#### Platform-specific Metrics
- `lowcode_portal_active_users`: Active users count
- `lowcode_portal_flows_created`: Flows created count
- `lowcode_portal_pages_built`: Pages built count
- `keycloak_*`: Authentication metrics
- `vault_*`: Secret management metrics

## 🚨 Alert Rules

### System Alerts
- **High CPU Usage**: >80% for 5 minutes
- **High Memory Usage**: >80% for 5 minutes
- **Disk Space Low**: >80% usage
- **Service Down**: Service unavailable

### Application Alerts
- **High Response Time**: >1 second (95th percentile)
- **High Error Rate**: >5% error rate
- **Database Connection**: Database unavailable
- **Container Restart**: Container restarted

## 📱 Access URLs

| Service | URL | Credentials |
|---------|-----|------------|
| Grafana | http://localhost:3001 | admin / admin123 |
| Prometheus | http://localhost:9292 | - |
| Loki | http://localhost:3100 | - |
| cAdvisor | http://localhost:8080 | - |

## 🔍 Usage Examples

### Prometheus Queries
```promql
# CPU usage
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# HTTP request rate
rate(http_requests_total[5m])

# Service availability
up{job="lowcode-portal-service"}
```

### Loki Queries
```logql
# All logs from lowcode-portal
{job="lowcode-portal"}

# Error logs
{job="lowcode-portal-service"} |= "ERROR"

# Logs from specific container
{container_name="lowcode-portal"}

# Rate of error logs
rate({job="lowcode-portal"} |= "ERROR" [5m])
```

## 🔧 Customization

### Adding New Dashboards
1. Create JSON dashboard in `grafana/dashboards/`
2. Restart Grafana container
3. Dashboard will be auto-imported

### Adding Alert Rules
1. Create YAML file in `prometheus/rules/`
2. Restart Prometheus container
3. Rules will be loaded automatically

### Adding New Scrape Targets
1. Edit `prometheus/prometheus.yml`
2. Add new job configuration
3. Restart Prometheus container

## 🛡️ Security

### Default Credentials
- **Grafana**: admin / admin123 (change after first login)
- **Prometheus**: No authentication (internal only)
- **Loki**: No authentication (internal only)

### Production Security
- Enable Grafana OAuth/LDAP
- Configure Prometheus basic auth
- Use HTTPS with valid certificates
- Restrict network access

## 🔄 Maintenance

### Log Rotation
```bash
# Loki logs cleanup (auto after 7 days)
docker exec loki rm -rf /loki/chunks/fake/*

# Prometheus data cleanup
docker exec prometheus rm -rf /prometheus/*
```

### Backup Configuration
```bash
# Backup Grafana dashboards
docker exec grafana cp -r /var/lib/grafana/dashboards /backup/

# Backup Prometheus configuration
cp prometheus/ /backup/prometheus/
```

### Health Checks
```bash
# Check all services
docker compose ps

# Check Prometheus targets
curl http://localhost:9292/api/v1/targets

# Check Grafana API
curl http://admin:admin123@localhost:3001/api/health
```

## 🚀 Scaling

### High Availability
- Run multiple Prometheus instances
- Use Grafana clustering
- Implement Loki clustering
- Load balance with HAProxy/Nginx

### Performance Tuning
- Increase retention periods
- Optimize scrape intervals
- Use recording rules
- Configure proper resource limits

## 📋 Troubleshooting

### Common Issues

#### Grafana Permission Denied
```bash
sudo chown -R 472:472 grafana/
docker compose restart grafana
```

#### Prometheus Config Error
```bash
# Validate configuration
docker exec prometheus promtool check config /etc/prometheus/prometheus.yml
```

#### Loki Not Receiving Logs
```bash
# Check Promtail status
docker exec promtail promtail -config.file=/etc/promtail/config.yml -dry-run
```

### Log Locations
- **Grafana**: `docker logs grafana`
- **Prometheus**: `docker logs prometheus`
- **Loki**: `docker logs loki`
- **Promtail**: `docker logs promtail`

## 📊 Monitoring Best Practices

1. **Set Appropriate Retention**: Balance storage vs. history needs
2. **Use Labels Wisely**: Don't create high cardinality labels
3. **Create Meaningful Alerts**: Avoid alert fatigue
4. **Monitor the Monitors**: Watch resource usage of monitoring stack
5. **Regular Backups**: Backup dashboards and configurations
6. **Documentation**: Document custom metrics and alerts

---

*TON Lowcode Platform - Complete Monitoring Solution* 🚀