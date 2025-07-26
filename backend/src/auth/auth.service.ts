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

  async validateUser(
    email: string,
    password: string,
  ): Promise<{
    email: string;
    id: string;
    role: string;
    permissions: string[];
  } | null> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: {
    email: string;
    id: string;
    role: string;
    permissions?: string[];
    firstName?: string;
    lastName?: string;
  }): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role: string;
      permissions: string[];
    };
  }> {
    const defaultPermissions = ROLE_PERMISSIONS[user.role] || [];
    const userPermissions = user.permissions || defaultPermissions;

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      permissions: userPermissions,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: refreshTokenConfig.expiresIn,
    });

    return {
      access_token,
      refresh_token,
      expires_in: 900,
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

  async refreshToken(
    refresh_token: string,
  ): Promise<{ access_token: string; expires_in: number }> {
    const payload = this.jwtService.verify(refresh_token);
    const access_token = this.jwtService.sign({
      email: payload.email,
      sub: payload.sub,
      role: payload.role,
      permissions: payload.permissions,
    });

    return {
      access_token,
      expires_in: 900,
    };
  }

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{
    id: string;
    email: string;
    role: string;
    permissions: string[];
  }> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const defaultPermissions =
      ROLE_PERMISSIONS[createUserDto.role as keyof typeof ROLE_PERMISSIONS] ||
      [];

    const userWithHashedPassword = {
      ...createUserDto,
      password: hashedPassword,
      permissions: defaultPermissions,
    };

    return this.usersService.create(userWithHashedPassword);
  }

  async validateToken(
    token: string,
  ): Promise<{
    email: string;
    id: string;
    role: string;
    permissions: string[];
  } | null> {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findByEmail(decoded.email);
      return user ? { ...user, permissions: decoded.permissions } : null;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
