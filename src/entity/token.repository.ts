import { Token, TokenType } from '@prisma/client';
import { db } from '../utils/db.js';

function create(
  userId: string,
  token: string,
  tokenType: TokenType,
  payload?: string,
): Promise<Token> {
  return db.token.create({
    data: {
      userId,
      token,
      tokenType,
      payload,
    },
  });
}

function deleteById(id: number) {
  return db.token.delete({ where: { id } });
}

function deleteByUserId(userId: string, tokenType: TokenType) {
  return db.token.deleteMany({ where: { userId, tokenType } });
}

function getByToken(token: string): Promise<Token | null> {
  return db.token.findUnique({
    where: { token },
  });
}

function getByPayload(payload: string): Promise<Token | null> {
  return db.token.findFirst({ where: { payload } });
}

function getByUserId(
  userId: string,
  tokenType: TokenType,
): Promise<Token | null> {
  return db.token.findFirst({
    where: { userId, tokenType },
  });
}

export const tokenRepository = {
  create,

  getByToken,
  getByUserId,
  getByPayload,

  deleteById,
  deleteByUserId,
};
