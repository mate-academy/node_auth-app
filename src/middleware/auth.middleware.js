import * as tokenService from '../services/refreshToken.service.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Needed authorization',
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = await tokenService.verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }

  req.user = { id: payload.sub };

  next();
};
