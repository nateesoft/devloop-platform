import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsDateString, IsInt, Min, Max, IsJSON } from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['todo', 'in_progress', 'review', 'completed'])
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: TaskPriority;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  estimatedHours?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  actualHours?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsInt()
  assignedTo?: number;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['todo', 'in_progress', 'review', 'completed'])
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: TaskPriority;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  estimatedHours?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  actualHours?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsInt()
  assignedTo?: number;
}

export class TaskResponseDto {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  assignee?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  projectId?: number;
  createdBy: number;
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  
  // Relations
  creator?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  
  assignedUser?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  
  project?: {
    id: number;
    name: string;
    description?: string;
  };
}

export class TaskListResponseDto {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  dueDate?: string;
  assignee?: string;
  tags?: string[];
  projectId?: number;
  createdBy: number;
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  isDueSoon: boolean;
}