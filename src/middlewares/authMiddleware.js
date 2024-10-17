import { jwtService } from '../services/jwt.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';

  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    res.sendStatus(401);

    return;
  }

  const userData = jwtService.verifyToken(token);

  if (!userData) {
    res.sendStatus(401);

    return;
  }

  next();
};
