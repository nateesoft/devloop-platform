import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService } from './media.service';
import { CreateMediaFolderDto } from './dto/create-media-folder.dto';
import { UpdateMediaFileDto } from './dto/update-media-file.dto';

@ApiTags('Media Management')
@Controller('media')
// @UseGuards(JwtAuthGuard) // Temporarily disabled for testing
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
    },
    fileFilter: (req, file, callback) => {
      // Accept all file types for now
      callback(null, true);
    },
  }))
  async uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('folderId') folderId: string,
    @Req() req: any,
  ) {
    const userId = '1'; // Using existing user ID
    const uploadedFiles: any[] = [];

    for (const file of files) {
      const uploadedFile = await this.mediaService.uploadFile(file, userId, folderId);
      uploadedFiles.push(uploadedFile);
    }

    return {
      success: true,
      data: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
    };
  }

  @ApiOperation({ summary: 'Get files by folder' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  @Get('files')
  async getFiles(
    @Query('folderId') folderId: string,
    @Req() req: any,
  ) {
    const userId = '1'; // Using existing user ID
    const files = await this.mediaService.findAllFiles(userId, folderId);

    return {
      success: true,
      data: files,
    };
  }

  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, description: 'File found' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @Get('files/:id')
  async getFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    const userId = '1'; // Using existing user ID
    const file = await this.mediaService.findFileById(id, userId);

    return {
      success: true,
      data: file,
    };
  }

  @Put('files/:id')
  async updateFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: UpdateMediaFileDto,
    @Req() req: any,
  ) {
    const userId = '1'; // Using existing user ID
    const file = await this.mediaService.updateFile(id, userId, updateData);

    return {
      success: true,
      data: file,
      message: 'File updated successfully',
    };
  }

  @Delete('files/:id')
  async deleteFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    const userId = '1'; // Using existing user ID
    await this.mediaService.deleteFile(id, userId);

    return {
      success: true,
      message: 'File deleted successfully',
    };
  }

  @Delete('files')
  async deleteFiles(
    @Body('fileIds') fileIds: string[],
    @Req() req: any,
  ) {
    const userId = '1'; // Using existing user ID
    
    for (const fileId of fileIds) {
      await this.mediaService.deleteFile(fileId, userId);
    }

    return {
      success: true,
      message: `${fileIds.length} file(s) deleted successfully`,
    };
  }

  @ApiOperation({ summary: 'Create new folder' })
  @ApiResponse({ status: 201, description: 'Folder created successfully' })
  @Post('folders')
  async createFolder(
    @Body() createFolderDto: CreateMediaFolderDto,
    @Req() req: any,
  ) {
    const userId = '1'; // Using existing user ID
    const folder = await this.mediaService.createFolder(createFolderDto, userId);

    return {
      success: true,
      data: folder,
      message: 'Folder created successfully',
    };
  }

  @ApiOperation({ summary: 'Get folders by parent' })
  @ApiResponse({ status: 200, description: 'Folders retrieved successfully' })
  @Get('folders')
  async getFolders(
    @Query('parentId') parentId: string,
    @Req() req: any,
  ) {
    const userId = '1'; // Using existing user ID
    const folders = await this.mediaService.findAllFolders(userId, parentId);

    return {
      success: true,
      data: folders,
    };
  }

  @Get('folders/:id')
  async getFolder(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    const userId = '1'; // Using existing user ID
    const folder = await this.mediaService.findFolderById(id, userId);

    return {
      success: true,
      data: folder,
    };
  }

  @Delete('folders/:id')
  async deleteFolder(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    const userId = '1'; // Using existing user ID
    await this.mediaService.deleteFolder(id, userId);

    return {
      success: true,
      message: 'Folder deleted successfully',
    };
  }

  @Put('files/:id/move')
  async moveFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('folderId') folderId: string,
    @Req() req: any,
  ) {
    const userId = '1'; // Using existing user ID
    const file = await this.mediaService.updateFile(id, userId, { folderId });

    return {
      success: true,
      data: file,
      message: 'File moved successfully',
    };
  }

  @Put('files/move')
  async moveFiles(
    @Body('fileIds') fileIds: string[],
    @Body('folderId') folderId: string,
    @Req() req: any,
  ) {
    const userId = '1'; // Using existing user ID
    const movedFiles: any[] = [];

    for (const fileId of fileIds) {
      const file = await this.mediaService.updateFile(fileId, userId, { folderId });
      movedFiles.push(file);
    }

    return {
      success: true,
      data: movedFiles,
      message: `${movedFiles.length} file(s) moved successfully`,
    };
  }

  @Put('files/:id/tags')
  async updateFileTags(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('tags') tags: string[],
    @Req() req: any,
  ) {
    const userId = '1'; // Using existing user ID
    const file = await this.mediaService.updateFile(id, userId, { tags });

    return {
      success: true,
      data: file,
      message: 'File tags updated successfully',
    };
  }

  @Put('files/:id/rename')
  async renameFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('name') name: string,
    @Req() req: any,
  ) {
    const userId = '1'; // Using existing user ID
    const file = await this.mediaService.updateFile(id, userId, { name });

    return {
      success: true,
      data: file,
      message: 'File renamed successfully',
    };
  }
}