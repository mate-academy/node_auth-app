import * as tokenService from '../services/refreshToken.service.js';

export const guestMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  const payload = await tokenService.verifyAccessToken(token);

  if (payload) {
    return res.status(403).json({
      message: 'You are already logged in',
    });
  }

  next();
};
