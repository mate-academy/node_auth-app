import { randomBytes } from 'crypto';
import { NormalizedUser } from '../types/User.js';
import { prisma } from '../prismaClient.js';
import jwt from 'jsonwebtoken';

function generateAccessToken(user: NormalizedUser) {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error('Access secret is not defined');
  }

  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(user: NormalizedUser) {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('Refresh secret is not defined');
  }

  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

function validateAccessToken(token: string) {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error('Access secret is not defined');
  }

  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
}

function validateRefreshToken(token: string) {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('Refresh secret is not defined');
  }

  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

function generateRandomToken() {
  return randomBytes(32).toString('hex');
}

async function saveToken(userId: number, refreshToken: string) {
  await prisma.token.upsert({
    where: {
      userId,
    },
    update: {
      token: refreshToken,
    },
    create: {
      userId,
      token: refreshToken,
    },
  });
}

async function removeToken(refreshToken: string) {
  await prisma.token.deleteMany({
    where: {
      token: refreshToken,
    },
  });
}

export const tokenService = {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken,
  generateRandomToken,
  saveToken,
  removeToken,
};
