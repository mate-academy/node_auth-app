import { jwtService } from '../services/jwt.service.js';

export const isAuth = (req, res, next) => {
  const h = req.headers.authorization;

  if (!h) {
    res.sendStatus(401);

    return;
  }

  const [, token] = h.split(' ');

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
