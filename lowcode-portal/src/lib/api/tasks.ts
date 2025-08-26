import apiClient from './client';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
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

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  assignee?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  projectId?: number;
  assignedTo?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  assignee?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  projectId?: number;
  assignedTo?: number;
}

export interface TaskFilters {
  projectId?: number;
  status?: string;
  assignedTo?: number;
  priority?: string;
}

export interface TaskStatistics {
  totalTasks: number;
  statusDistribution: Array<{ status: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
  overdueTasks: number;
  dueSoonTasks: number;
}

export const taskAPI = {
  // Get all tasks with optional filters
  getAll: async (filters?: TaskFilters) => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo.toString());
    if (filters?.priority) params.append('priority', filters.priority);
    
    const url = `/tasks${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get single task by ID
  getById: async (id: number): Promise<Task> => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  // Create new task
  create: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  },

  // Update existing task
  update: async (id: number, data: UpdateTaskRequest): Promise<Task> => {
    const response = await apiClient.patch(`/tasks/${id}`, data);
    return response.data;
  },

  // Delete task
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },

  // Get tasks by project
  getByProject: async (projectId: number): Promise<Task[]> => {
    const response = await apiClient.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  // Get task statistics
  getStatistics: async (projectId?: number): Promise<TaskStatistics> => {
    const url = projectId 
      ? `/tasks/statistics?projectId=${projectId}`
      : '/tasks/statistics';
    const response = await apiClient.get(url);
    return response.data;
  },
};