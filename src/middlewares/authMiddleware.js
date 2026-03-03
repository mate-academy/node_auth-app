import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    return res.sentStatus(401);
  }

  const userData = jwtService.verifyAccessToken(token);

  if (!userData) {
    return res.sendStatus(401);
  }

  next();
};
