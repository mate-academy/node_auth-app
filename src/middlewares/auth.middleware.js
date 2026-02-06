import { jwtService } from '../services/jwt.services.js';

export const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.sendStatus(401);
  }

  const [, token] = auth.split(' ');

  const user = jwtService.verify(token);

  if (!user) {
    return res.sendStatus(401);
  }

  req.user = user;
  next();
};
