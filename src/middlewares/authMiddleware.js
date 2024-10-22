import { jwtService } from '../services/jwt.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';

  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    return res.sendStatus(401);
  }

  const userData = jwtService.verifyToken(token);

  if (!userData) {
    return res.sendStatus(401);
  }

  next();
};
