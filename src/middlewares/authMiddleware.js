import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    res.sendStatus(401);

    return;
  }

  const userDate = jwtService.verify(token);

  if (!userDate) {
    res.sendStatus(401);

    return;
  }

  next();
};
