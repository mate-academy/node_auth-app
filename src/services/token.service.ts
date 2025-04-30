import crypto from 'crypto';
import { Token, TokenType } from '@prisma/client';
import { tokenRepository } from '../entity/token.repository.js';
import { NormalizedUser } from '../types/NormalizedUser.js';
import { jwt } from '../utils/jwt.js';

function generate(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateAccessToken(normalizedUser: NormalizedUser): string {
  return jwt.generateAccessToken(normalizedUser);
}

function generateRefreshToken(normalizedUser: NormalizedUser): string {
  return jwt.generateRefreshToken(normalizedUser);
}

function create(
  userId: string,
  token: string,
  tokenType: TokenType,
  payload?: string,
): Promise<Token> {
  return tokenRepository.create(userId, hashToken(token), tokenType, payload);
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

async function createAuthTokens(
  normalizedUser: NormalizedUser,
): Promise<AuthTokens> {
  const accessToken = tokenService.generateAccessToken(normalizedUser);
  const refreshToken = tokenService.generateRefreshToken(normalizedUser);

  await tokenService.deleteByUserId(normalizedUser.id, TokenType.refresh);
  await tokenService.create(normalizedUser.id, refreshToken, TokenType.refresh);

  return { accessToken, refreshToken };
}

function getByToken(token: string): Promise<Token | null> {
  return tokenRepository.getByToken(hashToken(token));
}

function getByUserId(
  userId: string,
  tokenType: TokenType,
): Promise<Token | null> {
  return tokenRepository.getByUserId(userId, tokenType);
}

function deleteById(id: number): Promise<Token> {
  return tokenRepository.deleteById(id);
}

function deleteByUserId(userId: string, tokenType: TokenType) {
  return tokenRepository.deleteByUserId(userId, tokenType);
}

export const tokenService = {
  generate,
  generateAccessToken,
  generateRefreshToken,

  create,
  createAuthTokens,

  getByToken,
  getByUserId,

  deleteById,
  deleteByUserId,
};
