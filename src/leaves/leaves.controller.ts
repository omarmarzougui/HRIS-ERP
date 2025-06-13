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
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { Leave } from './entities/leave.entity';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RBACGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles/roles.decorator';
import { RequirePermissions } from '../common/decorators/permissions/permissions.decorator';
import { UserRole } from '../users/entities/user.entity';
import { LEAVE_PERMISSIONS } from '../common/constants/permissions';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RBACGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  @RequirePermissions(LEAVE_PERMISSIONS.CREATE_LEAVE_REQUEST)
  async create(@Body() createLeaveDto: CreateLeaveDto, @Request() req): Promise<Leave> {
    return this.leavesService.create(createLeaveDto, req.user.userId);
  }

  @Get()
  @RequirePermissions(LEAVE_PERMISSIONS.LIST_LEAVE_REQUESTS)
  async findAll(@Request() req): Promise<Leave[]> {
    return this.leavesService.findAll(req.user.userId, req.user.role);
  }

  @Get('pending')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @RequirePermissions(LEAVE_PERMISSIONS.APPROVE_LEAVE_REQUEST)
  async getPendingLeaves(): Promise<Leave[]> {
    return this.leavesService.getPendingLeaves();
  }

  @Get(':id')
  @RequirePermissions(LEAVE_PERMISSIONS.READ_LEAVE_REQUEST)
  async findOne(@Param('id') id: string, @Request() req): Promise<Leave | null> {
    return this.leavesService.findOne(id, req.user.userId, req.user.role);
  }

  @Put(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @RequirePermissions(LEAVE_PERMISSIONS.APPROVE_LEAVE_REQUEST)
  async approveLeave(
    @Param('id') id: string,
    @Body() approveLeaveDto: ApproveLeaveDto,
    @Request() req,
  ): Promise<Leave> {
    return this.leavesService.approveLeave(id, approveLeaveDto, req.user.userId);
  }

  @Put(':id')
  @RequirePermissions(LEAVE_PERMISSIONS.UPDATE_LEAVE_REQUEST)
  async update(
    @Param('id') id: string,
    @Body() updateLeaveDto: Partial<Leave>,
    @Request() req,
  ): Promise<any> {
    return this.leavesService.update(id, updateLeaveDto, req.user.userId);
  }

  @Delete(':id')
  @RequirePermissions(LEAVE_PERMISSIONS.DELETE_LEAVE_REQUEST)
  async cancel(@Param('id') id: string, @Request() req): Promise<any> {
    return this.leavesService.cancel(id, req.user.userId);
  }

  @Get('balance/:employeeId')
  @RequirePermissions(LEAVE_PERMISSIONS.VIEW_LEAVE_BALANCE)
  async getLeaveBalance(@Param('employeeId') employeeId: string): Promise<any> {
    return this.leavesService.getLeaveBalance(employeeId);
  }

  @Get('balance/my')
  @RequirePermissions(LEAVE_PERMISSIONS.VIEW_LEAVE_BALANCE)
  async getMyLeaveBalance(@Request() req): Promise<any> {
    return this.leavesService.getLeaveBalance(req.user.userId);
  }
} 