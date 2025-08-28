import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../../modules/metrics/metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    // Track request start
    const originalSend = res.send;
    
    const metricsService = this.metricsService;
    res.send = function(body) {
      const duration = Date.now() - start;
      const route = req.route?.path || req.path;
      
      // Record HTTP metrics
      if (metricsService) {
        metricsService.recordHttpRequest(
          req.method,
          route,
          res.statusCode,
          duration
        );
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  }
}