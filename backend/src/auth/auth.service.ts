import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

export const DEFAULT_ROLE = 'EMPLOYEE_VIEWER';

export interface LoginResult {
  accessToken: string;
  user: { id: number; email: string; roleName: string };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<LoginResult> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const role = await this.prisma.role.findUnique({
      where: { name: DEFAULT_ROLE },
    });
    if (!role) {
      throw new NotFoundException(
        `Default role '${DEFAULT_ROLE}' not found. Run the seed script.`,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        roleId: role.id,
      },
    });

    return this.buildLoginResult(user.id, user.email, role.name);
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildLoginResult(user.id, user.email, user.role.name);
  }

  private async buildLoginResult(
    userId: number,
    email: string,
    roleName: string,
  ): Promise<LoginResult> {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });
    const payload = { sub: userId, email, roleId: role!.id, roleName };
    const accessToken = await this.jwt.signAsync(payload);
    return { accessToken, user: { id: userId, email, roleName } };
  }
}
