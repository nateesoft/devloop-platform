import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RedisService } from '../../services/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  private async generateTokens(user: User, sessionId?: string): Promise<{ access_token: string; refresh_token: string; sessionId: string }> {
    const tokenId = crypto.randomUUID();
    const payload = { 
      sub: user.id, 
      email: user.email, 
      firstName: user.firstName, 
      lastName: user.lastName,
      role: user.role,
      sessionId: sessionId,
      tokenId: tokenId
    };
    
    const access_token = this.jwtService.sign(payload, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
    });
    const refresh_token = this.jwtService.sign(payload, { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' 
    });
    
    return { access_token, refresh_token, sessionId: sessionId || '' };
  }

  async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; tokens: { access_token: string; refresh_token: string }; message: string }> {
    const { email, password, firstName, lastName, role } = registerDto;

    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'user',
    });

    const savedUser = await this.usersRepository.save(user);

    const { password: _, ...userWithoutPassword } = savedUser;
    // Create initial session for new user
    const sessionId = await this.redisService.createSession(savedUser.id, {
      deviceInfo: 'Registration Device',
      ipAddress: 'Unknown IP',
      userAgent: 'Unknown User Agent',
    });

    const tokens = await this.generateTokens(savedUser, sessionId);
    
    return {
      user: { ...userWithoutPassword, currentSessionId: sessionId },
      tokens,
      message: 'User registered successfully'
    };
  }

  async login(loginDto: LoginDto, deviceInfo?: { ip?: string; userAgent?: string; deviceInfo?: string }): Promise<{ user: Partial<User>; tokens: { access_token: string; refresh_token: string; sessionId: string }; message: string; sessionInfo?: any }> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException({
        message: 'Login failed',
        error: 'Invalid email or password',
        statusCode: 401
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        message: 'Login failed',
        error: 'Invalid email or password',
        statusCode: 401
      });
    }

    // Check for existing active sessions
    const activeSessions = await this.redisService.getUserActiveSessions(user.id);
    
    // Terminate other sessions (single session per user)
    if (activeSessions.length > 0) {
      await this.redisService.terminateAllUserSessions(user.id);
    }

    // Create new session
    const sessionId = await this.redisService.createSession(user.id, {
      deviceInfo: deviceInfo?.deviceInfo || 'Unknown Device',
      ipAddress: deviceInfo?.ip || 'Unknown IP',
      userAgent: deviceInfo?.userAgent || 'Unknown User Agent',
    });

    // Update user record
    await this.usersRepository.update(user.id, {
      currentSessionId: sessionId,
      lastLoginAt: new Date(),
      lastLoginIp: deviceInfo?.ip || undefined,
    });

    const { password: _, ...userWithoutPassword } = user;
    const tokens = await this.generateTokens(user, sessionId);
    
    return {
      user: { ...userWithoutPassword, currentSessionId: sessionId },
      tokens,
      message: 'Login successful',
      sessionInfo: {
        sessionId,
        loginTime: new Date(),
        deviceInfo: deviceInfo?.deviceInfo || 'Unknown Device'
      }
    };
  }

  async validateUser(payload: any): Promise<User | null> {
    // Check if token is blacklisted
    if (payload.tokenId) {
      const isBlacklisted = await this.redisService.isTokenBlacklisted(payload.tokenId);
      if (isBlacklisted) {
        throw new UnauthorizedException({
          message: 'Authentication failed',
          error: 'Your session has been terminated. Please log in again.',
          statusCode: 401
        });
      }
    }

    const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
    if (!user) {
      return null;
    }

    // Validate session
    if (payload.sessionId) {
      const session = await this.redisService.getSession(payload.sessionId);
      if (!session || !session.isActive || session.userId !== user.id) {
        throw new UnauthorizedException({
          message: 'Authentication failed',
          error: 'Your session has expired or is invalid. Please log in again.',
          statusCode: 401
        });
      }

      // Update session activity
      await this.redisService.updateSessionActivity(payload.sessionId);
    }

    return user;
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      // Check if token is blacklisted
      if (payload.tokenId) {
        const isBlacklisted = await this.redisService.isTokenBlacklisted(payload.tokenId);
        if (isBlacklisted) {
          throw new UnauthorizedException({
            message: 'Token refresh failed',
            error: 'Your session has been terminated. Please log in again.',
            statusCode: 401
          });
        }
      }

      const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException({
          message: 'Authentication failed',
          error: 'User account not found. Please log in again.',
          statusCode: 401
        });
      }

      // Validate session
      if (payload.sessionId) {
        const session = await this.redisService.getSession(payload.sessionId);
        if (!session || !session.isActive || session.userId !== user.id) {
          throw new UnauthorizedException({
          message: 'Authentication failed',
          error: 'Your session has expired or is invalid. Please log in again.',
          statusCode: 401
        });
        }
      }

      const tokenId = crypto.randomUUID();
      const newPayload = { 
        sub: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        role: user.role,
        sessionId: payload.sessionId,
        tokenId: tokenId
      };
      
      const access_token = this.jwtService.sign(newPayload, { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
      });
      
      return { access_token };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException({
        message: 'Token refresh failed',
        error: 'Your session has expired or is invalid. Please log in again.',
        statusCode: 401
      });
    }
  }

  async syncKeycloakUser(keycloakData: any, deviceInfo?: { ip?: string; userAgent?: string; deviceInfo?: string }): Promise<{ user: Partial<User>; tokens: { access_token: string; refresh_token: string; sessionId: string }; message: string }> {
    const { preferred_username, email, given_name, family_name } = keycloakData;

    let user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) {
      // Create new user from Keycloak data
      user = this.usersRepository.create({
        email: email,
        firstName: given_name || preferred_username,
        lastName: family_name || '',
        role: 'user',
        password: '', // No password needed for Keycloak users
      });
      
      user = await this.usersRepository.save(user);
    }

    // Check for existing active sessions
    const activeSessions = await this.redisService.getUserActiveSessions(user.id);
    
    // Terminate other sessions (single session per user)
    if (activeSessions.length > 0) {
      await this.redisService.terminateAllUserSessions(user.id);
    }

    // Create new session
    const sessionId = await this.redisService.createSession(user.id, {
      deviceInfo: deviceInfo?.deviceInfo || 'Keycloak SSO',
      ipAddress: deviceInfo?.ip || 'Unknown IP',
      userAgent: deviceInfo?.userAgent || 'Unknown User Agent',
    });

    // Update user record
    await this.usersRepository.update(user.id, {
      currentSessionId: sessionId,
      lastLoginAt: new Date(),
      lastLoginIp: deviceInfo?.ip || undefined,
    });

    const { password: _, ...userWithoutPassword } = user;
    const tokens = await this.generateTokens(user, sessionId);
    
    return {
      user: { ...userWithoutPassword, currentSessionId: sessionId },
      tokens,
      message: 'Keycloak sync successful'
    };
  }

  async logout(userId: number, sessionId: string, tokenId?: string): Promise<{ message: string }> {
    // Terminate session
    await this.redisService.terminateSession(sessionId);

    // Blacklist token if provided
    if (tokenId) {
      const tokenExpiresIn = 24 * 60 * 60; // 24 hours in seconds
      await this.redisService.blacklistToken(tokenId, tokenExpiresIn);
    }

    // Clear current session from user record
    await this.usersRepository.update(userId, {
      currentSessionId: undefined,
    });

    return { message: 'Logout successful' };
  }

  async logoutAllSessions(userId: number): Promise<{ message: string }> {
    // Terminate all user sessions
    await this.redisService.terminateAllUserSessions(userId);

    // Clear current session from user record
    await this.usersRepository.update(userId, {
      currentSessionId: undefined,
    });

    return { message: 'All sessions terminated successfully' };
  }

  async getUserActiveSessions(userId: number): Promise<any[]> {
    return await this.redisService.getUserActiveSessions(userId);
  }

  async terminateSessionById(userId: number, targetSessionId: string): Promise<{ message: string }> {
    const sessions = await this.redisService.getUserActiveSessions(userId);
    const sessionExists = sessions.some(session => session.sessionId === targetSessionId);

    if (!sessionExists) {
      throw new UnauthorizedException({
        message: 'Session termination failed',
        error: 'The specified session was not found or you are not authorized to terminate it.',
        statusCode: 401
      });
    }

    await this.redisService.terminateSession(targetSessionId);

    // If this was the current session, clear it from user record
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (user && user.currentSessionId === targetSessionId) {
      await this.usersRepository.update(userId, {
        currentSessionId: undefined,
      });
    }

    return { message: 'Session terminated successfully' };
  }
}