import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    public httpRequestsTotal: Counter<string>,
    
    @InjectMetric('http_request_duration_seconds')
    public httpRequestDuration: Histogram<string>,
    
    @InjectMetric('active_users')
    public activeUsers: Gauge<string>,
    
    @InjectMetric('flows_created_total')
    public flowsCreatedTotal: Counter<string>,
    
    @InjectMetric('pages_created_total')
    public pagesCreatedTotal: Counter<string>,
    
    @InjectMetric('components_created_total')
    public componentsCreatedTotal: Counter<string>,
    
    @InjectMetric('database_queries_total')
    public databaseQueriesTotal: Counter<string>,
    
    @InjectMetric('auth_attempts_total')
    public authAttemptsTotal: Counter<string>,
    
    @InjectMetric('media_uploads_total')
    public mediaUploadsTotal: Counter<string>,
    
    @InjectMetric('vault_operations_total')
    public vaultOperationsTotal: Counter<string>,
  ) {}

  // Business metrics tracking methods
  incrementFlowsCreated(userId?: string) {
    this.flowsCreatedTotal.inc({ user_id: userId || 'unknown' });
  }

  incrementPagesCreated(userId?: string) {
    this.pagesCreatedTotal.inc({ user_id: userId || 'unknown' });
  }

  incrementComponentsCreated(userId?: string) {
    this.componentsCreatedTotal.inc({ user_id: userId || 'unknown' });
  }

  incrementDatabaseQueries(operation: string, status: 'success' | 'error') {
    this.databaseQueriesTotal.inc({ operation, status });
  }

  incrementAuthAttempts(method: string, status: 'success' | 'failure') {
    this.authAttemptsTotal.inc({ method, status });
  }

  incrementMediaUploads(type: string, status: 'success' | 'error') {
    this.mediaUploadsTotal.inc({ type, status });
  }

  incrementVaultOperations(operation: string, status: 'success' | 'error') {
    this.vaultOperationsTotal.inc({ operation, status });
  }

  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  // HTTP metrics tracking
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ 
      method, 
      route, 
      status_code: statusCode.toString() 
    });
    
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode.toString() },
      duration / 1000 // Convert to seconds
    );
  }
}