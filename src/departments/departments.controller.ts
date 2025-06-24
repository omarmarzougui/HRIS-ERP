import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RBACGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles/roles.decorator';
import { RequirePermissions } from '../common/decorators/permissions/permissions.decorator';
import { UserRole } from '../users/entities/user.entity';
import { DEPARTMENT_PERMISSIONS } from '../common/constants/permissions';

@Controller('departments')
@UseGuards(JwtAuthGuard, RBACGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR)
  @RequirePermissions(DEPARTMENT_PERMISSIONS.CREATE_DEPARTMENT)
  create(@Body() createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @RequirePermissions(DEPARTMENT_PERMISSIONS.LIST_DEPARTMENTS)
  findAll(): Promise<Department[]> {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @RequirePermissions(DEPARTMENT_PERMISSIONS.READ_DEPARTMENT)
  findOne(@Param('id') id: string): Promise<Department | null> {
    return this.departmentsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  @RequirePermissions(DEPARTMENT_PERMISSIONS.UPDATE_DEPARTMENT)
  update(@Param('id') id: string, @Body() updateDepartmentDto: Partial<Department>): Promise<any> {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(DEPARTMENT_PERMISSIONS.DELETE_DEPARTMENT)
  remove(@Param('id') id: string): Promise<any> {
    return this.departmentsService.remove(id);
  }

  @Get('manager/:managerId')
  @RequirePermissions(DEPARTMENT_PERMISSIONS.READ_DEPARTMENT)
  findByManager(@Param('managerId') managerId: string): Promise<Department[]> {
    return this.departmentsService.findByManager(managerId);
  }

  @Get(':id/budget')
  @Roles(UserRole.ADMIN, UserRole.HR)
  @RequirePermissions(DEPARTMENT_PERMISSIONS.MANAGE_DEPARTMENT_BUDGET)
  getBudget(@Param('id') id: string): Promise<{ budget: number }> {
    return this.departmentsService.getDepartmentBudget(id).then(budget => ({ budget }));
  }
} 