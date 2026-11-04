import * as refreshService from '../services/refreshToken.service.js';

export const setCookie = async (user, res) => {
  const refreshToken = await refreshService.generateRefreshToken(user.id);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: refreshService.REFRESH_TTL_MS,
    path: '/auth',
  });
};

export const clearCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/auth',
  });
};
