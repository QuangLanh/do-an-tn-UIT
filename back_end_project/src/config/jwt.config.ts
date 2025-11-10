import { Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

@Injectable()
export class JwtConfig implements JwtOptionsFactory {
  createJwtOptions(): JwtModuleOptions {
    return {
      secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION || '7d',
      },
    };
  }
}

