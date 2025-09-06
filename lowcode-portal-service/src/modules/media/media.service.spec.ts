import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaFile, MediaFileType } from '../../entities/media-file.entity';
import { MediaFolder } from '../../entities/media-folder.entity';
import { User } from '../../entities/user.entity';
import { MinioService } from '../../services/minio.service';
import { CreateMediaFolderDto } from './dto/create-media-folder.dto';
import { UpdateMediaFileDto } from './dto/update-media-file.dto';

describe('MediaService', () => {
  let service: MediaService;
  let mediaFileRepository: jest.Mocked<Repository<MediaFile>>;
  let mediaFolderRepository: jest.Mocked<Repository<MediaFolder>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let minioService: jest.Mocked<MinioService>;

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

  const mockMediaFile: MediaFile = {
    id: 'file-123',
    name: 'test.jpg',
    originalName: 'test.jpg',
    type: 'image' as MediaFileType,
    mimeType: 'image/jpeg',
    size: 1024,
    minioPath: 'files/test.jpg',
    bucketName: 'test-bucket',
    thumbnailPath: 'thumbnails/test.jpg',
    metadata: { width: 800, height: 600 },
    tags: [],
    folderId: undefined,
    uploader: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
    url: 'http://localhost:9000/files/test.jpg',
    thumbnailUrl: 'http://localhost:9000/thumbnails/test.jpg',
  };

  const mockMediaFolder: MediaFolder = {
    id: 'folder-123',
    name: 'Test Folder',
    parentId: undefined,
    createdBy: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    files: [],
    children: [],
    parent: undefined,
    creator: mockUser,
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test'),
    destination: '',
    filename: 'test.jpg',
    path: '',
    stream: {} as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: getRepositoryToken(MediaFile),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MediaFolder),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: MinioService,
          useValue: {
            uploadFile: jest.fn(),
            uploadThumbnail: jest.fn(),
            deleteFile: jest.fn(),
            getPublicFileUrl: jest.fn(),
            getBucketName: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    mediaFileRepository = module.get(getRepositoryToken(MediaFile));
    mediaFolderRepository = module.get(getRepositoryToken(MediaFolder));
    userRepository = module.get(getRepositoryToken(User));
    minioService = module.get(MinioService);
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      minioService.uploadFile.mockResolvedValue('files/test.jpg');
      minioService.uploadThumbnail.mockResolvedValue('thumbnails/test.jpg');
      minioService.getBucketName.mockReturnValue('test-bucket');
      minioService.getPublicFileUrl.mockReturnValue('http://localhost:9000/files/test.jpg');
      mediaFileRepository.create.mockReturnValue(mockMediaFile);
      mediaFileRepository.save.mockResolvedValue(mockMediaFile);

      const result = await service.uploadFile(mockFile, '1');

      expect(result).toEqual(mockMediaFile);
      expect(minioService.uploadFile).toHaveBeenCalledWith('test.jpg', mockFile.buffer, 'image/jpeg');
    });

    it('should throw BadRequestException for no file', async () => {
      await expect(service.uploadFile({} as any, '1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.uploadFile(mockFile, '1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findFileById', () => {
    it('should find file by id successfully', async () => {
      mediaFileRepository.findOne.mockResolvedValue(mockMediaFile);
      minioService.getPublicFileUrl.mockReturnValue('http://localhost:9000/files/test.jpg');

      const result = await service.findFileById('file-123', '1');

      expect(result).toEqual(mockMediaFile);
    });

    it('should throw NotFoundException when file not found', async () => {
      mediaFileRepository.findOne.mockResolvedValue(null);

      await expect(service.findFileById('file-123', '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateFile', () => {
    const updateData: UpdateMediaFileDto = {
      name: 'updated-test.jpg',
      tags: ['tag1', 'tag2'],
    };

    it('should update file successfully', async () => {
      jest.spyOn(service, 'findFileById').mockResolvedValue(mockMediaFile);
      mediaFileRepository.save.mockResolvedValue({ ...mockMediaFile, ...updateData });

      const result = await service.updateFile('file-123', '1', updateData);

      expect(result.name).toBe('updated-test.jpg');
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      jest.spyOn(service, 'findFileById').mockResolvedValue(mockMediaFile);
      minioService.deleteFile.mockResolvedValue();
      mediaFileRepository.delete.mockResolvedValue({} as any);

      await service.deleteFile('file-123', '1');

      expect(minioService.deleteFile).toHaveBeenCalledWith('files/test.jpg');
      expect(mediaFileRepository.delete).toHaveBeenCalledWith('file-123');
    });
  });

  describe('createFolder', () => {
    const createFolderDto: CreateMediaFolderDto = {
      name: 'New Folder',
      parentId: undefined,
    };

    it('should create folder successfully', async () => {
      mediaFolderRepository.create.mockReturnValue(mockMediaFolder);
      mediaFolderRepository.save.mockResolvedValue(mockMediaFolder);

      const result = await service.createFolder(createFolderDto, '1');

      expect(result).toEqual(mockMediaFolder);
    });
  });

  describe('findFolderById', () => {
    it('should find folder by id successfully', async () => {
      mediaFolderRepository.findOne.mockResolvedValue(mockMediaFolder);

      const result = await service.findFolderById('folder-123', '1');

      expect(result).toEqual(mockMediaFolder);
    });

    it('should throw NotFoundException when folder not found', async () => {
      mediaFolderRepository.findOne.mockResolvedValue(null);

      await expect(service.findFolderById('folder-123', '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteFolder', () => {
    it('should delete empty folder successfully', async () => {
      const emptyFolder = { ...mockMediaFolder, files: [], children: [] };
      jest.spyOn(service, 'findFolderById').mockResolvedValue(emptyFolder);
      mediaFolderRepository.delete.mockResolvedValue({} as any);

      await service.deleteFolder('folder-123', '1');

      expect(mediaFolderRepository.delete).toHaveBeenCalledWith('folder-123');
    });
  });

  describe('findAllFiles', () => {
    it('should find all files for user', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockMediaFile]),
      };

      mediaFileRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      minioService.getPublicFileUrl.mockReturnValue('http://localhost:9000/files/test.jpg');

      const result = await service.findAllFiles('1');

      expect(result).toEqual([mockMediaFile]);
    });
  });
});