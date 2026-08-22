import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = async (req, res, next) => {
  const authorization = req.headers['authorization'] || '';

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.sendStatus(401);
    return;
  }

  const [, token] = authorization.split(' ');

  if (!token) {
    res.sendStatus(401);
    return;
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    res.sendStatus(401);
    return;
  }

  req.user = userData;

  next();
};
