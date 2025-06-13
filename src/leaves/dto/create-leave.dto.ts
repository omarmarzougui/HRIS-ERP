import { LeaveType } from '../entities/leave.entity';

export class CreateLeaveDto {
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason?: string;
  comments?: string;
} 