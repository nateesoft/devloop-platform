import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, transports, format, Logger } from 'winston';
import LokiTransport from 'winston-loki';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private readonly logger: Logger;

  constructor() {
    const lokiOptions = {
      host: process.env.LOKI_HOST || 'http://localhost:3100',
      labels: { 
        app: 'lowcode-portal-service',
        environment: process.env.NODE_ENV || 'development'
      },
      json: true,
      format: format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error('Loki connection error:', err)
    };

    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
        format.printf(({ timestamp, level, message, stack, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            stack,
            service: 'lowcode-portal-service',
            ...meta
          });
        })
      ),
      transports: [
        // Console transport
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        }),
        // File transport
        new transports.File({
          filename: 'logs/error.log',
          level: 'error'
        }),
        new transports.File({
          filename: 'logs/combined.log'
        }),
        // Loki transport
        new LokiTransport(lokiOptions)
      ],
    });
  }

  log(message: string, context?: string, meta?: any) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, stack?: string, context?: string, meta?: any) {
    this.logger.error(message, { stack, context, ...meta });
  }

  warn(message: string, context?: string, meta?: any) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: any) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: any) {
    this.logger.verbose(message, { context, ...meta });
  }

  // Custom business event logging methods
  logUserAction(userId: string, action: string, details?: any) {
    this.logger.info('User action', {
      userId,
      action,
      details,
      type: 'user_action'
    });
  }

  logFlowExecution(flowId: string, userId: string, status: 'started' | 'completed' | 'failed', details?: any) {
    this.logger.info('Flow execution', {
      flowId,
      userId,
      status,
      details,
      type: 'flow_execution'
    });
  }

  logDatabaseOperation(operation: string, table: string, status: 'success' | 'error', duration?: number, error?: string) {
    this.logger.info('Database operation', {
      operation,
      table,
      status,
      duration,
      error,
      type: 'database_operation'
    });
  }

  logAuthEvent(userId: string, event: 'login' | 'logout' | 'register' | 'failed_login', details?: any) {
    this.logger.info('Auth event', {
      userId,
      event,
      details,
      type: 'auth_event'
    });
  }

  logAPICall(endpoint: string, method: string, statusCode: number, duration: number, userId?: string) {
    this.logger.info('API call', {
      endpoint,
      method,
      statusCode,
      duration,
      userId,
      type: 'api_call'
    });
  }

  logVaultOperation(operation: string, key: string, status: 'success' | 'error', error?: string) {
    this.logger.info('Vault operation', {
      operation,
      key,
      status,
      error,
      type: 'vault_operation'
    });
  }

  logMediaUpload(fileName: string, fileSize: number, userId: string, status: 'success' | 'error', error?: string) {
    this.logger.info('Media upload', {
      fileName,
      fileSize,
      userId,
      status,
      error,
      type: 'media_upload'
    });
  }
}