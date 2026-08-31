import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtUser } from '../common/decorators/current-user.decorator.js';

interface JwtPayload {
  sub: number;
  email: string;
  roleId: number;
  roleName: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): JwtUser {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token');
    }
    return {
      sub: payload.sub,
      email: payload.email,
      roleId: payload.roleId,
      roleName: payload.roleName,
      permissions: [],
    };
  }
}
