import { TaskPriority, TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: Date;
  assignedTo?: string;
  estimatedHours?: number;
  actualHours?: number;
  comments?: string;
  tags?: string[];
} 