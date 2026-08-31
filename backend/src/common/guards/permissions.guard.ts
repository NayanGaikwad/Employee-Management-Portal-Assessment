import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  AuthenticatedRequest,
  JwtUser,
} from '../decorators/current-user.decorator.js';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user: JwtUser = request.user;

    const granted = await this.loadPermissions(user.roleId);

    const allowed = required.every((perm) => granted.includes(perm));
    if (!allowed) {
      throw new ForbiddenException(
        `Missing required permission: ${required.join(', ')}`,
      );
    }
    return true;
  }

  private async loadPermissions(roleId: number): Promise<string[]> {
    const row = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: { permissions: { select: { permission: { select: { action: true } } } } },
    });
    return (row?.permissions ?? []).map((p) => p.permission.action);
  }
}
