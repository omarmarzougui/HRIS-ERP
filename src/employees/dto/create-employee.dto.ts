export class CreateEmployeeDto {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  hireDate?: Date;
  department?: string;
  position?: string;
  salary?: number;
  managerId?: string;
  userId?: string;
} 