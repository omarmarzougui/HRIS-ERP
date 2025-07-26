// User Management Permissions
export const USER_PERMISSIONS = {
  CREATE_USER: 'user:create',
  READ_USER: 'user:read',
  UPDATE_USER: 'user:update',
  DELETE_USER: 'user:delete',
  LIST_USERS: 'user:list',
  MANAGE_USER_ROLES: 'user:manage_roles',
} as const;

// Employee Management Permissions
export const EMPLOYEE_PERMISSIONS = {
  CREATE_EMPLOYEE: 'employee:create',
  READ_EMPLOYEE: 'employee:read',
  UPDATE_EMPLOYEE: 'employee:update',
  DELETE_EMPLOYEE: 'employee:delete',
  LIST_EMPLOYEES: 'employee:list',
  VIEW_SALARY: 'employee:view_salary',
  UPDATE_SALARY: 'employee:update_salary',
  VIEW_PERFORMANCE: 'employee:view_performance',
  UPDATE_PERFORMANCE: 'employee:update_performance',
} as const;

// Department Management Permissions
export const DEPARTMENT_PERMISSIONS = {
  CREATE_DEPARTMENT: 'department:create',
  READ_DEPARTMENT: 'department:read',
  UPDATE_DEPARTMENT: 'department:update',
  DELETE_DEPARTMENT: 'department:delete',
  LIST_DEPARTMENTS: 'department:list',
  MANAGE_DEPARTMENT_BUDGET: 'department:manage_budget',
} as const;

// Leave Management Permissions
export const LEAVE_PERMISSIONS = {
  CREATE_LEAVE_REQUEST: 'leave:create',
  READ_LEAVE_REQUEST: 'leave:read',
  UPDATE_LEAVE_REQUEST: 'leave:update',
  DELETE_LEAVE_REQUEST: 'leave:delete',
  APPROVE_LEAVE_REQUEST: 'leave:approve',
  REJECT_LEAVE_REQUEST: 'leave:reject',
  LIST_LEAVE_REQUESTS: 'leave:list',
  VIEW_LEAVE_BALANCE: 'leave:view_balance',
} as const;

// Payroll Permissions
export const PAYROLL_PERMISSIONS = {
  GENERATE_PAYROLL: 'payroll:generate',
  READ_PAYROLL: 'payroll:read',
  UPDATE_PAYROLL: 'payroll:update',
  APPROVE_PAYROLL: 'payroll:approve',
  LIST_PAYROLL: 'payroll:list',
  VIEW_PAYROLL_REPORTS: 'payroll:view_reports',
} as const;

// System Administration Permissions
export const SYSTEM_PERMISSIONS = {
  MANAGE_SYSTEM_SETTINGS: 'system:manage_settings',
  VIEW_SYSTEM_LOGS: 'system:view_logs',
  MANAGE_BACKUPS: 'system:manage_backups',
  MANAGE_PERMISSIONS: 'system:manage_permissions',
} as const;

// All permissions combined
export const ALL_PERMISSIONS = {
  ...USER_PERMISSIONS,
  ...EMPLOYEE_PERMISSIONS,
  ...DEPARTMENT_PERMISSIONS,
  ...LEAVE_PERMISSIONS,
  ...PAYROLL_PERMISSIONS,
  ...SYSTEM_PERMISSIONS,
} as const;

export type Permission = typeof ALL_PERMISSIONS[keyof typeof ALL_PERMISSIONS]; 