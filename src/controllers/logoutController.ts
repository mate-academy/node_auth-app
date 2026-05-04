import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { TokenType } from '../generated/prisma/enums.js';

const logout = async (req: Request, res: Response): Promise<void> => {
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

  await prisma.token.delete({
    where: {
      id: existingToken.id,
    },
  });

  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logout request is valid.' });
};

export const logoutController = {
  logout,
};
