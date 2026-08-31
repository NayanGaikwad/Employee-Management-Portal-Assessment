import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService, DEFAULT_ROLE } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

const mockBcrypt = vi.mocked(bcrypt);

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  role: {
    findUnique: vi.fn(),
  },
  auditLog: { create: vi.fn() },
};

const mockJwt = {
  signAsync: vi.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('creates a user with hashed password and default role, returns a token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findUnique.mockResolvedValue({ id: 10, name: DEFAULT_ROLE });
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never);
      mockPrisma.user.create.mockResolvedValue({ id: 5, email: 'a@b.com', roleId: 10 });
      mockJwt.signAsync.mockResolvedValue('jwt-token');

      const result = await service.register({ email: 'a@b.com', password: 'password123' });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { email: 'a@b.com', passwordHash: 'hashed-password', roleId: 10 },
      });
      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.roleName).toBe(DEFAULT_ROLE);
    });

    it('throws ConflictException when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com' });

      await expect(
        service.register({ email: 'a@b.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws NotFoundException when the default role is missing', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findUnique.mockResolvedValue(null);

      await expect(
        service.register({ email: 'a@b.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('login', () => {
    it('returns a token for valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'a@b.com',
        passwordHash: 'hashed',
        role: { name: 'ADMIN' },
      });
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockPrisma.role.findUnique.mockResolvedValue({ id: 99, name: 'ADMIN' });
      mockJwt.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login({ email: 'a@b.com', password: 'password123' });

      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.roleName).toBe('ADMIN');
    });

    it('throws UnauthorizedException for an unknown user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nope@b.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException for a wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'a@b.com',
        passwordHash: 'hashed',
        role: { name: 'ADMIN' },
      });
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
