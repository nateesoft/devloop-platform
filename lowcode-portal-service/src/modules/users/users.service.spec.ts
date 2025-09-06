import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from '../../entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

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

  const mockUsers: User[] = [mockUser];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      userRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(userRepository.find).toHaveBeenCalled();
    });

    it('should return empty array when no users found', async () => {
      userRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createUserData: Partial<User> = {
      email: 'new@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'user',
    };

    it('should create and return new user', async () => {
      const newUser = { ...mockUser, ...createUserData, id: 2 };
      userRepository.create.mockReturnValue(newUser);
      userRepository.save.mockResolvedValue(newUser);

      const result = await service.create(createUserData);

      expect(result).toEqual(newUser);
      expect(userRepository.create).toHaveBeenCalledWith(createUserData);
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
    });
  });

  describe('update', () => {
    const updateData: Partial<User> = {
      firstName: 'UpdatedName',
      lastName: 'UpdatedLastName',
    };

    it('should update and return user', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      userRepository.update.mockResolvedValue({} as any);
      userRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedUser);
      expect(userRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null when user not found after update', async () => {
      userRepository.update.mockResolvedValue({} as any);
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.update(999, updateData);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete user successfully', async () => {
      userRepository.delete.mockResolvedValue({} as any);

      await service.remove(1);

      expect(userRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});