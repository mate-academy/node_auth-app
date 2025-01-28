import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    res.sendStatus(401);

    return;
  }

  try {
    const userData = jwtService.verify(token);

    if (!userData) {
      res.sendStatus(401);

      return;
    }

    next();
  } catch (error) {
    res.sendStatus(401);
  }
};
