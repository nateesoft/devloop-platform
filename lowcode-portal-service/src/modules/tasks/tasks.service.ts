import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { User } from '../../entities/user.entity';
import { MyProject } from '../../entities/my-project.entity';
import { CreateTaskDto, UpdateTaskDto, TaskResponseDto, TaskListResponseDto } from '../../dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(MyProject)
    private projectRepository: Repository<MyProject>,
  ) {}

  async create(createTaskDto: CreateTaskDto, createdBy: number): Promise<TaskResponseDto> {
    // Verify creator exists
    const creator = await this.userRepository.findOne({ where: { id: createdBy } });
    if (!creator) {
      throw new BadRequestException('Creator not found');
    }

    // Verify project exists if provided
    if (createTaskDto.projectId) {
      const project = await this.projectRepository.findOne({ 
        where: { id: createTaskDto.projectId },
        relations: ['createdBy']
      });
      if (!project) {
        throw new BadRequestException('Project not found');
      }
      // Check if user has access to the project
      if (project.createdBy.id !== createdBy) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }

    // Verify assigned user exists if provided
    if (createTaskDto.assignedTo) {
      const assignedUser = await this.userRepository.findOne({ where: { id: createTaskDto.assignedTo } });
      if (!assignedUser) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    // Convert date strings to Date objects
    const taskData = {
      ...createTaskDto,
      createdBy,
      startDate: createTaskDto.startDate ? new Date(createTaskDto.startDate) : undefined,
      endDate: createTaskDto.endDate ? new Date(createTaskDto.endDate) : undefined,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
    };

    const task = this.taskRepository.create(taskData);
    const savedTask = await this.taskRepository.save(task);

    const taskWithRelations = await this.findOneWithRelations(savedTask.id);
    if (!taskWithRelations) {
      throw new Error('Failed to retrieve created task');
    }
    return this.toResponseDto(taskWithRelations);
  }

  async findAll(
    userId: number, 
    projectId?: number, 
    status?: string,
    assignedTo?: number,
    priority?: string
  ): Promise<TaskListResponseDto[]> {
    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.creator', 'creator')
      .leftJoinAndSelect('task.assignedUser', 'assignedUser')
      .leftJoinAndSelect('task.project', 'project')
      .where('task.createdBy = :userId', { userId });

    if (projectId) {
      queryBuilder.andWhere('task.projectId = :projectId', { projectId });
    }

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (assignedTo) {
      queryBuilder.andWhere('task.assignedTo = :assignedTo', { assignedTo });
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    const tasks = await queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .getMany();

    return tasks.map(task => this.toListResponseDto(task));
  }

  async findOne(id: number, userId: number): Promise<TaskResponseDto> {
    const task = await this.findOneWithRelations(id);
    
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to this task
    if (task.createdBy !== userId && task.assignedTo !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return this.toResponseDto(task);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number): Promise<TaskResponseDto> {
    const task = await this.findOneWithRelations(id);
    
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has permission to update
    if (task.createdBy !== userId && task.assignedTo !== userId) {
      throw new ForbiddenException('You do not have permission to update this task');
    }

    // Verify project exists if being updated
    if (updateTaskDto.projectId && updateTaskDto.projectId !== task.projectId) {
      const project = await this.projectRepository.findOne({ 
        where: { id: updateTaskDto.projectId },
        relations: ['createdBy']
      });
      if (!project) {
        throw new BadRequestException('Project not found');
      }
      if (project.createdBy.id !== userId) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }

    // Verify assigned user exists if being updated
    if (updateTaskDto.assignedTo && updateTaskDto.assignedTo !== task.assignedTo) {
      const assignedUser = await this.userRepository.findOne({ where: { id: updateTaskDto.assignedTo } });
      if (!assignedUser) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    // Convert date strings to Date objects
    const updateData = {
      ...updateTaskDto,
      startDate: updateTaskDto.startDate ? new Date(updateTaskDto.startDate) : undefined,
      endDate: updateTaskDto.endDate ? new Date(updateTaskDto.endDate) : undefined,
      dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
    };

    await this.taskRepository.update(id, updateData);
    const updatedTask = await this.findOneWithRelations(id);
    
    return this.toResponseDto(updatedTask!);
  }

  async remove(id: number, userId: number): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });
    
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Only creator can delete task
    if (task.createdBy !== userId) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    await this.taskRepository.remove(task);
  }

  async getTasksByProject(projectId: number, userId: number): Promise<TaskListResponseDto[]> {
    // Verify user has access to project
    const project = await this.projectRepository.findOne({ 
      where: { id: projectId },
      relations: ['createdBy']
    });
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.createdBy.id !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.findAll(userId, projectId);
  }

  async getTaskStatistics(userId: number, projectId?: number): Promise<any> {
    const queryBuilder = this.taskRepository.createQueryBuilder('task')
      .where('task.createdBy = :userId', { userId });

    if (projectId) {
      queryBuilder.andWhere('task.projectId = :projectId', { projectId });
    }

    const totalTasks = await queryBuilder.getCount();
    
    const statusCounts = await queryBuilder
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('task.status')
      .getRawMany();

    const priorityCounts = await queryBuilder
      .select('task.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .groupBy('task.priority')
      .getRawMany();

    const overdueTasks = await queryBuilder
      .andWhere('task.dueDate < :now', { now: new Date() })
      .andWhere('task.status != :completed', { completed: 'completed' })
      .getCount();

    const dueSoonTasks = await queryBuilder
      .andWhere('task.dueDate <= :threeDaysFromNow', { 
        threeDaysFromNow: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) 
      })
      .andWhere('task.dueDate >= :now', { now: new Date() })
      .andWhere('task.status != :completed', { completed: 'completed' })
      .getCount();

    return {
      totalTasks,
      statusDistribution: statusCounts,
      priorityDistribution: priorityCounts,
      overdueTasks,
      dueSoonTasks,
    };
  }

  private async findOneWithRelations(id: number): Promise<Task | null> {
    return this.taskRepository.findOne({
      where: { id },
      relations: ['creator', 'assignedUser', 'project'],
    });
  }

  private toResponseDto(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      progress: task.progress,
      estimatedHours: Number(task.estimatedHours),
      actualHours: Number(task.actualHours),
      startDate: task.startDate?.toISOString().split('T')[0],
      endDate: task.endDate?.toISOString().split('T')[0],
      dueDate: task.dueDate?.toISOString().split('T')[0],
      assignee: task.assignee,
      tags: task.tags,
      metadata: task.metadata,
      projectId: task.projectId,
      createdBy: task.createdBy,
      assignedTo: task.assignedTo,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      isOverdue: task.isOverdue,
      isDueSoon: task.isDueSoon,
      creator: task.creator ? {
        id: task.creator.id,
        email: task.creator.email,
        firstName: task.creator.firstName,
        lastName: task.creator.lastName,
      } : undefined,
      assignedUser: task.assignedUser ? {
        id: task.assignedUser.id,
        email: task.assignedUser.email,
        firstName: task.assignedUser.firstName,
        lastName: task.assignedUser.lastName,
      } : undefined,
      project: task.project ? {
        id: task.project.id,
        name: task.project.name,
        description: task.project.description,
      } : undefined,
    };
  }

  private toListResponseDto(task: Task): TaskListResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      progress: task.progress,
      dueDate: task.dueDate?.toISOString().split('T')[0],
      assignee: task.assignee,
      tags: task.tags,
      projectId: task.projectId,
      createdBy: task.createdBy,
      assignedTo: task.assignedTo,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      isOverdue: task.isOverdue,
      isDueSoon: task.isDueSoon,
    };
  }
}