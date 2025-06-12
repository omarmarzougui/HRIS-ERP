import { Body, Controller, Post, UnauthorizedException, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { RBACGuard } from '../common/guards/rbac.guard';
import { Roles } from '../common/decorators/roles/roles.decorator';
import { RequirePermissions } from '../common/decorators/permissions/permissions.decorator';
import { UserRole } from '../users/entities/user.entity';
import { USER_PERMISSIONS, EMPLOYEE_PERMISSIONS } from '../common/constants/permissions';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RBACGuard)
  @Get('test-protected')
  async testProtected() {
    return { message: 'This is a protected route', timestamp: new Date().toISOString() };
  }

  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @Get('admin-only')
  async adminOnly() {
    return { message: 'This route is only accessible to Admin and HR users' };
  }

  @UseGuards(JwtAuthGuard, RBACGuard)
  @RequirePermissions(USER_PERMISSIONS.LIST_USERS)
  @Get('users-list')
  async usersList() {
    return { message: 'This route requires user:list permission' };
  }

  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(UserRole.MANAGER)
  @RequirePermissions(EMPLOYEE_PERMISSIONS.VIEW_PERFORMANCE)
  @Get('manager-dashboard')
  async managerDashboard() {
    return { message: 'Manager dashboard with performance viewing permission' };
  }

  @UseGuards(JwtAuthGuard, RBACGuard)
  @Roles(UserRole.EMPLOYEE)
  @Get('employee-profile')
  async employeeProfile() {
    return { message: 'Employee profile access' };
  }
}
