import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly usersService: UsersService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdBy: userId,
    });

    return this.taskRepository.save(task);
  }

  async findAll(userId: string, userRole: string): Promise<Task[]> {
    if (userRole === 'admin' || userRole === 'hr') {
      return this.taskRepository.find({
        relations: ['assignee', 'creator'],
        order: { createdAt: 'DESC' },
      });
    }

    if (userRole === 'manager') {
      // Managers can see tasks assigned to their team members
      return this.taskRepository.find({
        relations: ['assignee', 'creator'],
        where: { assignedTo: userId }, // This should be expanded to include team members
        order: { createdAt: 'DESC' },
      });
    }

    // Employees can see tasks assigned to them and tasks they created
    return this.taskRepository.find({
      relations: ['assignee', 'creator'],
      where: [
        { assignedTo: userId },
        { createdBy: userId },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string, userRole: string): Promise<Task | null> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignee', 'creator'],
    });

    if (!task) {
      return null;
    }

    // Check access permissions
    if (userRole !== 'admin' && userRole !== 'hr' && 
        task.assignedTo !== userId && task.createdBy !== userId) {
      throw new ForbiddenException('You can only view tasks assigned to you or created by you');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string, userRole: string): Promise<any> {
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    // Check if user can update the task
    if (userRole !== 'admin' && userRole !== 'hr' && 
        task.assignedTo !== userId && task.createdBy !== userId) {
      throw new ForbiddenException('You can only update tasks assigned to you or created by you');
    }

    // If status is being updated to DONE, set completed date
    if (updateTaskDto.status === TaskStatus.DONE && task.status !== TaskStatus.DONE) {
      updateTaskDto.completedDate = new Date();
    }

    return this.taskRepository.update(id, updateTaskDto);
  }

  async remove(id: string, userId: string, userRole: string): Promise<any> {
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    // Only creators, admins, and HR can delete tasks
    if (userRole !== 'admin' && userRole !== 'hr' && task.createdBy !== userId) {
      throw new ForbiddenException('You can only delete tasks you created');
    }

    return this.taskRepository.delete(id);
  }

  async assignTask(id: string, assignedTo: string, userId: string, userRole: string): Promise<any> {
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    // Check if user can assign the task
    if (userRole !== 'admin' && userRole !== 'hr' && task.createdBy !== userId) {
      throw new ForbiddenException('You can only assign tasks you created');
    }

    // Verify the assignee exists
    const assignee = await this.usersService.findOne(assignedTo);
    if (!assignee) {
      throw new BadRequestException('Assignee not found');
    }

    return this.taskRepository.update(id, { assignedTo });
  }

  async getMyTasks(userId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { assignedTo: userId },
      relations: ['assignee', 'creator'],
      order: { dueDate: 'ASC', priority: 'DESC' },
    });
  }

  async getTasksByStatus(status: TaskStatus, userId: string, userRole: string): Promise<Task[]> {
    const whereCondition: any = { status };

    if (userRole !== 'admin' && userRole !== 'hr') {
      whereCondition.assignedTo = userId;
    }

    return this.taskRepository.find({
      where: whereCondition,
      relations: ['assignee', 'creator'],
      order: { dueDate: 'ASC', priority: 'DESC' },
    });
  }

  async getTasksByPriority(priority: string, userId: string, userRole: string): Promise<Task[]> {
    const whereCondition: any = { priority };

    if (userRole !== 'admin' && userRole !== 'hr') {
      whereCondition.assignedTo = userId;
    }

    return this.taskRepository.find({
      where: whereCondition,
      relations: ['assignee', 'creator'],
      order: { dueDate: 'ASC' },
    });
  }

  async getOverdueTasks(userId: string, userRole: string): Promise<Task[]> {
    const today = new Date();
    const whereCondition: any = {
      dueDate: today,
      status: TaskStatus.TODO,
    };

    if (userRole !== 'admin' && userRole !== 'hr') {
      whereCondition.assignedTo = userId;
    }

    return this.taskRepository.find({
      where: whereCondition,
      relations: ['assignee', 'creator'],
      order: { dueDate: 'ASC' },
    });
  }

  async getTaskStatistics(userId: string, userRole: string): Promise<any> {
    const whereCondition: any = {};
    
    if (userRole !== 'admin' && userRole !== 'hr') {
      whereCondition.assignedTo = userId;
    }

    const [total, todo, inProgress, review, done, cancelled] = await Promise.all([
      this.taskRepository.count({ where: whereCondition }),
      this.taskRepository.count({ where: { ...whereCondition, status: TaskStatus.TODO } }),
      this.taskRepository.count({ where: { ...whereCondition, status: TaskStatus.IN_PROGRESS } }),
      this.taskRepository.count({ where: { ...whereCondition, status: TaskStatus.REVIEW } }),
      this.taskRepository.count({ where: { ...whereCondition, status: TaskStatus.DONE } }),
      this.taskRepository.count({ where: { ...whereCondition, status: TaskStatus.CANCELLED } }),
    ]);

    return {
      total,
      todo,
      inProgress,
      review,
      done,
      cancelled,
    };
  }
} 