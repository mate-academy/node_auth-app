import { jwtService } from '../services/jwt.service.js';

export const guestMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    return next();
  }

  const userData = jwtService.verify(token);

  if (userData) {
    res.sendStatus(401);

    return;
  }

  next();
};
