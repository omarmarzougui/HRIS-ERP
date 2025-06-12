import { Module } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RBACGuard } from './guards/rbac.guard';
import { RBACService } from './services/rbac.service';

@Module({
  providers: [RolesGuard, PermissionsGuard, RBACGuard, RBACService],
  exports: [RolesGuard, PermissionsGuard, RBACGuard, RBACService],
})
export class RBACModule {} 