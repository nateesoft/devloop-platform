import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

export interface UserSession {
  userId: number;
  sessionId: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  loginTime: Date;
  lastActivity: Date;
  isActive: boolean;
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType;
  private readonly SESSION_PREFIX = 'session:';
  private readonly USER_SESSIONS_PREFIX = 'user_sessions:';
  private readonly TOKEN_BLACKLIST_PREFIX = 'blacklist:';

  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || 'lowcode_redis_2024',
      database: parseInt(process.env.REDIS_DATABASE || '0'),
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
    });

    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  // Session Management
  async createSession(userId: number, sessionData: Partial<UserSession>): Promise<string> {
    const sessionId = this.generateSessionId();
    const session: UserSession = {
      userId,
      sessionId,
      deviceInfo: sessionData.deviceInfo || 'Unknown',
      ipAddress: sessionData.ipAddress || 'Unknown',
      userAgent: sessionData.userAgent || 'Unknown',
      loginTime: new Date(),
      lastActivity: new Date(),
      isActive: true,
      ...sessionData,
    };

    // Store session data
    await this.client.hSet(
      `${this.SESSION_PREFIX}${sessionId}`,
      this.sessionToRedisHash(session)
    );

    // Set session expiration (30 days)
    await this.client.expire(`${this.SESSION_PREFIX}${sessionId}`, 30 * 24 * 60 * 60);

    // Add session to user's active sessions list
    await this.client.sAdd(`${this.USER_SESSIONS_PREFIX}${userId}`, sessionId);

    return sessionId;
  }

  async getSession(sessionId: string): Promise<UserSession | null> {
    const sessionData = await this.client.hGetAll(`${this.SESSION_PREFIX}${sessionId}`);
    
    if (!sessionData || Object.keys(sessionData).length === 0) {
      return null;
    }

    return this.redisHashToSession(sessionData);
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    const exists = await this.client.exists(`${this.SESSION_PREFIX}${sessionId}`);
    if (exists) {
      await this.client.hSet(`${this.SESSION_PREFIX}${sessionId}`, {
        lastActivity: new Date().toISOString(),
      });
    }
  }

  async getUserActiveSessions(userId: number): Promise<UserSession[]> {
    const sessionIds = await this.client.sMembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
    const sessions: UserSession[] = [];

    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session && session.isActive) {
        sessions.push(session);
      } else {
        // Clean up inactive sessions
        await this.client.sRem(`${this.USER_SESSIONS_PREFIX}${userId}`, sessionId);
      }
    }

    return sessions;
  }

  async terminateSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      // Mark session as inactive
      await this.client.hSet(`${this.SESSION_PREFIX}${sessionId}`, {
        isActive: 'false',
      });

      // Remove from user's active sessions
      await this.client.sRem(`${this.USER_SESSIONS_PREFIX}${session.userId}`, sessionId);

      // Set short expiration for cleanup
      await this.client.expire(`${this.SESSION_PREFIX}${sessionId}`, 60 * 60); // 1 hour
    }
  }

  async terminateAllUserSessions(userId: number): Promise<void> {
    const sessionIds = await this.client.sMembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
    
    for (const sessionId of sessionIds) {
      await this.terminateSession(sessionId);
    }

    // Clear user sessions list
    await this.client.del(`${this.USER_SESSIONS_PREFIX}${userId}`);
  }

  async terminateOtherSessions(userId: number, currentSessionId: string): Promise<void> {
    const sessionIds = await this.client.sMembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
    
    for (const sessionId of sessionIds) {
      if (sessionId !== currentSessionId) {
        await this.terminateSession(sessionId);
      }
    }
  }

  // Token Blacklist Management
  async blacklistToken(tokenId: string, expiresIn: number): Promise<void> {
    await this.client.setEx(`${this.TOKEN_BLACKLIST_PREFIX}${tokenId}`, expiresIn, 'blacklisted');
  }

  async isTokenBlacklisted(tokenId: string): Promise<boolean> {
    const result = await this.client.get(`${this.TOKEN_BLACKLIST_PREFIX}${tokenId}`);
    return result === 'blacklisted';
  }

  // Utility Methods
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private sessionToRedisHash(session: UserSession): Record<string, string> {
    return {
      userId: session.userId.toString(),
      sessionId: session.sessionId,
      deviceInfo: session.deviceInfo || '',
      ipAddress: session.ipAddress || '',
      userAgent: session.userAgent || '',
      loginTime: session.loginTime.toISOString(),
      lastActivity: session.lastActivity.toISOString(),
      isActive: session.isActive.toString(),
    };
  }

  private redisHashToSession(hash: Record<string, string>): UserSession {
    return {
      userId: parseInt(hash.userId),
      sessionId: hash.sessionId,
      deviceInfo: hash.deviceInfo || 'Unknown',
      ipAddress: hash.ipAddress || 'Unknown',
      userAgent: hash.userAgent || 'Unknown',
      loginTime: new Date(hash.loginTime),
      lastActivity: new Date(hash.lastActivity),
      isActive: hash.isActive === 'true',
    };
  }

  // Health Check
  async ping(): Promise<string> {
    return await this.client.ping();
  }

  // Analytics Methods
  async getActiveSessionsCount(): Promise<number> {
    const keys = await this.client.keys(`${this.SESSION_PREFIX}*`);
    let activeCount = 0;

    for (const key of keys) {
      const isActive = await this.client.hGet(key, 'isActive');
      if (isActive === 'true') {
        activeCount++;
      }
    }

    return activeCount;
  }

  async getUserSessionsCount(userId: number): Promise<number> {
    return await this.client.sCard(`${this.USER_SESSIONS_PREFIX}${userId}`);
  }
}