import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TokenType } from '../src/generated/prisma/enums.js';
import { prisma } from '../src/lib/prisma.js';
import { meController } from '../src/controllers/meController.js';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    token: {
      findFirst: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const createResponse = () => {
  const status = vi.fn().mockReturnThis();
  const json = vi.fn();
  const clearCookie = vi.fn();

  return { status, json, clearCookie };
};

describe('meController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when auth context is missing', async () => {
    const response = createResponse();

    await meController.me(
      {
        headers: {},
        cookies: {},
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Authentication is required',
    });
  });

  it('returns 401 and clears cookie when refresh token is not found', async () => {
    const response = createResponse();
    vi.mocked(prisma.token.findFirst).mockResolvedValue(null);

    await meController.me(
      {
        cookies: {
          refreshToken: 'refresh-token-value',
        },
      } as never,
      response as never,
    );

    expect(prisma.token.findFirst).toHaveBeenCalledWith({
      where: {
        token: 'refresh-token-value',
        type: TokenType.REFRESH_TOKEN,
      },
    });
    expect(response.clearCookie).toHaveBeenCalledWith('refreshToken');
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Authentication is required',
    });
  });

  it('returns 401 and clears cookie when user is not found', async () => {
    const response = createResponse();
    vi.mocked(prisma.token.findFirst).mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      type: TokenType.REFRESH_TOKEN,
      token: 'refresh-token-value',
      expiresAt: new Date(),
      createdAt: new Date(),
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await meController.me(
      {
        cookies: {
          refreshToken: 'refresh-token-value',
        },
      } as never,
      response as never,
    );

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
      },
    });
    expect(response.clearCookie).toHaveBeenCalledWith('refreshToken');
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Authentication is required',
    });
  });

  it('returns 200 when auth context is present', async () => {
    const response = createResponse();
    vi.mocked(prisma.token.findFirst).mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      type: TokenType.REFRESH_TOKEN,
      token: 'refresh-token-value',
      expiresAt: new Date(),
      createdAt: new Date(),
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      name: 'John Doe',
      passwordHash: 'stored-hash',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActivated: true,
    });

    await meController.me(
      {
        cookies: {
          refreshToken: 'refresh-token-value',
        },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Authentication context is present.',
      data: {
        id: 'user-1',
        name: 'John Doe',
        email: 'test@example.com',
        isActivated: true,
      },
    });
  });
});
