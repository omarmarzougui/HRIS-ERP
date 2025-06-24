export class CreatePayrollDto {
  employeeId: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  basicSalary: number;
  overtimePay?: number;
  bonus?: number;
  allowances?: number;
  deductions?: number;
  notes?: string;
  breakdown?: {
    basicSalary: number;
    overtimePay: number;
    bonus: number;
    allowances: number;
    deductions: {
      tax: number;
      insurance: number;
      pension: number;
      other: number;
    };
  };
} 