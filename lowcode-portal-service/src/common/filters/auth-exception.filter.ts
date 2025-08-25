import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(UnauthorizedException)
export class AuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AuthExceptionFilter.name);

  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse() as any;
    
    // Log the authentication failure
    this.logger.warn(`Authentication failed: ${request.method} ${request.url}`, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      error: typeof exceptionResponse === 'string' ? exceptionResponse : exceptionResponse.error,
    });

    // Create user-friendly error response
    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof exceptionResponse === 'string' 
        ? 'Authentication failed' 
        : exceptionResponse.message || 'Authentication failed',
      error: typeof exceptionResponse === 'string' 
        ? 'Please check your credentials and try again.' 
        : exceptionResponse.error || 'Please check your credentials and try again.',
      code: typeof exceptionResponse === 'object' && exceptionResponse.code 
        ? exceptionResponse.code 
        : 'AUTH_FAILED'
    };

    response.status(status).json(errorResponse);
  }
}