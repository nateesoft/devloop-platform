# 📊 Monitoring Integration Plan
## Grafana + Loki + Prometheus with Lowcode Portal Service

### 🎯 Executive Summary
แผนการ integrate monitoring stack (Grafana + Loki + Prometheus) เข้ากับ lowcode-portal-service เพื่อให้มีการ monitoring แบบครบวงจร รวมถึง metrics, logs, alerts และ dashboards

---

## 📋 Current Service Analysis

### 🏗️ Service Architecture
- **Framework**: NestJS 11.0.1 with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Port**: 8080 (configurable via PORT env)
- **Modules**: 11 core modules (Auth, Users, Flows, Pages, etc.)
- **External Services**: Keycloak, MinIO, Vault

### 📦 Current Dependencies
```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/core": "^11.0.1", 
  "@nestjs/typeorm": "^11.0.0",
  "@nestjs/config": "^4.0.2",
  "typeorm": "^0.3.25",
  "pg": "^8.16.3"
}
```

### 🔍 Current Modules Structure
1. **AuthModule** - JWT authentication, Keycloak sync
2. **UsersModule** - User management
3. **FlowsModule** - Business logic flows
4. **PagesModule** - Page builder functionality
5. **ComponentsModule** - UI components management
6. **MyProjectsModule** - Project management
7. **MediaModule** - File management (MinIO)
8. **SecretKeysModule** - Secret management (Vault)
9. **NotesModule** - Documentation system
10. **ServicesModule** - External service integration
11. **UserGroupsModule** - Group and permissions

---

## 🎯 Integration Goals

### 🎪 Primary Objectives
1. **Application Performance Monitoring** - Response times, throughput, errors
2. **System Health Monitoring** - CPU, memory, database connections
3. **Business Metrics** - User activity, feature usage, flow executions
4. **Log Aggregation** - Centralized logging with search capabilities
5. **Alerting** - Proactive notifications for issues
6. **Observability** - Complete visibility into system behavior

### 📈 Success Metrics
- **< 100ms** average response time visibility
- **99.9%** service availability monitoring
- **Real-time** error detection and alerting
- **Complete** request tracing across all modules
- **Business insights** from user behavior metrics

---

## 🚀 Phase 1: Prometheus Metrics Integration

### 📦 Required Dependencies
```bash
npm install --save @prometheus-metrics/http prom-client
npm install --save-dev @types/prom-client
```

### 🎯 Implementation Plan

#### 1.1 Core Metrics Module
```typescript
// src/modules/monitoring/monitoring.module.ts
@Module({
  providers: [MetricsService, HealthService],
  controllers: [MetricsController, HealthController],
  exports: [MetricsService],
})
export class MonitoringModule {}
```

#### 1.2 Custom Metrics to Track

##### 📊 System Metrics
- `http_requests_total` - HTTP request count by method/route/status
- `http_request_duration_seconds` - Request duration histogram
- `database_connections_active` - Active DB connections
- `database_query_duration_seconds` - DB query performance

##### 🏢 Business Metrics  
- `lowcode_active_users_total` - Currently active users
- `lowcode_flows_executed_total` - Flow executions by user/type
- `lowcode_pages_created_total` - Pages created by user
- `lowcode_components_used_total` - Component usage statistics
- `lowcode_api_calls_total` - External API calls by service
- `lowcode_file_uploads_total` - Media uploads by type/size
- `lowcode_auth_events_total` - Authentication events (login/logout/fail)

##### 🔒 Security Metrics
- `lowcode_failed_auth_total` - Failed authentication attempts
- `lowcode_secret_access_total` - Secret access events
- `lowcode_unauthorized_requests_total` - Unauthorized access attempts

#### 1.3 Metrics Collection Points

##### HTTP Layer Metrics
```typescript
// src/interceptors/metrics.interceptor.ts
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.metricsService.recordHttpRequest(
          request.method,
          request.route.path,
          response.statusCode,
          duration
        );
      })
    );
  }
}
```

##### Database Metrics
```typescript
// src/interceptors/database-metrics.interceptor.ts
// Track query performance and connection pool
```

##### Business Logic Metrics
```typescript
// In each service method
async executeFlow(flowId: string, userId: string): Promise<FlowResult> {
  this.metricsService.incrementCounter('lowcode_flows_executed_total', {
    user_id: userId,
    flow_type: flow.type
  });
  
  const timer = this.metricsService.startTimer('lowcode_flow_duration_seconds');
  try {
    const result = await this.processFlow(flow);
    timer.end({ status: 'success' });
    return result;
  } catch (error) {
    timer.end({ status: 'error' });
    throw error;
  }
}
```

---

## 📝 Phase 2: Loki Logging Integration

### 📦 Required Dependencies
```bash
npm install --save winston winston-loki
npm install --save-dev @types/winston
```

### 🎯 Implementation Plan

#### 2.1 Structured Logging Setup
```typescript
// src/modules/monitoring/logger.service.ts
@Injectable()
export class LoggerService {
  private readonly logger: winston.Logger;
  
  constructor() {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.metadata()
      ),
      transports: [
        new winston.transports.Console(),
        new LokiTransport({
          host: process.env.LOKI_HOST || 'http://localhost:3100',
          labels: {
            app: 'lowcode-portal-service',
            version: process.env.npm_package_version,
            environment: process.env.NODE_ENV
          }
        })
      ]
    });
  }
}
```

#### 2.2 Log Categories and Levels

##### 🔍 Application Logs
- **INFO**: Normal operations, user actions
- **WARN**: Performance issues, deprecated usage
- **ERROR**: Application errors, exceptions
- **DEBUG**: Detailed debugging information

##### 📊 Audit Logs
- User authentication events
- Data modification operations
- Permission changes
- System configuration changes

##### 🚨 Security Logs
- Failed authentication attempts
- Unauthorized access attempts
- Suspicious user behavior
- API rate limit violations

#### 2.3 Contextual Logging
```typescript
// Add correlation IDs and user context
@Injectable()
export class RequestContextService {
  private static correlationId = new AsyncLocalStorage<string>();
  
  static setCorrelationId(id: string) {
    this.correlationId.enterWith(id);
  }
  
  static getCorrelationId(): string | undefined {
    return this.correlationId.getStore();
  }
}

// Log format with context
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "message": "User flow executed successfully",
  "correlationId": "req-12345-67890",
  "userId": "user-456",
  "module": "flows",
  "action": "execute",
  "flowId": "flow-789",
  "duration": 245,
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "ip": "192.168.1.100"
  }
}
```

---

## 🏥 Phase 3: Health Checks & Monitoring Endpoints

### 🎯 Implementation Plan

#### 3.1 Health Check Endpoints
```typescript
// src/modules/monitoring/health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  async getHealth(): Promise<HealthStatus> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version
    };
  }
  
  @Get('detailed')
  async getDetailedHealth(): Promise<DetailedHealthStatus> {
    return {
      database: await this.checkDatabase(),
      keycloak: await this.checkKeycloak(),
      minio: await this.checkMinIO(),
      vault: await this.checkVault(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };
  }
}
```

#### 3.2 Readiness & Liveness Probes
```typescript
@Get('ready')
async readiness(): Promise<ReadinessStatus> {
  // Check if service can accept requests
  const checks = await Promise.all([
    this.checkDatabase(),
    this.checkExternalServices()
  ]);
  
  return {
    ready: checks.every(check => check.healthy),
    checks
  };
}

@Get('live')
async liveness(): Promise<LivenessStatus> {
  // Basic service availability
  return {
    alive: true,
    timestamp: new Date().toISOString()
  };
}
```

#### 3.3 Metrics Endpoint
```typescript
@Get('metrics')
async getMetrics(@Res() res: Response): Promise<void> {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}
```

---

## 🎨 Phase 4: Custom Dashboards

### 🎯 Dashboard Design

#### 4.1 Service Overview Dashboard
```json
{
  "title": "Lowcode Portal Service - Overview",
  "panels": [
    {
      "title": "Request Rate",
      "targets": ["rate(http_requests_total[5m])"]
    },
    {
      "title": "Response Time P95",
      "targets": ["histogram_quantile(0.95, http_request_duration_seconds_bucket)"]
    },
    {
      "title": "Error Rate",
      "targets": ["rate(http_requests_total{status=~'5..'}[5m])"]
    },
    {
      "title": "Active Users",
      "targets": ["lowcode_active_users_total"]
    }
  ]
}
```

#### 4.2 Business Metrics Dashboard
- Flow execution trends
- User engagement metrics
- Feature adoption rates
- Page creation statistics
- Component usage patterns

#### 4.3 System Performance Dashboard
- Database connection pool status
- Memory usage patterns
- CPU utilization
- External service response times

---

## 🚨 Phase 5: Alerting Strategy

### 🎯 Alert Rules

#### 5.1 Critical Alerts (Immediate Response)
```yaml
groups:
  - name: lowcode-portal-critical
    rules:
      - alert: ServiceDown
        expr: up{job="lowcode-portal-service"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Lowcode Portal Service is down"
          
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected (>5%)"
          
      - alert: DatabaseConnectionFailure
        expr: database_connections_active == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection lost"
```

#### 5.2 Warning Alerts (Monitor Closely)
```yaml
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time (P95 > 1s)"
          
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage (>80%)"
```

#### 5.3 Business Alerts
```yaml
      - alert: LowUserActivity
        expr: lowcode_active_users_total < 5
        for: 10m
        labels:
          severity: info
        annotations:
          summary: "Unusually low user activity"
          
      - alert: HighAuthFailures
        expr: rate(lowcode_failed_auth_total[5m]) > 10
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High authentication failure rate"
```

---

## 🛣️ Implementation Roadmap

### 📅 Timeline & Phases

#### Week 1-2: Foundation Setup
- [ ] Install monitoring dependencies
- [ ] Create MonitoringModule and basic structure
- [ ] Implement health check endpoints
- [ ] Setup basic HTTP metrics collection
- [ ] Configure Prometheus scraping

#### Week 3-4: Metrics Implementation
- [ ] Implement comprehensive HTTP metrics
- [ ] Add database performance metrics
- [ ] Create business metrics collectors
- [ ] Add security metrics tracking
- [ ] Test metrics accuracy and performance impact

#### Week 5-6: Logging Integration
- [ ] Setup structured logging with Winston
- [ ] Configure Loki transport
- [ ] Implement contextual logging across modules
- [ ] Add correlation ID tracking
- [ ] Create log parsing and labeling rules

#### Week 7-8: Dashboards & Visualization
- [ ] Create service overview dashboard
- [ ] Build business metrics dashboard
- [ ] Design system performance dashboard
- [ ] Setup log exploration views in Grafana
- [ ] Configure dashboard auto-refresh and alerts

#### Week 9-10: Alerting & Optimization
- [ ] Implement critical alert rules
- [ ] Setup warning and info alerts
- [ ] Configure notification channels (Slack, Email)
- [ ] Performance testing and optimization
- [ ] Documentation and team training

---

## 🔧 Technical Implementation Details

### 🏗️ Code Structure
```
src/
├── modules/
│   ├── monitoring/
│   │   ├── monitoring.module.ts
│   │   ├── metrics/
│   │   │   ├── metrics.service.ts
│   │   │   ├── metrics.controller.ts
│   │   │   └── collectors/
│   │   │       ├── http-metrics.collector.ts
│   │   │       ├── database-metrics.collector.ts
│   │   │       └── business-metrics.collector.ts
│   │   ├── health/
│   │   │   ├── health.service.ts
│   │   │   └── health.controller.ts
│   │   └── logging/
│   │       ├── logger.service.ts
│   │       └── correlation.service.ts
│   └── interceptors/
│       ├── metrics.interceptor.ts
│       └── logging.interceptor.ts
```

### 🎯 Environment Configuration
```env
# Monitoring Configuration
PROMETHEUS_ENABLED=true
LOKI_ENABLED=true
LOKI_HOST=http://localhost:3100

# Metrics Configuration
METRICS_PATH=/metrics
HEALTH_CHECK_PATH=/health

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
CORRELATION_HEADER=x-correlation-id
```

### 📊 Performance Considerations
- **Metrics Collection**: < 1ms overhead per request
- **Log Processing**: Async with buffering
- **Memory Usage**: < 100MB additional for monitoring
- **Storage**: 30 days retention for metrics, 7 days for logs

---

## 🎯 Success Criteria

### 📈 Technical KPIs
- [ ] All service endpoints monitored
- [ ] < 1% performance overhead from monitoring
- [ ] 99.9% metrics collection accuracy
- [ ] All critical paths have business metrics
- [ ] Log aggregation covers all modules

### 🎪 Operational KPIs
- [ ] Mean time to detection (MTTD) < 2 minutes
- [ ] Mean time to resolution (MTTR) < 15 minutes
- [ ] Zero monitoring-related outages
- [ ] 100% alert accuracy (no false positives)
- [ ] Complete service observability

### 👥 Team KPIs
- [ ] All developers trained on monitoring tools
- [ ] Incident response procedures documented
- [ ] Monitoring runbooks created
- [ ] Regular monitoring reviews scheduled
- [ ] Performance optimization targets met

---

## 🚀 Next Steps

1. **Review and Approval** - Get stakeholder sign-off on the plan
2. **Environment Setup** - Prepare development environment
3. **Dependency Installation** - Add required NPM packages
4. **Module Creation** - Start with MonitoringModule structure
5. **Incremental Implementation** - Follow phased approach
6. **Testing and Validation** - Continuous testing throughout
7. **Documentation** - Update as implementation progresses
8. **Team Training** - Knowledge transfer and adoption

---

*This plan provides a comprehensive roadmap for integrating Grafana + Loki + Prometheus with your lowcode-portal-service, ensuring complete observability and monitoring capabilities.* 🎯
