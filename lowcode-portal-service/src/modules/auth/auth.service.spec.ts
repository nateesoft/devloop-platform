import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../../entities/user.entity';
import { RedisService } from '../../services/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;
  let redisService: jest.Mocked<RedisService>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    isActive: true,
    currentSessionId: 'session-123',
    lastLoginAt: new Date(),
    lastLoginIp: '127.0.0.1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            createSession: jest.fn(),
            getUserActiveSessions: jest.fn(),
            terminateAllUserSessions: jest.fn(),
            getSession: jest.fn(),
            updateSessionActivity: jest.fn(),
            isTokenBlacklisted: jest.fn(),
            blacklistToken: jest.fn(),
            terminateSession: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
    redisService = module.get(RedisService);
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
    };

    it('should register a new user successfully', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      redisService.createSession.mockResolvedValue('session-123');
      jwtService.sign.mockReturnValue('jwt-token');

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword' as never));

      const result = await service.register(registerDto);

      expect(result.user.email).toBe(mockUser.email);
      expect(result.tokens.access_token).toBe('jwt-token');
      expect(result.message).toBe('User registered successfully');
    });

    it('should throw ConflictException if user already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({} as any);
      redisService.getUserActiveSessions.mockResolvedValue([]);
      redisService.createSession.mockResolvedValue('session-123');
      jwtService.sign.mockReturnValue('jwt-token');

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true as never));

      const result = await service.login(loginDto);

      expect(result.user.email).toBe(mockUser.email);
      expect(result.tokens.access_token).toBe('jwt-token');
      expect(result.message).toBe('Login successful');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false as never));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    const payload = {
      sub: 1,
      email: 'test@example.com',
      sessionId: 'session-123',
      tokenId: 'token-123',
    };

    it('should validate user successfully', async () => {
      redisService.isTokenBlacklisted.mockResolvedValue(false);
      userRepository.findOne.mockResolvedValue(mockUser);
      redisService.getSession.mockResolvedValue({
        sessionId: 'session-123',
        userId: 1,
        isActive: true,
        loginTime: new Date(),
        lastActivity: new Date(),
        deviceInfo: 'test',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
      });
      redisService.updateSessionActivity.mockResolvedValue();

      const result = await service.validateUser(payload);

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException for blacklisted token', async () => {
      redisService.isTokenBlacklisted.mockResolvedValue(true);

      await expect(service.validateUser(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should return null for non-existent user', async () => {
      redisService.isTokenBlacklisted.mockResolvedValue(false);
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser(payload);

      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      redisService.terminateSession.mockResolvedValue();
      redisService.blacklistToken.mockResolvedValue();
      userRepository.update.mockResolvedValue({} as any);

      const result = await service.logout(1, 'session-123', 'token-123');

      expect(result.message).toBe('Logout successful');
      expect(redisService.terminateSession).toHaveBeenCalledWith('session-123');
      expect(redisService.blacklistToken).toHaveBeenCalledWith('token-123', 86400);
    });
  });
});