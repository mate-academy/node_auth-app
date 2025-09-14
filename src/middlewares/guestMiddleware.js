import { jwtService } from '../services/jwt.service.js';

export const guestMiddleware = (req, res, next) => {
  try {
    const authorization = req.headers['authorization'] || '';

    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7)
      : null;

    const isAccessTokenValid = token ? !!jwtService.verify(token) : false;

    const refreshToken = req.cookies?.refreshToken;
    const isRefreshTokenValid = refreshToken
      ? !!jwtService.verifyRefresh(refreshToken)
      : false;

    if (isAccessTokenValid || isRefreshTokenValid) {
      if (req.headers.accept?.includes('application/json')) {
        return res.status(403).json({ message: 'Already authenticated' });
      } else {
        return res.redirect(`${process.env.CLIENT_HOST}/profile`);
      }
    }

    next();
  } catch (err) {
    next();
  }
};
