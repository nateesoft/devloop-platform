import { UnauthorizedException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Login failed',
      error: 'Invalid email or password',
      statusCode: 401,
      code: 'INVALID_CREDENTIALS'
    });
  }
}

export class SessionExpiredException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Authentication failed',
      error: 'Your session has expired. Please log in again.',
      statusCode: 401,
      code: 'SESSION_EXPIRED'
    });
  }
}

export class SessionTerminatedException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Authentication failed',
      error: 'Your session has been terminated. Please log in again.',
      statusCode: 401,
      code: 'SESSION_TERMINATED'
    });
  }
}

export class TokenRefreshFailedException extends UnauthorizedException {
  constructor(reason?: string) {
    super({
      message: 'Token refresh failed',
      error: reason || 'Your session has expired or is invalid. Please log in again.',
      statusCode: 401,
      code: 'TOKEN_REFRESH_FAILED'
    });
  }
}

export class UserNotFoundException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Authentication failed',
      error: 'User account not found. Please log in again.',
      statusCode: 401,
      code: 'USER_NOT_FOUND'
    });
  }
}

export class SessionNotAuthorizedException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Session termination failed',
      error: 'The specified session was not found or you are not authorized to terminate it.',
      statusCode: 401,
      code: 'SESSION_NOT_AUTHORIZED'
    });
  }
}