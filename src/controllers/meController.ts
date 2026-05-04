import { Request, Response } from 'express';
import { TokenType } from '../generated/prisma/enums.js';
import { prisma } from '../lib/prisma.js';

const me = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken;

  if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
    res.status(401).json({ message: 'Authentication is required' });

    return;
  }

  const existingToken = await prisma.token.findFirst({
    where: {
      token: refreshToken,
      type: TokenType.REFRESH_TOKEN,
    },
  });

  if (!existingToken) {
    res.clearCookie('refreshToken');
    res.status(401).json({ message: 'Authentication is required' });

    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      id: existingToken.userId,
    },
  });

  if (!existingUser) {
    res.clearCookie('refreshToken');
    res.status(401).json({ message: 'Authentication is required' });

    return;
  }

  res.status(200).json({
    message: 'Authentication context is present.',
    data: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      isActivated: existingUser.isActivated,
    },
  });
};

export const meController = {
  me,
};
