export const REFRESH_COOKIE = 'refreshToken';

export const cookieOptions = {
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: 'lax' as const,
  secure: false, // true in production (HTTPS)
};
