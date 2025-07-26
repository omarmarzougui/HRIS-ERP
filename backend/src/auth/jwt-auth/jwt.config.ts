import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET || 'defaultSecret',
  signOptions: {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m', // Access token expires in 15 minutes
  },
};

export const refreshTokenConfig = {
  expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d', // Refresh token expires in 7 days
}; 