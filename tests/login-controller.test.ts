import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { TokenType } from '../src/generated/prisma/enums.js';
import { prisma } from '../src/lib/prisma.js';
import { loginController } from '../src/controllers/loginController.js';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    token: {
      create: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
  },
}));

const createResponse = () => {
  const status = vi.fn().mockReturnThis();
  const json = vi.fn();
  const cookie = vi.fn();

  return { status, json, cookie };
};

describe('loginController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when email is missing', async () => {
    const response = createResponse();

    await loginController.login(
      {
        body: {
          password: '12345678',
        },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Email must be a string',
    });
  });

  it('returns 401 when user is not found', async () => {
    const response = createResponse();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await loginController.login(
      {
        body: {
          email: ' test@example.com ',
          password: '12345678',
        },
      } as never,
      response as never,
    );

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'test@example.com',
      },
    });
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Invalid email or password',
    });
  });

  it('returns 401 when password does not match', async () => {
    const response = createResponse();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'John Doe',
      passwordHash: 'stored-hash',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActivated: true,
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(false);

    await loginController.login(
      {
        body: {
          email: 'test@example.com',
          password: '12345678',
        },
      } as never,
      response as never,
    );

    expect(bcrypt.compare).toHaveBeenCalledWith('12345678', 'stored-hash');
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Invalid email or password',
    });
  });

  it('returns 403 when user is not activated', async () => {
    const response = createResponse();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'John Doe',
      passwordHash: 'stored-hash',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActivated: false,
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true);

    await loginController.login(
      {
        body: {
          email: 'test@example.com',
          password: '12345678',
        },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Please activate your email first',
    });
  });

  it('returns 200 when login payload is valid', async () => {
    const response = createResponse();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'John Doe',
      passwordHash: 'stored-hash',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActivated: true,
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true);
    vi.mocked(prisma.token.create).mockResolvedValue({
      id: 'token-1',
      userId: '1',
      type: TokenType.REFRESH_TOKEN,
      token: 'generated-token',
      expiresAt: new Date(),
      createdAt: new Date(),
    });

    await loginController.login(
      {
        body: {
          email: ' test@example.com ',
          password: '12345678',
        },
      } as never,
      response as never,
    );

    expect(prisma.token.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: '1',
        type: TokenType.REFRESH_TOKEN,
      }),
    });
    expect(response.cookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
      }),
    );
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Login successful.',
      data: {
        id: '1',
        email: 'test@example.com',
        name: 'John Doe',
        isActivated: true,
      },
    });
  });
});
