import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrometheusService } from '@willsoto/nestjs-prometheus';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ 
    summary: 'Get Prometheus metrics',
    description: 'Returns Prometheus metrics in text format for scraping'
  })
  async getMetrics(): Promise<string> {
    return this.prometheusService.register.metrics();
  }
}