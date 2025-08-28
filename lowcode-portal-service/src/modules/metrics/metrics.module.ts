import { Module } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider, makeHistogramProvider, makeGaugeProvider } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'lowcode_portal_',
        },
      },
    }),
  ],
  controllers: [MetricsController],
  providers: [
    MetricsService,
    // HTTP metrics
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    }),
    // Business metrics
    makeGaugeProvider({
      name: 'active_users',
      help: 'Number of currently active users',
      labelNames: ['user_type'],
    }),
    makeCounterProvider({
      name: 'flows_created_total',
      help: 'Total number of flows created',
      labelNames: ['user_id'],
    }),
    makeCounterProvider({
      name: 'pages_created_total',
      help: 'Total number of pages created',
      labelNames: ['user_id'],
    }),
    makeCounterProvider({
      name: 'components_created_total',
      help: 'Total number of components created',
      labelNames: ['user_id'],
    }),
    makeCounterProvider({
      name: 'database_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'status'],
    }),
    makeCounterProvider({
      name: 'auth_attempts_total',
      help: 'Total number of authentication attempts',
      labelNames: ['method', 'status'],
    }),
    makeCounterProvider({
      name: 'media_uploads_total',
      help: 'Total number of media uploads',
      labelNames: ['type', 'status'],
    }),
    makeCounterProvider({
      name: 'vault_operations_total',
      help: 'Total number of vault operations',
      labelNames: ['operation', 'status'],
    }),
  ],
  exports: [MetricsService],
})
export class MetricsModule {}