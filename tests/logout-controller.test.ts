import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TokenType } from '../src/generated/prisma/enums.js';
import { prisma } from '../src/lib/prisma.js';
import { logoutController } from '../src/controllers/logoutController.js';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    token: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const createResponse = () => {
  const status = vi.fn().mockReturnThis();
  const json = vi.fn();
  const clearCookie = vi.fn();

  return { status, json, clearCookie };
};

describe('logoutController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when refresh token is missing', async () => {
    const response = createResponse();

    await logoutController.logout(
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

  it('returns 401 and clears cookie when refresh token is not found in db', async () => {
    const response = createResponse();
    vi.mocked(prisma.token.findFirst).mockResolvedValue(null);

    await logoutController.logout(
      {
        headers: {},
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

  it('returns 200 and clears cookie when refresh token exists', async () => {
    const response = createResponse();
    vi.mocked(prisma.token.findFirst).mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      type: TokenType.REFRESH_TOKEN,
      token: 'refresh-token-value',
      expiresAt: new Date(),
      createdAt: new Date(),
    });
    vi.mocked(prisma.token.delete).mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      type: TokenType.REFRESH_TOKEN,
      token: 'refresh-token-value',
      expiresAt: new Date(),
      createdAt: new Date(),
    });

    await logoutController.logout(
      {
        headers: {},
        cookies: {
          refreshToken: 'refresh-token-value',
        },
      } as never,
      response as never,
    );

    expect(prisma.token.delete).toHaveBeenCalledWith({
      where: {
        id: 'token-1',
      },
    });
    expect(response.clearCookie).toHaveBeenCalledWith('refreshToken');
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Logout request is valid.',
    });
  });
});
