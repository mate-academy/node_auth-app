import type { Response } from 'express';
import * as tokenRepository from '../repository/tokens.repository.ts';
import type { NormalizedUser } from '../types/index.ts';

const saveAuthorization = async (res: Response, normalizedUser: NormalizedUser) => {
  const refreshToken = await tokenRepository.upsert(normalizedUser);

  res.cookie('refreshToken', refreshToken.token, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
  })
}

export default {
  saveAuthorization,
}
