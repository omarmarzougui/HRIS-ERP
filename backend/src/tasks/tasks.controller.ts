import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RBACGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles/roles.decorator';
import { RequirePermissions } from '../common/decorators/permissions/permissions.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RBACGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @RequirePermissions('task:create')
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req): Promise<Task> {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Get()
  @RequirePermissions('task:list')
  async findAll(@Request() req): Promise<Task[]> {
    return this.tasksService.findAll(req.user.userId, req.user.role);
  }

  @Get('my')
  @RequirePermissions('task:read')
  async getMyTasks(@Request() req): Promise<Task[]> {
    return this.tasksService.getMyTasks(req.user.userId);
  }

  @Get('status/:status')
  @RequirePermissions('task:read')
  async getTasksByStatus(
    @Param('status') status: TaskStatus,
    @Request() req,
  ): Promise<Task[]> {
    return this.tasksService.getTasksByStatus(status, req.user.userId, req.user.role);
  }

  @Get('priority/:priority')
  @RequirePermissions('task:read')
  async getTasksByPriority(
    @Param('priority') priority: string,
    @Request() req,
  ): Promise<Task[]> {
    return this.tasksService.getTasksByPriority(priority, req.user.userId, req.user.role);
  }

  @Get('overdue')
  @RequirePermissions('task:read')
  async getOverdueTasks(@Request() req): Promise<Task[]> {
    return this.tasksService.getOverdueTasks(req.user.userId, req.user.role);
  }

  @Get('statistics')
  @RequirePermissions('task:read')
  async getTaskStatistics(@Request() req): Promise<any> {
    return this.tasksService.getTaskStatistics(req.user.userId, req.user.role);
  }

  @Get(':id')
  @RequirePermissions('task:read')
  async findOne(@Param('id') id: string, @Request() req): Promise<Task | null> {
    return this.tasksService.findOne(id, req.user.userId, req.user.role);
  }

  @Put(':id')
  @RequirePermissions('task:update')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ): Promise<any> {
    return this.tasksService.update(id, updateTaskDto, req.user.userId, req.user.role);
  }

  @Put(':id/assign')
  @RequirePermissions('task:assign')
  async assignTask(
    @Param('id') id: string,
    @Body() body: { assignedTo: string },
    @Request() req,
  ): Promise<any> {
    return this.tasksService.assignTask(id, body.assignedTo, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @RequirePermissions('task:delete')
  async remove(@Param('id') id: string, @Request() req): Promise<any> {
    return this.tasksService.remove(id, req.user.userId, req.user.role);
  }
} 