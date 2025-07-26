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
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RBACGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles/roles.decorator';
import { RequirePermissions } from '../common/decorators/permissions/permissions.decorator';
import { UserRole } from './entities/user.entity';
import { USER_PERMISSIONS } from '../common/constants/permissions';

@Controller('users')
@UseGuards(JwtAuthGuard, RBACGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR)
  @RequirePermissions(USER_PERMISSIONS.CREATE_USER)
  create(@Body() user: CreateUserDto): Promise<User> {
    return this.usersService.create(user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @RequirePermissions(USER_PERMISSIONS.LIST_USERS)
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions(USER_PERMISSIONS.READ_USER)
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions(USER_PERMISSIONS.UPDATE_USER)
  update(@Param('id') id: string, @Body() user: Partial<User>): Promise<any> {
    return this.usersService.update(id, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  @RequirePermissions(USER_PERMISSIONS.DELETE_USER)
  remove(@Param('id') id: string): Promise<any> {
    return this.usersService.remove(id);
  }

  @Put(':id/role')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(USER_PERMISSIONS.MANAGE_USER_ROLES)
  updateRole(@Param('id') id: string, @Body() body: { role: UserRole }): Promise<any> {
    return this.usersService.update(id, { role: body.role });
  }

  @Put(':id/permissions')
  @Roles(UserRole.ADMIN)
  @RequirePermissions(USER_PERMISSIONS.MANAGE_USER_ROLES)
  updatePermissions(@Param('id') id: string, @Body() body: { permissions: string[] }): Promise<any> {
    return this.usersService.update(id, { permissions: body.permissions });
  }
}
