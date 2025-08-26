import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskResponseDto, TaskListResponseDto } from '../../dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: any,
  ): Promise<TaskResponseDto> {
    const userId = req.user.id;
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('priority') priority?: string,
  ): Promise<TaskListResponseDto[]> {
    const userId = req.user.id;
    return this.tasksService.findAll(
      userId,
      projectId ? parseInt(projectId) : undefined,
      status,
      assignedTo ? parseInt(assignedTo) : undefined,
      priority,
    );
  }

  @Get('statistics')
  async getStatistics(
    @Request() req: any,
    @Query('projectId') projectId?: string,
  ): Promise<any> {
    const userId = req.user.id;
    return this.tasksService.getTaskStatistics(
      userId,
      projectId ? parseInt(projectId) : undefined,
    );
  }

  @Get('project/:projectId')
  async getTasksByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Request() req: any,
  ): Promise<TaskListResponseDto[]> {
    const userId = req.user.id;
    return this.tasksService.getTasksByProject(projectId, userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<TaskResponseDto> {
    const userId = req.user.id;
    return this.tasksService.findOne(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ): Promise<TaskResponseDto> {
    const userId = req.user.id;
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.id;
    return this.tasksService.remove(id, userId);
  }
}