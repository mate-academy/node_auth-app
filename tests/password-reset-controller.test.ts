import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { TokenType } from '../src/generated/prisma/enums.js';
import { prisma } from '../src/lib/prisma.js';
import { passwordResetController } from '../src/controllers/passwordResetController.js';
import { sendPasswordResetEmail } from '../src/services/mailService.js';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    token: {
      create: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
  },
}));

vi.mock('../src/services/mailService.js', () => ({
  sendPasswordResetEmail: vi.fn(),
}));

const createResponse = () => {
  const status = vi.fn().mockReturnThis();
  const json = vi.fn();

  return { status, json };
};

describe('passwordResetController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns neutral success when email does not exist', async () => {
    const response = createResponse();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await passwordResetController.request(
      {
        body: {
          email: 'missing@example.com',
        },
      } as never,
      response as never,
    );

    expect(prisma.token.create).not.toHaveBeenCalled();
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      message:
        'If an account with this email exists, a reset link has been sent.',
      data: {},
    });
  });

  it('creates a password reset token and sends email when user exists', async () => {
    const response = createResponse();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      passwordHash: 'stored-hash',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActivated: true,
    });
    vi.mocked(prisma.token.create).mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      type: TokenType.PASSWORD_RESET,
      token: 'password-reset-token',
      expiresAt: new Date(),
      createdAt: new Date(),
    });

    await passwordResetController.request(
      {
        body: {
          email: ' john@example.com ',
        },
      } as never,
      response as never,
    );

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'john@example.com',
      },
    });
    expect(prisma.token.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        type: TokenType.PASSWORD_RESET,
      }),
    });
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      'john@example.com',
      expect.any(String),
    );
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('returns 400 when password reset token is invalid', async () => {
    const response = createResponse();
    vi.mocked(prisma.token.findFirst).mockResolvedValue(null);

    await passwordResetController.confirm(
      {
        params: {
          token: 'invalid-token',
        },
        body: {
          password: 'password123',
          confirmPassword: 'password123',
        },
      } as never,
      response as never,
    );

    expect(prisma.token.findFirst).toHaveBeenCalledWith({
      where: {
        token: 'invalid-token',
        type: TokenType.PASSWORD_RESET,
      },
    });
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Password reset token is invalid or expired',
    });
  });

  it('returns 400 when new passwords do not match', async () => {
    const response = createResponse();
    vi.mocked(prisma.token.findFirst).mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      type: TokenType.PASSWORD_RESET,
      token: 'valid-token',
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      passwordHash: 'stored-hash',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActivated: true,
    });

    await passwordResetController.confirm(
      {
        params: {
          token: 'valid-token',
        },
        body: {
          password: 'password123',
          confirmPassword: 'password321',
        },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Passwords do not match',
    });
  });

  it('updates the password and deletes reset token when payload is valid', async () => {
    const response = createResponse();
    vi.mocked(prisma.token.findFirst).mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      type: TokenType.PASSWORD_RESET,
      token: 'valid-token',
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      passwordHash: 'stored-hash',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActivated: true,
    });
    vi.mocked(bcrypt.hash).mockResolvedValue('new-password-hash');
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      passwordHash: 'new-password-hash',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActivated: true,
    });
    vi.mocked(prisma.token.delete).mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      type: TokenType.PASSWORD_RESET,
      token: 'valid-token',
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    });

    await passwordResetController.confirm(
      {
        params: {
          token: 'valid-token',
        },
        body: {
          password: 'password123',
          confirmPassword: 'password123',
        },
      } as never,
      response as never,
    );

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
      },
      data: {
        passwordHash: 'new-password-hash',
      },
    });
    expect(prisma.token.delete).toHaveBeenCalledWith({
      where: {
        id: 'token-1',
      },
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Password updated successfully.',
    });
  });
});
