import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
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
