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
    
    res.send = function(body) {
      const duration = Date.now() - start;
      const route = req.route?.path || req.path;
      
      // Record HTTP metrics
      if (this.metricsService) {
        this.metricsService.recordHttpRequest(
          req.method,
          route,
          res.statusCode,
          duration
        );
      }
      
      return originalSend.call(this, body);
    }.bind({ metricsService: this.metricsService });
    
    next();
  }
}