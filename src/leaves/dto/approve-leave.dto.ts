import { LeaveStatus } from '../entities/leave.entity';

export class ApproveLeaveDto {
  status: LeaveStatus;
  rejectionReason?: string;
  comments?: string;
} 