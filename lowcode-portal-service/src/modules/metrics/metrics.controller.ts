import { Controller, Get, Header, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { register } from 'prom-client';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  
  @Get()
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ 
    summary: 'Get Prometheus metrics',
    description: 'Returns Prometheus metrics in text format for scraping'
  })
  async getMetrics(): Promise<string> {
    return await register.metrics();
  }
}