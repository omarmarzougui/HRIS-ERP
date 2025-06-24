import { TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  assignedTo?: string;
  projectId?: string;
  departmentId?: string;
  estimatedHours?: number;
  comments?: string;
  tags?: string[];
} 