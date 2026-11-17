import type { Response } from 'express';
import type { AuthenticationData } from './types.js';

export const sendAuthentication = (res: Response, data: AuthenticationData) => {
  res.cookie('refreshToken', data.refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  return res.json({
    user: data.user,
    accessToken: data.accessToken,
  });
};
