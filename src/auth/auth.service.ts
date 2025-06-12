import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { refreshTokenConfig } from './jwt-auth/jwt.config';
import { ROLE_PERMISSIONS } from '../common/constants/role-permissions';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Get default permissions for the user's role
    const defaultPermissions = ROLE_PERMISSIONS[user.role] || [];
    
    // Use user's custom permissions if available, otherwise use default permissions
    const userPermissions = user.permissions || defaultPermissions;
    
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role,
      permissions: userPermissions,
    };
    
    // Generate access token
    const access_token = this.jwtService.sign(payload);
    
    // Generate refresh token with longer expiration
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: refreshTokenConfig.expiresIn,
    });

    return {
      access_token,
      refresh_token,
      expires_in: 900, // 15 minutes in seconds
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: userPermissions,
      },
    };
  }

  async refreshToken(refresh_token: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refresh_token);
      
      // Generate new access token
      const access_token = this.jwtService.sign({
        email: payload.email,
        sub: payload.sub,
        role: payload.role,
        permissions: payload.permissions,
      });

      return {
        access_token,
        expires_in: 900, // 15 minutes in seconds
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(createUserDto: CreateUserDto) {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Get default permissions for the user's role
    const defaultPermissions = ROLE_PERMISSIONS[createUserDto.role] || ROLE_PERMISSIONS.employee;
    
    const userWithHashedPassword = {
      ...createUserDto,
      password: hashedPassword,
      permissions: defaultPermissions,
    };
    
    return this.usersService.create(userWithHashedPassword);
  }
}
