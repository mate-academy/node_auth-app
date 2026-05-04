import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { TokenType } from '../src/generated/prisma/enums.js';
import { prisma } from '../src/lib/prisma.js';
import { profileController } from '../src/controllers/profileController.js';
import { sendEmailChangeNotification } from '../src/services/mailService.js';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    token: {
      findFirst: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock('../src/services/mailService.js', () => ({
  sendEmailChangeNotification: vi.fn(),
}));

const createResponse = () => {
  const status = vi.fn().mockReturnThis();
  const json = vi.fn();
  const clearCookie = vi.fn();

  return { status, json, clearCookie };
};

const authenticatedRequest = {
  cookies: {
    refreshToken: 'refresh-token-value',
  },
};

const authenticatedToken = {
  id: 'token-1',
  userId: 'user-1',
  type: TokenType.REFRESH_TOKEN,
  token: 'refresh-token-value',
  expiresAt: new Date(),
  createdAt: new Date(),
};

const authenticatedUser = {
  id: 'user-1',
  email: 'john@example.com',
  name: 'John Doe',
  passwordHash: 'stored-password-hash',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActivated: true,
};

describe('profileController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.token.findFirst).mockResolvedValue(authenticatedToken);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(authenticatedUser);
  });

  it('updates the user name', async () => {
    const response = createResponse();
    vi.mocked(prisma.user.update).mockResolvedValue({
      ...authenticatedUser,
      name: 'Jane Doe',
    });

    await profileController.updateName(
      {
        ...authenticatedRequest,
        body: {
          name: '  Jane Doe  ',
        },
      } as never,
      response as never,
    );

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
      },
      data: {
        name: 'Jane Doe',
      },
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Name updated successfully.',
      data: {
        id: 'user-1',
        name: 'Jane Doe',
        email: 'john@example.com',
        isActivated: true,
      },
    });
  });

  it('updates the password when the old password is correct', async () => {
    const response = createResponse();
    vi.mocked(bcrypt.compare).mockResolvedValue(true);
    vi.mocked(bcrypt.hash).mockResolvedValue('new-password-hash');
    vi.mocked(prisma.user.update).mockResolvedValue(authenticatedUser);

    await profileController.updatePassword(
      {
        ...authenticatedRequest,
        body: {
          oldPassword: 'password123',
          newPassword: 'new-password123',
          confirmNewPassword: 'new-password123',
        },
      } as never,
      response as never,
    );

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'password123',
      'stored-password-hash',
    );
    expect(bcrypt.hash).toHaveBeenCalledWith('new-password123', 10);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
      },
      data: {
        passwordHash: 'new-password-hash',
      },
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Password updated successfully.',
    });
  });

  it('updates the email and notifies the old address', async () => {
    const response = createResponse();
    vi.mocked(bcrypt.compare).mockResolvedValue(true);
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce(authenticatedUser)
      .mockResolvedValueOnce(null);
    vi.mocked(prisma.user.update).mockResolvedValue({
      ...authenticatedUser,
      email: 'jane@example.com',
    });

    await profileController.updateEmail(
      {
        ...authenticatedRequest,
        body: {
          newEmail: 'jane@example.com',
          confirmNewEmail: 'jane@example.com',
          password: 'password123',
        },
      } as never,
      response as never,
    );

    expect(prisma.user.findUnique).toHaveBeenNthCalledWith(2, {
      where: {
        email: 'jane@example.com',
      },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
      },
      data: {
        email: 'jane@example.com',
      },
    });
    expect(sendEmailChangeNotification).toHaveBeenCalledWith(
      'john@example.com',
      'jane@example.com',
    );
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Email updated successfully.',
      data: {
        id: 'user-1',
        name: 'John Doe',
        email: 'jane@example.com',
        isActivated: true,
      },
    });
  });

  it('returns 401 when the password is incorrect during email update', async () => {
    const response = createResponse();
    vi.mocked(bcrypt.compare).mockResolvedValue(false);

    await profileController.updateEmail(
      {
        ...authenticatedRequest,
        body: {
          newEmail: 'jane@example.com',
          confirmNewEmail: 'jane@example.com',
          password: 'password123',
        },
      } as never,
      response as never,
    );

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Password is incorrect',
    });
  });
});
