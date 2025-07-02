import { Injectable } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';
import { ROLE_PERMISSIONS } from '../constants/role-permissions';
import { ALL_PERMISSIONS } from '../constants/permissions';

@Injectable()
export class RBACService {
  /**
   * Get default permissions for a role
   */
  getRolePermissions(role: UserRole): string[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if a user has a specific permission
   */
  hasPermission(
    userPermissions: string[],
    requiredPermission: string,
  ): boolean {
    return userPermissions.includes(requiredPermission);
  }

  /**
   * Check if a user has all required permissions
   */
  hasAllPermissions(
    userPermissions: string[],
    requiredPermissions: string[],
  ): boolean {
    return requiredPermissions.every((permission) =>
      this.hasPermission(userPermissions, permission),
    );
  }

  /**
   * Check if a user has any of the required permissions
   */
  hasAnyPermission(
    userPermissions: string[],
    requiredPermissions: string[],
  ): boolean {
    return requiredPermissions.some((permission) =>
      this.hasPermission(userPermissions, permission),
    );
  }

  /**
   * Check if a user has a specific role
   */
  hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
  }

  /**
   * Get all available permissions
   */
  getAllPermissions(): string[] {
    return Object.values(ALL_PERMISSIONS);
  }

  /**
   * Get all available roles
   */
  getAllRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  /**
   * Validate if a permission exists
   */
  isValidPermission(permission: string): boolean {
    return this.getAllPermissions().includes(permission);
  }

  /**
   * Validate if a role exists
   */
  isValidRole(role: string): boolean {
    return this.getAllRoles().includes(role as UserRole);
  }

  /**
   * Get permissions that are not assigned to a role
   */
  getUnassignedPermissions(role: UserRole): string[] {
    const rolePermissions = this.getRolePermissions(role);
    const allPermissions = this.getAllPermissions();
    return allPermissions.filter(
      (permission) => !rolePermissions.includes(permission),
    );
  }

  /**
   * Check if user can access a resource based on ownership
   * This is useful for resources that belong to users (e.g., own profile, own leave requests)
   */
  canAccessOwnResource(
    userId: string,
    resourceUserId: string,
    userRole: UserRole,
  ): boolean {
    // Admin and HR can access any resource
    if (userRole === UserRole.ADMIN || userRole === UserRole.HR) {
      return true;
    }

    // Users can only access their own resources
    return userId === resourceUserId;
  }

  /**
   * Check if user can manage other users based on role hierarchy
   */
  canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, UserRole[]> = {
      [UserRole.ADMIN]: [
        UserRole.ADMIN,
        UserRole.HR,
        UserRole.MANAGER,
        UserRole.EMPLOYEE,
      ],
      [UserRole.HR]: [UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE],
      [UserRole.MANAGER]: [UserRole.EMPLOYEE],
      [UserRole.EMPLOYEE]: [],
    };

    return roleHierarchy[managerRole]?.includes(targetRole) || false;
  }
}
