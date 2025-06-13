import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leave, LeaveStatus } from './entities/leave.entity';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class LeavesService {
  constructor(
    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,
    private readonly usersService: UsersService,
  ) {}

  async create(createLeaveDto: CreateLeaveDto, userId: string): Promise<Leave> {
    // Validate dates
    if (new Date(createLeaveDto.startDate) >= new Date(createLeaveDto.endDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check if user is creating leave for themselves or has permission
    if (createLeaveDto.employeeId !== userId) {
      const user = await this.usersService.findOne(userId);
      if (user.role !== 'admin' && user.role !== 'hr' && user.role !== 'manager') {
        throw new ForbiddenException('You can only create leave requests for yourself');
      }
    }

    const leave = this.leaveRepository.create({
      ...createLeaveDto,
      status: LeaveStatus.PENDING,
    });

    return this.leaveRepository.save(leave);
  }

  async findAll(userId: string, userRole: string): Promise<Leave[]> {
    if (userRole === 'admin' || userRole === 'hr') {
      return this.leaveRepository.find({
        relations: ['employee', 'approver'],
        order: { createdAt: 'DESC' },
      });
    }

    if (userRole === 'manager') {
      // Managers can see leave requests from their team members
      return this.leaveRepository.find({
        relations: ['employee', 'approver'],
        where: { employee: { managerId: userId } },
        order: { createdAt: 'DESC' },
      });
    }

    // Employees can only see their own leave requests
    return this.leaveRepository.find({
      relations: ['employee', 'approver'],
      where: { employeeId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string, userRole: string): Promise<Leave | null> {
    const leave = await this.leaveRepository.findOne({
      where: { id },
      relations: ['employee', 'approver'],
    });

    if (!leave) {
      return null;
    }

    // Check access permissions
    if (userRole !== 'admin' && userRole !== 'hr' && 
        userRole !== 'manager' && leave.employeeId !== userId) {
      throw new ForbiddenException('You can only view your own leave requests');
    }

    return leave;
  }

  async approveLeave(id: string, approveLeaveDto: ApproveLeaveDto, approverId: string): Promise<Leave> {
    const leave = await this.leaveRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!leave) {
      throw new BadRequestException('Leave request not found');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Leave request is not pending approval');
    }

    const updateData: Partial<Leave> = {
      status: approveLeaveDto.status,
      approvedBy: approverId,
      approvedAt: new Date(),
      comments: approveLeaveDto.comments,
    };

    if (approveLeaveDto.status === LeaveStatus.REJECTED) {
      updateData.rejectionReason = approveLeaveDto.rejectionReason;
    }

    await this.leaveRepository.update(id, updateData);

    return this.leaveRepository.findOne({
      where: { id },
      relations: ['employee', 'approver'],
    });
  }

  async update(id: string, updateLeaveDto: Partial<Leave>, userId: string): Promise<any> {
    const leave = await this.leaveRepository.findOne({
      where: { id },
    });

    if (!leave) {
      throw new BadRequestException('Leave request not found');
    }

    // Only allow updates if leave is pending and user owns the request
    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Cannot update leave request that is not pending');
    }

    if (leave.employeeId !== userId) {
      throw new ForbiddenException('You can only update your own leave requests');
    }

    return this.leaveRepository.update(id, updateLeaveDto);
  }

  async cancel(id: string, userId: string): Promise<any> {
    const leave = await this.leaveRepository.findOne({
      where: { id },
    });

    if (!leave) {
      throw new BadRequestException('Leave request not found');
    }

    if (leave.employeeId !== userId) {
      throw new ForbiddenException('You can only cancel your own leave requests');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Cannot cancel leave request that is not pending');
    }

    return this.leaveRepository.update(id, { status: LeaveStatus.CANCELLED });
  }

  async getLeaveBalance(employeeId: string): Promise<any> {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const approvedLeaves = await this.leaveRepository.find({
      where: {
        employeeId,
        status: LeaveStatus.APPROVED,
        startDate: startOfYear,
        endDate: endOfYear,
      },
    });

    const totalDaysUsed = approvedLeaves.reduce((sum, leave) => sum + leave.numberOfDays, 0);
    const annualLeaveLimit = 25; // Default annual leave limit
    const remainingDays = Math.max(0, annualLeaveLimit - totalDaysUsed);

    return {
      totalDays: annualLeaveLimit,
      usedDays: totalDaysUsed,
      remainingDays,
      leaves: approvedLeaves,
    };
  }

  async getPendingLeaves(): Promise<Leave[]> {
    return this.leaveRepository.find({
      where: { status: LeaveStatus.PENDING },
      relations: ['employee'],
      order: { createdAt: 'ASC' },
    });
  }
} 