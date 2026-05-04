import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { TokenType } from '../src/generated/prisma/enums.js';
import { prisma } from '../src/lib/prisma.js';
import { authController } from '../src/controllers/authController.js';
import { sendActivationEmail } from '../src/services/mailService.js';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
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
  sendActivationEmail: vi.fn(),
}));

const createResponse = () => {
  const status = vi.fn().mockReturnThis();
  const json = vi.fn();

  return { status, json };
};

describe('authController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when name is missing', async () => {
    const response = createResponse();

    await authController.registration(
      {
        body: {
          email: 'test@example.com',
          password: '12345678',
          confirmPassword: '12345678',
        },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Name must be a string',
    });
  });

  it('returns 400 when passwords do not match', async () => {
    const response = createResponse();

    await authController.registration(
      {
        body: {
          name: 'John Doe',
          email: 'test@example.com',
          password: '12345678',
          confirmPassword: '87654321',
        },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Passwords do not match',
    });
  });

  it('returns 409 when user with email already exists', async () => {
    const response = createResponse();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'John Doe',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActivated: true,
    });

    await authController.registration(
      {
        body: {
          name: 'John Doe',
          email: 'test@example.com',
          password: '12345678',
          confirmPassword: '12345678',
        },
      } as never,
      response as never,
    );

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'test@example.com',
      },
    });
    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      message: 'User with this email already exists',
    });
  });

  it('returns 200 when registration payload is valid', async () => {
    const response = createResponse();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password');
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'John Doe',
      passwordHash: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActivated: false,
    });
    vi.mocked(prisma.token.create).mockResolvedValue({
      id: 'token-1',
      userId: '1',
      type: TokenType.EMAIL_ACTIVATION,
      token: 'activation-token',
      expiresAt: new Date(),
      createdAt: new Date(),
    });

    await authController.registration(
      {
        body: {
          name: '  John Doe  ',
          email: ' test@example.com ',
          password: '12345678',
          confirmPassword: '12345678',
        },
      } as never,
      response as never,
    );

    expect(bcrypt.hash).toHaveBeenCalledWith('12345678', 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'John Doe',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      },
    });
    expect(prisma.token.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: '1',
        type: TokenType.EMAIL_ACTIVATION,
      }),
    });
    expect(sendActivationEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.any(String),
    );
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      message: 'User registered successfully.',
      data: {
        id: '1',
        email: 'test@example.com',
        name: 'John Doe',
        isActivated: false,
        activationToken: expect.any(String),
      },
    });
  });

  it('returns 400 when activation token is invalid', async () => {
    const response = createResponse();
    vi.mocked(prisma.token.findFirst).mockResolvedValue(null);

    await authController.activate(
      {
        params: {
          token: 'invalid-token',
        },
      } as never,
      response as never,
    );

    expect(prisma.token.findFirst).toHaveBeenCalledWith({
      where: {
        token: 'invalid-token',
        type: TokenType.EMAIL_ACTIVATION,
      },
    });
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Activation token is invalid or expired',
    });
  });

  it('returns 200 when activation token is valid', async () => {
    const response = createResponse();
    const expiresAt = new Date(Date.now() + 60_000);
    vi.mocked(prisma.token.findFirst).mockResolvedValue({
      id: 'token-1',
      userId: '1',
      type: TokenType.EMAIL_ACTIVATION,
      token: 'valid-token',
      expiresAt,
      createdAt: new Date(),
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'John Doe',
      passwordHash: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActivated: false,
    });
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'John Doe',
      passwordHash: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActivated: true,
    });
    vi.mocked(prisma.token.delete).mockResolvedValue({
      id: 'token-1',
      userId: '1',
      type: TokenType.EMAIL_ACTIVATION,
      token: 'valid-token',
      expiresAt,
      createdAt: new Date(),
    });

    await authController.activate(
      {
        params: {
          token: 'valid-token',
        },
      } as never,
      response as never,
    );

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: {
        id: '1',
      },
      data: {
        isActivated: true,
      },
    });
    expect(prisma.token.delete).toHaveBeenCalledWith({
      where: {
        id: 'token-1',
      },
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Account activated successfully.',
      data: {
        id: '1',
        email: 'test@example.com',
        name: 'John Doe',
        isActivated: true,
      },
    });
  });
});
